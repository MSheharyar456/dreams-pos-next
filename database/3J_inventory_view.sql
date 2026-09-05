-- 3J: Inventory Summary View

-- Drop the view if it exists so we can safely recreate it
DROP VIEW IF EXISTS product_inventory_summary;

CREATE VIEW product_inventory_summary AS
SELECT 
    pv.id AS variant_id,
    p.id AS product_id,
    p.name AS product_name,
    pv.variant_name,
    p.sku,
    p.category_id,
    p.brand_id,
    COALESCE(SUM(CASE WHEN im.quantity > 0 THEN im.quantity ELSE 0 END), 0) AS total_in,
    COALESCE(SUM(CASE WHEN im.quantity < 0 THEN ABS(im.quantity) ELSE 0 END), 0) AS total_out,
    COALESCE(SUM(im.quantity), 0) AS available_qty
FROM 
    product_variants pv
JOIN 
    products p ON p.id = pv.product_id
LEFT JOIN 
    inventory_movements im ON im.product_variant_id = pv.id
GROUP BY 
    pv.id, p.id;
