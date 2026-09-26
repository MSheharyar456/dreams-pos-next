'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export async function createSale(
  customerName: string,
  cartItems: CartItem[],
  totalAmount: number,
  isLoan: boolean = false,
  paidAmount: number = 0,
  phone: string = "",
  note: string = "",
  selectedCustomerId: string | null = null,
  shippingPrice: number = 0,
  loaderPrice: number = 0,
  unloadingPrice: number = 0
) {
  const supabase = await createClient();

  const timestamp = Date.now();
  const invoiceNumber = `INV-${timestamp}`;
  const saleId = randomUUID(); // Manually generate UUID to guarantee it exists

  // Fetch logged in user
  const { data: { user } } = await supabase.auth.getUser();
  const salesManName = user?.user_metadata?.full_name || user?.email || 'Admin';

  // 1. Reuse a saved customer when selected, otherwise create or find by name.
  let customerId = selectedCustomerId || null;
  if (customerName && customerName.trim() !== '') {
    const safeName = customerName.trim();

    if (!customerId) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id, phone')
        .ilike('name', safeName)
        .maybeSingle();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      }
    }

    if (customerId) {
      if (phone) {
        await supabase.from('customers').update({ phone }).eq('id', customerId);
      }
    } else {
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert([{ 
          name: safeName, 
          is_active: true,
          opening_balance: 0,
          credit_limit: 0,
          phone: phone,
          address: ''
        }])
        .select('id')
        .single();

      if (!createError && newCustomer) {
        customerId = newCustomer.id;
      } else if (createError) {
        console.error("Error creating customer:", createError);
      }
    }
  }

  const shipping = Math.max(0, Number(shippingPrice) || 0);
  const loader = Math.max(0, Number(loaderPrice) || 0);
  const unloading = Math.max(0, Number(unloadingPrice) || 0);
  const chargeTotal = shipping + loader + unloading;
  const saleTotal = Math.max(0, Number(totalAmount) || 0) + chargeTotal;

  // When Loan Khata is not selected, checkout treats the sale as fully paid.
  // The paid-amount input is only shown for loan sales, so its default of zero
  // must not make a cash sale look unpaid on the receipt.
  const cashPaid = isLoan
    ? Math.max(0, Math.min(Number(paidAmount) || 0, saleTotal))
    : saleTotal;
  const effectivePaidAmount = cashPaid;
  const remainingAmount = Math.max(0, saleTotal - effectivePaidAmount);
  const effectivePaymentStatus = effectivePaidAmount >= saleTotal
    ? 'paid'
    : effectivePaidAmount > 0
      ? 'partial'
      : 'unpaid';

  // 2. Insert into sales table with status = pending
  const { error: saleError } = await supabase
    .from('sales')
    .insert([{ 
      id: saleId,
      invoice_number: invoiceNumber,
      customer_id: customerId,
      total_amount: saleTotal,
      subtotal: totalAmount,
      loader_charges: chargeTotal,
      shipping_price: shipping,
      loader_price: loader,
      unloading_price: unloading,
      paid_amount: effectivePaidAmount,
      remaining_amount: remainingAmount,
      order_status: 'pending', // NEW LOGIC: Always pending initially
      payment_status: isLoan ? effectivePaymentStatus : 'paid',
      notes: note ? note : (customerName ? customerName : 'Walk-in Customer'),
      sales_man: salesManName
    }]);

  if (saleError) {
    console.error("Error creating sale:", saleError);
    return { success: false, error: saleError.message };
  }

  // 2. Prepare sale_items
  const saleItems = cartItems.map(item => ({
    sale_id: saleId,
    product_variant_id: item.id,
    quantity: item.quantity,
    unit_price: item.price,
    total: item.price * item.quantity
  }));

  // 3. Insert into sale_items
  if (saleItems.length > 0) {
    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);

    if (itemsError) {
      console.error("Error inserting sale items:", itemsError);
      return { success: false, error: itemsError.message };
    }
  }

  // 4. (REMOVED) We DO NOT deduct inventory yet until approved!

  // 5. Revalidate cache
  revalidatePath('/products');
  revalidatePath('/pos');
  revalidatePath('/sales');
  revalidatePath('/dashboard');

  return { success: true, saleId };
}

// NEW ACTION: Approve Order
export async function approveOrder(saleId: string) {
  const supabase = await createClient();

  // 1. Get sale details and items
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .select('invoice_number, customer_id, total_amount, paid_amount, payment_status, order_status, sale_items(*)')
    .eq('id', saleId)
    .single();

  if (saleError || !sale) return { success: false, error: 'Sale not found' };
  if (sale.order_status !== 'pending') return { success: false, error: 'Order has already been approved' };

  // 2. Deduct inventory
  const inventoryMovements = sale.sale_items.map((item: any) => ({
    product_variant_id: item.product_variant_id,
    movement_type: 'sale',
    quantity: -Math.abs(item.quantity), 
    reference_type: 'sale',
    reference_id: saleId,
    unit_cost: 0,
    notes: `Sale approved: ${sale.invoice_number}`
  }));

  if (inventoryMovements.length > 0) {
    const { error: inventoryError } = await supabase
      .from('inventory_movements')
      .insert(inventoryMovements);

    if (inventoryError) return { success: false, error: inventoryError.message };
  }

  // 3. Apply the customer's advance only after admin approval.
  const { data: ledgerRow } = await supabase
    .from('customer_ledgers')
    .select('id, customer_id, total_amount, remaining_amount, paid_amount, remarks')
    .eq('sale_id', saleId)
    .maybeSingle();

  let finalRemaining = 0;
  let finalPaid = 0;
  let ledgerCreated = false;
  if (ledgerRow) {
    let remarks: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(ledgerRow.remarks || '{}');
      if (parsed && typeof parsed === 'object') remarks = parsed;
    } catch {
      remarks = {};
    }
    const { data: customer } = await supabase
      .from('customers')
      .select('opening_balance')
      .eq('id', ledgerRow.customer_id)
      .maybeSingle();
    const currentAdvance = Math.max(0, Number(customer?.opening_balance || 0));
    const recordedAdvance = Math.max(0, Number(remarks.available_advance || 0));
    const customerAdvance = Math.max(currentAdvance, recordedAdvance);
    const cashPaid = Math.max(0, Number(remarks.cash_paid ?? ledgerRow.paid_amount ?? 0));
    const invoiceRemaining = Math.max(0, Number(ledgerRow.total_amount || 0) - cashPaid);
    const advanceApplied = Math.min(customerAdvance, invoiceRemaining);
    finalPaid = cashPaid + advanceApplied;
    finalRemaining = invoiceRemaining - advanceApplied;

    remarks.advance_used = advanceApplied;
    remarks.opening_advance = Number(remarks.opening_advance ?? customerAdvance);
    remarks.available_advance = customerAdvance - advanceApplied;
    remarks.paid_amount = finalPaid;
    remarks.remaining_amount = finalRemaining;

    const { error: ledgerUpdateError } = await supabase
      .from('customer_ledgers')
      .update({
        paid_amount: finalPaid,
        remaining_amount: finalRemaining,
        remarks: JSON.stringify(remarks)
      })
      .eq('id', ledgerRow.id);
    if (ledgerUpdateError) return { success: false, error: ledgerUpdateError.message };

    if (advanceApplied > 0) {
      const { error: customerUpdateError } = await supabase
        .from('customers')
        .update({ opening_balance: customerAdvance - advanceApplied })
        .eq('id', ledgerRow.customer_id);
      if (customerUpdateError) return { success: false, error: customerUpdateError.message };
    }
  } else if (sale.customer_id && sale.payment_status !== 'paid') {
    const { data: customer } = await supabase
      .from('customers')
      .select('opening_balance')
      .eq('id', sale.customer_id)
      .maybeSingle();
    const customerAdvance = Math.max(0, Number(customer?.opening_balance || 0));
    const cashPaid = Math.max(0, Number(sale.paid_amount || 0));
    const invoiceRemaining = Math.max(0, Number(sale.total_amount || 0) - cashPaid);
    const advanceApplied = Math.min(customerAdvance, invoiceRemaining);
    finalPaid = cashPaid + advanceApplied;
    finalRemaining = invoiceRemaining - advanceApplied;

    const { error: ledgerInsertError } = await supabase
      .from('customer_ledgers')
      .insert([{
        customer_id: sale.customer_id,
        sale_id: saleId,
        invoice_number: sale.invoice_number,
        total_amount: sale.total_amount,
        paid_amount: finalPaid,
        remaining_amount: finalRemaining,
        remarks: JSON.stringify({
          type: 'loan_sale',
          sale_total: sale.total_amount,
          cash_paid: cashPaid,
          opening_advance: customerAdvance,
          advance_used: advanceApplied,
          available_advance: customerAdvance - advanceApplied,
          paid_amount: finalPaid,
          remaining_amount: finalRemaining,
          note: 'Loan from POS'
        })
      }]);
    if (ledgerInsertError) return { success: false, error: ledgerInsertError.message };
    ledgerCreated = true;

    if (advanceApplied > 0) {
      const { error: customerUpdateError } = await supabase
        .from('customers')
        .update({ opening_balance: customerAdvance - advanceApplied })
        .eq('id', sale.customer_id);
      if (customerUpdateError) return { success: false, error: customerUpdateError.message };
    }
  }

  const finalPaymentStatus = ledgerRow || ledgerCreated
    ? finalRemaining <= 0
      ? 'paid'
      : finalPaid > 0
        ? 'partial'
        : 'unpaid'
    : 'paid';

  const { error: updateError } = await supabase
    .from('sales')
    .update({ order_status: 'completed', payment_status: finalPaymentStatus })
    .eq('id', saleId);

  if (updateError) return { success: false, error: updateError.message };

  revalidatePath('/dashboard');
  revalidatePath('/sales');
  revalidatePath('/report/sales');
  revalidatePath('/report/profit-loss');
  revalidatePath('/report/inventory');
  
  return { success: true };
}

export async function getPendingOrders() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('sales')
    .select('*')
    .eq('order_status', 'pending')
    .order('created_at', { ascending: false });
  return data || [];
}


export async function getSaleById(saleId: string) {
  const supabase = await createClient();
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .select('*, sale_items(*)')
    .eq('id', saleId)
    .single();

  if (saleError || !sale) return null;

  // If there's a ledger, fetch it to get paid_amount and phone
  const { data: ledger } = await supabase
    .from('customer_ledgers')
    .select('*, customers(*)')
    .eq('sale_id', saleId)
    .single();

  // If no ledger, maybe just check if customer exists via notes or direct match
  let customerName = sale.notes;
  let phone = '';
  let isLoan = sale.payment_status !== 'paid';
  let paidAmount = 0;

  if (ledger) {
    customerName = ledger.customers?.name || customerName;
    phone = ledger.customers?.phone || phone;
    paidAmount = ledger.paid_amount || 0;
    isLoan = true;
  }

  return { sale, customerName, phone, isLoan, paidAmount };
}

export async function updateSale(saleId: string, customerName: string, cartItems: CartItem[], totalAmount: number, isLoan: boolean = false, paidAmount: number = 0, phone: string = "", note: string = "", shippingPrice: number = 0, loaderPrice: number = 0, unloadingPrice: number = 0, unallocatedCharges: number = 0) {
  const supabase = await createClient();

  // Fetch logged in user
  const { data: { user } } = await supabase.auth.getUser();
  const salesManName = user?.user_metadata?.full_name || user?.email || 'Admin';

  // 1. Manage Customer
  let customerId = null;
  if (customerName && customerName.trim() !== '') {
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .ilike('name', customerName.trim())
      .single();
      
    if (existingCustomer) {
      customerId = existingCustomer.id;
      if (phone) {
        await supabase.from('customers').update({ phone }).eq('id', customerId);
      }
    } else {
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert([{ 
          name: customerName.trim(), 
          is_active: true,
          opening_balance: 0,
          credit_limit: 0,
          phone: phone,
          address: ''
        }])
        .select('id')
        .single();
        
      if (newCustomer) {
        customerId = newCustomer.id;
      }
    }
  }

  const { data: savedCustomer } = customerId
    ? await supabase.from('customers').select('opening_balance').eq('id', customerId).single()
    : { data: null };
  const customerAdvance = Math.max(0, Number(savedCustomer?.opening_balance || 0));
  const shipping = Math.max(0, Number(shippingPrice) || 0);
  const loader = Math.max(0, Number(loaderPrice) || 0);
  const unloading = Math.max(0, Number(unloadingPrice) || 0);
  const chargeTotal = shipping + loader + unloading + Math.max(0, Number(unallocatedCharges) || 0);
  const saleTotal = Math.max(0, Number(totalAmount) || 0) + chargeTotal;
  const cashPaid = isLoan
    ? Math.max(0, Math.min(Number(paidAmount) || 0, saleTotal))
    : saleTotal;
  const advanceApplied = 0;
  const effectivePaidAmount = cashPaid;
  const remainingAmount = Math.max(0, saleTotal - effectivePaidAmount);
  const effectivePaymentStatus = effectivePaidAmount >= saleTotal
    ? 'paid'
    : effectivePaidAmount > 0
      ? 'partial'
      : 'unpaid';

  // 2. Update Sales Table
  const { error: saleError } = await supabase
    .from('sales')
    .update({ 
      total_amount: saleTotal,
      subtotal: totalAmount,
      loader_charges: chargeTotal,
      shipping_price: shipping,
      loader_price: loader,
      unloading_price: unloading,
      paid_amount: effectivePaidAmount,
      remaining_amount: remainingAmount,
      payment_status: isLoan ? effectivePaymentStatus : 'paid',
      notes: note ? note : (customerName ? customerName : 'Walk-in Customer'),
      sales_man: salesManName
    })
    .eq('id', saleId);

  if (saleError) return { success: false, error: saleError.message };

  // 3. Wipe old sale_items and insert new ones
  await supabase.from('sale_items').delete().eq('sale_id', saleId);

  const saleItems = cartItems.map(item => ({
    sale_id: saleId,
    product_variant_id: item.id,
    quantity: item.quantity,
    unit_price: item.price,
    total: item.price * item.quantity
  }));

  if (saleItems.length > 0) {
    const { error: itemsError } = await supabase.from('sale_items').insert(saleItems);
    if (itemsError) return { success: false, error: itemsError.message };
  }

  // 4. Update Customer Ledgers (Wipe old and insert new if loan)
  await supabase.from('customer_ledgers').delete().eq('sale_id', saleId);
  
  if (isLoan && customerId) {
    // Get invoice number from sales
    const { data: saleInfo } = await supabase.from('sales').select('invoice_number').eq('id', saleId).single();
    const invoiceNumber = saleInfo?.invoice_number || `INV-${Date.now()}`;

    const ledgerRemarks = JSON.stringify({
      type: 'loan_sale',
      sale_total: saleTotal,
      cash_paid: cashPaid,
      advance_used: 0,
      available_advance: customerAdvance,
      paid_amount: effectivePaidAmount,
      remaining_amount: remainingAmount,
      note: note || 'Loan from POS (Updated)'
    });

    await supabase
      .from('customer_ledgers')
      .insert([{
        customer_id: customerId,
        sale_id: saleId,
        invoice_number: invoiceNumber,
        total_amount: saleTotal,
        paid_amount: effectivePaidAmount,
        remaining_amount: remainingAmount,
        remarks: ledgerRemarks
      }]);
  }

  if (customerId && advanceApplied > 0) {
    const { error: advanceError } = await supabase
      .from('customers')
      .update({ opening_balance: customerAdvance - advanceApplied })
      .eq('id', customerId);
    if (advanceError) return { success: false, error: advanceError.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/pos');
  
  return { success: true };
}

export async function getTodayTotalSales() {
  const supabase = await createClient();
  
  // Get today's start and end date in UTC
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.toISOString();
  
  today.setHours(23, 59, 59, 999);
  const endOfDay = today.toISOString();

  const { data, error } = await supabase
    .from('sales')
    .select('total_amount')
    .eq('order_status', 'completed')
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay);
    
  if (error || !data) return 0;
  
  return data.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0);
}

export async function getDashboardStats() {
  const supabase = await createClient();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.toISOString();
  today.setHours(23, 59, 59, 999);
  const endOfDay = today.toISOString();

  // 1. Total Employees
  const { count: employeeCount } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true });

  // 2. Pending Orders Count
  const { count: pendingCount } = await supabase
    .from('sales')
    .select('*', { count: 'exact', head: true })
    .eq('order_status', 'pending');

  // 3. Today's Profit
  // Profit = (sale_items.unit_price - products.purchase_price) * quantity
  // We need to fetch today's completed sales and their items with product purchase price
  const { data: salesData } = await supabase
    .from('sales')
    .select(`
      id,
      sale_items (
        quantity,
        unit_price,
        product_variant_id
      )
    `)
    .eq('order_status', 'completed')
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay);

  let totalProfit = 0;
  if (salesData) {
    // To calculate profit, we need purchase_price of products.
    // In POS, it's often stored in product_variants. Let's fetch all variants to cross-reference.
    const { data: variants } = await supabase.from('product_variants').select('id, purchase_price');
    const variantMap = new Map();
    if (variants) {
      variants.forEach(v => variantMap.set(v.id, v.purchase_price || 0));
    }

    salesData.forEach(sale => {
      sale.sale_items?.forEach((item: any) => {
        const purchasePrice = variantMap.get(item.product_variant_id) || 0;
        const profit = (Number(item.unit_price) - Number(purchasePrice)) * Number(item.quantity);
        totalProfit += profit;
      });
    });
  }

  const { data: purchasesData } = await supabase
    .from('purchases')
    .select('total_amount, notes')
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay);

  const todayTotalPurchases = (purchasesData || []).reduce((sum, purchase) => {
    let isPending = false;
    try {
      isPending = JSON.parse(purchase.notes || '{}')?.type === 'pending_pop';
    } catch {
      isPending = false;
    }
    return isPending ? sum : sum + Number(purchase.total_amount || 0);
  }, 0);

  return {
    totalEmployees: employeeCount || 0,
    pendingOrdersCount: pendingCount || 0,
    todayTotalProfit: totalProfit,
    todayTotalPurchases,
  };
}

export async function deletePendingOrder(saleId: string) {
  const supabase = await createClient();

  // Ensure it's pending
  const { data: sale } = await supabase.from('sales').select('order_status').eq('id', saleId).single();
  if (!sale || sale.order_status !== 'pending') {
    return { success: false, error: 'Only pending orders can be deleted' };
  }

  // Delete ledgers and items first (in case no ON DELETE CASCADE)
  await supabase.from('customer_ledgers').delete().eq('sale_id', saleId);
  await supabase.from('sale_items').delete().eq('sale_id', saleId);
  
  // Delete sale
  const { error } = await supabase.from('sales').delete().eq('id', saleId);
  if (error) return { success: false, error: error.message };
  
  revalidatePath('/dashboard');
  return { success: true };
}
