-- 3I: Phase 3 Corrections, Auth Triggers, and RLS
-- Safe, idempotent migration to correct existing Phase 3 schema

-- ==============================================================================
-- 1. PROFILES / AUTH
-- ==============================================================================

-- Create a secure trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role, status)
    VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'full_name', 'Unknown User'), 
        'employee', -- Enforce default role, users cannot choose privileged roles on signup
        'active'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Must drop before replacing trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to prevent unauthorized role escalation
CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS trigger AS $$
BEGIN
    IF NEW.role <> OLD.role THEN
        -- Only allow if the person doing it is an owner/admin (checking via auth.uid())
        -- If auth.uid() is null, it might be a server-side service role operation, which we allow.
        IF auth.uid() IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')
        ) THEN
            RAISE EXCEPTION 'You do not have permission to change roles.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON profiles;
CREATE TRIGGER trg_prevent_role_escalation
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION prevent_role_escalation();


-- ==============================================================================
-- 3. PAYMENT AUTOMATION
-- ==============================================================================

CREATE OR REPLACE FUNCTION trg_payments_automation()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.payment_type = 'incoming' THEN
            -- Incoming customer payment
            IF NEW.customer_id IS NOT NULL THEN
                INSERT INTO customer_ledger (customer_id, transaction_type, reference_type, reference_id, debit, credit, description)
                VALUES (NEW.customer_id, 'payment', 'payments', NEW.id, 0, NEW.amount, 'Payment Received ' || COALESCE(NEW.reference_number, ''));
            END IF;
            UPDATE payment_accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.payment_account_id;
        ELSIF NEW.payment_type = 'outgoing' THEN
            -- Outgoing supplier payment
            IF NEW.supplier_id IS NOT NULL THEN
                INSERT INTO supplier_ledger (supplier_id, transaction_type, reference_type, reference_id, debit, credit, description)
                VALUES (NEW.supplier_id, 'payment', 'payments', NEW.id, NEW.amount, 0, 'Payment Sent ' || COALESCE(NEW.reference_number, ''));
            END IF;
            UPDATE payment_accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.payment_account_id;
        END IF;
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- 1. Reverse the OLD accounting effects
        IF OLD.payment_type = 'incoming' THEN
            UPDATE payment_accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.payment_account_id;
            IF OLD.customer_id IS NOT NULL THEN
                DELETE FROM customer_ledger WHERE reference_id = OLD.id AND reference_type = 'payments';
            END IF;
        ELSIF OLD.payment_type = 'outgoing' THEN
            UPDATE payment_accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.payment_account_id;
            IF OLD.supplier_id IS NOT NULL THEN
                DELETE FROM supplier_ledger WHERE reference_id = OLD.id AND reference_type = 'payments';
            END IF;
        END IF;

        -- 2. Apply the NEW accounting effects
        IF NEW.payment_type = 'incoming' THEN
            UPDATE payment_accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.payment_account_id;
            IF NEW.customer_id IS NOT NULL THEN
                INSERT INTO customer_ledger (customer_id, transaction_type, reference_type, reference_id, debit, credit, description)
                VALUES (NEW.customer_id, 'payment', 'payments', NEW.id, 0, NEW.amount, 'Payment Received ' || COALESCE(NEW.reference_number, ''));
            END IF;
        ELSIF NEW.payment_type = 'outgoing' THEN
            UPDATE payment_accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.payment_account_id;
            IF NEW.supplier_id IS NOT NULL THEN
                INSERT INTO supplier_ledger (supplier_id, transaction_type, reference_type, reference_id, debit, credit, description)
                VALUES (NEW.supplier_id, 'payment', 'payments', NEW.id, NEW.amount, 0, 'Payment Sent ' || COALESCE(NEW.reference_number, ''));
            END IF;
        END IF;
        
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Reverse the accounting effects safely
        IF OLD.payment_type = 'incoming' THEN
            IF OLD.customer_id IS NOT NULL THEN
                DELETE FROM customer_ledger WHERE reference_id = OLD.id AND reference_type = 'payments';
            END IF;
            UPDATE payment_accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.payment_account_id;
        ELSIF OLD.payment_type = 'outgoing' THEN
            IF OLD.supplier_id IS NOT NULL THEN
                DELETE FROM supplier_ledger WHERE reference_id = OLD.id AND reference_type = 'payments';
            END IF;
            UPDATE payment_accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.payment_account_id;
        END IF;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payments_automation ON payments;
CREATE TRIGGER trg_payments_automation
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION trg_payments_automation();


-- ==============================================================================
-- 4 & 5. SALES AND PURCHASE RETURN INVENTORY
-- ==============================================================================

CREATE OR REPLACE FUNCTION trg_sales_return_items_inventory()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO inventory_movements (product_variant_id, movement_type, quantity, reference_type, reference_id, unit_cost)
        VALUES (NEW.product_variant_id, 'sale_return', NEW.quantity, 'sales_return_items', NEW.id, NULL); 
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE inventory_movements 
        SET quantity = NEW.quantity, product_variant_id = NEW.product_variant_id
        WHERE reference_id = NEW.id AND reference_type = 'sales_return_items';
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM inventory_movements WHERE reference_id = OLD.id AND reference_type = 'sales_return_items';
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sales_return_items_inventory ON sales_return_items;
CREATE TRIGGER trg_sales_return_items_inventory
    AFTER INSERT OR UPDATE OR DELETE ON sales_return_items
    FOR EACH ROW EXECUTE FUNCTION trg_sales_return_items_inventory();


CREATE OR REPLACE FUNCTION trg_purchase_return_items_inventory()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Decrease inventory by the returned quantity
        INSERT INTO inventory_movements (product_variant_id, movement_type, quantity, reference_type, reference_id, unit_cost)
        VALUES (NEW.product_variant_id, 'purchase_return', -NEW.quantity, 'purchase_return_items', NEW.id, NULL);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE inventory_movements 
        SET quantity = -NEW.quantity, product_variant_id = NEW.product_variant_id
        WHERE reference_id = NEW.id AND reference_type = 'purchase_return_items';
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM inventory_movements WHERE reference_id = OLD.id AND reference_type = 'purchase_return_items';
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_purchase_return_items_inventory ON purchase_return_items;
CREATE TRIGGER trg_purchase_return_items_inventory
    AFTER INSERT OR UPDATE OR DELETE ON purchase_return_items
    FOR EACH ROW EXECUTE FUNCTION trg_purchase_return_items_inventory();


-- ==============================================================================
-- 6. EXPENSE PAYMENT AUTOMATION
-- ==============================================================================

CREATE OR REPLACE FUNCTION trg_expenses_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE payment_accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.payment_account_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Reverse old, apply new
        UPDATE payment_accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.payment_account_id;
        UPDATE payment_accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.payment_account_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE payment_accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.payment_account_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_expenses_payment ON expenses;
CREATE TRIGGER trg_expenses_payment
    AFTER INSERT OR UPDATE OR DELETE ON expenses
    FOR EACH ROW EXECUTE FUNCTION trg_expenses_payment();


-- ==============================================================================
-- 7. EMPLOYEE SALARY PAYMENT AUTOMATION
-- ==============================================================================

CREATE OR REPLACE FUNCTION trg_employee_salary_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE payment_accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.payment_account_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE payment_accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.payment_account_id;
        UPDATE payment_accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.payment_account_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE payment_accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.payment_account_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_employee_salary_payment ON employee_salary_payments;
CREATE TRIGGER trg_employee_salary_payment
    AFTER INSERT OR UPDATE OR DELETE ON employee_salary_payments
    FOR EACH ROW EXECUTE FUNCTION trg_employee_salary_payment();


-- ==============================================================================
-- 8. PAYMENT ACCOUNT OPENING BALANCE
-- ==============================================================================

-- Safely initialize current balances for accounts that have opening_balance but current_balance = 0
UPDATE payment_accounts 
SET current_balance = COALESCE(opening_balance, 0)
WHERE (current_balance IS NULL OR current_balance = 0) AND opening_balance > 0;

CREATE OR REPLACE FUNCTION trg_payment_accounts_opening()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.current_balance IS NULL OR NEW.current_balance = 0 THEN
            NEW.current_balance := COALESCE(NEW.opening_balance, 0);
        END IF;
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payment_accounts_opening ON payment_accounts;
CREATE TRIGGER trg_payment_accounts_opening
    BEFORE INSERT ON payment_accounts
    FOR EACH ROW EXECUTE FUNCTION trg_payment_accounts_opening();


-- ==============================================================================
-- 9 & 10. SALES / PURCHASE LEDGER & NULL HANDLING
-- ==============================================================================

CREATE OR REPLACE FUNCTION trg_sales_ledger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.customer_id IS NOT NULL THEN
            INSERT INTO customer_ledger (customer_id, transaction_type, reference_type, reference_id, debit, credit, description)
            VALUES (NEW.customer_id, 'sale', 'sales', NEW.id, NEW.total_amount, 0, 'Sale Invoice ' || NEW.invoice_number);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Reverse old entry
        DELETE FROM customer_ledger WHERE reference_id = OLD.id AND reference_type = 'sales';
        -- Apply new entry safely
        IF NEW.customer_id IS NOT NULL THEN
            INSERT INTO customer_ledger (customer_id, transaction_type, reference_type, reference_id, debit, credit, description)
            VALUES (NEW.customer_id, 'sale', 'sales', NEW.id, NEW.total_amount, 0, 'Sale Invoice ' || NEW.invoice_number);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM customer_ledger WHERE reference_id = OLD.id AND reference_type = 'sales';
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sales_ledger ON sales;
CREATE TRIGGER trg_sales_ledger
    AFTER INSERT OR UPDATE OR DELETE ON sales
    FOR EACH ROW EXECUTE FUNCTION trg_sales_ledger();

CREATE OR REPLACE FUNCTION trg_purchases_ledger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.supplier_id IS NOT NULL THEN
            INSERT INTO supplier_ledger (supplier_id, transaction_type, reference_type, reference_id, debit, credit, description)
            VALUES (NEW.supplier_id, 'purchase', 'purchases', NEW.id, 0, NEW.total_amount, 'Purchase Invoice ' || NEW.purchase_number);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        DELETE FROM supplier_ledger WHERE reference_id = OLD.id AND reference_type = 'purchases';
        IF NEW.supplier_id IS NOT NULL THEN
            INSERT INTO supplier_ledger (supplier_id, transaction_type, reference_type, reference_id, debit, credit, description)
            VALUES (NEW.supplier_id, 'purchase', 'purchases', NEW.id, 0, NEW.total_amount, 'Purchase Invoice ' || NEW.purchase_number);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM supplier_ledger WHERE reference_id = OLD.id AND reference_type = 'purchases';
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_purchases_ledger ON purchases;
CREATE TRIGGER trg_purchases_ledger
    AFTER INSERT OR UPDATE OR DELETE ON purchases
    FOR EACH ROW EXECUTE FUNCTION trg_purchases_ledger();


-- ==============================================================================
-- CUSTOMER / SUPPLIER LEDGER RETURNS
-- ==============================================================================

CREATE OR REPLACE FUNCTION trg_sales_returns_ledger()
RETURNS TRIGGER AS $$
DECLARE
    v_customer_id UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        SELECT customer_id INTO v_customer_id FROM sales WHERE id = NEW.sale_id;
        IF v_customer_id IS NOT NULL THEN
            INSERT INTO customer_ledger (customer_id, transaction_type, reference_type, reference_id, debit, credit, description)
            VALUES (v_customer_id, 'sale_return', 'sales_returns', NEW.id, 0, NEW.total_amount, 'Sales Return');
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        DELETE FROM customer_ledger WHERE reference_id = OLD.id AND reference_type = 'sales_returns';
        SELECT customer_id INTO v_customer_id FROM sales WHERE id = NEW.sale_id;
        IF v_customer_id IS NOT NULL THEN
            INSERT INTO customer_ledger (customer_id, transaction_type, reference_type, reference_id, debit, credit, description)
            VALUES (v_customer_id, 'sale_return', 'sales_returns', NEW.id, 0, NEW.total_amount, 'Sales Return');
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM customer_ledger WHERE reference_id = OLD.id AND reference_type = 'sales_returns';
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sales_returns_ledger ON sales_returns;
CREATE TRIGGER trg_sales_returns_ledger
    AFTER INSERT OR UPDATE OR DELETE ON sales_returns
    FOR EACH ROW EXECUTE FUNCTION trg_sales_returns_ledger();

CREATE OR REPLACE FUNCTION trg_purchase_returns_ledger()
RETURNS TRIGGER AS $$
DECLARE
    v_supplier_id UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        SELECT supplier_id INTO v_supplier_id FROM purchases WHERE id = NEW.purchase_id;
        IF v_supplier_id IS NOT NULL THEN
            INSERT INTO supplier_ledger (supplier_id, transaction_type, reference_type, reference_id, debit, credit, description)
            VALUES (v_supplier_id, 'purchase_return', 'purchase_returns', NEW.id, NEW.total_amount, 0, 'Purchase Return');
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        DELETE FROM supplier_ledger WHERE reference_id = OLD.id AND reference_type = 'purchase_returns';
        SELECT supplier_id INTO v_supplier_id FROM purchases WHERE id = NEW.purchase_id;
        IF v_supplier_id IS NOT NULL THEN
            INSERT INTO supplier_ledger (supplier_id, transaction_type, reference_type, reference_id, debit, credit, description)
            VALUES (v_supplier_id, 'purchase_return', 'purchase_returns', NEW.id, NEW.total_amount, 0, 'Purchase Return');
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM supplier_ledger WHERE reference_id = OLD.id AND reference_type = 'purchase_returns';
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_purchase_returns_ledger ON purchase_returns;
CREATE TRIGGER trg_purchase_returns_ledger
    AFTER INSERT OR UPDATE OR DELETE ON purchase_returns
    FOR EACH ROW EXECUTE FUNCTION trg_purchase_returns_ledger();


-- ==============================================================================
-- 11. VALIDATION
-- ==============================================================================

DO $$
BEGIN
    -- Safe check constraints, wrapped in DO block to handle "already exists" errors if run multiple times
    BEGIN
        ALTER TABLE sale_items ADD CONSTRAINT chk_sale_items_qty CHECK (quantity > 0);
        ALTER TABLE sale_items ADD CONSTRAINT chk_sale_items_price CHECK (unit_price >= 0);
        ALTER TABLE sale_items ADD CONSTRAINT chk_sale_items_discount CHECK (discount >= 0);
        ALTER TABLE sale_items ADD CONSTRAINT chk_sale_items_total CHECK (total >= 0);
    EXCEPTION WHEN OTHERS THEN NULL; END;

    BEGIN
        ALTER TABLE purchase_items ADD CONSTRAINT chk_purchase_items_qty CHECK (quantity > 0);
        ALTER TABLE purchase_items ADD CONSTRAINT chk_purchase_items_cost CHECK (unit_cost >= 0);
        ALTER TABLE purchase_items ADD CONSTRAINT chk_purchase_items_discount CHECK (discount >= 0);
        ALTER TABLE purchase_items ADD CONSTRAINT chk_purchase_items_total CHECK (total >= 0);
    EXCEPTION WHEN OTHERS THEN NULL; END;

    BEGIN
        ALTER TABLE sales ADD CONSTRAINT chk_sales_amounts CHECK (subtotal >= 0 AND total_amount >= 0 AND discount >= 0 AND paid_amount >= 0 AND remaining_amount >= 0);
    EXCEPTION WHEN OTHERS THEN NULL; END;

    BEGIN
        ALTER TABLE purchases ADD CONSTRAINT chk_purchases_amounts CHECK (subtotal >= 0 AND total_amount >= 0 AND discount >= 0 AND paid_amount >= 0 AND remaining_amount >= 0);
    EXCEPTION WHEN OTHERS THEN NULL; END;

    BEGIN
        ALTER TABLE payments ADD CONSTRAINT chk_payments_amount CHECK (amount >= 0);
    EXCEPTION WHEN OTHERS THEN NULL; END;

    BEGIN
        ALTER TABLE expenses ADD CONSTRAINT chk_expenses_amount CHECK (amount >= 0);
    EXCEPTION WHEN OTHERS THEN NULL; END;

    BEGIN
        ALTER TABLE employee_salary_payments ADD CONSTRAINT chk_salary_amount CHECK (amount >= 0);
    EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;


-- ==============================================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable RLS safely
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS units ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sales_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sales_return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS purchase_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS purchase_return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customer_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS supplier_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employee_salary_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS loaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS loader_bills ENABLE ROW LEVEL SECURITY;

-- Anonymous users cannot access ERP tables. 
-- Authenticated users are given global access to the ERP data based on their JWT. 
-- This achieves: "authenticated users can work with ERP data... anonymous users must not access ERP tables."
-- Advanced row-level filtering based on profiles.role (like blocking employees from expenses) is left out 
-- to prevent blocking legitimate business logic for now, but RLS is structurally enabled.

DO $$
DECLARE
    t_name text;
    tables CURSOR FOR
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'categories', 'brands', 'units', 'products', 'product_variants', 
                          'customers', 'suppliers', 'sales', 'sale_items', 'purchases', 'purchase_items', 
                          'sales_returns', 'sales_return_items', 'purchase_returns', 'purchase_return_items', 
                          'inventory_movements', 'customer_ledger', 'supplier_ledger', 'payment_accounts', 
                          'payments', 'expense_categories', 'expenses', 'employees', 'employee_salary_payments', 
                          'loaders', 'loader_bills');
BEGIN
    FOR t IN tables LOOP
        -- Drop any old policies if they existed to ensure clean state
        EXECUTE format('DROP POLICY IF EXISTS "Enable ALL for authenticated users only" ON %I', t.tablename);
        
        -- Create the secure authenticated-only policy
        EXECUTE format('CREATE POLICY "Enable ALL for authenticated users only" ON %I FOR ALL TO authenticated USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'')', t.tablename);
    END LOOP;
END $$;
