import Link from 'next/link';
import { getCategoryById, updateCategory } from '@/app/actions/categories';
import { redirect } from 'next/navigation';

export default async function EditCategory(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const category = await getCategoryById(params.id);

  if (!category) {
    redirect('/categories');
  }

  async function handleSubmit(formData: FormData) {
    'use server';
    const result = await updateCategory(params.id, formData);
    if (result.success) {
      redirect('/categories');
    } else {
      console.error(result.error);
    }
  }

  return (
    <>
      <div className="page-header">
          <div className="page-title">
            <h4>Product Edit Category</h4>
            <h6>Edit a product Category</h6>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <form action={handleSubmit}>
              <div className="row">
                <div className="col-lg-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label>Category Name</label>
                    <input type="text" name="name" required className="form-control" defaultValue={category.name} />
                  </div>
                </div>
                <div className="col-lg-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label>Status</label>
                    <div className="form-check form-switch mt-2">
                      <input className="form-check-input" type="checkbox" name="is_active" id="is_active" defaultChecked={category.is_active} />
                      <label className="form-check-label" htmlFor="is_active">Active</label>
                    </div>
                  </div>
                </div>
                <div className="col-lg-12">
                  <div className="form-group">
                    <label>Description</label>
                    <textarea className="form-control" name="description" defaultValue={category.description || ''}></textarea>
                  </div>
                </div>
                <div className="col-lg-12">
                  <button type="submit" className="btn btn-submit me-2">Submit</button>
                  <Link href="/categories" className="btn btn-cancel">Cancel</Link>
                </div>
              </div>
            </form>
          </div>
        </div>
    </>
  );
}
