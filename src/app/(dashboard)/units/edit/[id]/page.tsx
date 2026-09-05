import Link from 'next/link';
import { getUnitById, updateUnit } from '@/app/actions/units';
import { redirect } from 'next/navigation';

export default async function EditUnit({ params }: { params: { id: string } }) {
  const unit = await getUnitById(params.id);

  if (!unit) {
    redirect('/units');
  }

  async function handleSubmit(formData: FormData) {
    'use server';
    const result = await updateUnit(params.id, formData);
    if (result.success) {
      redirect('/units');
    } else {
      console.error(result.error);
    }
  }

  return (
    <>
      <div className="page-header">
          <div className="page-title">
            <h4>Unit Edit</h4>
            <h6>Update your Unit</h6>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <form action={handleSubmit}>
              <div className="row">
                <div className="col-lg-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label>Unit Name</label>
                    <input type="text" name="name" required className="form-control" defaultValue={unit.name} />
                  </div>
                </div>
                <div className="col-lg-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label>Short Name</label>
                    <input type="text" name="short_name" required className="form-control" defaultValue={unit.short_name} />
                  </div>
                </div>
                <div className="col-lg-6 col-sm-6 col-12">
                  <div className="form-group">
                    <label>Status</label>
                    <div className="form-check form-switch mt-2">
                      <input className="form-check-input" type="checkbox" name="is_active" id="is_active" defaultChecked={unit.is_active} />
                      <label className="form-check-label" htmlFor="is_active">Active</label>
                    </div>
                  </div>
                </div>
                <div className="col-lg-12">
                  <button type="submit" className="btn btn-submit me-2">Submit</button>
                  <Link href="/units" className="btn btn-cancel">Cancel</Link>
                </div>
              </div>
            </form>
          </div>
        </div>
    </>
  );
}
