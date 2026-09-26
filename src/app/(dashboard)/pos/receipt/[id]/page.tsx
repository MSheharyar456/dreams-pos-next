import React from 'react';
import Link from 'next/link';
import PrintButton from '@/components/ui/PrintButton';
import { createClient } from '@/lib/supabase/server';
import ScaleImageUpload from '@/components/ui/ScaleImageUpload';
import ReceiptField from '@/components/ui/ReceiptField';

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const supabase = await createClient();

  // Fetch sale details
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .select('*, items:sale_items(*, product:product_variants(*, product:products(*)))')
    .eq('id', id)
    .single();

  const { data: ledgerRow } = await supabase
    .from('customer_ledgers')
    .select('*')
    .eq('sale_id', id)
    .maybeSingle();

  const customerId = ledgerRow?.customer_id || sale?.customer_id;
  const { data: customer } = customerId
    ? await supabase
      .from('customers')
      .select('opening_balance')
      .eq('id', customerId)
      .maybeSingle()
    : { data: null };

  const parseLedgerMeta = (value: string | null | undefined) => {
    if (!value) return null;
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'object' && parsed ? parsed : null;
    } catch {
      return null;
    }
  };

  const ledgerMeta = parseLedgerMeta((ledgerRow as any)?.remarks || null);

  if (saleError || !sale) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Receipt not found</h2>
        <p style={{ color: 'red' }}>Error: {saleError ? JSON.stringify(saleError) : 'No sale data returned'}</p>
        <Link href="/pos" style={{ color: '#ff9f43' }}>Back to POS</Link>
      </div>
    );
  }
  
  // Calculate total quantity for challan
  const totalQty = sale.items.reduce((sum: number, item: any) => sum + Number(item.quantity), 0);
  const customerName = sale.notes ? sale.notes.replace('Walk-in Customer: ', '') : 'Walk-in Customer';
  const saleTotal = Number(sale.total_amount || 0);
  const saleCharges = Math.max(0, Number(sale.loader_charges || 0));
  const ledgerCashPaid = Number(ledgerMeta?.cash_paid ?? ledgerRow?.paid_amount ?? sale.paid_amount ?? 0);
  const ledgerAdvanceUsed = Number(ledgerMeta?.advance_used ?? 0);
  const availableAdvance = sale.order_status === 'pending'
    ? Math.max(0, Number(ledgerMeta?.available_advance ?? customer?.opening_balance ?? 0))
    : Math.max(0, Number(customer?.opening_balance ?? ledgerMeta?.available_advance ?? 0));
  const displayAdvance = sale.order_status === 'pending'
    ? availableAdvance
    : ledgerAdvanceUsed;
  const displayPaidAmount = ledgerCashPaid;
  const netBalance = availableAdvance - saleTotal + ledgerCashPaid;
  const remainingAmount = sale.order_status === 'pending'
    ? Math.abs(netBalance)
    : Math.max(0, Number(ledgerRow?.remaining_amount || 0));

  return (
    <div style={{ minHeight: '80vh', padding: '40px' }}>
      
      {/* Top Action Bar */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px' }}>
        <PrintButton />
        <Link href="/pos">
          <button style={{ padding: '10px 25px', backgroundColor: '#ff9f43', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
            <i className="fa fa-arrow-left" style={{ marginRight: '8px' }}></i> New Sale
          </button>
        </Link>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center' }}>
        
        {/* ========================================= */}
        {/* 1. CUSTOMER INVOICE (Left Side)           */}
        {/* ========================================= */}
        <div style={{ flex: '1 1 500px', maxWidth: '600px', backgroundColor: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px dashed #eee', paddingBottom: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '1px' }}><span style={{ color: '#0B3B60' }}>JAVEED ALNOOR</span>{' '}<span style={{ color: '#F69220' }}>BUILDING</span></h1>
            <p style={{ margin: '5px 0', color: '#666', fontSize: '18px', fontWeight: 'bold' }}>Sale Invoice</p>
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555' }}>
              <span>Invoice: <strong>{sale.invoice_number}</strong></span>
              <span>Date: {new Date(sale.created_at).toLocaleDateString()}</span>
            </div>
            <div style={{ marginTop: '5px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555' }}>
              <span>Customer: <strong>{customerName}</strong></span>
              <span>Time: {new Date(sale.created_at).toLocaleTimeString()}</span>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '10px 0', textAlign: 'left', color: '#444' }}>Item</th>
                <th style={{ padding: '10px 0', textAlign: 'center', color: '#444' }}>Qty</th>
                <th style={{ padding: '10px 0', textAlign: 'right', color: '#444' }}>Price</th>
                <th style={{ padding: '10px 0', textAlign: 'right', color: '#444' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item: any) => {
                const productName = item.product?.product?.name || 'Unknown Product';
                const variantName = item.product?.variant_name;
                const displayName = variantName && variantName !== 'Default' ? `${productName} - ${variantName}` : productName;
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                    <td style={{ padding: '15px 0', color: '#555' }}>{displayName}</td>
                    <td style={{ padding: '15px 0', textAlign: 'center', color: '#555' }}>{item.quantity}</td>
                    <td style={{ padding: '15px 0', textAlign: 'right', color: '#555' }}>Rs. {item.unit_price.toFixed(2)}</td>
                    <td style={{ padding: '15px 0', textAlign: 'right', fontWeight: 600, color: '#333' }}>Rs. {item.total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px dashed #eee', paddingTop: '20px' }}>
            <div style={{ width: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '16px', color: '#555' }}>
                <span>{saleCharges > 0 ? 'Subtotal:' : 'Total:'}</span>
                <span>Rs. {Math.max(0, saleTotal - saleCharges).toFixed(2)}</span>
              </div>
              {saleCharges > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '16px', color: '#555' }}>
                    <span>Charges:</span>
                    <span>Rs. {saleCharges.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '16px', color: '#555' }}>
                    <span>Total:</span>
                    <span>Rs. {saleTotal.toFixed(2)}</span>
                  </div>
                </>
              )}
              {sale.payment_status !== 'paid' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '16px', color: '#555' }}>
                  <span>Advance:</span>
                  <span style={{ color: '#ea5455', fontWeight: 600 }}>Rs. {displayAdvance.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '16px', color: '#555' }}>
                <span>Total Paid:</span>
                <span>Rs. {displayPaidAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '22px', fontWeight: 700, color: '#111' }}>
                <span>Remaining:</span>
                <span>Rs. {remainingAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '60px' }}>
             <div style={{ textAlign: 'center', borderTop: '1px solid #333', width: '30%', paddingTop: '5px' }}>Receiver</div>
             <div style={{ textAlign: 'center', borderTop: '1px solid #333', width: '30%', paddingTop: '5px' }}>Accountant</div>
          </div>
        </div>


        {/* ========================================= */}
        {/* 2. DELIVERY CHALLAN (Right Side)          */}
        {/* ========================================= */}
        <div style={{ flex: '1 1 500px', maxWidth: '600px', backgroundColor: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px dashed #eee', paddingBottom: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '1px' }}><span style={{ color: '#0B3B60' }}>JAVEED ALNOOR</span>{' '}<span style={{ color: '#F69220' }}>BUILDING</span></h1>
            <p style={{ margin: '5px 0', color: '#666', fontSize: '18px', fontWeight: 'bold' }}>Delivery Challan</p>
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555' }}>
              <span>Invoice: <strong>{sale.invoice_number}</strong></span>
              <span>Date: {new Date(sale.created_at).toLocaleDateString()}</span>
            </div>
            <div style={{ marginTop: '5px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555' }}>
              <span>Customer: <strong>{customerName}</strong></span>
              <span>Sales Man: <ReceiptField saleId={sale.id} field="sales_man" initialValue={sale.sales_man} placeholder="Enter Name" /></span>
            </div>
            <div style={{ marginTop: '5px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555' }}>
              <span>Loader: <ReceiptField saleId={sale.id} field="loader_name" initialValue={sale.loader_name} placeholder="Enter Loader" /></span>
              <span>Scale Name: <ReceiptField saleId={sale.id} field="scale_name" initialValue={sale.scale_name} placeholder="Enter Scale" /></span>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee', backgroundColor: '#f4f4f4' }}>
                <th style={{ padding: '10px', textAlign: 'left', color: '#333' }}>SN</th>
                <th style={{ padding: '10px', textAlign: 'left', color: '#333' }}>Product Name</th>
                <th style={{ padding: '10px', textAlign: 'center', color: '#333' }}>QTY</th>
                <th style={{ padding: '10px', textAlign: 'center', color: '#333' }}>Scale Image</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item: any, index: number) => {
                const productName = item.product?.product?.name || 'Unknown Product';
                const variantName = item.product?.variant_name;
                const displayName = variantName && variantName !== 'Default' ? `${productName} - ${variantName}` : productName;
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                    <td style={{ padding: '15px 10px', color: '#555', width: '40px' }}>{index + 1}</td>
                    <td style={{ padding: '15px 10px', color: '#555' }}>{displayName}</td>
                    <td style={{ padding: '15px 10px', textAlign: 'center', color: '#333', fontWeight: 600, fontSize: '16px' }}>{item.quantity}</td>
                    <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                      <ScaleImageUpload 
                        saleItemId={item.id} 
                        saleId={sale.id} 
                        initialImageUrl={item.scale_image_url} 
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px dashed #eee', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px', fontSize: '20px', fontWeight: 700, color: '#111' }}>
              <span>Total QTY:</span>
              <span>{totalQty}</span>
            </div>
          </div>
          
          <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between' }}>
             <span>Driver: <ReceiptField saleId={sale.id} field="driver_name" initialValue={sale.driver_name} placeholder="Enter Driver" /></span>
             <span>Vehicle: <ReceiptField saleId={sale.id} field="vehicle_number" initialValue={sale.vehicle_number} placeholder="Enter Vehicle" /></span>
          </div>
        </div>

      </div>
    </div>
  );
}

// Force reload side-by-side: 1786786277233
