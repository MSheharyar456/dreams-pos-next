-- 3D: Inventory

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'purchase_return', 'sale_return', 'adjustment', 'damage', 'opening_stock')),
    quantity NUMERIC(12, 2) NOT NULL, -- positive for stock in, negative for stock out
    reference_type TEXT, -- e.g., 'sale_items', 'purchase_items'
    reference_id UUID, -- ID of the related item row
    unit_cost NUMERIC(15, 2) DEFAULT 0.00,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
