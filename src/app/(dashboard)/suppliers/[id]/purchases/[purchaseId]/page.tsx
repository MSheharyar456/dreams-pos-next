import Link from 'next/link';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/ui/PrintButton';
import { getPurchaseById } from '@/app/actions/purchases';

export default async function PurchaseInvoice({ params }: { params: Promise<{ id: string; purchaseId: string }> }) {
  const { id, purchaseId } = await params;
  const purchase: any = await getPurchaseById(purchaseId);
  if (!purchase || purchase.supplier_id !== id) notFound();

  let ledgerMeta: any = {};
  try {
    const parsed = purchase.ledger?.remarks
      ? JSON.parse(purchase.ledger.remarks)
      : purchase.notes
        ? JSON.parse(purchase.notes)
        : {};
    if (parsed && typeof parsed === 'object') ledgerMeta = parsed;
  } catch {
    ledgerMeta = {};
  }

  const isPending = ledgerMeta.type === 'pending_pop';
  const totalAmount = Number(purchase.total_amount || 0);
  const cashPaid = Number(ledgerMeta.cash_paid ?? ledgerMeta.cashPaid ?? purchase.paid_amount ?? 0);
  const currentSupplierAdvance = Math.max(0, Number(purchase.supplier?.opening_balance || 0));
  const advanceBefore = isPending
    ? Math.max(0, Number(ledgerMeta.openingAdvance ?? currentSupplierAdvance))
    : ledgerMeta.opening_advance !== undefined
    ? Number(ledgerMeta.opening_advance)
    : ledgerMeta.openingAdvance !== undefined
      ? Number(ledgerMeta.openingAdvance)
      : currentSupplierAdvance;
  const advanceUsed = isPending
    ? Math.max(0, Number(ledgerMeta.advanceUsed ?? Math.min(advanceBefore, totalAmount - cashPaid)))
    : ledgerMeta.advance_used !== undefined
    ? Number(ledgerMeta.advance_used)
    : ledgerMeta.advanceUsed !== undefined
      ? Number(ledgerMeta.advanceUsed)
      : Math.max(0, Number(purchase.paid_amount || 0) - cashPaid);
  const remainingAdvance = isPending
    ? Math.max(0, Number(ledgerMeta.availableAdvance ?? (advanceBefore - advanceUsed)))
    : ledgerMeta.available_advance !== undefined
    ? Number(ledgerMeta.available_advance)
    : ledgerMeta.availableAdvance !== undefined
      ? Number(ledgerMeta.availableAdvance)
      : currentSupplierAdvance;
  const showAdvanceDetails = advanceBefore > 0.005 || advanceUsed > 0.005 || remainingAdvance > 0.005;
  const remainingAmount = isPending
    ? Math.max(0, totalAmount - cashPaid - advanceUsed)
    : Number(purchase.remaining_amount || 0);
  const receiptItems = purchase.items?.length
    ? purchase.items
    : (Array.isArray(ledgerMeta.cartItems) ? ledgerMeta.cartItems.map((item: any, index: number) => ({
      id: `${purchase.id}-${index}`,
      quantity: item.quantity,
      unit_cost: item.purchasePrice,
      total: Number(item.quantity) * Number(item.purchasePrice),
      variant: {
        variant_name: item.variantName,
        product: { name: item.name }
      }
    })) : []);
  const receiptNote = isPending ? ledgerMeta.note : purchase.notes;

  return (
    <div style={{ maxWidth: 850, margin: '0 auto', padding: 30 }}>
      <div className="d-flex gap-2 justify-content-center mb-4">
        <PrintButton />
        <Link href={`/suppliers/${id}/purchases`} className="btn btn-added">Back to purchases</Link>
      </div>
      <div className="card">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between border-bottom pb-3 mb-4">
            <div><h2 className="mb-1">PURCHASE INVOICE</h2><div className="text-muted">{purchase.purchase_number}</div></div>
            <div className="text-end"><strong>{purchase.supplier?.name}</strong><br />{purchase.supplier?.phone}<br />{purchase.supplier?.address}</div>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>Purchased by: <strong>{purchase.created_by_name || 'Unknown'}</strong></div>
            <div>Date: <strong>{new Date(purchase.created_at).toLocaleString()}</strong></div>
          </div>
          <table className="table">
            <thead><tr><th>Product</th><th>Variant</th><th className="text-end">Quantity</th><th className="text-end">Unit Cost</th><th className="text-end">Total</th></tr></thead>
            <tbody>{receiptItems.map((item: any) => <tr key={item.id}><td>{item.variant?.product?.name || item.name || 'Unknown product'}</td><td>{item.variant?.variant_name || 'Default'}</td><td className="text-end">{Number(item.quantity)}</td><td className="text-end">Rs. {Number(item.unit_cost ?? item.purchasePrice).toFixed(2)}</td><td className="text-end">Rs. {Number(item.total ?? Number(item.quantity) * Number(item.purchasePrice)).toFixed(2)}</td></tr>)}</tbody>
          </table>
          <div className="ms-auto" style={{ maxWidth: 320 }}>
            <div className="d-flex justify-content-between"><span>Subtotal:</span><strong>Rs. {Number(purchase.subtotal || 0).toFixed(2)}</strong></div>
            {(Number(purchase.shipping_price || 0) + Number(purchase.loader_price || 0) + Number(purchase.unloading_price || 0)) > 0 && <div className="d-flex justify-content-between"><span>Charges:</span><strong>Rs. {(Number(purchase.shipping_price || 0) + Number(purchase.loader_price || 0) + Number(purchase.unloading_price || 0)).toFixed(2)}</strong></div>}
            {isPending && <div className="alert alert-warning py-2 mt-3">Pending Approval: stock and supplier balance are unchanged.</div>}
            <div className="d-flex justify-content-between border-top mt-3 pt-2"><span><strong>Total:</strong></span><strong>Rs. {totalAmount.toFixed(2)}</strong></div>
            <div className="d-flex justify-content-between"><span>Cash Paid:</span><span>Rs. {cashPaid.toFixed(2)}</span></div>
            {showAdvanceDetails && (
              <>
                <div className="d-flex justify-content-between" style={{ color: '#ea5455', fontWeight: 600 }}><span>Supplier Advance:</span><span>Rs. {advanceBefore.toFixed(2)}</span></div>
                <div className="d-flex justify-content-between" style={{ color: '#ea5455', fontWeight: 600 }}><span>Advance Used:</span><span>Rs. {advanceUsed.toFixed(2)}</span></div>
                <div className="d-flex justify-content-between" style={{ color: '#ea5455', fontWeight: 600 }}><span>Remaining Supplier Credit:</span><span>Rs. {remainingAdvance.toFixed(2)}</span></div>
              </>
            )}
            <div className="d-flex justify-content-between border-top mt-2 pt-2"><span><strong>Remaining Payable:</strong></span><strong>Rs. {remainingAmount.toFixed(2)}</strong></div>
          </div>
          {receiptNote && <div className="mt-4"><strong>Notes:</strong> {receiptNote}</div>}
        </div>
      </div>
    </div>
  );
}
