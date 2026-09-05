import React from 'react';
import { getExpenseCategories } from '@/app/actions/expenses';
import AddCategoryModal from '@/components/expenses/AddCategoryModal';

export default async function ExpenseCategoryPage() {
  const categories = await getExpenseCategories();

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Expense Categories</h4>
          <h6>Manage your expense categories</h6>
        </div>
        <div className="page-btn">
          <AddCategoryModal />
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-top">
            <div className="search-set">
              <div className="search-path">
                <a className="btn btn-filter" id="filter_search">
                  <img src="/assets/img/icons/filter.svg" alt="img" />
                  <span><img src="/assets/img/icons/closes.svg" alt="img" /></span>
                </a>
              </div>
              <div className="search-input">
                <a className="btn btn-searchset"><img src="/assets/img/icons/search-white.svg" alt="img" /></a>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table datanew">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((item: any) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td>{item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : '-'}</td>
                    <td>
                      <a className="me-3" href="#">
                        <img src="/assets/img/icons/edit.svg" alt="img" />
                      </a>
                      <a className="me-3 confirm-text" href="#">
                        <img src="/assets/img/icons/delete.svg" alt="img" />
                      </a>
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
