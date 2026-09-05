-- 3E: Finance (Ledgers + Payments)

-- CUSTOMER LEDGER
CREATE TABLE customer_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'payment', 'sale_return', 'adjustment', 'opening_balance')),
    reference_type TEXT, -- e.g., 'sales', 'payments'
    reference_id UUID,
    debit NUMERIC(15, 2) DEFAULT 0.00, -- Increases amount customer owes (e.g., Sale)
    credit NUMERIC(15, 2) DEFAULT 0.00, -- Decreases amount customer owes (e.g., Payment)
    description TEXT,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPLIER LEDGER
CREATE TABLE supplier_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE RESTRICT,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'payment', 'purchase_return', 'adjustment', 'opening_balance')),
    reference_type TEXT, -- e.g., 'purchases', 'payments'
    reference_id UUID,
    debit NUMERIC(15, 2) DEFAULT 0.00, -- Decreases amount we owe supplier (e.g., Payment to supplier)
    credit NUMERIC(15, 2) DEFAULT 0.00, -- Increases amount we owe supplier (e.g., Purchase on credit)
    description TEXT,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENT ACCOUNTS
CREATE TABLE payment_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- e.g., 'Cash', 'JazzCash', 'Bank Al Habib'
    account_type TEXT, -- e.g., 'cash', 'bank', 'mobile'
    account_number TEXT,
    opening_balance NUMERIC(15, 2) DEFAULT 0.00,
    current_balance NUMERIC(15, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_account_id UUID REFERENCES payment_accounts(id) ON DELETE RESTRICT,
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE RESTRICT,
    sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
    purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('incoming', 'outgoing')), -- incoming from customer, outgoing to supplier/expense
    payment_method TEXT, -- e.g., 'cash', 'transfer', 'cheque'
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    reference_number TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
