'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getEmployees() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
  return data || [];
}

export async function getEmployeeById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('employees').select('*').eq('id', id).single();
  if (error) {
    console.error('Error fetching employee:', error);
    return null;
  }
  return data;
}

export async function createEmployee(formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const father_name = formData.get('father_name') as string;
  const phone_1 = formData.get('phone_1') as string;
  const phone_2 = formData.get('phone_2') as string;
  const cnic_number = formData.get('cnic_number') as string;
  const cnic_front_image = formData.get('cnic_front_image') as string;
  const cnic_back_image = formData.get('cnic_back_image') as string;

  const { data, error } = await supabase
    .from('employees')
    .insert([{
      name,
      father_name,
      phone_1,
      phone_2,
      cnic_number,
      cnic_front_image,
      cnic_back_image
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating employee:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/employees');
  return { success: true, data };
}

export async function updateEmployee(formData: FormData) {
  const supabase = await createClient();
  
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const father_name = formData.get('father_name') as string;
  const phone_1 = formData.get('phone_1') as string;
  const phone_2 = formData.get('phone_2') as string;
  const cnic_number = formData.get('cnic_number') as string;
  const cnic_front_image = formData.get('cnic_front_image') as string | null;
  const cnic_back_image = formData.get('cnic_back_image') as string | null;

  // Fetch existing employee to delete old images if replaced
  const { data: emp } = await supabase.from('employees').select('cnic_front_image, cnic_back_image').eq('id', id).single();
  
  const updateData: any = {
    name,
    father_name,
    phone_1,
    phone_2,
    cnic_number
  };

  const filesToDelete = [];

  if (cnic_front_image) {
    updateData.cnic_front_image = cnic_front_image;
    if (emp?.cnic_front_image) {
      const urlParts = emp.cnic_front_image.split('/');
      filesToDelete.push(urlParts[urlParts.length - 1]);
    }
  }

  if (cnic_back_image) {
    updateData.cnic_back_image = cnic_back_image;
    if (emp?.cnic_back_image) {
      const urlParts = emp.cnic_back_image.split('/');
      filesToDelete.push(urlParts[urlParts.length - 1]);
    }
  }

  if (filesToDelete.length > 0) {
    await supabase.storage.from('cnic_images').remove(filesToDelete);
  }

  const { data, error } = await supabase
    .from('employees')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating employee:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/employees');
  return { success: true, data };
}

export async function deleteEmployee(id: string) {
  const supabase = await createClient();
  
  // 1. Fetch employee to get image URLs
  const { data: emp } = await supabase.from('employees').select('cnic_front_image, cnic_back_image').eq('id', id).single();
  
  // 2. Delete images from storage if they exist
  if (emp) {
    const filesToDelete = [];
    if (emp.cnic_front_image) {
      const urlParts = emp.cnic_front_image.split('/');
      const fileName = urlParts[urlParts.length - 1];
      filesToDelete.push(fileName);
    }
    if (emp.cnic_back_image) {
      const urlParts = emp.cnic_back_image.split('/');
      const fileName = urlParts[urlParts.length - 1];
      filesToDelete.push(fileName);
    }
    
    if (filesToDelete.length > 0) {
      const { error: storageError } = await supabase.storage.from('cnic_images').remove(filesToDelete);
      if (storageError) {
        console.error('Error deleting images from bucket:', storageError);
      }
    }
  }

  // 3. Delete employee row
  const { error } = await supabase.from('employees').delete().eq('id', id);
  if (error) {
    console.error('Error deleting employee:', error);
    return { success: false, error: error.message };
  }
  revalidatePath('/employees');
  return { success: true };
}
