import Link from 'next/link';
import { getEmployees, deleteEmployee } from '@/app/actions/employees';
import { revalidatePath } from 'next/cache';
import DeleteButton from '@/components/ui/DeleteButton';
import PeopleListSwitch from '@/components/layout/PeopleListSwitch';

export default async function EmployeeList() {
  const employees = await getEmployees();

  async function handleDelete(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    await deleteEmployee(id);
    revalidatePath('/employees');
  }

  return (
    <>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="page-title">
          <h4>Employee List</h4>
          <h6>Manage your employees</h6>
        </div>
        <div className="d-flex align-items-center flex-wrap gap-3">
          <PeopleListSwitch active="/employees" />
          <div className="page-btn">
            <Link href="/employees/add" className="btn btn-added">
              <img src="/assets/img/icons/plus.svg" className="me-1" alt="img" />
              Add New Employee
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          
          <div className="table-top">
            <div className="search-set">
              <div className="search-input">
                <a className="btn btn-searchset"><img src="/assets/img/icons/search-white.svg" alt="img" /></a>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table datanew">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Father's Name</th>
                  <th>Primary Phone</th>
                  <th>Secondary Phone</th>
                  <th>CNIC Number</th>
                  <th>CNIC Images</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp: any) => (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td>{emp.father_name || 'N/A'}</td>
                      <td>{emp.phone_1}</td>
                      <td>{emp.phone_2 || 'N/A'}</td>
                      <td>{emp.cnic_number}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {emp.cnic_front_image ? (
                            <a href={emp.cnic_front_image} target="_blank" rel="noreferrer" style={{ color: '#ff9f43', textDecoration: 'underline' }}>Front</a>
                          ) : 'N/A'}
                          |
                          {emp.cnic_back_image ? (
                            <a href={emp.cnic_back_image} target="_blank" rel="noreferrer" style={{ color: '#ff9f43', textDecoration: 'underline' }}>Back</a>
                          ) : 'N/A'}
                        </div>
                      </td>
                      <td>
                        <Link href={`/employees/edit/${emp.id}`} className="me-3">
                          <img src="/assets/img/icons/edit.svg" alt="edit" />
                        </Link>
                        <form action={handleDelete} className="d-inline">
                          <input type="hidden" name="id" value={emp.id} />
                          <DeleteButton id={emp.id} />
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
