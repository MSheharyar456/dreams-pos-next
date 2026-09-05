'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getProducts(filters?: { product_id?: string; category_id?: string; brand_id?: string; }) {
  noStore();
  const supabase = await createClient();
  let query = supabase
    .from('products')
    .select('*, category:categories(name), brand:brands(name), variants:product_variants(*, unit:units(name, short_name), inventory_movements(quantity))')
    .order('created_at', { ascending: false });

  if (filters?.product_id) {
    query = query.eq('id', filters.product_id);
  }
  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id);
  }
  if (filters?.brand_id) {
    query = query.eq('brand_id', filters.brand_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data;
}

export async function getProductById(id: string) {
  noStore();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  return data;
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;
    const category_id = formData.get('category_id') as string;
  const brand_id = formData.get('brand_id') as string;

  const is_active = true;

  // Check for dynamic pipe dimensions
  const savedVariantName = formData.get('variant_name') as string;
  const sutr = formData.get('sutr') as string;
  const feet = formData.get('feet') as string;
  let variant_name = savedVariantName || 'Default';
  if (sutr && feet) {
    variant_name = `${sutr} Sutr, ${feet} Feet`;
  } else if (sutr) {
    variant_name = `${sutr} Sutr`;
  } else if (feet) {
    variant_name = `${feet} Feet`;
  }


  // Variant fields from the addproduct.html UI
  const sku = formData.get('sku') as string;
    const purchase_price = parseFloat(formData.get('purchase_price') as string || '0');
  const sale_price = parseFloat(formData.get('sale_price') as string || '0');
  const min_qty = parseFloat(formData.get('min_qty') as string || '10');
  const opening_stock = parseFloat(formData.get('opening_stock') as string || '0');

  if (!name) {
    return { error: 'Product name is required' };
  }

  // 1. Insert Product
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert([{ 
      name, 
      
       
      category_id: category_id || null,
      brand_id: brand_id || null,
      is_active 
    }])
    .select()
    .single();

  if (productError) {
    return { error: productError.message };
  }

  // 2. Insert Default Variant
  if (product) {
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .insert([{
        product_id: product.id,
        variant_name: variant_name,
        
        purchase_price: purchase_price,
        sale_price: sale_price,
        low_stock_threshold: 0,
        is_active: is_active
      }])
      .select()
      .single();

    if (variantError) {
      console.error('Error creating variant:', variantError);
      return { error: 'Failed to create product variant: ' + variantError.message };
    } else if (variant && opening_stock > 0) {
      // 3. Insert Opening Stock Movement
      const { error: openErr } = await supabase.from('inventory_movements').insert([{
        product_variant_id: variant.id,
        movement_type: 'purchase',
        quantity: opening_stock,
        unit_cost: purchase_price,
        notes: 'Initial opening stock'
      }]);
      
      if (openErr) {
        console.error('Error inserting opening stock:', openErr);
        return { error: 'Failed to insert opening stock: ' + openErr.message };
      }
    }
  }

  revalidatePath('/products');
  redirect('/products');
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;
    const category_id = formData.get('category_id') as string;
  const brand_id = formData.get('brand_id') as string;

  const is_active = true;

  // Check for dynamic pipe dimensions
  const savedVariantName = formData.get('variant_name') as string;
  const sutr = formData.get('sutr') as string;
  const feet = formData.get('feet') as string;
  let variant_name = savedVariantName || 'Default';
  if (sutr && feet) {
    variant_name = `${sutr} Sutr, ${feet} Feet`;
  } else if (sutr) {
    variant_name = `${sutr} Sutr`;
  } else if (feet) {
    variant_name = `${feet} Feet`;
  }

  const sku = formData.get('sku') as string;
  
  // Variant fields
    const purchase_price = parseFloat(formData.get('purchase_price') as string || '0');
  const sale_price = parseFloat(formData.get('sale_price') as string || '0');
  const min_qty = parseFloat(formData.get('min_qty') as string || '10');
  const add_stock = parseFloat(formData.get('add_stock') as string || '0');

  if (!name) {
    return { error: 'Product name is required' };
  }

  const { data, error } = await supabase
    .from('products')
    .update({ 
      name, 
      
      
      category_id: category_id || null,
      brand_id: brand_id || null,
      is_active 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Update the exact variant opened from Product List, not always the first one.
  const requestedVariantId = formData.get('variant_id') as string;
  let variantId = requestedVariantId;
  if (!variantId) {
    const { data: variants } = await supabase.from('product_variants').select('id').eq('product_id', id).order('created_at', { ascending: true }).limit(1);
    if (!variants || variants.length === 0) return { error: 'No product variant was found.' };
    variantId = variants[0].id;
  }

  const { data: updatedVariant, error: variantUpdateErr } = await supabase.from('product_variants').update({
    variant_name: variant_name,
    
    purchase_price,
    sale_price,
    low_stock_threshold: 0,
    is_active
  }).eq('id', variantId).select('id, purchase_price, sale_price').single();

  if (variantUpdateErr || !updatedVariant) {
    return { error: 'Failed to update variant: ' + (variantUpdateErr?.message || 'No matching variant was updated. Check database permissions.') };
  }

  console.log("add_stock value:", add_stock);
  // If user added stock from the Edit screen
  if (add_stock > 0) {
    console.log("Attempting to insert inventory_movement with quantity:", add_stock);
    const { error: moveErr } = await supabase.from('inventory_movements').insert([{
      product_variant_id: variantId,
      movement_type: 'purchase',
      quantity: add_stock,
      unit_cost: purchase_price,
      notes: 'Manual stock addition via edit form'
    }]);
    
    if (moveErr) {
      console.error('Error inserting stock adjustment:', moveErr);
      return { error: 'Failed to update stock: ' + moveErr.message };
    } else {
      console.log("Successfully inserted inventory movement!");
    }
  }

  revalidatePath('/products');
  revalidatePath(`/products/edit/${id}`);
  return { success: true, data };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/products');
  return { success: true };
}

export async function bulkDeleteProducts(ids: string[]) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('products')
    .delete()
    .in('id', ids);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/products');
  return { success: true };
}

export async function getProductsBySupplier(supplier_id: string) {
  noStore();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, variants:product_variants(id, variant_name, inventory_movements(quantity, unit_cost, movement_type))')
    .eq('supplier_id', supplier_id)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data.map((product: any) => {
    let remainingQuantity = 0;
    let totalPurchasedAmount = 0;
    product.variants?.forEach((variant: any) => {
      variant.inventory_movements?.forEach((movement: any) => {
        if (movement.movement_type === 'purchase') {
          remainingQuantity += movement.quantity;
          totalPurchasedAmount += (movement.quantity * (movement.unit_cost || 0));
        } else if (movement.movement_type === 'sale') {
          remainingQuantity -= movement.quantity;
        }
      });
    });
    return { ...product, calculated_quantity: remainingQuantity, calculated_total_purchased: totalPurchasedAmount };
  });
}
