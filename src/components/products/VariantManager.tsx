'use client';

import { useState } from 'react';
import { createVariant, updateVariant, deleteVariant } from '@/app/actions/variants';

export default function VariantManager({ productId, variants, units }: { productId: string, variants: any[], units: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleAdd(formData: FormData) {
    await createVariant(productId, formData);
    const form = document.getElementById('add-variant-form') as HTMLFormElement;
    form?.reset();
  }

  async function handleUpdate(id: string, formData: FormData) {
    await updateVariant(id, productId, formData);
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (window.confirm('Are you sure you want to delete this variant?')) {
      await deleteVariant(id, productId);
    }
  }

  return (
    <div className="card mt-4">
      <div className="card-body">
        <div className="page-header mb-3">
          <div className="page-title">
            <h4>Product Variants</h4>
            <h6>Manage variants for this product</h6>
          </div>
        </div>
        
        <div className="table-responsive mb-4">
          <table className="table">
            <thead>
              <tr>
                <th>Variant Name</th>
                <th>Size</th>
                <th>Grade</th>
                <th>Unit</th>
                <th>Purchase Price</th>
                <th>Sale Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                editingId === variant.id ? (
                  <tr key={variant.id}>
                    <td colSpan={7}>
                      <form action={(formData) => handleUpdate(variant.id, formData)} className="row align-items-center">
                        <div className="col"><input type="text" name="variant_name" className="form-control" defaultValue={variant.variant_name} required /></div>
                        <div className="col"><input type="text" name="size" className="form-control" defaultValue={variant.size || ''} placeholder="Size" /></div>
                        <div className="col"><input type="text" name="grade" className="form-control" defaultValue={variant.grade || ''} placeholder="Grade" /></div>
                        <div className="col">
                          <select className="form-select" name="unit_id" defaultValue={variant.unit_id || ''}>
                            <option value="">Select</option>
                            {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                          </select>
                        </div>
                        <div className="col"><input type="number" step="0.01" name="purchase_price" className="form-control" defaultValue={variant.purchase_price} /></div>
                        <div className="col"><input type="number" step="0.01" name="sale_price" className="form-control" defaultValue={variant.sale_price} /></div>
                        <div className="col-auto">
                          <button type="submit" className="btn btn-submit btn-sm me-2">Save</button>
                          <button type="button" className="btn btn-cancel btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={variant.id}>
                    <td>{variant.variant_name}</td>
                    <td>{variant.size || '-'}</td>
                    <td>{variant.grade || '-'}</td>
                    <td>{variant.unit?.name || '-'}</td>
                    <td>{variant.purchase_price}</td>
                    <td>{variant.sale_price}</td>
                    <td>
                      <a href="#!" className="me-3" onClick={(e) => { e.preventDefault(); setEditingId(variant.id); }}>
                        <img src="/assets/img/icons/edit.svg" alt="img" />
                      </a>
                      <a href="#!" onClick={(e) => { e.preventDefault(); handleDelete(variant.id); }}>
                        <img src="/assets/img/icons/delete.svg" alt="img" />
                      </a>
                    </td>
                  </tr>
                )
              ))}
              {variants.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center">No variants added yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <hr />
        
        <h5 className="mb-3">Add New Variant</h5>
        <form id="add-variant-form" action={handleAdd}>
          <div className="row">
            <div className="col-lg-3 col-sm-6 col-12">
              <div className="form-group">
                <label>Variant Name *</label>
                <input type="text" name="variant_name" className="form-control" required placeholder="e.g. 3 Sutr" />
              </div>
            </div>
            <div className="col-lg-2 col-sm-6 col-12">
              <div className="form-group">
                <label>Size</label>
                <input type="text" name="size" className="form-control" />
              </div>
            </div>
            <div className="col-lg-2 col-sm-6 col-12">
              <div className="form-group">
                <label>Grade</label>
                <input type="text" name="grade" className="form-control" />
              </div>
            </div>
            <div className="col-lg-2 col-sm-6 col-12">
              <div className="form-group">
                <label>Unit</label>
                <select className="form-select" name="unit_id">
                  <option value="">Select Unit</option>
                  {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6 col-12">
              <div className="form-group">
                <label>Low Stock Threshold</label>
                <input type="number" name="low_stock_threshold" className="form-control" defaultValue="10" />
              </div>
            </div>
            <div className="col-lg-3 col-sm-6 col-12">
              <div className="form-group">
                <label>Purchase Price</label>
                <input type="number" step="0.01" name="purchase_price" className="form-control" defaultValue="0" />
              </div>
            </div>
            <div className="col-lg-3 col-sm-6 col-12">
              <div className="form-group">
                <label>Sale Price</label>
                <input type="number" step="0.01" name="sale_price" className="form-control" defaultValue="0" />
              </div>
            </div>
            <div className="col-lg-3 col-sm-6 col-12 d-flex align-items-end">
              <div className="form-group w-100">
                <button type="submit" className="btn btn-submit w-100">Add Variant</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
