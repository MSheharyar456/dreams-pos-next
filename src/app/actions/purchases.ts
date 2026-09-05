'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type PurchaseCartItem = {
  productId?: string;
  variantId?: string;
  name: string;
  categoryId?: string;
  brandId?: string;
  unitId?: string;
  variantName?: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
  updateSalePrice?: boolean;
};

function numberValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export async function createPurchase(
  supplierId: string,
  cartItems: PurchaseCartItem[],
  paidAmount: number,
  notes = '',
  shippingPrice = 0,
  loaderPrice = 0,
  unloadingPrice = 0,
  createdByName = 'Unknown',
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'You must be logged in to create a purchase.' };
  if (!supplierId || cartItems.length === 0) return { success: false, error: 'Add at least one product to the purchase.' };

  const validItems = cartItems.filter((item) => item.productId && item.variantId && numberValue(item.quantity) > 0 && numberValue(item.purchasePrice) >= 0);
  if (validItems.length !== cartItems.length) return { success: false, error: 'Select an existing product and use a valid quantity (greater than 0).' };

  const itemSubtotal = validItems.reduce((sum, item) => sum + numberValue(item.quantity) * numberValue(item.purchasePrice), 0);
  const shipping = numberValue(shippingPrice);
  const loader = numberValue(loaderPrice);
  const unloading = numberValue(unloadingPrice);
  const charges = shipping + loader + unloading;
  const totalAmount = itemSubtotal + charges;
  const paid = Math.max(0, Math.min(numberValue(paidAmount), totalAmount));
  const remaining = totalAmount - paid;
  const paymentStatus = remaining === 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid';

  const { data: supplier } = await supabase.from('suppliers').select('id').eq('id', supplierId).single();
  if (!supplier) return { success: false, error: 'Supplier was not found.' };

  const resolvedItems: Array<{ variantId: string; quantity: number; unitCost: number }> = [];
  for (const item of validItems) {
    const update: Record<string, number> = { purchase_price: numberValue(item.purchasePrice) };
    if (item.updateSalePrice) update.sale_price = numberValue(item.salePrice);
    const { error } = await supabase.from('product_variants').update(update).eq('id', item.variantId);
    if (error) return { success: false, error: error.message };
    resolvedItems.push({ variantId: item.variantId!, quantity: numberValue(item.quantity), unitCost: numberValue(item.purchasePrice) });
  }

  const purchaseNumber = `PUR-${Date.now()}`;
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      supplier_id: supplierId,
      purchase_number: purchaseNumber,
      subtotal: itemSubtotal,
      shipping_price: shipping,
      loader_price: loader,
      unloading_price: unloading,
      other_charges: charges,
      total_amount: totalAmount,
      paid_amount: paid,
      remaining_amount: remaining,
      payment_status: paymentStatus,
      notes: notes.trim() || null,
      created_by: user.id,
      created_by_name: createdByName.trim() || 'Unknown',
    })
    .select('id, purchase_number')
    .single();
  if (purchaseError || !purchase) return { success: false, error: purchaseError?.message || 'Could not save the purchase.' };

  const { error: itemError } = await supabase.from('purchase_items').insert(resolvedItems.map((item) => ({ purchase_id: purchase.id, product_variant_id: item.variantId, quantity: item.quantity, unit_cost: item.unitCost, total: item.quantity * item.unitCost })));
  if (itemError) return { success: false, error: itemError.message };

  // The live project uses the existing supplier-loan ledger shape (not the newer
  // debit/credit schema): one invoice row carries its total, paid, and balance.
  const { error: ledgerError } = await supabase.from('supplier_ledger').insert({
    supplier_id: supplierId,
    invoice_number: purchase.purchase_number,
    total_amount: totalAmount,
    paid_amount: paid,
    remaining_amount: remaining,
    remarks: notes.trim() || 'Purchase POP invoice',
  });
  if (ledgerError) return { success: false, error: ledgerError.message };

  revalidatePath('/suppliers');
  revalidatePath(`/suppliers/${supplierId}/products`);
  revalidatePath(`/suppliers/${supplierId}/purchases`);
  revalidatePath('/products');
  revalidatePath('/report/inventory');
  return { success: true, purchaseId: purchase.id };
}

export async function getPurchasesBySupplier(supplierId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('purchases').select('*, purchase_items(quantity, total)').eq('supplier_id', supplierId).order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function getPurchaseById(purchaseId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('purchases')
    .select('*, supplier:suppliers(name, phone, address), items:purchase_items(*, variant:product_variants(variant_name, sale_price, product:products(id, name)))')
    .eq('id', purchaseId)
    .single();
  if (error) return null;
  return data;
}

export async function deletePurchase(purchaseId: string, supplierId: string) {
  const supabase = await createClient();
  const { data: purchase, error: fetchError } = await supabase
    .from('purchases')
    .select('id, purchase_number, supplier_id')
    .eq('id', purchaseId)
    .single();
  if (fetchError || !purchase || purchase.supplier_id !== supplierId) return { success: false, error: 'Purchase invoice not found.' };

  // Remove the old-format supplier loan row explicitly; purchase-item triggers
  // remove the corresponding inventory movements when items are deleted.
  await supabase.from('supplier_ledger').delete().eq('invoice_number', purchase.purchase_number);
  const { error: itemError } = await supabase.from('purchase_items').delete().eq('purchase_id', purchaseId);
  if (itemError) return { success: false, error: itemError.message };
  const { error } = await supabase.from('purchases').delete().eq('id', purchaseId);
  if (error) return { success: false, error: error.message };

  revalidatePath(`/suppliers/${supplierId}/purchases`);
  revalidatePath(`/suppliers/${supplierId}/products`);
  revalidatePath('/products');
  revalidatePath('/report/inventory');
  return { success: true };
}

export async function updatePurchase(
  purchaseId: string,
  supplierId: string,
  cartItems: PurchaseCartItem[],
  paidAmount: number,
  notes = '',
  shippingPrice = 0,
  loaderPrice = 0,
  unloadingPrice = 0,
  createdByName = 'Unknown',
) {
  const supabase = await createClient();
  
  // Verify the purchase exists and belongs to the supplier
  const { data: purchase, error: fetchError } = await supabase
    .from('purchases')
    .select('id, purchase_number, supplier_id, paid_amount, total_amount')
    .eq('id', purchaseId)
    .single();
  
  if (fetchError || !purchase || purchase.supplier_id !== supplierId) {
    return { success: false, error: 'Purchase invoice not found.' };
  }

  if (cartItems.length === 0) {
    return { success: false, error: 'Add at least one product to the purchase.' };
  }

  const validItems = cartItems.filter((item) => item.productId && item.variantId && numberValue(item.quantity) > 0 && numberValue(item.purchasePrice) >= 0);
  if (validItems.length !== cartItems.length) {
    return { success: false, error: 'Select an existing product and use a valid quantity (greater than 0).' };
  }

  const itemSubtotal = validItems.reduce((sum, item) => sum + numberValue(item.quantity) * numberValue(item.purchasePrice), 0);
  const shipping = numberValue(shippingPrice);
  const loader = numberValue(loaderPrice);
  const unloading = numberValue(unloadingPrice);
  const charges = shipping + loader + unloading;
  const totalAmount = itemSubtotal + charges;
  const paid = Math.max(0, Math.min(numberValue(paidAmount), totalAmount));
  const remaining = totalAmount - paid;
  const paymentStatus = remaining === 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid';

  // Delete old purchase items and their inventory movements will cascade via triggers
  const { error: deleteItemError } = await supabase.from('purchase_items').delete().eq('purchase_id', purchaseId);
  if (deleteItemError) return { success: false, error: deleteItemError.message };

  // Update product variants with new prices
  const resolvedItems: Array<{ variantId: string; quantity: number; unitCost: number }> = [];
  for (const item of validItems) {
    const update: Record<string, number> = { purchase_price: numberValue(item.purchasePrice) };
    if (item.updateSalePrice) update.sale_price = numberValue(item.salePrice);
    const { error } = await supabase.from('product_variants').update(update).eq('id', item.variantId);
    if (error) return { success: false, error: error.message };
    resolvedItems.push({ variantId: item.variantId!, quantity: numberValue(item.quantity), unitCost: numberValue(item.purchasePrice) });
  }

  // Update the purchase record
  const { error: updateError } = await supabase
    .from('purchases')
    .update({
      subtotal: itemSubtotal,
      shipping_price: shipping,
      loader_price: loader,
      unloading_price: unloading,
      other_charges: charges,
      total_amount: totalAmount,
      paid_amount: paid,
      remaining_amount: remaining,
      payment_status: paymentStatus,
      notes: notes.trim() || null,
      created_by_name: createdByName.trim() || 'Unknown',
      updated_at: new Date().toISOString(),
    })
    .eq('id', purchaseId);
  
  if (updateError) return { success: false, error: updateError.message };

  // Insert new purchase items
  const { error: itemError } = await supabase.from('purchase_items').insert(
    resolvedItems.map((item) => ({
      purchase_id: purchaseId,
      product_variant_id: item.variantId,
      quantity: item.quantity,
      unit_cost: item.unitCost,
      total: item.quantity * item.unitCost,
    }))
  );
  if (itemError) return { success: false, error: itemError.message };

  // Update supplier ledger - delete old and insert new
  await supabase.from('supplier_ledger').delete().eq('invoice_number', purchase.purchase_number);
  const { error: ledgerError } = await supabase.from('supplier_ledger').insert({
    supplier_id: supplierId,
    invoice_number: purchase.purchase_number,
    total_amount: totalAmount,
    paid_amount: paid,
    remaining_amount: remaining,
    remarks: notes.trim() || 'Purchase POP invoice (updated)',
  });
  if (ledgerError) return { success: false, error: ledgerError.message };

  revalidatePath(`/suppliers/${supplierId}/purchases`);
  revalidatePath(`/suppliers/${supplierId}/products`);
  revalidatePath('/products');
  revalidatePath('/report/inventory');
  return { success: true };
}
