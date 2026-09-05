import Link from 'next/link';
import CustomerForm from '@/components/customers/CustomerForm';
import { createCustomer } from '@/app/actions/customers';

export default function AddCustomer() {
  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Customer Add</h4>
          <h6>Create new customer</h6>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <CustomerForm serverAction={createCustomer} />
        </div>
      </div>
    </>
  );
}
