-- Preserve the individual customer POS charges so pending sales can be edited.
ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS shipping_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS loader_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS unloading_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00;
