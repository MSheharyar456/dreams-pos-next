'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function SupplierForm({ serverAction, initialData }: { serverAction: (formData: FormData) => Promise<any>, initialData?: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      if (initialData?.id) {
        formData.append('id', initialData.id);
      }
      // handle checkbox
      formData.set('is_active', formData.get('is_active') ? 'true' : 'false');

      const result = await serverAction(formData);
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Supplier saved successfully',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          router.push('/suppliers');
        });
      } else {
        Swal.fire('Error', result.error, 'error');
      }
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-lg-6 col-sm-6 col-12">
          <div className="form-group">
            <label>Supplier Name *</label>
            <input type="text" name="name" className="form-control" defaultValue={initialData?.name} required />
          </div>
        </div>
        <div className="col-lg-6 col-sm-6 col-12">
          <div className="form-group">
            <label>Phone</label>
            <input type="text" name="phone" className="form-control" defaultValue={initialData?.phone} />
          </div>
        </div>
        <div className="col-lg-6 col-sm-6 col-12">
          <div className="form-group">
            <label>Opening Balance</label>
            <input type="number" step="0.01" name="opening_balance" className="form-control" defaultValue={initialData?.opening_balance || 0} />
          </div>
        </div>
        <div className="col-lg-12 col-sm-12 col-12">
          <div className="form-group">
            <label>Address</label>
            <textarea name="address" className="form-control" defaultValue={initialData?.address} rows={2}></textarea>
          </div>
        </div>
        <div className="col-lg-12 col-sm-12 col-12">
          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" className="form-control" defaultValue={initialData?.notes} rows={2}></textarea>
          </div>
        </div>
        <div className="col-lg-12 col-sm-12 col-12">
          <div className="form-group">
            <div className="check-box">
              <label>
                <input type="checkbox" name="is_active" defaultChecked={initialData?.is_active ?? true} />
                <span style={{marginLeft: '8px'}}>Is Active</span>
              </label>
            </div>
          </div>
        </div>

        <div className="col-lg-12">
          <button type="submit" className="btn btn-submit me-2" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Submit'}
          </button>
          <Link href="/suppliers" className="btn btn-cancel">Cancel</Link>
        </div>
      </div>
    </form>
  );
}
