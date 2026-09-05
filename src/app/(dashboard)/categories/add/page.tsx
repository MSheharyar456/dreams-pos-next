import Link from 'next/link';
import { createCategory } from '@/app/actions/categories';
import { redirect } from 'next/navigation';

export default function AddCategory() {
  async function handleSubmit(formData: FormData) {
    'use server';
    const result = await createCategory(formData);
    if (result.success) {
      redirect('/categories');
    } else {
      // Handle error natively or pass back to a client component if needed
      console.error(result.error);
    }
  }

  return (
    <>
      <div className="page-header">
          <div className="page-title">
            <h4>Product Add Category</h4>
            <h6>Create new product Category</h6>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <form action={handleSubmit}>
              <div className="row">
                <div className="col-lg-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label>Category Name</label>
                    <input type="text" name="name" required className="form-control" />
                  </div>
                </div>
                <div className="col-lg-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label>Status</label>
                    <div className="form-check form-switch mt-2">
                      <input className="form-check-input" type="checkbox" name="is_active" id="is_active" defaultChecked />
                      <label className="form-check-label" htmlFor="is_active">Active</label>
                    </div>
                  </div>
                </div>
                <div className="col-lg-12">
                  <div className="form-group">
                    <label>Description</label>
                    <textarea className="form-control" name="description"></textarea>
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
