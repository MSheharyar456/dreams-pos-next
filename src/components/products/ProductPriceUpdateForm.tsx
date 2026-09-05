'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function ProductPriceUpdateForm({ product, variant, categoryName, brandName, serverAction }: { product: any; variant: any; categoryName: string; brandName: string; serverAction: (formData: FormData) => Promise<any> }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const result = await serverAction(new FormData(event.currentTarget));
    setSaving(false);
    if (result?.error) return Swal.fire('Update failed', result.error, 'error');
    await Swal.fire({ icon: 'success', title: 'Selling price updated successfully', timer: 1400, showConfirmButton: false });
    router.refresh();
  }

  return <form onSubmit={submit}>
    <input type="hidden" name="category_id" value={product.category_id || ''} />
    <input type="hidden" name="brand_id" value={product.brand_id || ''} />
    <input type="hidden" name="variant_name" value={variant?.variant_name || 'Default'} />
    <input type="hidden" name="variant_id" value={variant?.id || ''} />
    <input type="hidden" name="add_stock" value="0" />
    <div className="row">
      <div className="col-lg-4 col-sm-6 col-12"><div className="form-group"><label>Product Name</label><input name="name" className="form-control" defaultValue={product.name} required /></div></div>
      <div className="col-lg-3 col-sm-6 col-12"><div className="form-group"><label>Category</label><input className="form-control" value={categoryName || '-'} disabled /></div></div>
      <div className="col-lg-3 col-sm-6 col-12"><div className="form-group"><label>Brand</label><input className="form-control" value={brandName || '-'} disabled /></div></div>
      {!categoryName.toLowerCase().includes('cement') && <div className="col-lg-2 col-sm-6 col-12"><div className="form-group"><label>Size / Variant</label><input className="form-control" value={variant?.variant_name || 'Default'} disabled /></div></div>}
      <div className="col-lg-4 col-sm-6 col-12"><div className="form-group"><label>Purchase Price</label><input type="number" min="0" step="0.01" name="purchase_price" className="form-control" defaultValue={variant?.purchase_price || 0} required /></div></div>
      <div className="col-lg-4 col-sm-6 col-12"><div className="form-group"><label>Sale Price (Selling Price)</label><input type="number" min="0" step="0.01" name="sale_price" className="form-control" defaultValue={variant?.sale_price || 0} required autoFocus /></div></div>
      <div className="col-lg-12"><button type="submit" className="btn btn-submit" disabled={saving}>{saving ? 'Updating...' : 'Update Prices'}</button></div>
    </div>
  </form>;
}
