'use server';

import { createClient } from '@/lib/supabase/server';

export async function getCustomerLedgers() {
  const supabase = await createClient();
  let { data, error } = await supabase
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

  // Legacy customer edits could leave an overpayment as a negative invoice
  // remainder. Move that credit to the customer's advance once, then clear the
  // invoice remainder so it cannot be counted twice on subsequent reads.
  const advanceByCustomer = new Map<string, number>();
  for (const ledger of data || []) {
    const invoiceRemainder = Number(ledger.remaining_amount || 0);
    if (!ledger.customer_id || !ledger.invoice_number || invoiceRemainder >= -0.009) continue;

    const { data: customer, error: fetchCustomerError } = await supabase
      .from('customers')
      .select('opening_balance')
      .eq('id', ledger.customer_id)
      .maybeSingle();
    if (fetchCustomerError || !customer) continue;

    const currentAdvance = advanceByCustomer.get(ledger.customer_id)
      ?? Math.max(0, Number(customer.opening_balance || 0));
    const credit = Number(Math.abs(invoiceRemainder).toFixed(2));
    const nextAdvance = Number((currentAdvance + credit).toFixed(2));
    let ledgerMeta: Record<string, any> = {};
    try {
      const parsed = JSON.parse(ledger.remarks || '{}');
      if (parsed && typeof parsed === 'object') ledgerMeta = parsed;
    } catch {
      ledgerMeta = {};
    }

    const { error: customerUpdateError } = await supabase
      .from('customers')
      .update({ opening_balance: nextAdvance })
      .eq('id', ledger.customer_id);
    if (customerUpdateError) continue;

    const totalAmount = Math.max(0, Number(ledger.total_amount || 0));
    const { error: ledgerUpdateError } = await supabase
      .from('customer_ledgers')
      .update({
        remaining_amount: 0,
        paid_amount: totalAmount,
        remarks: JSON.stringify({
          ...ledgerMeta,
          available_advance: nextAdvance,
          paid_amount: totalAmount,
          remaining_amount: 0,
        }),
      })
      .eq('id', ledger.id);
    if (ledgerUpdateError) {
      await supabase
        .from('customers')
        .update({ opening_balance: currentAdvance })
        .eq('id', ledger.customer_id)
        .eq('opening_balance', nextAdvance);
      continue;
    }

    advanceByCustomer.set(ledger.customer_id, nextAdvance);
    ledger.remaining_amount = 0;
    ledger.paid_amount = totalAmount;
    ledger.remarks = JSON.stringify({
      ...ledgerMeta,
      available_advance: nextAdvance,
      paid_amount: totalAmount,
      remaining_amount: 0,
    });
    if (ledger.customers) ledger.customers.opening_balance = nextAdvance;
  }

  // Roll each customer's outstanding invoice balance onto their latest
  // invoice, preserving the source rows and adjustment histories as carry
  // records so their amounts are not counted twice.
  const invoicesByCustomer = new Map<string, any[]>();
  for (const ledger of data || []) {
    if (!ledger.customer_id || !ledger.invoice_number) continue;
    const customerRows = invoicesByCustomer.get(ledger.customer_id) || [];
    customerRows.push(ledger);
    invoicesByCustomer.set(ledger.customer_id, customerRows);
  }
  for (const customerRows of invoicesByCustomer.values()) {
    if (customerRows.length < 2) continue;
    customerRows.sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime());
    const latest = customerRows[customerRows.length - 1];
    const earlierRows = customerRows.slice(0, -1);
    if (!earlierRows.some((row) => Math.abs(Number(row.remaining_amount || 0)) >= 0.005)) continue;
    const combinedRemaining = Number(customerRows.reduce(
      (balance, row) => balance + Number(row.remaining_amount || 0),
      0
    ).toFixed(2));

    for (const row of earlierRows) {
      const carriedBalance = Number(row.remaining_amount || 0);
      if (Math.abs(carriedBalance) < 0.005) continue;
      let meta: any = {};
      try { meta = JSON.parse(row.remarks || '{}'); } catch { meta = { original_remarks: row.remarks || '' }; }
      meta.carried_forward_balance = Number((Number(meta.carried_forward_balance || 0) + carriedBalance).toFixed(2));
      meta.carried_forward_to = latest.invoice_number;
      meta.manual_remaining = 0;
      const remarks = JSON.stringify(meta);
      await supabase
        .from('customer_ledgers')
        .update({ remaining_amount: 0, remarks })
        .eq('id', row.id);
      row.remaining_amount = 0;
      row.remarks = remarks;
    }

    let latestMeta: any = {};
    try { latestMeta = JSON.parse(latest.remarks || '{}'); } catch { latestMeta = { original_remarks: latest.remarks || '' }; }
    latestMeta.customer_balance_rollup = true;
    latestMeta.manual_remaining = combinedRemaining;
    const latestRemarks = JSON.stringify(latestMeta);
    await supabase
      .from('customer_ledgers')
      .update({ remaining_amount: combinedRemaining, remarks: latestRemarks })
      .eq('id', latest.id);
    latest.remaining_amount = combinedRemaining;
    latest.remarks = latestRemarks;
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

  const { data: allCustomers, error: customerError } = await supabase
    .from('customers')
    .select(`
      id,
      name,
      phone,
      opening_balance
    `)
    .gt('opening_balance', 0);

  if (customerError) {
    console.error('🔴 [LOANS ACTION] Error fetching customers with opening balance:', customerError);
    return [];
  }

  // Return all customers with positive opening_balance as advance rows.
  const customersWithBalance = allCustomers || [];

  console.log('✅ [LOANS ACTION] Found', customersWithBalance.length, 'customers with positive opening balance');
  customersWithBalance.forEach((customer, idx) => {
    console.log(`   Customer ${idx + 1}: name="${customer.name}", opening_balance=${customer.opening_balance}`);
  });

  return customersWithBalance.map(c => ({
    id: `${c.id}-advance`,
    customer_id: c.id,
    invoice_number: null,
    customers: {
      name: c.name,
      phone: c.phone,
      opening_balance: c.opening_balance
    },
    total_amount: 0,
    paid_amount: c.opening_balance,
    remaining_amount: -c.opening_balance,
    remarks: JSON.stringify({
      type: 'advance',
      note: 'Customer opening balance advance'
    }),
    created_at: new Date().toISOString()
  }));
}

export async function getSupplierLedgers() {
  const supabase = await createClient();
  let { data, error } = await supabase
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

  if (error) return [];

  const { data: purchases } = await supabase
    .from('purchases')
    .select('supplier_id, purchase_number, total_amount, paid_amount, remaining_amount, notes')
    .order('created_at', { ascending: false });
  const pendingPurchases = (purchases || []).filter((purchase) => {
    try {
      return JSON.parse(purchase.notes || '{}')?.type === 'pending_pop';
    } catch {
      return false;
    }
  });
  const pendingPurchaseNumbers = new Set(pendingPurchases.map((purchase) => purchase.purchase_number));
  let pendingLedgerCleaned = false;

  // Pending POPs must not create ledger entries or consume supplier advances.
  for (const pendingPurchase of pendingPurchases) {
    if (!pendingPurchase.purchase_number) continue;
    const pendingLedger = (data || []).find((ledger) => ledger.invoice_number === pendingPurchase.purchase_number);
    if (!pendingLedger) continue;

    let pendingMeta: any = {};
    try { pendingMeta = JSON.parse(pendingPurchase.notes || '{}'); } catch { pendingMeta = {}; }
    const cashPaid = Math.max(0, Number(pendingMeta.cashPaid ?? pendingMeta.cash_paid ?? 0));
    const wronglyAppliedAdvance = Math.max(0, Number(pendingPurchase.paid_amount || 0) - cashPaid);
    if (wronglyAppliedAdvance > 0) {
      const { data: supplier } = await supabase
        .from('suppliers')
        .select('opening_balance')
        .eq('id', pendingPurchase.supplier_id)
        .single();
      await supabase
        .from('suppliers')
        .update({ opening_balance: Number(supplier?.opening_balance || 0) + wronglyAppliedAdvance })
        .eq('id', pendingPurchase.supplier_id);
    }

    const totalAmount = Number(pendingPurchase.total_amount || 0);
    const pendingRemaining = Math.max(0, totalAmount - cashPaid);
    await supabase
      .from('purchases')
      .update({
        paid_amount: cashPaid,
        remaining_amount: pendingRemaining,
        payment_status: pendingRemaining === 0 ? 'paid' : cashPaid > 0 ? 'partial' : 'unpaid',
      })
      .eq('purchase_number', pendingPurchase.purchase_number)
      .eq('supplier_id', pendingPurchase.supplier_id);
    await supabase.from('supplier_ledger').delete().eq('id', pendingLedger.id);
    pendingLedgerCleaned = true;
  }

  const ledgerInvoiceNumbers = new Set((data || []).map((ledger) => ledger.invoice_number).filter(Boolean));
  const missingPurchaseLedgers = (purchases || []).filter(
    (purchase) => purchase.purchase_number
      && !pendingPurchaseNumbers.has(purchase.purchase_number)
      && !ledgerInvoiceNumbers.has(purchase.purchase_number),
  );

  if (missingPurchaseLedgers.length > 0) {
    await supabase.from('supplier_ledger').insert(missingPurchaseLedgers.map((purchase) => ({
      supplier_id: purchase.supplier_id,
      invoice_number: purchase.purchase_number,
      total_amount: purchase.total_amount,
      paid_amount: purchase.paid_amount,
      remaining_amount: purchase.remaining_amount,
      remarks: purchase.notes || 'Purchase POP invoice',
    })));

    const refreshed = await supabase
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
    data = refreshed.data;
    error = refreshed.error;
  }

  if (error) return [];

  if (pendingLedgerCleaned && missingPurchaseLedgers.length === 0) {
    const refreshed = await supabase
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
    data = refreshed.data;
    error = refreshed.error;
  }

  if (error) return [];

  let invoiceChanged = false;
  for (const ledger of data || []) {
    if (!ledger.invoice_number) continue;
    const total = Math.max(0, Number(ledger.total_amount || 0));
    let ledgerMeta: any = {};
    try { ledgerMeta = JSON.parse(ledger.remarks || '{}'); } catch { ledgerMeta = {}; }
    if (ledgerMeta.carried_forward_to) continue;
    if (ledgerMeta.type === 'purchase_pop' && ledgerMeta.advance_used !== undefined) {
      const cashPaid = Math.max(0, Number(ledgerMeta.cash_paid || 0));
      const availableAdvance = Math.max(0, Number(ledgerMeta.available_advance || 0));
      const purchaseRemaining = Math.max(0, Number(ledgerMeta.remaining_amount || 0));
      const oldAdjustment = Number(ledgerMeta.manual_adjustment);
      const oldManualRemaining = Number(ledgerMeta.manual_remaining);
      const balanceBeforeAdjustment = purchaseRemaining - availableAdvance;
      const currentSupplierBalance = Math.max(0, Number(ledger.suppliers?.opening_balance || 0));
      const matchesOldWrongNeedReceiveEdit = Number.isFinite(oldAdjustment)
        && oldAdjustment > 0
        && balanceBeforeAdjustment < 0
        && ledgerMeta.manual_remaining !== undefined
        && Math.abs(oldManualRemaining - (balanceBeforeAdjustment - oldAdjustment)) < 0.01
        && Math.abs(currentSupplierBalance - (availableAdvance + oldAdjustment)) < 0.01;

      if (matchesOldWrongNeedReceiveEdit) {
        const correctedRemaining = Number((balanceBeforeAdjustment + oldAdjustment).toFixed(2));
        const correctedAdvance = Number(Math.max(0, availableAdvance - oldAdjustment).toFixed(2));
        ledgerMeta.manual_adjustment = -oldAdjustment;
        ledgerMeta.manual_remaining = correctedRemaining;
        ledgerMeta.manual_available_advance = correctedAdvance;
        ledgerMeta.adjustment_history = [{
          amount: -oldAdjustment,
          balance_after: correctedRemaining,
          balance_type: 'net',
          date: ledgerMeta.manual_adjustment_date || new Date().toLocaleDateString('en-GB'),
          remarks: ledgerMeta.manual_adjustment_note || ''
        }];
        const correctedRemarks = JSON.stringify(ledgerMeta);
        await supabase
          .from('supplier_ledger')
          .update({ remaining_amount: correctedRemaining, remarks: correctedRemarks })
          .eq('id', ledger.id);
        await supabase
          .from('suppliers')
          .update({ opening_balance: correctedAdvance })
          .eq('id', ledger.supplier_id);
        ledger.remaining_amount = correctedRemaining;
        ledger.remarks = correctedRemarks;
        if (ledger.suppliers) ledger.suppliers.opening_balance = correctedAdvance;
        invoiceChanged = true;
      }

      const ledgerRemaining = ledgerMeta.manual_remaining !== undefined
        ? Number(ledgerMeta.manual_remaining)
        : purchaseRemaining - availableAdvance;
      if (Number(ledger.paid_amount || 0) !== cashPaid || Number(ledger.remaining_amount || 0) !== ledgerRemaining) {
        await supabase
          .from('supplier_ledger')
          .update({ paid_amount: cashPaid, remaining_amount: ledgerRemaining })
          .eq('id', ledger.id);
        invoiceChanged = true;
      }
      continue;
    }
    if (ledgerMeta.supplier_balance_rollup) {
      const rolledUpRemaining = Number(ledgerMeta.manual_remaining ?? ledger.remaining_amount ?? 0);
      if (Number(ledger.remaining_amount || 0) !== rolledUpRemaining) {
        await supabase
          .from('supplier_ledger')
          .update({ remaining_amount: rolledUpRemaining })
          .eq('id', ledger.id);
        ledger.remaining_amount = rolledUpRemaining;
        invoiceChanged = true;
      }
      continue;
    }
    const paid = Math.min(total, Math.max(0, Number(ledger.paid_amount || 0)));
    const remaining = Math.max(0, total - paid);
    if (Number(ledger.paid_amount || 0) !== paid || Number(ledger.remaining_amount || 0) !== remaining) {
      await supabase
        .from('supplier_ledger')
        .update({ paid_amount: paid, remaining_amount: remaining })
        .eq('id', ledger.id);
      if (ledger.invoice_number) {
        await supabase
          .from('purchases')
          .update({ paid_amount: paid, remaining_amount: remaining, payment_status: remaining === 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid' })
          .eq('supplier_id', ledger.supplier_id)
          .eq('purchase_number', ledger.invoice_number);
      }
      invoiceChanged = true;
    }
  }

  if (invoiceChanged) {
    const refreshed = await supabase
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
    data = refreshed.data;
    error = refreshed.error;
  }

  // Keep one live balance on each supplier's latest invoice. Earlier invoice
  // rows retain their adjustment histories, while their outstanding amount is
  // carried into the latest row exactly once.
  const invoicesBySupplier = new Map<string, any[]>();
  for (const ledger of data || []) {
    if (!ledger.supplier_id || !ledger.invoice_number) continue;
    const supplierRows = invoicesBySupplier.get(ledger.supplier_id) || [];
    supplierRows.push(ledger);
    invoicesBySupplier.set(ledger.supplier_id, supplierRows);
  }
  for (const supplierRows of invoicesBySupplier.values()) {
    if (supplierRows.length < 2) continue;
    supplierRows.sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime());
    const latest = supplierRows[supplierRows.length - 1];
    const earlierRows = supplierRows.slice(0, -1);
    if (!earlierRows.some((row) => Math.abs(Number(row.remaining_amount || 0)) >= 0.005)) continue;
    const combinedRemaining = Number(supplierRows.reduce(
      (balance, row) => balance + Number(row.remaining_amount || 0),
      0
    ).toFixed(2));

    for (const row of earlierRows) {
      const carriedBalance = Number(row.remaining_amount || 0);
      if (Math.abs(carriedBalance) < 0.005) continue;
      let meta: any = {};
      try { meta = JSON.parse(row.remarks || '{}'); } catch { meta = { original_remarks: row.remarks || '' }; }
      meta.carried_forward_balance = Number((Number(meta.carried_forward_balance || 0) + carriedBalance).toFixed(2));
      meta.carried_forward_to = latest.invoice_number;
      if (meta.type === 'purchase_pop') meta.manual_remaining = 0;
      const remarks = JSON.stringify(meta);
      await supabase
        .from('supplier_ledger')
        .update({ remaining_amount: 0, remarks })
        .eq('id', row.id);
      row.remaining_amount = 0;
      row.remarks = remarks;
    }

    let latestMeta: any = {};
    try { latestMeta = JSON.parse(latest.remarks || '{}'); } catch { latestMeta = { original_remarks: latest.remarks || '' }; }
    latestMeta.supplier_balance_rollup = true;
    latestMeta.manual_remaining = combinedRemaining;
    const latestRemarks = JSON.stringify(latestMeta);
    await supabase
      .from('supplier_ledger')
      .update({ remaining_amount: combinedRemaining, remarks: latestRemarks })
      .eq('id', latest.id);
    latest.remaining_amount = combinedRemaining;
    latest.remarks = latestRemarks;
  }

  const supplierBalances = new Map<string, number>();
  for (const ledger of data || []) {
    if (!ledger.supplier_id || !ledger.invoice_number) continue;
    if (!supplierBalances.has(ledger.supplier_id)) {
      supplierBalances.set(ledger.supplier_id, Math.max(0, Number(ledger.suppliers?.opening_balance || 0)));
    }
  }

  let ledgerChanged = false;
  for (const [supplierId, openingBalance] of supplierBalances) {
    let availableAdvance = openingBalance;
    if (availableAdvance <= 0) continue;

    const supplierInvoices = (data || [])
      .filter((ledger) => ledger.supplier_id === supplierId && ledger.invoice_number)
      .sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime());

    for (const ledger of supplierInvoices) {
      const remaining = Math.max(0, Number(ledger.remaining_amount || 0));
      const applied = Math.min(availableAdvance, remaining);
      if (applied <= 0) continue;

      const nextPaid = Number(ledger.paid_amount || 0) + applied;
      const nextRemaining = remaining - applied;
      await supabase
        .from('supplier_ledger')
        .update({ paid_amount: nextPaid, remaining_amount: nextRemaining })
        .eq('id', ledger.id);
      const { data: purchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('supplier_id', supplierId)
        .eq('purchase_number', ledger.invoice_number)
        .maybeSingle();
      if (purchase) {
        await supabase
          .from('purchases')
          .update({ paid_amount: nextPaid, remaining_amount: nextRemaining, payment_status: nextRemaining === 0 ? 'paid' : 'partial' })
          .eq('id', purchase.id);
      }
      availableAdvance -= applied;
      ledgerChanged = true;
      if (availableAdvance <= 0) break;
    }

    if (availableAdvance !== openingBalance) {
      await supabase
        .from('suppliers')
        .update({ opening_balance: availableAdvance })
        .eq('id', supplierId);
    }
  }

  if (ledgerChanged) {
    const refreshed = await supabase
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
    data = refreshed.data;
    error = refreshed.error;
  }
  
  console.log('✅ [LOANS ACTION] Successfully fetched', data?.length || 0, 'supplier ledger records');
  data?.forEach((ledger, idx) => {
    console.log(`   Record ${idx + 1}: supplier="${ledger.suppliers?.name}", opening_balance=${ledger.suppliers?.opening_balance}`);
  });
  
  return (data || []).filter((ledger) => ledger.remarks !== 'Supplier opening balance advance');
}

export async function getSupplierLoanHistory(ledgerId: string) {
  const supabase = await createClient();
  const { data: ledger } = await supabase
    .from('supplier_ledger')
    .select('supplier_id')
    .eq('id', ledgerId)
    .maybeSingle();
  if (!ledger?.supplier_id) return [];

  const { data, error } = await supabase
    .from('supplier_ledger')
    .select('*')
    .eq('supplier_id', ledger.supplier_id)
    .not('invoice_number', 'is', null)
    .order('created_at', { ascending: false });
  if (error) return [];
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
  
  const { data: ledgerSuppliers } = await supabase
    .from('supplier_ledger')
    .select('supplier_id, remarks');
  const suppliersWithInvoices = new Set(
    ledgerSuppliers
      ?.filter((ledger) => ledger.remarks !== 'Supplier opening balance advance')
      .map((ledger) => ledger.supplier_id) || [],
  );
  const suppliersWithAdvance = (allSuppliers || []).filter(
    (supplier) => !suppliersWithInvoices.has(supplier.id),
  );

  console.log('✅ [LOANS ACTION] Found', suppliersWithAdvance.length, 'suppliers with opening balance and no POP invoice');
  suppliersWithAdvance.forEach((supplier, idx) => {
    console.log(`   Supplier ${idx + 1}: name="${supplier.name}", opening_balance=${supplier.opening_balance}`);
  });
  
  // Convert to ledger-like format for compatibility.
  // The opening balance is money already paid to the supplier, so it is a credit
  // and belongs under Need Receive until it is used against a purchase.
  return suppliersWithAdvance.map(s => ({
    id: s.id,
    supplier_id: s.id,
    invoice_number: null,
    suppliers: {
      name: s.name,
      phone: s.phone,
      opening_balance: s.opening_balance
    },
    total_amount: 0,
    paid_amount: s.opening_balance,
    remaining_amount: -s.opening_balance,
    remarks: 'Supplier opening balance advance',
    created_at: new Date().toISOString()
  }));
}

export async function updateLoanBalance(type: 'customer' | 'supplier', ledgerId: string, paymentAmount: number, remarks: string) {
  const supabase = await createClient();
  const table = type === 'customer' ? 'customer_ledgers' : 'supplier_ledger';

  if (type === 'customer') {
    const { data: currentLedger } = await supabase
      .from('customer_ledgers')
      .select('customer_id, invoice_number, total_amount, paid_amount, remaining_amount, remarks')
      .eq('id', ledgerId)
      .maybeSingle();
    const customerId = currentLedger?.customer_id || ledgerId.replace(/-advance$/, '');
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('opening_balance, notes')
      .eq('id', customerId)
      .maybeSingle();

    if (customerError || !customer) {
      return { success: false, error: 'Customer balance not found' };
    }

    let customerInvoiceRows: any[] = [];
    let currentInvoiceRemaining = Number(currentLedger?.remaining_amount ?? 0);
    if (currentLedger?.invoice_number && currentLedger.customer_id) {
      const { data: rows } = await supabase
        .from('customer_ledgers')
        .select('*')
        .eq('customer_id', currentLedger.customer_id)
        .not('invoice_number', 'is', null)
        .order('created_at', { ascending: true });
      customerInvoiceRows = rows || [];
      const latestInvoice = customerInvoiceRows[customerInvoiceRows.length - 1];
      if (latestInvoice?.id === currentLedger.id) {
        currentInvoiceRemaining = Number(customerInvoiceRows.reduce(
          (balance, row) => balance + Number(row.remaining_amount || 0),
          0
        ).toFixed(2));
      }
    }

    const persistCustomerInvoiceRollup = async (remaining: number) => {
      if (!currentLedger?.invoice_number || customerInvoiceRows[customerInvoiceRows.length - 1]?.id !== currentLedger.id) return;
      for (const row of customerInvoiceRows) {
        if (row.id === currentLedger.id) continue;
        const carriedBalance = Number(row.remaining_amount || 0);
        if (Math.abs(carriedBalance) < 0.005) continue;
        let meta: any = {};
        try { meta = JSON.parse(row.remarks || '{}'); } catch { meta = { original_remarks: row.remarks || '' }; }
        meta.carried_forward_balance = Number((Number(meta.carried_forward_balance || 0) + carriedBalance).toFixed(2));
        meta.carried_forward_to = currentLedger.invoice_number;
        meta.manual_remaining = 0;
        const { error } = await supabase
          .from('customer_ledgers')
          .update({ remaining_amount: 0, remarks: JSON.stringify(meta) })
          .eq('id', row.id);
        if (error) return error;
      }

      const { data: updatedLatest, error: latestError } = await supabase
        .from('customer_ledgers')
        .select('remarks')
        .eq('id', currentLedger.id)
        .maybeSingle();
      if (latestError) return latestError;
      let latestMeta: any = {};
      try { latestMeta = JSON.parse(updatedLatest?.remarks || '{}'); } catch { latestMeta = {}; }
      latestMeta.customer_balance_rollup = true;
      latestMeta.manual_remaining = Number(remaining.toFixed(2));
      const { error } = await supabase
        .from('customer_ledgers')
        .update({ remaining_amount: Number(remaining.toFixed(2)), remarks: JSON.stringify(latestMeta) })
        .eq('id', currentLedger.id);
      return error;
    };

    const adjustment = Number(paymentAmount);
    if (!Number.isFinite(adjustment)) {
      return { success: false, error: 'Adjustment must be a valid number' };
    }

    if (!currentLedger) {
      const currentAdvance = Number(customer.opening_balance || 0);
      const nextAdvance = Math.max(0, currentAdvance + adjustment);
      const transactionNote = remarks.trim()
        ? `[Customer Ledger Transaction Details] ${JSON.stringify({
            date: new Date().toLocaleDateString('en-GB'),
            remarks: remarks.trim()
          })}`
        : '';
      const nextCustomerNotes = transactionNote
        ? [customer.notes, transactionNote].filter(Boolean).join('\n')
        : customer.notes;
      const { error: balanceError } = await supabase
        .from('customers')
        .update({
          opening_balance: Number(nextAdvance.toFixed(2)),
          ...(transactionNote ? { notes: nextCustomerNotes } : {})
        })
        .eq('id', customerId);
      if (balanceError) {
        return { success: false, error: 'Failed to update customer opening balance' };
      }
      return { success: true };
    }

    let ledgerRemarks: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(currentLedger?.remarks || '{}');
      if (parsed && typeof parsed === 'object') ledgerRemarks = parsed;
    } catch {
      ledgerRemarks = {};
    }

    const currentSignedRemaining = currentInvoiceRemaining;
    // A negative customer adjustment comes from the Need Pay editor. Settle it
    // against the customer's outstanding opening advance, not the invoice due.
    // If more is settled than the remaining advance, record the excess as due
    // from the customer on this invoice so the signed net balance flips to Need Receive.
    if (currentLedger.invoice_number && adjustment < 0) {
      const currentAdvance = Math.max(0, Number(customer.opening_balance || 0))
        + Math.max(0, -currentSignedRemaining);
      const settlementAmount = Math.abs(adjustment);
      const nextAdvance = Math.max(0, Number((currentAdvance - settlementAmount).toFixed(2)));
      const excessSettlement = Math.max(0, Number((settlementAmount - currentAdvance).toFixed(2)));
      const nextInvoiceRemaining = Number((Math.max(0, currentSignedRemaining) + excessSettlement).toFixed(2));
      const nextPaidAmount = Math.max(0, Number(currentLedger.total_amount || 0) - nextInvoiceRemaining);
      const { error: balanceError } = await supabase
        .from('customers')
        .update({ opening_balance: nextAdvance })
        .eq('id', customerId);

      if (balanceError) {
        return { success: false, error: 'Failed to settle customer advance' };
      }

      const adjustmentHistory = Array.isArray(ledgerRemarks.adjustment_history)
        ? ledgerRemarks.adjustment_history
        : [];
      const { error: remarksError } = await supabase
        .from('customer_ledgers')
        .update({
          remaining_amount: nextInvoiceRemaining,
          paid_amount: Number(nextPaidAmount.toFixed(2)),
          remarks: JSON.stringify({
            ...ledgerRemarks,
            available_advance: nextAdvance,
            remaining_amount: nextInvoiceRemaining,
            paid_amount: Number(nextPaidAmount.toFixed(2)),
            manual_adjustment: Number((Number(ledgerRemarks.manual_adjustment ?? 0) + adjustment).toFixed(2)),
            manual_adjustment_date: new Date().toLocaleDateString('en-GB'),
            manual_adjustment_note: remarks || '',
            adjustment_history: [
              ...adjustmentHistory,
              {
                amount: adjustment,
                balance_after: Number((nextInvoiceRemaining - nextAdvance).toFixed(2)),
                balance_type: 'net',
                date: new Date().toLocaleDateString('en-GB'),
                remarks: remarks || ''
              }
            ]
          })
        })
        .eq('id', ledgerId);

      if (remarksError) {
        return { success: false, error: 'Advance settled, but its history could not be updated' };
      }

      const rollupError = await persistCustomerInvoiceRollup(nextInvoiceRemaining);
      if (rollupError) return { success: false, error: 'Advance updated, but earlier invoice balances could not be carried forward' };

      return { success: true };
    }

    // Positive input reduces the current outstanding balance on either side.
    // Once the invoice is fully paid, any excess becomes customer advance rather
    // than a negative invoice remainder.
    const adjustedRemaining = Number((currentSignedRemaining - adjustment).toFixed(2));
    const excessToAdvance = Math.max(0, Number((-adjustedRemaining).toFixed(2)));
    const nextRemaining = Math.max(0, adjustedRemaining);
    const nextOpeningAdvance = Number((Math.max(0, Number(customer.opening_balance || 0)) + excessToAdvance).toFixed(2));
    const nextPaidAmount = Math.max(0, Number(currentLedger.total_amount || 0) - Math.max(0, nextRemaining));

    if (excessToAdvance > 0) {
      const { error: advanceError } = await supabase
        .from('customers')
        .update({ opening_balance: nextOpeningAdvance })
        .eq('id', customerId);
      if (advanceError) {
        return { success: false, error: 'Invoice settled, but excess could not be saved as customer advance' };
      }
    }

    if (currentLedger) {
      const { error: ledgerUpdateError } = await supabase
        .from('customer_ledgers')
        .update({
          paid_amount: Number(nextPaidAmount.toFixed(2)),
          remaining_amount: nextRemaining,
          remarks: JSON.stringify({
            ...ledgerRemarks,
            available_advance: nextOpeningAdvance,
            paid_amount: Number(nextPaidAmount.toFixed(2)),
            remaining_amount: nextRemaining,
            manual_adjustment: Number((Number(ledgerRemarks.manual_adjustment ?? 0) + adjustment).toFixed(2)),
            manual_adjustment_date: new Date().toLocaleDateString('en-GB'),
            manual_adjustment_note: remarks || '',
            adjustment_history: [
              ...(Array.isArray(ledgerRemarks.adjustment_history) ? ledgerRemarks.adjustment_history : []),
              {
                amount: adjustment,
                balance_after: Number((nextRemaining - nextOpeningAdvance).toFixed(2)),
                balance_type: 'net',
                date: new Date().toLocaleDateString('en-GB'),
                remarks: remarks || ''
              }
            ]
          })
        })
        .eq('id', ledgerId);

      if (ledgerUpdateError) {
        return { success: false, error: 'Failed to update customer ledger' };
      }
      const rollupError = await persistCustomerInvoiceRollup(nextRemaining);
      if (rollupError) return { success: false, error: 'Balance updated, but earlier invoice balances could not be carried forward' };
    }

    const isOpeningAdvanceRow = !currentLedger?.invoice_number && currentLedger?.customer_id;
    if (isOpeningAdvanceRow) {
      const nextOpeningBalance = Math.max(0, Math.abs(nextRemaining));
      const { error: balanceError } = await supabase
        .from('customers')
        .update({ opening_balance: Number(nextOpeningBalance.toFixed(2)) })
        .eq('id', customerId);
      if (balanceError) {
        return { success: false, error: 'Failed to update customer opening balance' };
      }
    }

    return { success: true };
  }

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
  let currentRemaining = Number(current.remaining_amount) || 0;
  const requestedAdjustment = Number(paymentAmount);
  if (!Number.isFinite(requestedAdjustment)) {
    return { success: false, error: 'Adjustment must be a valid number' };
  }

  const isSupplierInvoice = Boolean(current.invoice_number);
  let supplierInvoiceRows: any[] = [];
  if (isSupplierInvoice && current.supplier_id) {
    const { data: rows } = await supabase
      .from('supplier_ledger')
      .select('*')
      .eq('supplier_id', current.supplier_id)
      .not('invoice_number', 'is', null)
      .order('created_at', { ascending: true });
    supplierInvoiceRows = rows || [];
    const latestInvoice = supplierInvoiceRows[supplierInvoiceRows.length - 1];
    if (latestInvoice?.id === current.id) {
      currentRemaining = Number(supplierInvoiceRows.reduce(
        (balance, row) => balance + Number(row.remaining_amount || 0),
        0
      ).toFixed(2));
    }
  }
  let currentRemarksMeta: any = {};
  try { currentRemarksMeta = JSON.parse(current.remarks || '{}'); } catch { currentRemarksMeta = {}; }
  let supplierOpeningBalance = 0;
  if (isSupplierInvoice && current.supplier_id) {
    const { data: supplier } = await supabase
      .from('suppliers')
      .select('opening_balance')
      .eq('id', current.supplier_id)
      .maybeSingle();
    supplierOpeningBalance = Math.max(0, Number(supplier?.opening_balance || 0));
  }
  // Supplier Need Receive is a negative ledger balance. Normalize the sign on
  // the server as well as in the editor so reducing that credit always reduces
  // the supplier's stored opening advance, even if a caller sends a positive
  // amount by mistake.
  const adjustment = isSupplierInvoice
    ? currentRemaining < 0 ? -Math.abs(requestedAdjustment) : Math.abs(requestedAdjustment)
    : Math.max(0, requestedAdjustment);
  const isSupplierNeedReceive = isSupplierInvoice && currentRemaining < 0;
  const nextRemaining = isSupplierInvoice
    ? currentRemaining - adjustment
    : currentRemaining - adjustment;
  const nextPaidAmount = isSupplierInvoice
    ? Math.max(0, Math.min(totalAmount, totalAmount - Math.max(0, nextRemaining)))
    : totalAmount - nextRemaining;
  const nextTotalAmount = totalAmount;

  let newRemarks = current.remarks;
  if (isSupplierInvoice && current.remarks) {
    try {
      const parsed = JSON.parse(current.remarks);
      if (parsed && typeof parsed === 'object' && parsed.type === 'purchase_pop') {
        const currentAvailableAdvance = supplierOpeningBalance;
        const adjustmentHistory = Array.isArray(parsed.adjustment_history)
          ? parsed.adjustment_history
          : Number(parsed.manual_adjustment || 0) !== 0
            ? [{
                amount: Number(parsed.manual_adjustment),
                balance_after: Number(parsed.manual_remaining ?? currentRemaining),
                balance_type: 'net',
                date: parsed.manual_adjustment_date || new Date().toLocaleDateString('en-GB'),
                remarks: parsed.manual_adjustment_note || ''
              }]
            : [];
        parsed.manual_remaining = Number(nextRemaining.toFixed(2));
        parsed.manual_adjustment = Number((Number(parsed.manual_adjustment || 0) + adjustment).toFixed(2));
        parsed.manual_available_advance = Number((isSupplierNeedReceive
          ? Math.max(0, currentAvailableAdvance + adjustment)
          : currentAvailableAdvance).toFixed(2));
        parsed.manual_adjustment_note = remarks || '';
        parsed.manual_adjustment_date = new Date().toLocaleDateString('en-GB');
        parsed.adjustment_history = [
          ...adjustmentHistory,
          {
            amount: adjustment,
            balance_after: Number(nextRemaining.toFixed(2)),
            balance_type: 'net',
            date: new Date().toLocaleDateString('en-GB'),
            remarks: remarks || ''
          }
        ];
        newRemarks = JSON.stringify(parsed);
      }
    } catch {
      newRemarks = current.remarks;
    }
  } else if (remarks) {
    newRemarks = `${current.remarks || ''}\n[${new Date().toLocaleDateString('en-GB')}] Adjustment of ${adjustment}: ${remarks}`.trim();
  }

  const persistedPaidAmount = isSupplierInvoice
    ? Math.max(0, Number(currentRemarksMeta.cash_paid ?? current.paid_amount ?? 0))
    : nextPaidAmount;

  const { error: updateError } = await supabase
    .from(table)
    .update({
      total_amount: Number(nextTotalAmount.toFixed(2)),
      paid_amount: Number(persistedPaidAmount.toFixed(2)),
      remaining_amount: Number(nextRemaining.toFixed(2)),
      remarks: newRemarks
    })
    .eq('id', ledgerId);

  if (updateError) {
    console.error('Error updating ledger:', updateError);
    return { success: false, error: 'Failed to update balance' };
  }

  // The supplier ledger displays one row per supplier. When the latest invoice
  // is edited, move earlier invoice balances into that row so the displayed
  // aggregate is also the balance being edited. Keep the source invoice's
  // adjustment metadata and mark its balance as carried, so it is not counted
  // again on the next ledger load.
  if (isSupplierInvoice && current.invoice_number && supplierInvoiceRows[supplierInvoiceRows.length - 1]?.id === current.id) {
    for (const row of supplierInvoiceRows) {
      if (row.id === current.id) continue;
      const carriedBalance = Number(row.remaining_amount || 0);
      if (Math.abs(carriedBalance) < 0.005) continue;
      let carriedMeta: any = {};
      try { carriedMeta = JSON.parse(row.remarks || '{}'); } catch {
        carriedMeta = { original_remarks: row.remarks || '' };
      }
      carriedMeta.carried_forward_balance = Number((Number(carriedMeta.carried_forward_balance || 0) + carriedBalance).toFixed(2));
      carriedMeta.carried_forward_to = current.invoice_number;
      if (carriedMeta.type === 'purchase_pop') carriedMeta.manual_remaining = 0;
      await supabase
        .from('supplier_ledger')
        .update({ remaining_amount: 0, remarks: JSON.stringify(carriedMeta) })
        .eq('id', row.id);
    }
  }

  if (isSupplierInvoice && current.invoice_number) {
    if (isSupplierNeedReceive) {
      const adjustedSupplierBalance = Number((supplierOpeningBalance + adjustment).toFixed(2));
      await supabase
        .from('suppliers')
        .update({ opening_balance: Math.max(0, adjustedSupplierBalance) })
        .eq('id', current.supplier_id);
    }

    const { data: purchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('supplier_id', current.supplier_id)
      .eq('purchase_number', current.invoice_number)
      .maybeSingle();
    if (purchase) {
      await supabase
        .from('purchases')
        .update({
          paid_amount: Number(persistedPaidAmount.toFixed(2)),
          remaining_amount: Number(Math.max(0, nextRemaining).toFixed(2)),
          payment_status: Math.max(0, nextRemaining) === 0 ? 'paid' : nextPaidAmount > 0 ? 'partial' : 'unpaid'
        })
        .eq('id', purchase.id);
    }
  }

  return { success: true };
}

export async function updateLoanRemarks(type: 'customer' | 'supplier', ledgerId: string, remarks: string) {
  const supabase = await createClient();
  const table = type === 'customer' ? 'customer_ledgers' : 'supplier_ledger';
  const { error } = await supabase
    .from(table)
    .update({ remarks: remarks.trim() || null })
    .eq('id', ledgerId);

  if (error) {
    console.error('Error updating loan history:', error);
    return { success: false, error: 'Failed to update history' };
  }

  return { success: true };
}

export async function getCustomerLoanHistory(ledgerId: string) {
  const supabase = await createClient();
  const { data: selectedLedger, error: selectedError } = await supabase
    .from('customer_ledgers')
    .select('customer_id')
    .eq('id', ledgerId)
    .maybeSingle();

  if (!selectedLedger?.customer_id && ledgerId.endsWith('-advance')) {
    const customerId = ledgerId.replace(/-advance$/, '');
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('opening_balance, notes')
      .eq('id', customerId)
      .maybeSingle();
    if (customerError || !customer) return [];

    const noteLines = String(customer.notes || '').match(/^\[Customer Ledger Transaction Details\] .+$/gm) || [];
    return noteLines.flatMap((line, index) => {
      try {
        const note = JSON.parse(line.replace(/^\[Customer Ledger Transaction Details\] /, ''));
        return [{
          id: `${ledgerId}-note-${index}`,
          invoice_number: null,
          total_amount: 0,
          paid_amount: 0,
          remaining_amount: -Number(customer.opening_balance || 0),
          remarks: JSON.stringify({
            type: 'customer_advance_note',
            transaction_note_date: note.date,
            transaction_details: note.remarks,
          }),
          created_at: new Date().toISOString(),
        }];
      } catch {
        return [];
      }
    });
  }

  if (selectedError || !selectedLedger?.customer_id) return [];

  const { data, error } = await supabase
    .from('customer_ledgers')
    .select('id, invoice_number, total_amount, paid_amount, remaining_amount, remarks, created_at')
    .eq('customer_id', selectedLedger.customer_id)
    .order('created_at', { ascending: true });

  if (error) return [];
  const { data: customer } = await supabase
    .from('customers')
    .select('opening_balance, notes')
    .eq('id', selectedLedger.customer_id)
    .maybeSingle();
  const noteLines = String(customer?.notes || '').match(/^\[Customer Ledger Transaction Details\] .+$/gm) || [];
  const noteHistory = noteLines.flatMap((line, index) => {
    try {
      const note = JSON.parse(line.replace(/^\[Customer Ledger Transaction Details\] /, ''));
      return [{
        id: `${ledgerId}-note-${index}`,
        invoice_number: null,
        total_amount: 0,
        paid_amount: 0,
        remaining_amount: -Number(customer?.opening_balance || 0),
        remarks: JSON.stringify({
          type: 'customer_advance_note',
          transaction_note_date: note.date,
          transaction_details: note.remarks,
        }),
        created_at: new Date().toISOString(),
      }];
    } catch {
      return [];
    }
  });
  return [...(data || []), ...noteHistory];
}

export async function deleteLoanLedger(type: 'customer' | 'supplier', ledgerId: string) {
  const supabase = await createClient();
  const table = type === 'customer' ? 'customer_ledgers' : 'supplier_ledger';

  if (type === 'customer' && ledgerId.endsWith('-advance')) {
    const customerId = ledgerId.replace(/-advance$/, '');
    const { data: customer } = await supabase
      .from('customers')
      .select('opening_balance')
      .eq('id', customerId)
      .maybeSingle();
    const remainingAmount = Math.abs(Number(customer?.opening_balance) || 0);
    if (remainingAmount > 0.009) {
      return {
        success: false,
        error: 'This loan cannot be deleted until the remaining balance is fully cleared.'
      };
    }
    const { error: customerError } = await supabase
      .from('customers')
      .update({ opening_balance: 0 })
      .eq('id', customerId);
    if (customerError) {
      return { success: false, error: 'Failed to clear customer advance' };
    }
    return { success: true };
  }

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
