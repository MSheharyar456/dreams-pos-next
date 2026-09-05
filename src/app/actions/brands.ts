'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getBrands() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('brands')
    .select('*, category:categories(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
  return data;
}

export async function getBrandById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching brand:', error);
    return null;
  }
  return data;
}

export async function createBrand(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const category_id = formData.get('category_id') as string;
  const is_active = formData.get('is_active') === 'on' || formData.get('is_active') === 'true';

  if (!name) {
    return { error: 'Brand name is required' };
  }

  const { data, error } = await supabase
    .from('brands')
    .insert([{ name, description, category_id: category_id || null, is_active }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/brands');
  return { success: true, data };
}

export async function updateBrand(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const category_id = formData.get('category_id') as string;
  const is_active = formData.get('is_active') === 'on' || formData.get('is_active') === 'true';

  if (!name) {
    return { error: 'Brand name is required' };
  }

  const { data, error } = await supabase
    .from('brands')
    .update({ name, description, category_id: category_id || null, is_active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/brands');
  revalidatePath(`/brands/edit/${id}`);
  return { success: true, data };
}

export async function deleteBrand(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/brands');
  return { success: true };
}
