import Link from 'next/link';
import SupplierForm from '@/components/suppliers/SupplierForm';
import { updateSupplier, getSupplierById } from '@/app/actions/suppliers';
import { notFound } from 'next/navigation';

export default async function EditSupplier(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const item = await getSupplierById(params.id);

  if (!item) {
    notFound();
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Supplier Edit</h4>
          <h6>Update supplier</h6>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <SupplierForm serverAction={updateSupplier} initialData={item} />
        </div>
      </div>
    </>
  );
}
