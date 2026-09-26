import React from 'react';
import Link from 'next/link';
import { getCustomerLedgers, getSupplierLedgers, getCustomersWithOpeningBalanceOnly, getSuppliersWithOpeningBalanceOnly } from '@/app/actions/loans';

export default async function LoansPage() {
  const [customerLedgers, supplierLedgers, customersWithOBOnly, suppliersWithOBOnly] = await Promise.all([
    getCustomerLedgers(),
    getSupplierLedgers(),
    getCustomersWithOpeningBalanceOnly(),
    getSuppliersWithOpeningBalanceOnly()
  ]);
  
  // Combine ledger entries with customers/suppliers that have opening balance but no ledger entries
  // Filter out cleared invoices (remaining=0 with invoice_number) to match ledger detail view
  const allCustomerData = [...customerLedgers, ...customersWithOBOnly].filter(item => {
    if (!item.invoice_number) return true; // Advance rows always count
    const remaining = Number(item.remaining_amount || 0);
    const isNewSystemLoan = typeof item.remarks === 'string' && item.remarks.includes('"loan_sale"');
    return Math.abs(remaining) > 0.009 || isNewSystemLoan; // Only count invoices with active balance or new system invoices
  });

  const allSupplierData = [...supplierLedgers, ...suppliersWithOBOnly];
  
  console.log('\n📊 [LOANS PAGE] Fetched customer ledgers:', customerLedgers.length, 'records');
  customerLedgers.forEach((ledger, idx) => {
    console.log(`   Ledger ${idx + 1}: Customer="${ledger.customers?.name}", opening_balance=${ledger.customers?.opening_balance}, remaining=${ledger.remaining_amount}`);
  });
  
  console.log('📊 [LOANS PAGE] Fetched customers with opening_balance only:', customersWithOBOnly.length, 'records');
  customersWithOBOnly.forEach((customer, idx) => {
    console.log(`   Customer ${idx + 1}: name="${customer.customers?.name}", opening_balance=${customer.customers?.opening_balance}`);
  });

  const customerToReceive = allCustomerData.reduce((sum, ledger) => {
    const remaining = Number(ledger.remaining_amount || 0);
    const toAdd = Math.max(0, remaining); // Only use remaining amount (includes opening balance)
    return sum + toAdd;
  }, 0);
  console.log('\u2705 [LOANS PAGE] CUSTOMER TO RECEIVE TOTAL:', customerToReceive);

  const customerToPay = allCustomerData.reduce((sum, ledger) => {
    const remaining = Number(ledger.remaining_amount || 0);
    const toAdd = Math.max(0, -remaining); // Only use remaining amount (negative = need to pay)
    return sum + toAdd;
  }, 0);
  console.log('\u2705 [LOANS PAGE] CUSTOMER TO PAY TOTAL:', customerToPay);

  const activeCustomers = new Set(allCustomerData.map(l => l.customer_id).filter(Boolean)).size;

  console.log('\n📊 [LOANS PAGE] Fetched supplier ledgers:', supplierLedgers.length, 'records');
  supplierLedgers.forEach((ledger, idx) => {
    console.log(`   Ledger ${idx + 1}: Supplier="${ledger.suppliers?.name}", opening_balance=${ledger.suppliers?.opening_balance}, remaining=${ledger.remaining_amount}`);
  });
  console.log('📊 [LOANS PAGE] Fetched suppliers with opening_balance only:', suppliersWithOBOnly.length, 'records');
  
  const supplierToPay = allSupplierData.reduce((sum, ledger) => {
    const remaining = Number(ledger.remaining_amount || 0);
    const toAdd = Math.max(0, remaining); // Only use remaining amount
    return sum + toAdd;
  }, 0);
  console.log('\u2705 [LOANS PAGE] SUPPLIER TO PAY TOTAL:', supplierToPay);

  const supplierToReceive = allSupplierData.reduce((sum, ledger) => {
    const remaining = Number(ledger.remaining_amount || 0);
    const toAdd = Math.max(0, -remaining); // Only use remaining amount (negative = need to receive)
    return sum + toAdd;
  }, 0);
  console.log('\u2705 [LOANS PAGE] SUPPLIER TO RECEIVE TOTAL:', supplierToReceive);

  const activeSuppliers = new Set(allSupplierData.map(l => l.supplier_id).filter(Boolean)).size;

  return (
    <div style={{ minHeight: '80vh', padding: '40px' }}>
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 50%', borderRight: '1px solid #f0f0f0', padding: '40px 30px 30px', backgroundColor: '#fff' }}>
            <div style={{ borderTop: '6px solid #28c76f', borderRadius: '8px 8px 0 0', marginBottom: '24px' }} />
            <h2 style={{ margin: '0 0 16px', textAlign: 'center', fontSize: '24px', color: '#28c76f', fontWeight: 800, textTransform: 'uppercase' }}>CUSTOMER LOANS</h2>

            <div style={{ textAlign: 'center', padding: '18px 0 8px' }}>
              <p style={{ fontSize: '16px', color: '#555', marginBottom: '10px' }}>Total Amount to Receive</p>
              <h1 style={{ fontSize: '48px', color: '#111', margin: 0, fontWeight: 900 }}>Rs. {customerToReceive.toFixed(2)}</h1>
            </div>

            <div style={{ textAlign: 'center', padding: '18px 0 8px' }}>
              <p style={{ fontSize: '16px', color: '#555', marginBottom: '10px' }}>Total Amount to Pay</p>
              <h1 style={{ fontSize: '36px', color: '#111', margin: 0, fontWeight: 700 }}>Rs. {customerToPay.toFixed(2)}</h1>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: '15px', color: '#666', fontSize: '14px', marginTop: '24px' }}>
              <span>Active Customers in Debt:</span>
              <span style={{ fontWeight: 700, color: '#333' }}>{activeCustomers}</span>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <Link href="/loans/customers">
                <button style={{ padding: '12px 30px', backgroundColor: '#28c76f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, width: '100%' }}>
                  View Customer Ledgers
                </button>
              </Link>
            </div>
          </div>

          <div style={{ flex: '1 1 50%', padding: '40px 30px 30px', backgroundColor: '#fff' }}>
            <div style={{ borderTop: '6px solid #ea5455', borderRadius: '8px 8px 0 0', marginBottom: '24px' }} />
            <h2 style={{ margin: '0 0 16px', textAlign: 'center', fontSize: '24px', color: '#ea5455', fontWeight: 800, textTransform: 'uppercase' }}>SUPPLIER LOANS</h2>

            <div style={{ textAlign: 'center', padding: '18px 0 8px' }}>
              <p style={{ fontSize: '16px', color: '#555', marginBottom: '10px' }}>Total Amount to Pay</p>
              <h1 style={{ fontSize: '48px', color: '#111', margin: 0, fontWeight: 900 }}>Rs. {supplierToPay.toFixed(2)}</h1>
            </div>

            <div style={{ textAlign: 'center', padding: '18px 0 8px' }}>
              <p style={{ fontSize: '16px', color: '#555', marginBottom: '10px' }}>Total Amount to Receive</p>
              <h1 style={{ fontSize: '36px', color: '#111', margin: 0, fontWeight: 700 }}>Rs. {supplierToReceive.toFixed(2)}</h1>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: '15px', color: '#666', fontSize: '14px', marginTop: '24px' }}>
              <span>Active Suppliers to Pay:</span>
              <span style={{ fontWeight: 700, color: '#333' }}>{activeSuppliers}</span>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <Link href="/loans/suppliers">
                <button style={{ padding: '12px 30px', backgroundColor: '#ea5455', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, width: '100%' }}>
                  View Supplier Ledgers
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
