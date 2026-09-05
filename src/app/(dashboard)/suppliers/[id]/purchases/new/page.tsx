import { notFound } from 'next/navigation';
import PurchasePOS from '@/components/purchases/PurchasePOS';
import { getSupplierById } from '@/app/actions/suppliers';
import { getProducts } from '@/app/actions/products';
import { createClient } from '@/lib/supabase/server';

export default async function NewSupplierPurchase({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let employeeName = 'Unknown';
  if (user?.email) {
    const { data: employee } = await supabase
      .from('employees')
      .select('name')
      .eq('phone', user.phone || user.email)
      .maybeSingle();

    if (employee?.name) {
      employeeName = employee.name;
    }
  }

  const [supplier, products] = await Promise.all([getSupplierById(id), getProducts()]);
  if (!supplier) notFound();

  const catalog = (products || []).flatMap((product: any) =>
    (product.variants || []).map((variant: any) => ({
      productId: product.id,
      variantId: variant.id,
      name: [product.name, product.brand?.name].filter(Boolean).join(' — '),
      categoryName: product.category?.name || '',
      variantName: variant.variant_name || 'Default',
      unitId: variant.unit_id,
      unitName: variant.unit?.short_name || variant.unit?.name,
      purchasePrice: Number(variant.purchase_price || 0),
      salePrice: Number(variant.sale_price || 0),
      stock: (variant.inventory_movements || []).reduce(
        (sum: number, movement: any) => sum + Number(movement.quantity || 0),
        0,
      ),
    })),
  );

  return (
    <PurchasePOS
      supplierId={id}
      supplierName={supplier.name}
      catalog={catalog}
      currentUserEmail={employeeName}
    />
  );
}
