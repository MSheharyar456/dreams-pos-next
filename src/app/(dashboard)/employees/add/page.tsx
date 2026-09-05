import Link from 'next/link';
import EmployeeForm from '@/components/employees/EmployeeForm';
import { createEmployee } from '@/app/actions/employees';

export default async function AddEmployee() {
  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Add Employee</h4>
          <h6>Create new employee</h6>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <EmployeeForm serverAction={createEmployee} />
        </div>
      </div>
    </>
  );
}
