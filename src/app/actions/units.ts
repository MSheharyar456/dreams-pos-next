'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getUnits() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching units:', error);
    return [];
  }
  return data;
}

export async function getUnitById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching unit:', error);
    return null;
  }
  return data;
}

export async function createUnit(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;
  const short_name = formData.get('short_name') as string;
  const is_active = formData.get('is_active') === 'on' || formData.get('is_active') === 'true';

  if (!name || !short_name) {
    return { error: 'Unit name and short name are required' };
  }

  const { data, error } = await supabase
    .from('units')
    .insert([{ name, short_name, is_active }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/units');
  return { success: true, data };
}

export async function updateUnit(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;
  const short_name = formData.get('short_name') as string;
  const is_active = formData.get('is_active') === 'on' || formData.get('is_active') === 'true';

  if (!name || !short_name) {
    return { error: 'Unit name and short name are required' };
  }

  const { data, error } = await supabase
    .from('units')
    .update({ name, short_name, is_active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/units');
  revalidatePath(`/units/edit/${id}`);
  return { success: true, data };
}

export async function deleteUnit(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('units')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/units');
  return { success: true };
}
