const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    envVars[key.trim()] = values.join('=').trim().replace(/['"]/g, '');
  }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Logging in...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'mshehar5@gmail.com',
    password: 'khan6500',
  });

  if (authError) {
    console.error("Auth Error:", authError);
    return;
  }
  console.log("Logged in successfully!");

  console.log("\nFetching products with variants and movements...");
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, name, variants:product_variants(id, variant_name, inventory_movements(*))')
    .limit(5);

  console.log("\nFetching ALL inventory movements directly...");
  const { data: moves, error: moveErr } = await supabase
    .from('inventory_movements')
    .select('*')
    .limit(10);

  if (moveErr) {
    console.error("Movements Fetch Error:", moveErr);
  } else {
    console.log("Movements Data:");
    console.dir(moves, { depth: null });
  }

  console.log("\nAttempting to insert a manual movement...");
  // Use the ID of the first variant from SRC Cement
  const { data: insertData, error: insertErr } = await supabase
    .from('inventory_movements')
    .insert([{
      product_variant_id: 'c81a895d-b643-4bd2-9cd0-b3210e42e5d8',
      movement_type: 'purchase',
      quantity: 10,
      unit_cost: 0,
      notes: 'test insert'
    }])
    .select();
  
  console.log("\nDiscovering 'sales' schema...");
  const { error: sErr } = await supabase.from('sales').insert([{ invoice_number: 'TEST2' }]);
  console.log("Sales schema error:", sErr);
  
  console.log("\nDiscovering 'sale_items' schema...");
  const { error: siErr } = await supabase.from('sale_items').insert([{ 
    sale_id: 'eb7b34dc-25a7-4b48-a084-ab97a6b8a2ce', // Dummy UUID from movements
    product_variant_id: 'c81a895d-b643-4bd2-9cd0-b3210e42e5d8', // SRC Cement
    quantity: 1, 
    unit_price: 10,
    total: 10
  }]);
  console.log("Sale Items schema error:", siErr);
}

test();
