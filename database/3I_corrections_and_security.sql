-- 3I: Schema Corrections, Security, and Indexes
-- Do NOT drop tables. Do NOT destroy data.

-- ==============================================================================
-- 1. PAYMENT UPDATE AUTOMATION
-- ==============================================================================

CREATE OR REPLACE FUNCTION trg_payments_automation()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.payment_type = 'incoming' THEN
            IF NEW.customer_id IS NOT NULL THEN
                INSERT INTO customer_ledger (customer_id, transaction_type, reference_type, reference_id, debit, credit, description)
                VALUES (NEW.customer_id, 'payment', 'payments', NEW.id, 0, NEW.amount, 'Payment Received ' || COALESCE(NEW.reference_number, ''));
            END IF;
            UPDATE payment_accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.payment_account_id;
        ELSIF NEW.payment_type = 'outgoing' THEN
            IF NEW.supplier_id IS NOT NULL THEN
                INSERT INTO supplier_ledger (supplier_id, transaction_type, reference_type, reference_id, debit, credit, description)
                VALUES (NEW.supplier_id, 'payment', 'payments', NEW.id, NEW.amount, 0, 'Payment Sent ' || COALESCE(NEW.reference_number, ''));
            END IF;
            UPDATE payment_accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.payment_account_id;
        END IF;
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Completely reverse OLD effect
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

        -- Completely apply NEW effect
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

-- Trigger already exists, but replacing the function updates the logic safely.

-- ==============================================================================
-- 2. EXPENSE PAYMENT ACCOUNT
-- ==============================================================================

CREATE OR REPLACE FUNCTION trg_expenses_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE payment_accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.payment_account_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Reverse old
        UPDATE payment_accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.payment_account_id;
        -- Apply new
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
-- 3. EMPLOYEE SALARY PAYMENT
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
-- 4. PAYMENT ACCOUNT OPENING BALANCE
-- ==============================================================================

CREATE OR REPLACE FUNCTION trg_payment_accounts_opening()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Initialize current_balance to opening_balance if current_balance is 0 or null
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
-- 5. SALES RETURNS INVENTORY
-- ==============================================================================

CREATE OR REPLACE FUNCTION trg_sales_return_items_inventory()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO inventory_movements (product_variant_id, movement_type, quantity, reference_type, reference_id, unit_cost)
        VALUES (NEW.product_variant_id, 'sale_return', NEW.quantity, 'sales_return_items', NEW.id, NULL); -- Cost is null because it's a return, proper costing handled later
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


-- ==============================================================================
-- 6. PURCHASE RETURNS INVENTORY
-- ==============================================================================

CREATE OR REPLACE FUNCTION trg_purchase_return_items_inventory()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
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
-- 7. CUSTOMER LEDGER RETURNS
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
        SELECT customer_id INTO v_customer_id FROM sales WHERE id = NEW.sale_id;
        IF v_customer_id IS NOT NULL THEN
            UPDATE customer_ledger 
            SET credit = NEW.total_amount, customer_id = v_customer_id
            WHERE reference_id = NEW.id AND reference_type = 'sales_returns';
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


-- ==============================================================================
-- 8. SUPPLIER LEDGER RETURNS
-- ==============================================================================

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
        SELECT supplier_id INTO v_supplier_id FROM purchases WHERE id = NEW.purchase_id;
        IF v_supplier_id IS NOT NULL THEN
            UPDATE supplier_ledger 
            SET debit = NEW.total_amount, supplier_id = v_supplier_id
            WHERE reference_id = NEW.id AND reference_type = 'purchase_returns';
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
-- 9. NULL CUSTOMER SALES & 10. INVENTORY COST
-- ==============================================================================

-- Re-declare trg_sales_ledger to handle NULL customer (Cash/Walk-in)
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
        -- If it had a customer, update it. If it changed to/from null, we delete and re-insert.
        DELETE FROM customer_ledger WHERE reference_id = OLD.id AND reference_type = 'sales';
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

-- Re-declare trg_sale_items_inventory to NOT use sale_items.unit_price as inventory cost
CREATE OR REPLACE FUNCTION trg_sale_items_inventory()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO inventory_movements (product_variant_id, movement_type, quantity, reference_type, reference_id, unit_cost)
        VALUES (NEW.product_variant_id, 'sale', -NEW.quantity, 'sale_items', NEW.id, NULL); -- Costing calculated later
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE inventory_movements 
        SET quantity = -NEW.quantity, product_variant_id = NEW.product_variant_id, unit_cost = NULL
        WHERE reference_id = NEW.id AND reference_type = 'sale_items';
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM inventory_movements WHERE reference_id = OLD.id AND reference_type = 'sale_items';
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;


-- ==============================================================================
-- 11. DATA VALIDATION (CHECK CONSTRAINTS)
-- ==============================================================================

-- Safely add constraints (prevent negative quantities and values)
ALTER TABLE sale_items ADD CONSTRAINT chk_sale_items_qty CHECK (quantity > 0);
ALTER TABLE sale_items ADD CONSTRAINT chk_sale_items_price CHECK (unit_price >= 0);
ALTER TABLE sale_items ADD CONSTRAINT chk_sale_items_discount CHECK (discount >= 0);
ALTER TABLE sale_items ADD CONSTRAINT chk_sale_items_total CHECK (total >= 0);

ALTER TABLE purchase_items ADD CONSTRAINT chk_purchase_items_qty CHECK (quantity > 0);
ALTER TABLE purchase_items ADD CONSTRAINT chk_purchase_items_cost CHECK (unit_cost >= 0);
ALTER TABLE purchase_items ADD CONSTRAINT chk_purchase_items_discount CHECK (discount >= 0);
ALTER TABLE purchase_items ADD CONSTRAINT chk_purchase_items_total CHECK (total >= 0);

ALTER TABLE sales ADD CONSTRAINT chk_sales_amounts CHECK (subtotal >= 0 AND total_amount >= 0 AND discount >= 0 AND paid_amount >= 0 AND remaining_amount >= 0);
ALTER TABLE purchases ADD CONSTRAINT chk_purchases_amounts CHECK (subtotal >= 0 AND total_amount >= 0 AND discount >= 0 AND paid_amount >= 0 AND remaining_amount >= 0);

ALTER TABLE payments ADD CONSTRAINT chk_payments_amount CHECK (amount >= 0);
ALTER TABLE expenses ADD CONSTRAINT chk_expenses_amount CHECK (amount >= 0);
ALTER TABLE employee_salary_payments ADD CONSTRAINT chk_salary_amount CHECK (amount >= 0);
ALTER TABLE loader_bills ADD CONSTRAINT chk_loader_bills_amount CHECK (quantity > 0 AND rate >= 0 AND total_amount >= 0 AND paid_amount >= 0 AND remaining_amount >= 0);


-- ==============================================================================
-- 13. RLS / SECURITY
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_salary_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE loaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE loader_bills ENABLE ROW LEVEL SECURITY;

-- Create Policies for Authenticated Users Only (since POS users all share the same data)
CREATE POLICY "Enable all for authenticated users" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON brands FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON units FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON product_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON sales FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON sale_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON purchases FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON purchase_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON sales_returns FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON sales_return_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON purchase_returns FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON purchase_return_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON inventory_movements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON customer_ledger FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON supplier_ledger FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON payment_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON expense_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON employees FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON employee_salary_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON loaders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON loader_bills FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ==============================================================================
-- 14. INDEXES
-- ==============================================================================

-- Add useful indexes for performance on foreign keys and commonly searched fields
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_variant_id ON sale_items(product_variant_id);

CREATE INDEX IF NOT EXISTS idx_purchases_supplier_id ON purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_variant_id ON purchase_items(product_variant_id);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant_id ON inventory_movements(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_ref_id ON inventory_movements(reference_id);

CREATE INDEX IF NOT EXISTS idx_customer_ledger_customer_id ON customer_ledger(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_ledger_ref_id ON customer_ledger(reference_id);

CREATE INDEX IF NOT EXISTS idx_supplier_ledger_supplier_id ON supplier_ledger(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_ledger_ref_id ON supplier_ledger(reference_id);

CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_supplier_id ON payments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_payments_sale_id ON payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_payments_purchase_id ON payments(purchase_id);
CREATE INDEX IF NOT EXISTS idx_payments_account_id ON payments(payment_account_id);

CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(expense_category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_account_id ON expenses(payment_account_id);

CREATE INDEX IF NOT EXISTS idx_employee_salary_employee_id ON employee_salary_payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_salary_account_id ON employee_salary_payments(payment_account_id);

CREATE INDEX IF NOT EXISTS idx_loader_bills_loader_id ON loader_bills(loader_id);
CREATE INDEX IF NOT EXISTS idx_loader_bills_sale_id ON loader_bills(sale_id);
