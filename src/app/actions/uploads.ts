'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateSaleItemImage(saleItemId: string, imageUrl: string, saleId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('sale_items')
    .update({ scale_image_url: imageUrl })
    .eq('id', saleItemId);

  if (error) {
    console.error("Error updating sale item image:", error);
    return { success: false, error: error.message };
  }

  // Revalidate the receipt page to reflect the new image
  revalidatePath(`/pos/receipt/${saleId}`);

  return { success: true };
}
