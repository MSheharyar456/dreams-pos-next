'use server';

import { createClient } from '@/lib/supabase/server';

export async function updateSaleField(saleId: string, field: string, value: string) {
  const supabase = await createClient();

  // Validate field to prevent SQL injection or invalid updates
  const allowedFields = ['loader_name', 'scale_name', 'sales_man', 'driver_name', 'vehicle_number'];
  if (!allowedFields.includes(field)) {
    return { success: false, error: 'Invalid field' };
  }

  const { error } = await supabase
    .from('sales')
    .update({ [field]: value })
    .eq('id', saleId);

  if (error) {
    console.error("Error updating sale field:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
