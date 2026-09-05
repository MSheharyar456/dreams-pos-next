'use client';

import React, { useEffect, useState } from 'react';
import { getSalesInventory, deleteSaleItem } from '@/app/actions/report';

export default function SalesInventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await getSalesInventory(startDate, endDate);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };
  
  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setTimeout(() => {
      getSalesInventory('', '').then(d => setItems(d || []));
    }, 100);
  }
  
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this sale item? The stock will be returned to inventory and the invoice total will be updated.')) {
      setLoading(true);
      const res = await deleteSaleItem(id);
      if (res.success) {
        alert('Item successfully reversed.');
        await loadData();
      } else {
        alert(res.error || 'Failed to delete item.');
        setLoading(false);
      }
    }
  }

  const formatCurrency = (amount: number) => Number(amount || 0).toFixed(2);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Sales Inventory Report</h4>
          <h6>Item-Level Sales and Profit details</h6>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleFilter} className="row align-items-end mb-4">
            <div className="col-md-3">
              <label>From Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>
            <div className="col-md-3">
              <label>To Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>
            <div className="col-md-4">
              <button type="submit" className="btn btn-submit me-2">Filter</button>
              <button type="button" className="btn btn-cancel" onClick={handleClear}>Clear</button>
            </div>
          </form>

          <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="table table-bordered table-striped" style={{ whiteSpace: 'nowrap', borderCollapse: 'collapse', width: '100%' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 1 }}>
                <tr>
                  <th>Invoice Number</th>
                  <th>Name</th>
                  <th>Receipt</th>
                  <th>Date</th>
                  <th className="text-end">Purchase Price</th>
                  <th className="text-end">Sale Price</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-end">Total Amount</th>
                  <th className="text-end">Profit</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-4">Loading inventory data...</td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-4">No records found.</td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.invoiceNumber}</td>
                      <td>{item.name}</td>
                      <td>{item.receipt}</td>
                      <td>{formatDate(item.date)}</td>
                      <td className="text-end text-muted">{formatCurrency(item.purchasePrice)}</td>
                      <td className="text-end font-weight-bold">{formatCurrency(item.salePrice)}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end text-primary">{formatCurrency(item.totalAmount)}</td>
                      <td className="text-end text-success">{formatCurrency(item.profit)}</td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-danger p-1" onClick={() => handleDelete(item.id)} title="Delete Item & Restore Stock">
                          <img src="/assets/img/icons/delete.svg" alt="Delete" style={{ width: '16px', height: '16px' }} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
