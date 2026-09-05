'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { updatePurchase, type PurchaseCartItem } from '@/app/actions/purchases';

type CatalogItem = { productId: string; variantId: string; name: string; categoryName?: string; variantName: string; unitId?: string; unitName?: string; purchasePrice: number; salePrice: number; stock: number };

export default function EditPurchasePOS({
  supplierId,
  supplierName,
  purchaseId,
  catalog,
  initialCart,
  initialPaidAmount,
  initialNotes,
  initialShippingPrice,
  initialLoaderPrice,
  initialUnloadingPrice,
  currentUserEmail = 'Unknown',
}: {
  supplierId: string;
  supplierName: string;
  purchaseId: string;
  catalog: CatalogItem[];
  initialCart: PurchaseCartItem[];
  initialPaidAmount: number;
  initialNotes: string;
  initialShippingPrice: number;
  initialLoaderPrice: number;
  initialUnloadingPrice: number;
  currentUserEmail?: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [employeeName, setEmployeeName] = useState(currentUserEmail);
  // For edits, auto-enable updateSalePrice so changes are reflected immediately
  const initialCartWithUpdateFlag = initialCart.map((item) => ({ ...item, updateSalePrice: true }));
  const [cart, setCart] = useState<PurchaseCartItem[]>(initialCartWithUpdateFlag);
  const [paidAmount, setPaidAmount] = useState(String(initialPaidAmount));
  const [shippingPrice, setShippingPrice] = useState(String(initialShippingPrice || 0));
  const [loaderPrice, setLoaderPrice] = useState(String(initialLoaderPrice || 0));
  const [unloadingPrice, setUnloadingPrice] = useState(String(initialUnloadingPrice || 0));
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);

  const extraCharges = Number(shippingPrice || 0) + Number(loaderPrice || 0) + Number(unloadingPrice || 0);
  const total = cart.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0) + extraCharges;

  const matches = useMemo(
    () => catalog.filter((item) => `${item.name} ${item.variantName}`.toLowerCase().includes(search.toLowerCase())).slice(0, 12),
    [catalog, search]
  );

  function quantityUnit(item: CatalogItem | undefined) {
    const categoryOrName = `${item?.categoryName || ''} ${item?.name || ''}`.toLowerCase();
    if (categoryOrName.includes('sand') || categoryOrName.includes('crush') || categoryOrName.includes('bajri') || categoryOrName.includes('reet')) return 'Cubic Feet';
    if (categoryOrName.includes('cement')) return 'Bags';
    if (categoryOrName.includes('steel') || categoryOrName.includes('syria')) return 'Kg';
    if (categoryOrName.includes('pipe')) return 'Lengths';
    if (categoryOrName.includes('powder')) return 'Packets';
    if (item?.unitName) return item.unitName;
    return 'Pieces';
  }

  const cartUnits = Array.from(new Set(cart.map((item) => quantityUnit(catalog.find((entry) => entry.variantId === item.variantId)))));
  const quantityHeading = cartUnits.length === 1 ? `Qty (${cartUnits[0]})` : 'Qty Received';

  function addExisting(item: CatalogItem) {
    setCart((items) => [...items, { productId: item.productId, variantId: item.variantId, name: item.name, variantName: item.variantName, unitId: item.unitId, quantity: 1, purchasePrice: Number(item.purchasePrice || 0), salePrice: Number(item.salePrice || 0), updateSalePrice: true }]);
    setSearch('');
  }

  function updateItem(index: number, field: keyof PurchaseCartItem, value: string | boolean) {
    const numericFields = ['quantity', 'purchasePrice', 'salePrice'];
    const nextValue = typeof value === 'string' && numericFields.includes(field)
      ? Number(value) || 0
      : value;
    setCart((items) => items.map((item, current) => current === index ? { ...item, [field]: nextValue } : item));
  }

  async function submitPurchase() {
    if (!cart.length) return;
    if (Number(paidAmount) > total) return Swal.fire('Check payment', 'Paid amount cannot be more than the purchase total.', 'warning');
    setSaving(true);
    const result = await updatePurchase(
      purchaseId,
      supplierId,
      cart,
      Number(paidAmount) || 0,
      notes,
      Number(shippingPrice) || 0,
      Number(loaderPrice) || 0,
      Number(unloadingPrice) || 0,
      employeeName,
    );
    setSaving(false);
    if (!result.success) return Swal.fire('Purchase not updated', result.error || 'Please try again.', 'error');
    await Swal.fire({ icon: 'success', title: 'Purchase updated', text: 'Stock and supplier balance have been updated.', timer: 1400, showConfirmButton: false });
    router.push(`/suppliers/${supplierId}/purchases/${purchaseId}`);
  }

  return <>
    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
      <div><h2 className="mb-1" style={{ fontWeight: 800 }}>Edit Purchase (POP)</h2><div className="text-muted">Editing stock from: <strong>{supplierName}</strong></div><div className="mt-2 d-flex align-items-center gap-2"><label className="small text-muted mb-0">Purchased by:</label><input type="text" className="form-control form-control-sm" style={{ width: 250 }} value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="Enter employee name" /></div></div>
      <div className="text-end"><div className="small text-muted">Purchase total</div><div style={{ color: '#ff9f43', fontWeight: 800, fontSize: 24 }}>Rs. {total.toFixed(2)}</div></div>
    </div>
    <div className="card"><div className="card-body" style={{ padding: '0 15px 0 15px' }}>
      <div className="row"><div className="col-lg-8"><div className="form-group position-relative"><label>Select product from your existing Product List</label><input className="form-control" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product, size, feet, sutr..." />
        {search && <div className="border rounded bg-white position-absolute w-100" style={{ zIndex: 20, maxHeight: 300, overflowY: 'auto' }}>{matches.length ? matches.map((item) => <button type="button" className="btn w-100 text-start border-bottom rounded-0" key={item.variantId} onClick={() => addExisting(item)}><strong>{item.name}</strong>{item.variantName !== 'Default' ? ` — ${item.variantName}` : ''}<span className="float-end text-muted">Stock: {item.stock} {item.unitName || ''}</span></button>) : <div className="p-3 text-muted">No matching product or size exists in Product List.</div>}</div>}
      </div></div></div>
    </div></div>
    <div className="card"><div className="card-body"><div className="table-responsive"><table className="table"><thead><tr><th>Product</th><th>Current Stock</th><th>{quantityHeading}</th><th>Purchase Price</th><th>Sale Price</th><th>Update Sale Price</th><th>Total</th><th></th></tr></thead><tbody>
      {cart.length === 0 ? <tr><td colSpan={8} className="text-center py-4 text-muted">Add products to update this purchase invoice.</td></tr> : cart.map((item, index) => { const existing = item.variantId ? catalog.find((entry) => entry.variantId === item.variantId) : undefined; const unit = quantityUnit(existing); return <tr key={`${item.variantId || item.name}-${index}`}><td>{item.name}</td><td>{existing?.stock ?? 'New'} <span className="text-muted">{unit}</span></td><td><input type="number" min="0.01" step="0.01" className="form-control" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} /></td><td><input type="number" min="0" step="0.01" className="form-control" value={item.purchasePrice} onChange={(e) => updateItem(index, 'purchasePrice', e.target.value)} /></td><td><input type="number" min="0" step="0.01" className="form-control" value={item.salePrice} onChange={(e) => updateItem(index, 'salePrice', e.target.value)} /></td><td><input type="checkbox" checked={!!item.updateSalePrice} onChange={(e) => updateItem(index, 'updateSalePrice', e.target.checked)} /></td><td>Rs. {(item.quantity * item.purchasePrice).toFixed(2)}</td><td><button type="button" className="btn btn-sm btn-danger" onClick={() => setCart((items) => items.filter((_, current) => current !== index))}>×</button></td></tr> })}
    </tbody></table></div>
    {cart.length > 0 && <div className="row justify-content-end mt-4"><div className="col-lg-4"><div className="row g-3"><div className="col-md-4"><div className="form-group"><label>Shipping price</label><input type="number" min="0" step="0.01" className="form-control" value={shippingPrice} onChange={(e) => setShippingPrice(e.target.value)} /></div></div><div className="col-md-4"><div className="form-group"><label>Loader price</label><input type="number" min="0" step="0.01" className="form-control" value={loaderPrice} onChange={(e) => setLoaderPrice(e.target.value)} /></div></div><div className="col-md-4"><div className="form-group"><label>Unloading price</label><input type="number" min="0" step="0.01" className="form-control" value={unloadingPrice} onChange={(e) => setUnloadingPrice(e.target.value)} /></div></div></div><div className="form-group mt-3"><label>Total purchase amount</label><div className="form-control bg-light fw-bold">Rs. {total.toFixed(2)}</div></div><div className="form-group"><label>Paid now (leave 0 for full loan)</label><input type="number" min="0" max={total} step="0.01" className="form-control" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} /></div><div className="form-group"><label>Supplier note / invoice note</label><textarea className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div><div className="alert alert-light py-2">Remaining supplier balance: <strong>Rs. {Math.max(0, total - (Number(paidAmount) || 0)).toFixed(2)}</strong></div><button type="button" className="btn btn-submit w-100" disabled={saving} onClick={submitPurchase}>{saving ? 'Updating purchase...' : 'Update Purchase Invoice'}</button></div></div>}
    </div></div>
  </>;
}
