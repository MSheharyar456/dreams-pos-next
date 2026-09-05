'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

import { unstable_noStore as noStore } from 'next/cache';

export async function getSettings() {
  noStore(); // Prevents Next.js from caching this database query
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching settings:', error);
    return null;
  }
  return data;
}

export async function updateSettings(formData: FormData) {
  const supabase = await createClient();
  
  const project_name = formData.get('project_name');
  const printer_name = formData.get('printer_name');
  const printer_size = formData.get('printer_size');
  
  let logo_url = formData.get('current_logo') as string;
  const logoFile = formData.get('logo') as File;
  
  if (logoFile && logoFile.size > 0) {
    const fileExt = logoFile.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, logoFile);
      
    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      return { success: false, error: uploadError.message };
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName);
      
    logo_url = publicUrl;
  }

  const { error } = await supabase
    .from('settings')
    .upsert({
      id: 1,
      project_name,
      printer_name,
      printer_size,
      logo_url,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error updating settings:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirm_password') as string;
  
  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' };
  }
  
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    console.error('Error updating password:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
