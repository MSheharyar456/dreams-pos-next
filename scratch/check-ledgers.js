const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach((line) => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    envVars[key.trim()] = values.join('=').trim().replace(/['"]/g, '');
  }
});

const supabase = createClient(
  envVars['NEXT_PUBLIC_SUPABASE_URL'],
  envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']
);

(async () => {
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'mshehar5@gmail.com',
    password: 'khan6500',
  });

  if (authError) {
    console.error('AUTH ERR', authError);
    return;
  }

  const { data, error } = await supabase
    .from('customer_ledgers')
    .select('id, customer_id, sale_id, invoice_number, total_amount, paid_amount, remaining_amount, remarks, created_at, customers(name), sales(id, invoice_number, order_status, total_amount)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('LEDGERS ERR', error);
    return;
  }

  console.log('COUNT', data.length);
  for (const row of data) {
    console.log(JSON.stringify({
      id: row.id,
      customer: row.customers?.name,
      customer_id: row.customer_id,
      sale_id: row.sale_id,
      invoice_number: row.invoice_number,
      total_amount: row.total_amount,
      paid_amount: row.paid_amount,
      remaining_amount: row.remaining_amount,
      remarks: row.remarks,
      sales_match: row.sales ? {
        id: row.sales.id,
        invoice_number: row.sales.invoice_number,
        order_status: row.sales.order_status,
        total_amount: row.sales.total_amount,
      } : null,
      created_at: row.created_at,
    }, null, 2));
  }
})();
