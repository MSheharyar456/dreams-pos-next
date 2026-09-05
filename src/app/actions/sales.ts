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
  selectedCustomerId: string | null = null
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

  // 2. Insert into sales table with status = pending
  const { error: saleError } = await supabase
    .from('sales')
    .insert([{ 
      id: saleId,
      invoice_number: invoiceNumber,
      total_amount: totalAmount,
      subtotal: totalAmount,
      order_status: 'pending', // NEW LOGIC: Always pending initially
      payment_status: isLoan ? (paidAmount >= totalAmount ? 'paid' : (paidAmount > 0 ? 'partial' : 'unpaid')) : 'paid',
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

  // 5. Insert into customer_ledgers if loan
  if (isLoan && customerId) {
    const remainingAmount = totalAmount - paidAmount;
    const { error: ledgerError } = await supabase
      .from('customer_ledgers')
      .insert([{
        customer_id: customerId,
        sale_id: saleId,
        invoice_number: invoiceNumber,
        total_amount: totalAmount,
        paid_amount: paidAmount,
        remaining_amount: remainingAmount,
        remarks: note || 'Loan from POS'
      }]);
    if (ledgerError) {
      console.error("Error creating ledger:", ledgerError);
    }
  }

  // 6. Revalidate cache
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
    .select('invoice_number, sale_items(*)')
    .eq('id', saleId)
    .single();

  if (saleError || !sale) return { success: false, error: 'Sale not found' };

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

  // 3. Update status to completed
  const { error: updateError } = await supabase
    .from('sales')
    .update({ order_status: 'completed' })
    .eq('id', saleId);

  if (updateError) return { success: false, error: updateError.message };

  revalidatePath('/dashboard');
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

export async function updateSale(saleId: string, customerName: string, cartItems: CartItem[], totalAmount: number, isLoan: boolean = false, paidAmount: number = 0, phone: string = "", note: string = "") {
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

  // 2. Update Sales Table
  const { error: saleError } = await supabase
    .from('sales')
    .update({ 
      total_amount: totalAmount,
      subtotal: totalAmount,
      payment_status: isLoan ? (paidAmount >= totalAmount ? 'paid' : (paidAmount > 0 ? 'partial' : 'unpaid')) : 'paid',
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
    
    const remainingAmount = totalAmount - paidAmount;
    await supabase
      .from('customer_ledgers')
      .insert([{
        customer_id: customerId,
        sale_id: saleId,
        invoice_number: invoiceNumber,
        total_amount: totalAmount,
        paid_amount: paidAmount,
        remaining_amount: remainingAmount,
        remarks: note || 'Loan from POS (Updated)'
      }]);
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

  return {
    totalEmployees: employeeCount || 0,
    pendingOrdersCount: pendingCount || 0,
    todayTotalProfit: totalProfit
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
