import React from 'react';
import Link from 'next/link';
import { getSalesHistory } from '@/app/actions/sales-history';

export default async function SalesListPage() {
  const sales = await getSalesHistory();
  const totalPaid = sales.reduce((sum: number, sale: any) => sum + Number(sale.paid_amount || (sale.payment_status === 'paid' ? sale.total_amount : 0) || 0), 0);
  const totalSales = sales.reduce((sum: number, sale: any) => sum + Number(sale.total_amount || 0), 0);

  return (
    <>
        <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="page-title">
            <h4>Sales List</h4>
            <h6>Manage your sales</h6>
          </div>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="btn-group shadow-sm" role="group" aria-label="Choose list">
              <Link href="/sales" aria-current="page" className="btn btn-warning text-white fw-semibold px-4">
                <i className="fa fa-chart-line me-2" aria-hidden="true"></i>Sales List
              </Link>
              <Link href="/purchases" className="btn btn-outline-secondary fw-semibold px-4">
                <i className="fa fa-shopping-bag me-2" aria-hidden="true"></i>Purchase List
              </Link>
            </div>
            <div className="page-btn">
            <Link href="/pos" className="btn btn-added">
              <img src="/assets/img/icons/plus.svg" alt="img" className="me-1" />
              Add Sale
            </Link>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            
            {/* Filter Bar */}
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
                  <li>
                    <a data-bs-toggle="tooltip" data-bs-placement="top" title="pdf"><img src="/assets/img/icons/pdf.svg" alt="img" /></a>
                  </li>
                  <li>
                    <a data-bs-toggle="tooltip" data-bs-placement="top" title="excel"><img src="/assets/img/icons/excel.svg" alt="img" /></a>
                  </li>
                  <li>
                    <a data-bs-toggle="tooltip" data-bs-placement="top" title="print"><img src="/assets/img/icons/printer.svg" alt="img" /></a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table datanew">
                <thead>
                  <tr>
                    <th>
                      <label className="checkboxs">
                        <input type="checkbox" id="select-all" />
                        <span className="checkmarks"></span>
                      </label>
                    </th>
                    <th>Invoice Number</th>
                    <th>Customer Name</th>
                    <th>Paid Amount</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale: any) => {
                    let customerName = 'Walk-in Customer';
                    if (sale.notes && sale.notes.startsWith('Walk-in Customer: ')) {
                      customerName = sale.notes.replace('Walk-in Customer: ', '');
                    } else if (sale.notes) {
                      customerName = sale.notes;
                    }

                    return (
                      <tr key={sale.id}>
                        <td>
                          <label className="checkboxs">
                            <input type="checkbox" />
                            <span className="checkmarks"></span>
                          </label>
                        </td>
                        <td>{sale.invoice_number}</td>
                        <td>{customerName}</td>
                        <td data-paid-amount={Number(sale.paid_amount || (sale.payment_status === 'paid' ? sale.total_amount : 0) || 0)}>Rs. {Number(sale.paid_amount || (sale.payment_status === 'paid' ? sale.total_amount : 0) || 0).toFixed(2)}</td>
                        <td data-total-amount={Number(sale.total_amount || 0)}>Rs. {Number(sale.total_amount || 0).toFixed(2)}</td>
                        <td>{new Date(sale.created_at).toLocaleDateString()}</td>
                        <td className="text-center">
                          <Link href={`/pos/receipt/${sale.id}`} className="action-set">
                            <img src="/assets/img/icons/eye.svg" alt="img" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center">No sales found</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-light">
                  <tr>
                    <td colSpan={3} className="fw-bold">Grand Total ({sales.length} sales)</td>
                    <td className="fw-bold" data-total-footer="paid">Rs. {totalPaid.toFixed(2)}</td>
                    <td className="fw-bold" data-total-footer="total">Rs. {totalSales.toFixed(2)}</td>
                    <td></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </>
  );
}
