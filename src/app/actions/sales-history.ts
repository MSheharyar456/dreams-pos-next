'use server';

import { createClient } from '@/lib/supabase/server';

export async function getSalesHistory() {
  const supabase = await createClient();

  const { data: sales, error } = await supabase
    .from('sales')
    .select('*, items:sale_items(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching sales history:", error);
    return [];
  }

  return sales;
}
