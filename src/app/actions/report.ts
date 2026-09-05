'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getSalesReport(startDate?: string, endDate?: string) {
  const supabase = await createClient();
  
  let query = supabase.from('sales').select(`
    id,
    invoice_number,
    total_amount,
    payment_status,
    notes,
    sales_man,
    created_at,
    sale_items (
      quantity,
      unit_price,
      product_variant_id,
      product_variants (
        purchase_price
      )
    ),
    customer_ledgers (
      paid_amount,
      remaining_amount,
      remarks,
      customers (
        name
      )
    )
  `).eq('order_status', 'completed').order('created_at', { ascending: false });

  if (startDate) {
    query = query.gte('created_at', `${startDate}T00:00:00.000Z`);
  }
  if (endDate) {
    query = query.lte('created_at', `${endDate}T23:59:59.999Z`);
  }

  const { data: sales, error } = await query;

  if (error) {
    console.error('Error fetching sales report:', error);
    return [];
  }

  return sales.map((sale: any) => {
    let expectedProfit = 0;
    
    // Calculate total expected profit
    if (sale.sale_items && sale.sale_items.length > 0) {
      sale.sale_items.forEach((item: any) => {
        let purchasePrice = 0;
        if (item.product_variants) {
          if (Array.isArray(item.product_variants) && item.product_variants.length > 0) {
            purchasePrice = item.product_variants[0].purchase_price || 0;
          } else if (!Array.isArray(item.product_variants)) {
            purchasePrice = item.product_variants.purchase_price || 0;
          }
        }
        
        const profitPerItem = item.unit_price - purchasePrice;
        expectedProfit += profitPerItem * item.quantity;
      });
    }

    let customerName = sale.notes || 'Walk-in Customer';
    let receivedAmount = sale.total_amount;
    let receivableBalance = 0;
    let payableBalance = 0;
    let details = sale.notes || '';

    if (sale.customer_ledgers && sale.customer_ledgers.length > 0) {
      const ledger = sale.customer_ledgers[0];
      receivedAmount = ledger.paid_amount || 0;
      receivableBalance = ledger.remaining_amount || 0;
      details = ledger.remarks || details;
      
      if (ledger.customers) {
        if (Array.isArray(ledger.customers) && ledger.customers.length > 0) {
          customerName = ledger.customers[0].name;
        } else if (!Array.isArray(ledger.customers)) {
          customerName = ledger.customers.name;
        }
      }
    } else {
      if (sale.payment_status === 'unpaid') {
        receivedAmount = 0;
        receivableBalance = sale.total_amount;
      } else if (sale.payment_status === 'partial') {
        receivedAmount = 0;
        receivableBalance = sale.total_amount;
      }
    }

    let currentProfit = expectedProfit;
    if (sale.total_amount > 0 && receivedAmount < sale.total_amount) {
      currentProfit = expectedProfit * (receivedAmount / sale.total_amount);
    }

    return {
      invoiceNumber: sale.invoice_number,
      cashierName: sale.sales_man || 'Admin',
      customerName: customerName,
      transactionDate: sale.created_at,
      totalAmount: Number(sale.total_amount || 0),
      receivedAmount: Number(receivedAmount || 0),
      expectedProfit: Number(expectedProfit || 0),
      currentProfit: Number(currentProfit || 0),
      payableBalance: Number(payableBalance || 0),
      receivableBalance: Number(receivableBalance || 0),
      details: details,
    };
  });
}

export async function getSalesInventory(startDate?: string, endDate?: string) {
  const supabase = await createClient();
  
  let query = supabase.from('sale_items').select(`
    id,
    quantity,
    unit_price,
    total,
    sale_id,
    product_variant_id,
    sales (
      invoice_number,
      created_at
    ),
    product_variants (
      variant_name,
      purchase_price,
      products (
        name
      )
    )
  `);

  // Filtering by date means we must filter by the related sales table date.
  // Supabase JS doesn't easily support filtering by related tables at the top level 
  // without inner joins that are complex. We will fetch and filter in JS, or use a view.
  // Since we don't have a view, we'll fetch all and filter in JS (assuming reasonable data size for now).

  const { data: items, error } = await query;

  if (error) {
    console.error('Error fetching inventory report:', error);
    return [];
  }

  let filteredItems = items;
  
  if (startDate || endDate) {
    filteredItems = items.filter((item: any) => {
      const dateStr = item.sales?.created_at;
      if (!dateStr) return false;
      const date = new Date(dateStr).getTime();
      
      let pass = true;
      if (startDate) {
        if (date < new Date(`${startDate}T00:00:00.000Z`).getTime()) pass = false;
      }
      if (endDate) {
        if (date > new Date(`${endDate}T23:59:59.999Z`).getTime()) pass = false;
      }
      return pass;
    });
  }

  // Sort descending by date
  filteredItems.sort((a: any, b: any) => {
    const dA = new Date(a.sales?.created_at || 0).getTime();
    const dB = new Date(b.sales?.created_at || 0).getTime();
    return dB - dA;
  });

  return filteredItems.map((item: any) => {
    let invoice = '';
    let date = '';
    if (item.sales) {
      if (Array.isArray(item.sales)) {
        invoice = item.sales[0]?.invoice_number || '';
        date = item.sales[0]?.created_at || '';
      } else {
        invoice = item.sales.invoice_number || '';
        date = item.sales.created_at || '';
      }
    }

    let productName = '';
    let purchasePrice = 0;
    if (item.product_variants) {
      const pv = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants;
      purchasePrice = pv?.purchase_price || 0;
      productName = pv?.variant_name || '';
      if (!productName && pv?.products) {
         productName = Array.isArray(pv.products) ? pv.products[0]?.name : pv.products.name;
      }
    }

    const profit = (item.unit_price - purchasePrice) * item.quantity;

    return {
      id: item.id,
      sale_id: item.sale_id,
      product_variant_id: item.product_variant_id,
      invoiceNumber: invoice,
      name: productName,
      receipt: invoice,
      date: date,
      purchasePrice: purchasePrice,
      salePrice: item.unit_price,
      quantity: item.quantity,
      totalAmount: item.total,
      profit: profit,
    };
  });
}

export async function deleteSaleItem(itemId: string) {
  const supabase = await createClient();

  // 1. Get the item to know quantity, sale_id, variant_id, total
  const { data: item, error: fetchError } = await supabase
    .from('sale_items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (fetchError || !item) {
    return { success: false, error: 'Item not found' };
  }

  // 2. Delete item
  const { error: deleteError } = await supabase
    .from('sale_items')
    .delete()
    .eq('id', itemId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  // 3. Reverse inventory movement (add stock back)
  const { error: invError } = await supabase
    .from('inventory_movements')
    .insert([{
      product_variant_id: item.product_variant_id,
      movement_type: 'adjustment',
      quantity: Math.abs(item.quantity), // Add back positive
      reference_type: 'sale_reversal',
      reference_id: item.sale_id,
      unit_cost: 0,
      notes: `Reversal of deleted sale item from sale ${item.sale_id}`
    }]);

  if (invError) {
    console.error("Inventory reverse error:", invError);
  }

  // 4. Update the sales total_amount
  const { data: sale } = await supabase
    .from('sales')
    .select('total_amount, invoice_number')
    .eq('id', item.sale_id)
    .single();

  if (sale) {
    const newTotal = Math.max(0, sale.total_amount - item.total);
    await supabase.from('sales').update({ total_amount: newTotal, subtotal: newTotal }).eq('id', item.sale_id);
    
    // 5. Update customer_ledgers if applicable
    const { data: ledger } = await supabase
      .from('customer_ledgers')
      .select('*')
      .eq('sale_id', item.sale_id)
      .single();
      
    if (ledger) {
      const newLedgerTotal = Math.max(0, ledger.total_amount - item.total);
      const newRemaining = newLedgerTotal - ledger.paid_amount;
      await supabase.from('customer_ledgers').update({ 
        total_amount: newLedgerTotal, 
        remaining_amount: newRemaining 
      }).eq('id', ledger.id);
    }
  }

  revalidatePath('/report/inventory');
  revalidatePath('/report/sales');
  return { success: true };
}
