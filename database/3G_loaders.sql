-- 3G: Loaders

-- LOADERS
CREATE TABLE loaders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    vehicle_number TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOADER BILLS
CREATE TABLE loader_bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loader_id UUID REFERENCES loaders(id) ON DELETE RESTRICT,
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
    sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
    material_description TEXT,
    quantity NUMERIC(12, 2) NOT NULL,
    unit_id UUID REFERENCES units(id) ON DELETE RESTRICT,
    rate NUMERIC(15, 2) NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    paid_amount NUMERIC(15, 2) DEFAULT 0.00,
    remaining_amount NUMERIC(15, 2) NOT NULL,
    bill_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
