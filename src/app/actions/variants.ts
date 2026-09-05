'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getVariantsByProductId(product_id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_variants')
    .select('*, unit:units(name, short_name)')
    .eq('product_id', product_id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching variants:', error);
    return [];
  }
  return data;
}

export async function createVariant(product_id: string, formData: FormData) {
  const supabase = await createClient();
  const variant_name = formData.get('variant_name') as string;
  const size = formData.get('size') as string;
  const grade = formData.get('grade') as string;
  const unit_id = formData.get('unit_id') as string;
  const purchase_price = parseFloat(formData.get('purchase_price') as string || '0');
  const sale_price = parseFloat(formData.get('sale_price') as string || '0');
  const low_stock_threshold = parseFloat(formData.get('low_stock_threshold') as string || '0');
  const is_active = formData.get('is_active') === 'on' || formData.get('is_active') === 'true';

  if (!variant_name) {
    return { error: 'Variant name is required' };
  }

  const { data, error } = await supabase
    .from('product_variants')
    .insert([{ 
      product_id,
      variant_name, 
      size, 
      grade, 
      unit_id: unit_id || null,
      purchase_price,
      sale_price,
      low_stock_threshold,
      is_active 
    }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/products/edit/${product_id}`);
  return { success: true, data };
}

export async function updateVariant(id: string, product_id: string, formData: FormData) {
  const supabase = await createClient();
  const variant_name = formData.get('variant_name') as string;
  const size = formData.get('size') as string;
  const grade = formData.get('grade') as string;
  const unit_id = formData.get('unit_id') as string;
  const purchase_price = parseFloat(formData.get('purchase_price') as string || '0');
  const sale_price = parseFloat(formData.get('sale_price') as string || '0');
  const low_stock_threshold = parseFloat(formData.get('low_stock_threshold') as string || '0');
  const is_active = formData.get('is_active') === 'on' || formData.get('is_active') === 'true';

  if (!variant_name) {
    return { error: 'Variant name is required' };
  }

  const { data, error } = await supabase
    .from('product_variants')
    .update({ 
      variant_name, 
      size, 
      grade, 
      unit_id: unit_id || null,
      purchase_price,
      sale_price,
      low_stock_threshold,
      is_active 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/products/edit/${product_id}`);
  return { success: true, data };
}

export async function deleteVariant(id: string, product_id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/products/edit/${product_id}`);
  return { success: true };
}
