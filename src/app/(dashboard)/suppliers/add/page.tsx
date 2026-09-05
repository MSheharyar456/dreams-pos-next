import Link from 'next/link';
import SupplierForm from '@/components/suppliers/SupplierForm';
import { createSupplier } from '@/app/actions/suppliers';

export default function AddSupplier() {
  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Supplier Add</h4>
          <h6>Create new supplier</h6>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <SupplierForm serverAction={createSupplier} />
        </div>
      </div>
    </>
  );
}
