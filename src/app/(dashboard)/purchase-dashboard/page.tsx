'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { approvePurchase, getPendingPurchases } from '@/app/actions/purchases';
import { getDashboardStats } from '@/app/actions/sales';

export default function PurchaseDashboard() {
  const [loading, setLoading] = useState(true);
  const [todayPurchases, setTodayPurchases] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [pendingPurchases, setPendingPurchases] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPurchases = async () => {
    setLoading(true);
    const [stats, pending] = await Promise.all([
      getDashboardStats(),
      getPendingPurchases(),
    ]);
    setTodayPurchases(stats.todayTotalPurchases);
    setTotalEmployees(stats.totalEmployees);
    setPendingPurchases(pending || []);
    setLoading(false);
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const handleApprove = async (purchaseId: string) => {
    const Swal = (window as any).Swal;
    const confirmed = Swal
      ? (await Swal.fire({
        title: 'Approve POP?',
        text: 'This will add stock, apply supplier advance, and create the supplier ledger entry.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Approve',
      })).isConfirmed
      : window.confirm('Approve this POP?');
    if (!confirmed) return;

    setLoading(true);
    const result = await approvePurchase(purchaseId);
    if (result.success) {
      if (Swal) await Swal.fire({ icon: 'success', title: 'POP approved', timer: 1200, showConfirmButton: false });
      await loadPurchases();
    } else {
      if (Swal) await Swal.fire('Approval failed', result.error || 'Please try again.', 'error');
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => Number(amount || 0).toFixed(2);
  const formatDate = (date: string) => new Date(date).toLocaleString();
  const filteredPurchases = pendingPurchases.filter((purchase: any) => {
    const query = searchQuery.toLowerCase();
    return [purchase.purchase_number, purchase.suppliers?.name, purchase.created_by_name]
      .some((value) => String(value || '').toLowerCase().includes(query));
  });
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(indexOfFirstItem + itemsPerPage, filteredPurchases.length);
  const currentPurchases = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);
  const pendingAmount = currentPurchases.reduce((sum, purchase) => sum + Number(purchase.total_amount || 0), 0);

  return (
    <>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="page-title">
          <h4>Purchase Dashboard</h4>
          <h6>Monitor purchases and approve pending POP invoices</h6>
        </div>
        <div className="d-flex align-items-center flex-wrap gap-3">
          <div className="btn-group shadow-sm" role="group" aria-label="Choose dashboard">
            <Link href="/dashboard" className="btn btn-outline-secondary fw-semibold px-4">
              <i className="fa fa-chart-line me-2" aria-hidden="true"></i>Sales
            </Link>
            <Link href="/purchase-dashboard" aria-current="page" className="btn btn-warning text-white fw-semibold px-4">
              <i className="fa fa-shopping-bag me-2" aria-hidden="true"></i>Purchase
            </Link>
          </div>
          <Link href="/suppliers" className="btn btn-added">
            <img src="/assets/img/icons/plus.svg" alt="" className="me-1" />Add Purchase
          </Link>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-3 col-sm-6 col-12">
          <div className="dash-widget">
            <div className="dash-widgetimg"><span><img src="/assets/img/icons/dash1.svg" alt="img" /></span></div>
            <div className="dash-widgetcontent">
              <h5>Rs. <span className="counters">{formatCurrency(todayPurchases)}</span></h5>
              <h6>Today&apos;s Total Purchases</h6>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-sm-6 col-12">
          <div className="dash-widget dash1">
            <div className="dash-widgetimg"><span><img src="/assets/img/icons/dash2.svg" alt="img" /></span></div>
            <div className="dash-widgetcontent">
              <h5><span className="counters">{totalEmployees}</span></h5>
              <h6>Total Employees</h6>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-sm-6 col-12">
          <div className="dash-widget dash2">
            <div className="dash-widgetimg"><span><img src="/assets/img/icons/dash3.svg" alt="img" /></span></div>
            <div className="dash-widgetcontent">
              <h5><span className="counters">{pendingPurchases.length}</span></h5>
              <h6>Pending Purchases</h6>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-sm-6 col-12">
          <div className="dash-widget dash3">
            <div className="dash-widgetimg"><span><img src="/assets/img/icons/dash4.svg" alt="img" /></span></div>
            <div className="dash-widgetcontent">
              <h5>Rs. <span className="counters">{formatCurrency(pendingAmount)}</span></h5>
              <h6>Pending POP Amount</h6>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center w-100">
            <h4 className="card-title text-warning mb-0" style={{ fontWeight: 'bold' }}>Pending POP Approval</h4>
            <div className="d-flex align-items-center">
              <span className="me-2 text-muted" style={{ fontSize: '14px' }}>Search:</span>
              <input
                type="text"
                className="form-control form-control-sm"
                style={{ width: '200px' }}
                placeholder="Search purchases..."
                value={searchQuery}
                onChange={(event) => { setSearchQuery(event.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Purchase Number</th>
                  <th>Supplier</th>
                  <th>Total Amount</th>
                  <th>Cash Paid</th>
                  <th>Date &amp; Time</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-4">Loading pending POPs...</td></tr>
                ) : filteredPurchases.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4">{searchQuery ? 'No purchases match your search.' : 'No pending POPs waiting for approval.'}</td></tr>
                ) : currentPurchases.map((purchase: any) => (
                  <tr key={purchase.id}>
                    <td className="font-weight-bold text-primary">{purchase.purchase_number}</td>
                    <td>{purchase.suppliers?.name || 'Unknown supplier'}</td>
                    <td className="font-weight-bold text-success">Rs. {formatCurrency(purchase.total_amount)}</td>
                    <td>Rs. {formatCurrency(purchase.paid_amount)}</td>
                    <td>{formatDate(purchase.created_at)}</td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-success text-white" onClick={() => handleApprove(purchase.id)} disabled={loading}>
                        <i className="fa fa-check me-1"></i> Approve POP
                      </button>
                      <Link href={`/suppliers/${purchase.supplier_id}/purchases/${purchase.id}`} className="btn btn-sm btn-info text-white ms-2">
                        <i className="fa fa-eye me-1"></i> View
                      </Link>
                      <Link href={`/suppliers/${purchase.supplier_id}/purchases/${purchase.id}/edit`} className="btn btn-sm btn-warning text-white ms-2">
                        <i className="fa fa-edit me-1"></i> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-light">
                <tr>
                  <td colSpan={2} style={{ fontWeight: 'bold' }}>Total Pending POP Amount:</td>
                  <td style={{ fontWeight: 'bold' }}>Rs. {formatCurrency(pendingAmount)}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
          {(filteredPurchases.length > 0 || searchQuery !== '') && (
            <div className="d-flex justify-content-between align-items-center mt-3 px-3 pb-3">
              <div className="d-flex align-items-center">
                <span className="me-2 text-muted" style={{ fontSize: '14px' }}>Show</span>
                <select
                  className="form-select form-select-sm me-2"
                  style={{ width: '70px', display: 'inline-block' }}
                  value={itemsPerPage}
                  onChange={(event) => { setItemsPerPage(Number(event.target.value)); setCurrentPage(1); }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-muted" style={{ fontSize: '14px' }}>
                  entries | Showing {filteredPurchases.length ? indexOfFirstItem + 1 : 0} to {indexOfLastItem} of {filteredPurchases.length} entries
                </span>
              </div>
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
                  <button type="button" className="page-link" disabled={currentPage <= 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                </li>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button type="button" className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                  </li>
                ))}
                <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                  <button type="button" className="page-link" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

    </>
  );
}
