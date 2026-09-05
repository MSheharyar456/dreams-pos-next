-- 3H: Automation (Triggers & Functions)

-- ==============================================================================
-- 1. INVENTORY AUTOMATION
-- ==============================================================================

-- Trigger Function for sale_items (Decreases Inventory)
CREATE OR REPLACE FUNCTION trg_sale_items_inventory()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO inventory_movements (product_variant_id, movement_type, quantity, reference_type, reference_id, unit_cost)
        VALUES (NEW.product_variant_id, 'sale', -NEW.quantity, 'sale_items', NEW.id, NEW.unit_price);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE inventory_movements 
        SET quantity = -NEW.quantity, product_variant_id = NEW.product_variant_id, unit_cost = NEW.unit_price
        WHERE reference_id = NEW.id AND reference_type = 'sale_items';
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM inventory_movements WHERE reference_id = OLD.id AND reference_type = 'sale_items';
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sale_items_inventory
AFTER INSERT OR UPDATE OR DELETE ON sale_items
FOR EACH ROW EXECUTE FUNCTION trg_sale_items_inventory();

-- Trigger Function for purchase_items (Increases Inventory)
CREATE OR REPLACE FUNCTION trg_purchase_items_inventory()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO inventory_movements (product_variant_id, movement_type, quantity, reference_type, reference_id, unit_cost)
        VALUES (NEW.product_variant_id, 'purchase', NEW.quantity, 'purchase_items', NEW.id, NEW.unit_cost);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE inventory_movements 
        SET quantity = NEW.quantity, product_variant_id = NEW.product_variant_id, unit_cost = NEW.unit_cost
        WHERE reference_id = NEW.id AND reference_type = 'purchase_items';
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM inventory_movements WHERE reference_id = OLD.id AND reference_type = 'purchase_items';
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_purchase_items_inventory
AFTER INSERT OR UPDATE OR DELETE ON purchase_items
FOR EACH ROW EXECUTE FUNCTION trg_purchase_items_inventory();


-- ==============================================================================
-- 2. LEDGER AUTOMATION
-- ==============================================================================

-- Trigger Function for Sales (Customer Ledger Debit)
CREATE OR REPLACE FUNCTION trg_sales_ledger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO customer_ledger (customer_id, transaction_type, reference_type, reference_id, debit, credit, description)
        VALUES (NEW.customer_id, 'sale', 'sales', NEW.id, NEW.total_amount, 0, 'Sale Invoice ' || NEW.invoice_number);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE customer_ledger 
        SET debit = NEW.total_amount, customer_id = NEW.customer_id
        WHERE reference_id = NEW.id AND reference_type = 'sales';
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM customer_ledger WHERE reference_id = OLD.id AND reference_type = 'sales';
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sales_ledger
AFTER INSERT OR UPDATE OR DELETE ON sales
FOR EACH ROW EXECUTE FUNCTION trg_sales_ledger();

-- Trigger Function for Purchases (Supplier Ledger Credit)
CREATE OR REPLACE FUNCTION trg_purchases_ledger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO supplier_ledger (supplier_id, transaction_type, reference_type, reference_id, debit, credit, description)
        VALUES (NEW.supplier_id, 'purchase', 'purchases', NEW.id, 0, NEW.total_amount, 'Purchase Invoice ' || NEW.purchase_number);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE supplier_ledger 
        SET credit = NEW.total_amount, supplier_id = NEW.supplier_id
        WHERE reference_id = NEW.id AND reference_type = 'purchases';
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM supplier_ledger WHERE reference_id = OLD.id AND reference_type = 'purchases';
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_purchases_ledger
AFTER INSERT OR UPDATE OR DELETE ON purchases
FOR EACH ROW EXECUTE FUNCTION trg_purchases_ledger();

-- Trigger Function for Payments (Ledger & Account Balances)
CREATE OR REPLACE FUNCTION trg_payments_automation()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.payment_type = 'incoming' THEN
            -- Customer paying us: Credit customer ledger, Increase payment account balance
            IF NEW.customer_id IS NOT NULL THEN
                INSERT INTO customer_ledger (customer_id, transaction_type, reference_type, reference_id, debit, credit, description)
                VALUES (NEW.customer_id, 'payment', 'payments', NEW.id, 0, NEW.amount, 'Payment Received ' || COALESCE(NEW.reference_number, ''));
            END IF;
            UPDATE payment_accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.payment_account_id;
        ELSIF NEW.payment_type = 'outgoing' THEN
            -- We paying supplier: Debit supplier ledger, Decrease payment account balance
            IF NEW.supplier_id IS NOT NULL THEN
                INSERT INTO supplier_ledger (supplier_id, transaction_type, reference_type, reference_id, debit, credit, description)
                VALUES (NEW.supplier_id, 'payment', 'payments', NEW.id, NEW.amount, 0, 'Payment Sent ' || COALESCE(NEW.reference_number, ''));
            END IF;
            UPDATE payment_accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.payment_account_id;
        END IF;
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Complex scenario: Revert old amounts and apply new amounts
        IF OLD.payment_type = 'incoming' THEN
            UPDATE payment_accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.payment_account_id;
            IF OLD.customer_id IS NOT NULL THEN
                UPDATE customer_ledger SET credit = NEW.amount, customer_id = NEW.customer_id WHERE reference_id = NEW.id AND reference_type = 'payments';
            END IF;
        ELSIF OLD.payment_type = 'outgoing' THEN
            UPDATE payment_accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.payment_account_id;
            IF OLD.supplier_id IS NOT NULL THEN
                UPDATE supplier_ledger SET debit = NEW.amount, supplier_id = NEW.supplier_id WHERE reference_id = NEW.id AND reference_type = 'payments';
            END IF;
        END IF;

        IF NEW.payment_type = 'incoming' THEN
            UPDATE payment_accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.payment_account_id;
        ELSIF NEW.payment_type = 'outgoing' THEN
            UPDATE payment_accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.payment_account_id;
        END IF;
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.payment_type = 'incoming' THEN
            -- Revert
            IF OLD.customer_id IS NOT NULL THEN
                DELETE FROM customer_ledger WHERE reference_id = OLD.id AND reference_type = 'payments';
            END IF;
            UPDATE payment_accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.payment_account_id;
        ELSIF OLD.payment_type = 'outgoing' THEN
            -- Revert
            IF OLD.supplier_id IS NOT NULL THEN
                DELETE FROM supplier_ledger WHERE reference_id = OLD.id AND reference_type = 'payments';
            END IF;
            UPDATE payment_accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.payment_account_id;
        END IF;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payments_automation
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION trg_payments_automation();
