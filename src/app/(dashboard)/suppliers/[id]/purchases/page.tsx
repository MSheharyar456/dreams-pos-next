import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupplierById } from '@/app/actions/suppliers';
import { getPurchasesBySupplier, deletePurchase } from '@/app/actions/purchases';
import DeleteButton from '@/components/ui/DeleteButton';
import ApprovePurchaseButton from '@/components/purchases/ApprovePurchaseButton';

export default async function SupplierPurchases({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [supplier, purchases] = await Promise.all([getSupplierById(id), getPurchasesBySupplier(id)]);
  if (!supplier) notFound();
  async function handleDelete(formData: FormData) { 'use server'; await deletePurchase(formData.get('purchase_id') as string, id); }
  return <><div className="page-header"><div className="page-title"><h4>Purchases from {supplier.name}</h4><h6>Invoice history and supplier payments</h6></div><div className="page-btn"><Link className="btn btn-added" href={`/suppliers/${id}/purchases/new`}>New Purchase</Link></div></div><div className="card"><div className="card-body">{purchases.length === 0 ? <div className="text-center py-4 text-muted">No purchases have been recorded for this supplier.</div> : <div className="table-responsive"><table className="table"><thead><tr><th>Purchase No.</th><th>Date</th><th>Items</th><th>Total</th><th>Paid</th><th>Remaining</th><th>Status</th><th>Invoice</th><th>Action</th></tr></thead><tbody>{purchases.map((purchase: any) => { let pending = false; try { pending = JSON.parse(purchase.notes || '{}')?.type === 'pending_pop'; } catch {} return <tr key={purchase.id}><td>{purchase.purchase_number}</td><td>{new Date(purchase.created_at).toLocaleDateString()}</td><td>{purchase.purchase_items?.length || (pending ? 'Pending' : 0)}</td><td>Rs. {Number(purchase.total_amount || 0).toFixed(2)}</td><td>Rs. {Number(purchase.paid_amount || 0).toFixed(2)}</td><td>Rs. {Number(purchase.remaining_amount || 0).toFixed(2)}</td><td>{pending ? <span className="badge bg-warning text-dark">Pending Approval</span> : purchase.payment_status}</td><td><Link href={`/suppliers/${id}/purchases/${purchase.id}`} className="btn btn-sm btn-outline-primary">View</Link></td><td>{pending && <ApprovePurchaseButton purchaseId={purchase.id} />} {!pending && <><Link href={`/suppliers/${id}/purchases/${purchase.id}/edit`} className="btn btn-sm btn-outline-secondary me-2">Edit</Link><form action={handleDelete} className="d-inline"><input type="hidden" name="purchase_id" value={purchase.id} /><DeleteButton id={purchase.id} /></form></>}</td></tr>; })}</tbody></table></div>}</div></div></>;
}
