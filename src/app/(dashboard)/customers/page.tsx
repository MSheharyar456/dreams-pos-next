import Link from 'next/link';
import { getCustomers, deleteCustomer } from '@/app/actions/customers';
import { revalidatePath } from 'next/cache';
import DeleteButton from '@/components/ui/DeleteButton';

export default async function CustomersList() {
  const items = await getCustomers();

  const handleDelete = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    await deleteCustomer(id);
    revalidatePath('/customers');
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Customer List</h4>
          <h6>Manage your customers</h6>
        </div>
        <div className="page-btn">
          <Link href="/customers/add" className="btn btn-added">
            <img src="/assets/img/icons/plus.svg" alt="img" className="me-1" />
            Add Customer
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table datanew">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {
                  items.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.phone || '-'}</td>
                      <td>{item.total_balance || 0}</td>
                      <td>
                        <span className={item.is_active ? 'badges bg-lightgreen' : 'badges bg-lightred'}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <Link href={`/customers/edit/${item.id}`} className="me-3">
                          <img src="/assets/img/icons/edit.svg" alt="edit" />
                        </Link>
                        <form action={handleDelete} className="d-inline">
                          <input type="hidden" name="id" value={item.id} />
                          <DeleteButton id={item.id} />
                        </form>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
