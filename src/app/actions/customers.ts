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
      // Customer opening balance is an advance already paid by the customer,
      // so it offsets invoice receivables instead of adding to them.
      total_balance: ledgerBalance - toSignedNumber(customer.opening_balance)
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
  const { data: customer, error: customerFetchError } = await supabase
    .from('customers')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (customerFetchError || !customer) {
    console.error('Error finding customer to delete:', customerFetchError);
    return { success: false, error: customerFetchError?.message || 'Customer not found.' };
  }

  const { data: sales, error: salesFetchError } = await supabase
    .from('sales')
    .select('id')
    .eq('customer_id', id);
  if (salesFetchError) return { success: false, error: salesFetchError.message };
  const saleIds = (sales || []).map((sale) => sale.id);

  const salesReturnsQuery = saleIds.length > 0
    ? await supabase.from('sales_returns').select('id').in('sale_id', saleIds)
    : { data: [], error: null };
  if (salesReturnsQuery.error) return { success: false, error: salesReturnsQuery.error.message };
  const salesReturnIds = (salesReturnsQuery.data || []).map((salesReturn) => salesReturn.id);

  const { data: customerPayments, error: customerPaymentsError } = await supabase
    .from('payments')
    .select('id')
    .eq('customer_id', id);
  if (customerPaymentsError) return { success: false, error: customerPaymentsError.message };
  const salePaymentsQuery = saleIds.length > 0
    ? await supabase.from('payments').select('id').in('sale_id', saleIds)
    : { data: [], error: null };
  if (salePaymentsQuery.error) return { success: false, error: salePaymentsQuery.error.message };
  const paymentIds = Array.from(new Set([
    ...(customerPayments || []).map((payment) => payment.id),
    ...(salePaymentsQuery.data || []).map((payment) => payment.id),
  ]));

  // Payment triggers reverse the affected cash/bank balance and remove the
  // linked customer-ledger rows.
  if (paymentIds.length > 0) {
    const { error } = await supabase.from('payments').delete().in('id', paymentIds);
    if (error) return { success: false, error: `Could not delete customer payments: ${error.message}` };
  }
  if (salesReturnIds.length > 0) {
    const { error: returnItemsError } = await supabase
      .from('sales_return_items')
      .delete()
      .in('sales_return_id', salesReturnIds);
    if (returnItemsError) return { success: false, error: `Could not delete sales return items: ${returnItemsError.message}` };
    const { error: returnsError } = await supabase
      .from('sales_returns')
      .delete()
      .in('id', salesReturnIds);
    if (returnsError) return { success: false, error: `Could not delete sales returns: ${returnsError.message}` };
  }
  if (saleIds.length > 0) {
    const { error: saleItemsError } = await supabase
      .from('sale_items')
      .delete()
      .in('sale_id', saleIds);
    if (saleItemsError) return { success: false, error: `Could not delete sale items: ${saleItemsError.message}` };
  }

  const { error: ledgerError } = await supabase.from('customer_ledgers').delete().eq('customer_id', id);
  if (ledgerError) return { success: false, error: `Could not delete customer ledger entries: ${ledgerError.message}` };

  if (saleIds.length > 0) {
    const { error: salesError } = await supabase.from('sales').delete().eq('customer_id', id);
    if (salesError) return { success: false, error: `Could not delete customer sales: ${salesError.message}` };
  }

  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) {
    console.error('Error deleting customer:', error);
    return { success: false, error: error.message };
  }
  revalidatePath('/customers');
  revalidatePath('/sales');
  revalidatePath('/loans');
  revalidatePath('/loans/customers');
  return { success: true };
}
