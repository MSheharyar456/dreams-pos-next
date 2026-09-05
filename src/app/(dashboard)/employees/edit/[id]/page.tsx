import Link from 'next/link';
import EmployeeForm from '@/components/employees/EmployeeForm';
import { updateEmployee, getEmployeeById } from '@/app/actions/employees';
import { notFound } from 'next/navigation';

export default async function EditEmployee(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const employee = await getEmployeeById(params.id);

  if (!employee) {
    notFound();
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Edit Employee</h4>
          <h6>Update your employee</h6>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <EmployeeForm serverAction={updateEmployee} initialData={employee} />
        </div>
      </div>
    </>
  );
}
