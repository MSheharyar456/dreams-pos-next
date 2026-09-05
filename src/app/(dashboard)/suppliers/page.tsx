import Link from 'next/link';
import { getSuppliers, deleteSupplier } from '@/app/actions/suppliers';
import { revalidatePath } from 'next/cache';
import DeleteButton from '@/components/ui/DeleteButton';

export default async function SuppliersList() {
  const items = await getSuppliers();

  const handleDelete = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    await deleteSupplier(id);
    revalidatePath('/suppliers');
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Supplier List</h4>
          <h6>Manage your suppliers</h6>
        </div>
        <div className="page-btn">
          <Link href="/suppliers/add" className="btn btn-added">
            <img src="/assets/img/icons/plus.svg" alt="img" className="me-1" />
            Add Supplier
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
                  <th>Products</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => (
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
                      <div className="d-flex align-items-center gap-2">
                        <Link href={`/suppliers/${item.id}/purchases/new`} className="btn btn-sm btn-added" title="Open Purchase POP">
                          Purchase POP
                        </Link>
                        <Link href={`/suppliers/${item.id}/purchases`} className="btn btn-sm btn-outline-primary supplier-history-button" title="Purchase History">
                          Purchase History
                        </Link>
                      </div>
                    </td>
                    <td>
                      <Link href={`/suppliers/edit/${item.id}`} className="me-3" title="Edit Supplier">
                        <img src="/assets/img/icons/edit.svg" alt="edit" />
                      </Link>
                      <form action={handleDelete} className="d-inline">
                        <input type="hidden" name="id" value={item.id} />
                        <DeleteButton id={item.id} />
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
