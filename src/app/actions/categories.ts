'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data;
}

export async function getCategoryById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }
  return data;
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const is_active = formData.get('is_active') === 'on' || formData.get('is_active') === 'true';

  if (!name) {
    return { error: 'Category name is required' };
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, description, is_active }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/categories');
  return { success: true, data };
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const is_active = formData.get('is_active') === 'on' || formData.get('is_active') === 'true';

  if (!name) {
    return { error: 'Category name is required' };
  }

  const { data, error } = await supabase
    .from('categories')
    .update({ name, description, is_active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/categories');
  revalidatePath(`/categories/edit/${id}`);
  return { success: true, data };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/categories');
  return { success: true };
}
