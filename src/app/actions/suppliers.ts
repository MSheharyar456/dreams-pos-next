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
      ledgerBalance = supplier.supplier_ledger.reduce((sum: number, ledger: { remaining_amount?: number | string | null }) => sum + toSignedNumber(ledger.remaining_amount), 0);
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
  const { error } = await supabase.from('suppliers').delete().eq('id', id);
  if (error) {
    console.error('Error deleting supplier:', error);
    return { success: false, error: error.message };
  }
  revalidatePath('/suppliers');
  return { success: true };
}
