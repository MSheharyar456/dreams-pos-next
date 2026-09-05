import Link from 'next/link';
import { getBrands, deleteBrand } from '@/app/actions/brands';
import { revalidatePath } from 'next/cache';
import DeleteButton from '@/components/ui/DeleteButton';

export default async function BrandList() {
  const brands = await getBrands();

  async function handleDelete(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    await deleteBrand(id);
    revalidatePath('/brands');
  }

  return (
    <>
      <div className="page-header">
          <div className="page-title">
            <h4>Brand List</h4>
            <h6>Manage your Brands</h6>
          </div>
          <div className="page-btn">
            <Link href="/brands/add" className="btn btn-added">
              <img src="/assets/img/icons/plus.svg" className="me-1" alt="img" />
              Add Brand
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table datanew">
                <thead>
                  <tr>
                    <th>Brand Name</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand: any) => (
                    <tr key={brand.id}>
                      <td>{brand.name}</td>
                      <td>{brand.category?.name || '-'}</td>
                      <td>{brand.description}</td>
                      <td>
                        <span className={`badges ${brand.is_active ? 'bg-lightgreen' : 'bg-lightred'}`}>
                          {brand.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <Link className="me-3" href={`/brands/edit/${brand.id}`}>
                          <img src="/assets/img/icons/edit.svg" alt="img" />
                        </Link>
                        <form action={handleDelete} className="d-inline">
                          <input type="hidden" name="id" value={brand.id} />
                          <DeleteButton id={brand.id} />
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
