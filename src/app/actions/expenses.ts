'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getExpenses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      expense_categories (
        name
      )
    `)
    .order('expense_date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
  return data || [];
}

export async function getExpenseCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data || [];
}

export async function addExpense(formData: FormData) {
  const supabase = await createClient();
  
  const expense_category_id = formData.get('category_id');
  const reference = formData.get('reference');
  const amount = formData.get('amount');
  const description = formData.get('description');
  const expense_date = formData.get('expense_date') || new Date().toISOString();

  const { error } = await supabase
    .from('expenses')
    .insert([{
      expense_category_id,
        description: reference || description,
        amount: Number(amount),
        expense_date,
      created_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('Error adding expense:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/expenses');
  return { success: true };
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting expense:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/expenses');
  return { success: true };
}


export async function addExpenseCategory(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name');

  const { error } = await supabase
    .from('expense_categories')
    .insert([{ 
      name, 
      expense_type: formData.get('expense_type') || 'shop', // Allowed: 'shop', 'house', 'other'
      created_at: new Date().toISOString() 
    }]);

  if (error) {
    console.error('Error adding category:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/expenses/category');
  revalidatePath('/expenses');
  return { success: true };
}
