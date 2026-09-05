import Link from 'next/link';
import { getProductsBySupplier, deleteProduct } from '@/app/actions/products';
import { getSupplierById } from '@/app/actions/suppliers';
import { revalidatePath } from 'next/cache';
import DeleteButton from '@/components/ui/DeleteButton';
import { notFound } from 'next/navigation';

export default async function SupplierProductsList(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supplier = await getSupplierById(params.id);
  
  if (!supplier) {
    notFound();
  }

  const items = await getProductsBySupplier(params.id);

  const handleDelete = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    await deleteProduct(id);
    revalidatePath(`/suppliers/${params.id}/products`);
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Products from {supplier.name}</h4>
          <h6>Manage inventory supplied by this vendor</h6>
        </div>
        <div className="page-btn">
          <Link href={`/suppliers/${params.id}/purchases/new`} className="btn btn-added me-2">
            <img src="/assets/img/icons/plus.svg" alt="img" className="me-1" />
            New Purchase
          </Link>
          <Link href={`/suppliers/${params.id}/purchases`} className="btn btn-outline-secondary me-2">
            Purchase History
          </Link>
          <Link href={`/suppliers/${params.id}/products/add`} className="btn btn-added">
            <img src="/assets/img/icons/plus.svg" alt="img" className="me-1" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table datanew">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Remaining Qty</th>
                  <th>Total Purchased (Rs. )</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {
                  items.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.calculated_quantity}</td>
                      <td>{item.calculated_total_purchased}</td>
                      <td>
                        <Link href={`/products/edit/${item.id}`} className="me-3" title="Edit Master Product">
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
