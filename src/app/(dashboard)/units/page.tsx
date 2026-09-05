import Link from 'next/link';
import { getUnits, deleteUnit } from '@/app/actions/units';
import { revalidatePath } from 'next/cache';
import DeleteButton from '@/components/ui/DeleteButton';

export default async function UnitList() {
  const units = await getUnits();

  async function handleDelete(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    await deleteUnit(id);
    revalidatePath('/units');
  }

  return (
    <>
      <div className="page-header">
          <div className="page-title">
            <h4>Unit List</h4>
            <h6>Manage your Units</h6>
          </div>
          <div className="page-btn">
            <Link href="/units/add" className="btn btn-added">
              <img src="/assets/img/icons/plus.svg" className="me-1" alt="img" />
              Add Unit
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table datanew">
                <thead>
                  <tr>
                    <th>Unit Name</th>
                    <th>Short Name</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit: any) => (
                    <tr key={unit.id}>
                      <td>{unit.name}</td>
                      <td>{unit.short_name}</td>
                      <td>
                        <span className={`badges ${unit.is_active ? 'bg-lightgreen' : 'bg-lightred'}`}>
                          {unit.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <Link className="me-3" href={`/units/edit/${unit.id}`}>
                          <img src="/assets/img/icons/edit.svg" alt="img" />
                        </Link>
                        <form action={handleDelete} className="d-inline">
                          <input type="hidden" name="id" value={unit.id} />
                          <DeleteButton id={unit.id} />
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
