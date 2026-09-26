import Link from 'next/link';
import { getCustomers } from '@/app/actions/customers';
import CustomerDeleteButton from '@/components/customers/CustomerDeleteButton';
import PeopleListSwitch from '@/components/layout/PeopleListSwitch';

export default async function CustomersList() {
  const items = await getCustomers();

  return (
    <>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="page-title">
          <h4>Customer List</h4>
          <h6>Manage your customers</h6>
        </div>
        <div className="d-flex align-items-center flex-wrap gap-3">
          <PeopleListSwitch active="/customers" />
          <div className="page-btn">
            <Link href="/customers/add" className="btn btn-added">
              <img src="/assets/img/icons/plus.svg" alt="img" className="me-1" />
              Add Customer
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table datanew">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {
                  items.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.phone || '-'}</td>
                      <td>{item.total_balance || 0}</td>
                      <td>
                        <span className={item.is_active ? 'badges bg-lightgreen' : 'badges bg-lightred'}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <Link href={`/customers/edit/${item.id}`} className="me-3">
                          <img src="/assets/img/icons/edit.svg" alt="edit" />
                        </Link>
                        <CustomerDeleteButton id={item.id} name={item.name} />
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
