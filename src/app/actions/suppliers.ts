'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

function toSignedNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getSuppliers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('suppliers')
    .select(`
      *,
      supplier_ledger!supplier_ledger_supplier_id_fkey(remaining_amount)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching suppliers:', error?.message || error, error?.hint || '');
    return [];
  }
  const formattedData = (data || []).map(supplier => {
    let ledgerBalance = 0;
    if (supplier.supplier_ledger && supplier.supplier_ledger.length > 0) {
      ledgerBalance = supplier.supplier_ledger
        .filter((ledger: { remarks?: string | null }) => ledger.remarks !== 'Supplier opening balance advance')
        .reduce((sum: number, ledger: { remaining_amount?: number | string | null }) => sum + toSignedNumber(ledger.remaining_amount), 0);
    }
    return {
      ...supplier,
      total_balance: toSignedNumber(supplier.opening_balance) + ledgerBalance
    };
  });

  return formattedData;
}

export async function getSupplierById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('suppliers').select('*').eq('id', id).single();
  if (error) {
    console.error('Error fetching supplier:', error);
    return null;
  }
  return data;
}

export async function createSupplier(formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const opening_balance = parseFloat(formData.get('opening_balance') as string) || 0;
  const notes = formData.get('notes') as string;
  const is_active = formData.get('is_active') === 'true';
  
  console.log('🟢 [SUPPLIER CREATE] Adding supplier:', { name, opening_balance });

  const { data, error } = await supabase
    .from('suppliers')
    .insert([{
      name,
      phone,
      address,
      opening_balance,
      notes,
      is_active
    }])
    .select()
    .single();

  if (error) {
    console.error('🔴 [SUPPLIER CREATE] Error creating supplier:', error);
    return { success: false, error: error.message };
  }
  
  console.log('✅ [SUPPLIER CREATE] Successfully saved to database:', { id: data?.id, name: data?.name, opening_balance: data?.opening_balance });

  revalidatePath('/suppliers');
  return { success: true, data };
}

export async function updateSupplier(formData: FormData) {
  const supabase = await createClient();
  
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const opening_balance = parseFloat(formData.get('opening_balance') as string) || 0;
  const notes = formData.get('notes') as string;
  const is_active = formData.get('is_active') === 'true';
  
  console.log('🟡 [SUPPLIER UPDATE] Updating supplier:', { id, name, opening_balance });

  const updateData = {
    name,
    phone,
    address,
    opening_balance,
    notes,
    is_active
  };

  const { data, error } = await supabase
    .from('suppliers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('🔴 [SUPPLIER UPDATE] Error updating supplier:', error);
    return { success: false, error: error.message };
  }
  
  console.log('✅ [SUPPLIER UPDATE] Successfully updated in database:', { id: data?.id, name: data?.name, opening_balance: data?.opening_balance });

  revalidatePath('/suppliers');
  return { success: true, data };
}

export async function deleteSupplier(id: string) {
  const supabase = await createClient();
  const { data: supplier, error: supplierFetchError } = await supabase
    .from('suppliers')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (supplierFetchError || !supplier) {
    console.error('Error finding supplier to delete:', supplierFetchError);
    return { success: false, error: supplierFetchError?.message || 'Supplier not found.' };
  }

  const { data: purchases, error: purchasesFetchError } = await supabase
    .from('purchases')
    .select('id')
    .eq('supplier_id', id);
  if (purchasesFetchError) return { success: false, error: purchasesFetchError.message };
  const purchaseIds = (purchases || []).map((purchase) => purchase.id);

  const purchaseReturnsQuery = purchaseIds.length > 0
    ? await supabase.from('purchase_returns').select('id').in('purchase_id', purchaseIds)
    : { data: [], error: null };
  if (purchaseReturnsQuery.error) return { success: false, error: purchaseReturnsQuery.error.message };
  const purchaseReturnIds = (purchaseReturnsQuery.data || []).map((purchaseReturn) => purchaseReturn.id);

  const { data: supplierPayments, error: supplierPaymentsError } = await supabase
    .from('payments')
    .select('id')
    .eq('supplier_id', id);
  if (supplierPaymentsError) return { success: false, error: supplierPaymentsError.message };
  const purchasePaymentsQuery = purchaseIds.length > 0
    ? await supabase.from('payments').select('id').in('purchase_id', purchaseIds)
    : { data: [], error: null };
  if (purchasePaymentsQuery.error) return { success: false, error: purchasePaymentsQuery.error.message };
  const paymentIds = Array.from(new Set([
    ...(supplierPayments || []).map((payment) => payment.id),
    ...(purchasePaymentsQuery.data || []).map((payment) => payment.id),
  ]));

  // Delete payments first so their database trigger reverses their effect on
  // cash/bank accounts and removes their supplier-ledger entries.
  if (paymentIds.length > 0) {
    const { error } = await supabase.from('payments').delete().in('id', paymentIds);
    if (error) return { success: false, error: `Could not delete supplier payments: ${error.message}` };
  }
  if (purchaseReturnIds.length > 0) {
    const { error: returnItemsError } = await supabase
      .from('purchase_return_items')
      .delete()
      .in('purchase_return_id', purchaseReturnIds);
    if (returnItemsError) return { success: false, error: `Could not delete purchase return items: ${returnItemsError.message}` };
    const { error: returnsError } = await supabase
      .from('purchase_returns')
      .delete()
      .in('id', purchaseReturnIds);
    if (returnsError) return { success: false, error: `Could not delete purchase returns: ${returnsError.message}` };
  }
  if (purchaseIds.length > 0) {
    const { error: purchaseItemsError } = await supabase
      .from('purchase_items')
      .delete()
      .in('purchase_id', purchaseIds);
    if (purchaseItemsError) return { success: false, error: `Could not delete purchase items: ${purchaseItemsError.message}` };
  }

  const { error: ledgerError } = await supabase.from('supplier_ledger').delete().eq('supplier_id', id);
  if (ledgerError) return { success: false, error: `Could not delete supplier ledger entries: ${ledgerError.message}` };

  if (purchaseIds.length > 0) {
    const { error: purchasesError } = await supabase.from('purchases').delete().eq('supplier_id', id);
    if (purchasesError) return { success: false, error: `Could not delete purchase invoices: ${purchasesError.message}` };
  }

  const { error } = await supabase.from('suppliers').delete().eq('id', id);
  if (error) {
    console.error('Error deleting supplier:', error);
    return { success: false, error: error.message };
  }
  revalidatePath('/suppliers');
  revalidatePath('/purchases');
  revalidatePath('/purchase-dashboard');
  revalidatePath('/loans/suppliers');
  return { success: true };
}
