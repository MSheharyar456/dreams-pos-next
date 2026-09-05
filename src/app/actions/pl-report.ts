'use server';

import { createClient } from '@/lib/supabase/server';

export async function getProfitAndLoss(period: 'daily' | 'monthly', startDate?: string, endDate?: string) {
  const supabase = await createClient();

  let salesQuery = supabase.from('sales').select(`
    id,
    created_at,
    total_amount,
    sale_items (
      quantity,
      unit_price,
      product_variants (
        purchase_price
      )
    )
  `).eq('order_status', 'completed');

  if (startDate) salesQuery = salesQuery.gte('created_at', `${startDate}T00:00:00.000Z`);
  if (endDate) salesQuery = salesQuery.lte('created_at', `${endDate}T23:59:59.999Z`);

  const { data: sales, error: salesError } = await salesQuery;
  
  if (salesError) {
    console.error('Error fetching sales for PL:', salesError);
    return [];
  }

  let expQuery = supabase.from('expenses').select(`
    amount,
    expense_date
  `).eq('order_status', 'completed');

  if (startDate) expQuery = expQuery.gte('expense_date', startDate);
  if (endDate) expQuery = expQuery.lte('expense_date', endDate);

  const { data: expenses, error: expError } = await expQuery;

  if (expError) {
    console.error('Error fetching expenses for PL:', expError);
    return [];
  }

  const grouped: Record<string, any> = {};

  sales?.forEach((sale: any) => {
    const d = new Date(sale.created_at);
    // Use en-CA to safely get YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    
    const key = period === 'daily' ? `${yyyy}-${mm}-${dd}` : `${yyyy}-${mm}`;

    if (!grouped[key]) {
      grouped[key] = { date: key, revenue: 0, cogs: 0, grossProfit: 0, expenses: 0, netProfit: 0 };
    }

    grouped[key].revenue += Number(sale.total_amount || 0);

    let saleCogs = 0;
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
        saleCogs += purchasePrice * item.quantity;
      });
    }

    grouped[key].cogs += saleCogs;
    grouped[key].grossProfit += (Number(sale.total_amount || 0) - saleCogs);
  });

  expenses?.forEach((exp: any) => {
    const d = new Date(exp.expense_date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    
    const key = period === 'daily' ? `${yyyy}-${mm}-${dd}` : `${yyyy}-${mm}`;

    if (!grouped[key]) {
      grouped[key] = { date: key, revenue: 0, cogs: 0, grossProfit: 0, expenses: 0, netProfit: 0 };
    }

    grouped[key].expenses += Number(exp.amount || 0);
  });

  const results = Object.values(grouped).map((g: any) => {
    g.netProfit = g.grossProfit - g.expenses;
    return g;
  });

  results.sort((a: any, b: any) => (a.date > b.date ? -1 : 1));

  return results;
}
