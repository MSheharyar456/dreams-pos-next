'use client';

import React, { useEffect, useState } from 'react';
import { getSalesReport } from '@/app/actions/report';

export default function SalesReportPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await getSalesReport(startDate, endDate);
    setSales(data || []);
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
      // It will not reload immediately without effect, so we call it direct
      getSalesReport('', '').then(d => setSales(d || []));
    }, 100);
  }

  // Calculate totals
  const totals = sales.reduce(
    (acc, curr) => {
      acc.totalAmount += curr.totalAmount;
      acc.receivedAmount += curr.receivedAmount;
      acc.expectedProfit += curr.expectedProfit;
      acc.currentProfit += curr.currentProfit;
      acc.payableBalance += curr.payableBalance;
      acc.receivableBalance += curr.receivableBalance;
      return acc;
    },
    {
      totalAmount: 0,
      receivedAmount: 0,
      expectedProfit: 0,
      currentProfit: 0,
      payableBalance: 0,
      receivableBalance: 0,
    }
  );

  const formatCurrency = (amount: number) => amount.toFixed(2);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Sales Report</h4>
          <h6>View your detailed sales and profit report</h6>
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
                  <th>Cashier Name</th>
                  <th>Customer Name</th>
                  <th>Transaction Date</th>
                  <th className="text-end">Total Amount</th>
                  <th className="text-end">Received Amount</th>
                  <th className="text-end">Expected Profit</th>
                  <th className="text-end">Current Profit</th>
                  <th className="text-end">Payable Balance</th>
                  <th className="text-end">Receivable Balance</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="text-center py-4">Loading report data...</td>
                  </tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-4">No sales found for the selected dates.</td>
                  </tr>
                ) : (
                  sales.map((sale, index) => (
                    <tr key={index}>
                      <td>{sale.invoiceNumber}</td>
                      <td>{sale.cashierName}</td>
                      <td>{sale.customerName}</td>
                      <td>{formatDate(sale.transactionDate)}</td>
                      <td className="text-end font-weight-bold">{formatCurrency(sale.totalAmount)}</td>
                      <td className="text-end text-success">{formatCurrency(sale.receivedAmount)}</td>
                      <td className="text-end text-primary">{formatCurrency(sale.expectedProfit)}</td>
                      <td className="text-end text-info">{formatCurrency(sale.currentProfit)}</td>
                      <td className="text-end text-danger">{formatCurrency(sale.payableBalance)}</td>
                      <td className="text-end text-warning">{formatCurrency(sale.receivableBalance)}</td>
                      <td>{sale.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot style={{ position: 'sticky', bottom: 0, backgroundColor: '#e9ecef', fontWeight: 'bold' }}>
                <tr>
                  <td colSpan={4} className="text-end">Grand Total:</td>
                  <td className="text-end">{formatCurrency(totals.totalAmount)}</td>
                  <td className="text-end text-success">{formatCurrency(totals.receivedAmount)}</td>
                  <td className="text-end text-primary">{formatCurrency(totals.expectedProfit)}</td>
                  <td className="text-end text-info">{formatCurrency(totals.currentProfit)}</td>
                  <td className="text-end text-danger">{formatCurrency(totals.payableBalance)}</td>
                  <td className="text-end text-warning">{formatCurrency(totals.receivableBalance)}</td>
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
