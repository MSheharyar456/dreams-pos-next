'use server';

import { createClient } from '@/lib/supabase/server';

export async function getCustomerLedgers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('customer_ledgers')
    .select(`
      *,
      customers (
        name,
        phone,
        opening_balance
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('🔴 [LOANS ACTION] Error fetching customer ledgers:', error);
    return [];
  }
  
  console.log('✅ [LOANS ACTION] Successfully fetched', data?.length || 0, 'customer ledger records');
  data?.forEach((ledger, idx) => {
    console.log(`   Record ${idx + 1}: customer="${ledger.customers?.name}", opening_balance=${ledger.customers?.opening_balance}`);
  });
  
  return data || [];
}

// NEW: Get customers with opening_balance but NO ledger entries
export async function getCustomersWithOpeningBalanceOnly() {
  const supabase = await createClient();
  
  // Get customers with opening_balance but filter out those with ledger entries
  const { data: allCustomers, error: customerError } = await supabase
    .from('customers')
    .select(`
      id,
      name,
      phone,
      opening_balance
    `)
    .gt('opening_balance', 0)
    .neq('opening_balance', 0);
    
  if (customerError) {
    console.error('🔴 [LOANS ACTION] Error fetching customers with opening balance:', customerError);
    return [];
  }
  
  // Get customer IDs that have ledger entries
  const { data: ledgerCustomers } = await supabase
    .from('customer_ledgers')
    .select('customer_id');
  
  const ledgerCustomerIds = new Set(ledgerCustomers?.map(l => l.customer_id) || []);
  
  // Filter out customers that already have ledger entries
  const customersWithoutLedgers = (allCustomers || []).filter(
    c => c.id && !ledgerCustomerIds.has(c.id)
  );
  
  console.log('✅ [LOANS ACTION] Found', customersWithoutLedgers.length, 'customers with opening_balance but no ledger entries');
  customersWithoutLedgers.forEach((customer, idx) => {
    console.log(`   Customer ${idx + 1}: name="${customer.name}", opening_balance=${customer.opening_balance}`);
  });
  
  // Convert to ledger-like format for compatibility
  return customersWithoutLedgers.map(c => ({
    id: c.id,
    customer_id: c.id,
    invoice_number: null,
    customers: {
      name: c.name,
      phone: c.phone,
      opening_balance: c.opening_balance
    },
    total_amount: c.opening_balance,       // Opening balance amount
    paid_amount: c.opening_balance,        // Already paid (advance received)
    remaining_amount: -c.opening_balance,  // Negative = we owe them goods (need to pay)
    created_at: new Date().toISOString()
  }));
}

export async function getSupplierLedgers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('supplier_ledger')
    .select(`
      *,
      suppliers (
        name,
        phone,
        opening_balance
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('🔴 [LOANS ACTION] Error fetching supplier ledgers:', error);
    return [];
  }
  
  console.log('✅ [LOANS ACTION] Successfully fetched', data?.length || 0, 'supplier ledger records');
  data?.forEach((ledger, idx) => {
    console.log(`   Record ${idx + 1}: supplier="${ledger.suppliers?.name}", opening_balance=${ledger.suppliers?.opening_balance}`);
  });
  
  return data || [];
}

// NEW: Get suppliers with opening_balance but NO ledger entries
export async function getSuppliersWithOpeningBalanceOnly() {
  const supabase = await createClient();
  
  // Get suppliers with opening_balance
  const { data: allSuppliers, error: supplierError } = await supabase
    .from('suppliers')
    .select(`
      id,
      name,
      phone,
      opening_balance
    `)
    .gt('opening_balance', 0)
    .neq('opening_balance', 0);
    
  if (supplierError) {
    console.error('🔴 [LOANS ACTION] Error fetching suppliers with opening balance:', supplierError);
    return [];
  }
  
  // Get supplier IDs that have ledger entries
  const { data: ledgerSuppliers } = await supabase
    .from('supplier_ledger')
    .select('supplier_id');
  
  const ledgerSupplierIds = new Set(ledgerSuppliers?.map(l => l.supplier_id) || []);
  
  // Filter out suppliers that already have ledger entries
  const suppliersWithoutLedgers = (allSuppliers || []).filter(
    s => s.id && !ledgerSupplierIds.has(s.id)
  );
  
  console.log('✅ [LOANS ACTION] Found', suppliersWithoutLedgers.length, 'suppliers with opening_balance but no ledger entries');
  suppliersWithoutLedgers.forEach((supplier, idx) => {
    console.log(`   Supplier ${idx + 1}: name="${supplier.name}", opening_balance=${supplier.opening_balance}`);
  });
  
  // Convert to ledger-like format for compatibility
  return suppliersWithoutLedgers.map(s => ({
    id: s.id,
    supplier_id: s.id,
    invoice_number: null,
    suppliers: {
      name: s.name,
      phone: s.phone,
      opening_balance: s.opening_balance
    },
    total_amount: s.opening_balance,       // Opening balance amount
    paid_amount: s.opening_balance,        // Already paid (advance given)
    remaining_amount: -s.opening_balance,  // Negative = they owe us goods (need to receive)
    created_at: new Date().toISOString()
  }));
}

export async function updateLoanBalance(type: 'customer' | 'supplier', ledgerId: string, paymentAmount: number, remarks: string) {
  const supabase = await createClient();
  const table = type === 'customer' ? 'customer_ledgers' : 'supplier_ledger';

  const { data: current, error: fetchError } = await supabase
    .from(table)
    .select('*')
    .eq('id', ledgerId)
    .single();

  if (fetchError || !current) {
    console.error('Error fetching ledger:', fetchError);
    return { success: false, error: 'Ledger not found' };
  }

  const totalAmount = Number(current.total_amount) || 0;
  const currentRemaining = Number(current.remaining_amount) || 0;
  const adjustment = Math.max(0, Number(paymentAmount) || 0);

  // Legacy trade logic: edit is an adjustment of the current balance.
  // If the balance crosses zero, the loan flips to the opposite side instead of being clamped.
  const nextRemaining = currentRemaining - adjustment;
  const nextPaidAmount = totalAmount - nextRemaining;

  const newRemarks = remarks
    ? `${current.remarks || ''}\n[${new Date().toLocaleDateString('en-GB')}] Adjustment of ${adjustment}: ${remarks}`.trim()
    : current.remarks;

  const { error: updateError } = await supabase
    .from(table)
    .update({
      paid_amount: Number(nextPaidAmount.toFixed(2)),
      remaining_amount: Number(nextRemaining.toFixed(2)),
      remarks: newRemarks
    })
    .eq('id', ledgerId);

  if (updateError) {
    console.error('Error updating ledger:', updateError);
    return { success: false, error: 'Failed to update balance' };
  }

  return { success: true };
}

export async function deleteLoanLedger(type: 'customer' | 'supplier', ledgerId: string) {
  const supabase = await createClient();
  const table = type === 'customer' ? 'customer_ledgers' : 'supplier_ledger';

  const { data: current, error: fetchError } = await supabase
    .from(table)
    .select('*')
    .eq('id', ledgerId)
    .single();

  if (fetchError || !current) {
    console.error('Error fetching ledger before delete:', fetchError);
    return { success: false, error: 'Ledger not found' };
  }

  const remainingAmount = Math.abs(Number(current.remaining_amount) || 0);

  if (remainingAmount > 0.009) {
    return {
      success: false,
      error: 'This loan cannot be deleted until the remaining balance is fully cleared.'
    };
  }

  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .eq('id', ledgerId);

  if (deleteError) {
    console.error('Error deleting ledger:', deleteError);
    return { success: false, error: 'Failed to delete ledger' };
  }

  return { success: true };
}
