import Link from 'next/link';
import CustomerForm from '@/components/customers/CustomerForm';
import { updateCustomer, getCustomerById } from '@/app/actions/customers';
import { notFound } from 'next/navigation';

export default async function EditCustomer(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const item = await getCustomerById(params.id);

  if (!item) {
    notFound();
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Customer Edit</h4>
          <h6>Update customer</h6>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <CustomerForm serverAction={updateCustomer} initialData={item} />
        </div>
      </div>
    </>
  );
}
