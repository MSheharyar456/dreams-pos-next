import { notFound } from 'next/navigation';
import EditPurchasePOS from '@/components/purchases/EditPurchasePOS';
import { getSupplierById } from '@/app/actions/suppliers';
import { getPurchaseById } from '@/app/actions/purchases';
import { getProducts } from '@/app/actions/products';
import { createClient } from '@/lib/supabase/server';

export default async function EditSupplierPurchase({ params }: { params: Promise<{ id: string; purchaseId: string }> }) {
  const { id, purchaseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get employee name if user exists
  let employeeName = 'Unknown';
  if (user?.email) {
    const { data: employee } = await supabase
      .from('employees')
      .select('name')
      .eq('phone', user.phone || user.email)
      .maybeSingle();
    if (employee?.name) employeeName = employee.name;
  }
  
  const [supplier, purchase, products] = await Promise.all([
    getSupplierById(id),
    getPurchaseById(purchaseId),
    getProducts(),
  ]);
  
  if (!supplier || !purchase || purchase.supplier_id !== id) {
    notFound();
  }

  let pendingPurchase: any = null;
  try { pendingPurchase = purchase.notes ? JSON.parse(purchase.notes) : null; } catch { pendingPurchase = null; }
  const isPending = pendingPurchase?.type === 'pending_pop';

  // Build catalog
  const catalog = products.flatMap((product: any) => (product.variants || []).map((variant: any) => ({
    productId: product.id,
    variantId: variant.id,
    name: [product.name, product.brand?.name].filter(Boolean).join(' — '),
    categoryName: product.category?.name || '',
    variantName: variant.variant_name || 'Default',
    unitId: variant.unit_id,
    unitName: variant.unit?.short_name || variant.unit?.name,
    purchasePrice: Number(variant.purchase_price || 0),
    salePrice: Number(variant.sale_price || 0),
    stock: (variant.inventory_movements || []).reduce((sum: number, movement: any) => sum + Number(movement.quantity || 0), 0),
  })));

  // Convert existing purchase items to cart format
  const cartItems = isPending
    ? (pendingPurchase.cartItems || []).map((item: any) => ({ ...item }))
    : (purchase.items || []).map((item: any) => ({
    productId: item.variant?.product?.id,
    variantId: item.product_variant_id,
    name: item.variant?.product?.name || 'Unknown product',
    variantName: item.variant?.variant_name || 'Default',
    quantity: Number(item.quantity),
    purchasePrice: Number(item.unit_cost),
    salePrice: Number(item.variant?.sale_price || 0),
    updateSalePrice: false,
  }));

  const savedPurchaseName = purchase.created_by_name || '';
  const initialEmployeeName = savedPurchaseName || employeeName;

  return (
    <EditPurchasePOS
      supplierId={id}
      supplierName={supplier.name}
      purchaseId={purchaseId}
      catalog={catalog}
      initialCart={cartItems}
      initialPaidAmount={Number(isPending ? pendingPurchase.cashPaid || 0 : purchase.paid_amount || 0)}
      initialNotes={isPending ? pendingPurchase.note || '' : purchase.notes || ''}
      initialShippingPrice={Number(isPending ? pendingPurchase.shippingPrice || 0 : purchase.shipping_price || 0)}
      initialLoaderPrice={Number(isPending ? pendingPurchase.loaderPrice || 0 : purchase.loader_price || 0)}
      initialUnloadingPrice={Number(isPending ? pendingPurchase.unloadingPrice || 0 : purchase.unloading_price || 0)}
      isPending={isPending}
      currentUserEmail={initialEmployeeName}
    />
  );
}
