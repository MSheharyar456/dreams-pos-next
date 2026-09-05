'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DeleteButton from '@/components/ui/DeleteButton';
import { getPendingOrders, approveOrder, getTodayTotalSales, getDashboardStats, deletePendingOrder } from '@/app/actions/sales';

export default function Dashboard() {
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [todaySales, setTodaySales] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [todayProfit, setTodayProfit] = useState(0);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    const [data, todayTotal, stats] = await Promise.all([
      getPendingOrders(),
      getTodayTotalSales(),
      getDashboardStats()
    ]);
    setTodaySales(todayTotal);
    setTotalEmployees(stats.totalEmployees);
    setPendingCount(stats.pendingOrdersCount);
    setTodayProfit(stats.todayTotalProfit);
    setPendingOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleDeletePending = async (formData: FormData) => {
    const id = formData.get('id') as string;
    await deletePendingOrder(id);
    loadOrders();
  };

  const handleApprove = async (saleId: string) => {
    const Swal = (window as any).Swal;
    if (Swal) {
      Swal.fire({
        title: "Are you sure?",
        text: "You want to approve and finalize this order?",
        type: "info",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, approve it!",
        confirmButtonClass: "btn btn-success",
        cancelButtonClass: "btn btn-danger ml-1",
        buttonsStyling: false
      }).then(async (t: any) => {
        if (t.value) {
          setLoading(true);
          const res = await approveOrder(saleId);
          if (res.success) {
            Swal.fire({ 
              type: "success", 
              title: "Approved!", 
              text: "Order has been approved successfully.", 
              confirmButtonClass: "btn btn-success" 
            });
            loadOrders();
          } else {
            Swal.fire('Error', res.error || 'Failed to approve order', 'error');
            setLoading(false);
          }
        }
      });
    } else {
      if (window.confirm("Are you sure you want to approve this order?")) {
        setLoading(true);
        const res = await approveOrder(saleId);
        if (res.success) {
          alert('Order approved successfully!');
          loadOrders();
        } else {
          alert('Failed to approve order: ' + res.error);
          setLoading(false);
        }
      }
    }
  };

  const formatCurrency = (amount: number) => Number(amount || 0).toFixed(2);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

  // Search & Pagination Calculations
  const filteredOrders = pendingOrders.filter((order: any) => 
    (order.invoice_number && order.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (order.sales_man && order.sales_man.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (order.notes && order.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  
  const totalPendingAmount = currentItems.reduce((sum: number, order: any) => sum + Number(order.total_amount || 0), 0);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Admin Dashboard</h4>
          <h6>Manage your Pending Orders</h6>
        </div>
      </div>
      
      
      <div className="row">
        <div className="col-lg-3 col-sm-6 col-12">
          <div className="dash-widget">
            <div className="dash-widgetimg">
              <span>
                <img src="/assets/img/icons/dash1.svg" alt="img" />
              </span>
            </div>
            <div className="dash-widgetcontent">
              <h5>
                Rs. <span suppressHydrationWarning className="counters">
                  {formatCurrency(todaySales)}
                </span>
              </h5>
              <h6>Today's Total Sales</h6>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-sm-6 col-12">
          <div className="dash-widget dash1">
            <div className="dash-widgetimg">
              <span>
                <img src="/assets/img/icons/dash2.svg" alt="img" />
              </span>
            </div>
            <div className="dash-widgetcontent">
              <h5>
                <span suppressHydrationWarning className="counters">
                  {totalEmployees}
                </span>
              </h5>
              <h6>Total Employees</h6>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-sm-6 col-12">
          <div className="dash-widget dash2">
            <div className="dash-widgetimg">
              <span>
                <img src="/assets/img/icons/dash3.svg" alt="img" />
              </span>
            </div>
            <div className="dash-widgetcontent">
              <h5>
                <span suppressHydrationWarning className="counters">
                  {pendingCount}
                </span>
              </h5>
              <h6>Pending Orders</h6>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-sm-6 col-12">
          <div className="dash-widget dash3">
            <div className="dash-widgetimg">
              <span>
                <img src="/assets/img/icons/dash4.svg" alt="img" />
              </span>
            </div>
            <div className="dash-widgetcontent">
              <h5>
                Rs. <span suppressHydrationWarning className="counters">
                  {formatCurrency(todayProfit)}
                </span>
              </h5>
              <h6>Today's Total Profit</h6>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center w-100">
            <h4 className="card-title text-warning mb-0" style={{ fontWeight: 'bold' }}>Pending Orders Queue</h4>
            <div className="d-flex align-items-center">
              <span className="me-2 text-muted" style={{ fontSize: '14px' }}>Search:</span>
              <input 
                type="text" 
                className="form-control form-control-sm" 
                style={{ width: '200px' }}
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
        <div className="card-body" style={{ paddingTop: '0px' }}>
          <div className="table-responsive">
            <table className="table table-bordered table-striped" style={{ whiteSpace: 'nowrap' }}>
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Customer Name</th>
                  <th>Cashier</th>
                  <th>Total Amount</th>
                  <th>Date & Time</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">Loading pending orders...</td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">No pending orders waiting for approval.</td>
                  </tr>
                ) : (
                  currentItems.map((order: any, index: number) => (
                    <tr key={index}>
                      <td className="font-weight-bold text-primary">{order.invoice_number}</td>
                      <td>{order.notes || 'Walk-in Customer'}</td>
                      <td>{order.sales_man}</td>
                      <td className="font-weight-bold text-success">Rs. {formatCurrency(order.total_amount)}</td>
                        <td>{formatDate(order.created_at)}</td>
                      <td className="text-center">
                        <button 
                          className="btn btn-sm btn-success me-2 text-white" 
                          style={{ padding: '4px 10px' }}
                          title="Approve Order"
                          onClick={() => handleApprove(order.id)}
                        >
                          <i className="fa fa-check"></i>
                        </button>
                        <Link 
                          href={`/pos?edit=${order.id}`}
                          className="btn btn-sm btn-info text-white"
                          style={{ padding: '4px 10px' }}
                          title="Edit Order"
                        >
                          <i className="fa fa-edit"></i>
                        </Link>
                        <form action={handleDeletePending} className="ms-2" style={{ display: 'inline-flex', alignItems: 'center', transform: 'translateY(3px)' }}>
                          <input type="hidden" name="id" value={order.id} />
                          <DeleteButton id={order.id} />
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
                    <tfoot className="bg-light" style={{ borderTop: '2px solid #dee2e6' }}>
                      <tr>
                        <td colSpan={3} className="text-start font-weight-bold" style={{ fontWeight: 'bold', fontSize: '15px', paddingLeft: '15px' }}>Total Pending Amount:</td>
                        <td className="font-weight-bold text-success" style={{ fontWeight: 'bold', fontSize: '15px' }}>Rs. {formatCurrency(totalPendingAmount)}</td>
                        <td></td>
                        <td></td>
                      </tr>
                    </tfoot>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {(filteredOrders.length > 0 || searchQuery !== '') && (
            <div className="d-flex justify-content-between align-items-center mt-3 px-3 pb-3">
              <div className="d-flex align-items-center">
                <span className="me-2 text-muted" style={{ fontSize: '14px' }}>Show</span>
                <select 
                  className="form-select form-select-sm me-2" 
                  style={{ width: '70px', display: 'inline-block' }}
                  value={itemsPerPage} 
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-muted" style={{ fontSize: '14px' }}>
                  entries | Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} entries
                </span>
              </div>
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
