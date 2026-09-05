import Link from 'next/link';
import { getBrandById, updateBrand } from '@/app/actions/brands';
import { getCategories } from '@/app/actions/categories';
import { redirect } from 'next/navigation';

export default async function EditBrand({ params }: { params: { id: string } }) {
  const brand = await getBrandById(params.id);
  const categories = await getCategories();

  if (!brand) {
    redirect('/brands');
  }

  async function handleSubmit(formData: FormData) {
    'use server';
    const result = await updateBrand(params.id, formData);
    if (result.success) {
      redirect('/brands');
    } else {
      console.error(result.error);
    }
  }

  return (
    <>
      <div className="page-header">
          <div className="page-title">
            <h4>Brand Edit</h4>
            <h6>Update your Brand</h6>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <form action={handleSubmit}>
              <div className="row">
                <div className="col-lg-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label>Brand Name</label>
                    <input type="text" name="name" required className="form-control" defaultValue={brand.name} />
                  </div>
                </div>
                <div className="col-lg-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label>Category</label>
                    <select className="form-select" name="category_id" defaultValue={brand.category_id || ''}>
                      <option value="">Select a Category</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-lg-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label>Status</label>
                    <div className="form-check form-switch mt-2">
                      <input className="form-check-input" type="checkbox" name="is_active" id="is_active" defaultChecked={brand.is_active} />
                      <label className="form-check-label" htmlFor="is_active">Active</label>
                    </div>
                  </div>
                </div>
                <div className="col-lg-12">
                  <div className="form-group">
                    <label>Description</label>
                    <textarea className="form-control" name="description" defaultValue={brand.description || ''}></textarea>
                  </div>
                </div>
                <div className="col-lg-12">
                  <button type="submit" className="btn btn-submit me-2">Submit</button>
                  <Link href="/brands" className="btn btn-cancel">Cancel</Link>
                </div>
              </div>
            </form>
          </div>
        </div>
    </>
  );
}
