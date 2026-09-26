import React from 'react';
import Link from 'next/link';
import { getExpenses, getExpenseCategories } from '@/app/actions/expenses';
import AddExpenseModal from '@/components/expenses/AddExpenseModal';

export default async function ExpensesPage() {
  const expenses = await getExpenses();
  const categories = await getExpenseCategories();

  return (
    <>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="page-title">
          <h4>Expenses</h4>
          <h6>Manage your expenses</h6>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Link href="/expenses/category" className="btn btn-outline-secondary">
            <i className="fa fa-list-alt me-1" aria-hidden="true"></i>Expense Category
          </Link>
          <AddExpenseModal categories={categories} />
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
            <div className="wordset">
              <ul>
                <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="pdf"><img src="/assets/img/icons/pdf.svg" alt="img" /></a></li>
                <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="excel"><img src="/assets/img/icons/excel.svg" alt="img" /></a></li>
                <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="print"><img src="/assets/img/icons/printer.svg" alt="img" /></a></li>
              </ul>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table datanew">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Reference</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                                {expenses.map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.expense_date ? new Date(item.expense_date).toLocaleDateString('en-GB') : '-'}</td>
                    <td>{item.expense_categories?.name || '-'}</td>
                    <td>{/* item.reference doesn't exist */} -</td>
                    <td style={{ color: '#ea5455', fontWeight: 'bold' }}>{item.amount}</td>
                    <td>{item.description || '-'}</td>
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
