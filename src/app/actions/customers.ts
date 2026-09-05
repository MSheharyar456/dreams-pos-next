'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

function toSignedNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getCustomers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      customer_ledgers(remaining_amount)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  const formattedData = (data || []).map(customer => {
    let ledgerBalance = 0;
    if (customer.customer_ledgers && customer.customer_ledgers.length > 0) {
      ledgerBalance = customer.customer_ledgers.reduce((sum: number, ledger: { remaining_amount?: number | string | null }) => sum + toSignedNumber(ledger.remaining_amount), 0);
    }
    return {
      ...customer,
      total_balance: toSignedNumber(customer.opening_balance) + ledgerBalance
    };
  });

  return formattedData;
}

export async function getCustomerById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
  if (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
  return data;
}

export async function createCustomer(formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const opening_balance = parseFloat(formData.get('opening_balance') as string) || 0;
  const credit_limit = parseFloat(formData.get('credit_limit') as string) || 0;
  const notes = formData.get('notes') as string;
  const is_active = formData.get('is_active') === 'true';
  
  console.log('🟢 [CUSTOMER CREATE] Adding customer:', { name, opening_balance, credit_limit });

  const { data, error } = await supabase
    .from('customers')
    .insert([{
      name,
      phone,
      address,
      opening_balance,
      credit_limit,
      notes,
      is_active
    }])
    .select()
    .single();

  if (error) {
    console.error('🔴 [CUSTOMER CREATE] Error creating customer:', error);
    return { success: false, error: error.message };
  }
  
  console.log('✅ [CUSTOMER CREATE] Successfully saved to database:', { id: data?.id, name: data?.name, opening_balance: data?.opening_balance });

  revalidatePath('/customers');
  return { success: true, data };
}

export async function updateCustomer(formData: FormData) {
  const supabase = await createClient();
  
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const opening_balance = parseFloat(formData.get('opening_balance') as string) || 0;
  const credit_limit = parseFloat(formData.get('credit_limit') as string) || 0;
  const notes = formData.get('notes') as string;
  const is_active = formData.get('is_active') === 'true';
  
  console.log('🟡 [CUSTOMER UPDATE] Updating customer:', { id, name, opening_balance, credit_limit });

  const updateData = {
    name,
    phone,
    address,
    opening_balance,
    credit_limit,
    notes,
    is_active
  };

  const { data, error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('🔴 [CUSTOMER UPDATE] Error updating customer:', error);
    return { success: false, error: error.message };
  }
  
  console.log('✅ [CUSTOMER UPDATE] Successfully updated in database:', { id: data?.id, name: data?.name, opening_balance: data?.opening_balance });

  revalidatePath('/customers');
  return { success: true, data };
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) {
    console.error('Error deleting customer:', error);
    return { success: false, error: error.message };
  }
  revalidatePath('/customers');
  return { success: true };
}
