'use client';

import React, { useEffect, useState } from 'react';
import { getProfitAndLoss } from '@/app/actions/pl-report';

export default function ProfitLossPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = async () => {
    setLoading(true);
    const result = await getProfitAndLoss(period, startDate, endDate);
    setData(result || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [period]); // Reload when period changes

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };
  
  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setTimeout(() => {
      getProfitAndLoss(period, '', '').then(d => setData(d || []));
    }, 100);
  }

  // Calculate Grand Totals
  const totals = data.reduce(
    (acc, curr) => {
      acc.revenue += curr.revenue;
      acc.cogs += curr.cogs;
      acc.grossProfit += curr.grossProfit;
      acc.expenses += curr.expenses;
      acc.netProfit += curr.netProfit;
      return acc;
    },
    { revenue: 0, cogs: 0, grossProfit: 0, expenses: 0, netProfit: 0 }
  );

  const formatCurrency = (amount: number) => Number(amount || 0).toFixed(2);
  const formatPeriod = (dateStr: string) => {
    if (period === 'monthly') {
      const [yyyy, mm] = dateStr.split('-');
      const d = new Date(parseInt(yyyy), parseInt(mm) - 1, 1);
      return d.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    }
    return new Date(dateStr).toLocaleDateString('default', { dateStyle: 'medium' });
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Profit & Loss Report</h4>
          <h6>Analyze your business financial health</h6>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row">
        <div className="col-lg-3 col-sm-6 col-12">
          <div className="dash-widget">
            <div className="dash-widgetimg" style={{ backgroundColor: '#e5f3fe', color: '#007bff' }}>
              <img src="/assets/img/icons/dash1.svg" alt="img" />
            </div>
            <div className="dash-widgetcontent">
              <h5><span className="counters">{formatCurrency(totals.revenue)}</span></h5>
              <h6>Total Revenue</h6>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-sm-6 col-12">
          <div className="dash-widget dash1">
            <div className="dash-widgetimg" style={{ backgroundColor: '#fff2e5', color: '#fd7e14' }}>
              <img src="/assets/img/icons/dash2.svg" alt="img" />
            </div>
            <div className="dash-widgetcontent">
              <h5><span className="counters">{formatCurrency(totals.grossProfit)}</span></h5>
              <h6>Gross Profit</h6>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-sm-6 col-12">
          <div className="dash-widget dash2">
            <div className="dash-widgetimg" style={{ backgroundColor: '#ffe5e5', color: '#dc3545' }}>
              <img src="/assets/img/icons/dash3.svg" alt="img" />
            </div>
            <div className="dash-widgetcontent">
              <h5><span className="counters">{formatCurrency(totals.expenses)}</span></h5>
              <h6>Total Expenses</h6>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-sm-6 col-12">
          <div className="dash-widget dash3">
            <div className="dash-widgetimg" style={{ backgroundColor: '#e5fae5', color: '#28a745' }}>
              <img src="/assets/img/icons/dash4.svg" alt="img" />
            </div>
            <div className="dash-widgetcontent">
              <h5><span className="counters" style={{ color: totals.netProfit < 0 ? '#dc3545' : '#28a745' }}>{formatCurrency(totals.netProfit)}</span></h5>
              <h6>Net Profit</h6>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleFilter} className="row align-items-end mb-4">
            <div className="col-md-3">
              <label>Period View</label>
              <select className="form-control" value={period} onChange={(e) => setPeriod(e.target.value as 'daily'|'monthly')}>
                <option value="daily">Daily View</option>
                <option value="monthly">Monthly View</option>
              </select>
            </div>
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
            <div className="col-md-3">
              <button type="submit" className="btn btn-submit me-2">Filter</button>
              <button type="button" className="btn btn-cancel" onClick={handleClear}>Clear</button>
            </div>
          </form>

          <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="table table-bordered table-striped" style={{ whiteSpace: 'nowrap', borderCollapse: 'collapse', width: '100%' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 1 }}>
                <tr>
                  <th>{period === 'daily' ? 'Date' : 'Month'}</th>
                  <th className="text-end">Sales Revenue</th>
                  <th className="text-end" title="Cost of Goods Sold">COGS</th>
                  <th className="text-end">Gross Profit</th>
                  <th className="text-end">Operating Expenses</th>
                  <th className="text-end">Net Profit / Loss</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">Loading financial data...</td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">No financial records found for the selected period.</td>
                  </tr>
                ) : (
                  data.map((row, index) => (
                    <tr key={index}>
                      <td className="font-weight-bold">{formatPeriod(row.date)}</td>
                      <td className="text-end">{formatCurrency(row.revenue)}</td>
                      <td className="text-end text-muted">{formatCurrency(row.cogs)}</td>
                      <td className="text-end text-primary">{formatCurrency(row.grossProfit)}</td>
                      <td className="text-end text-danger">{formatCurrency(row.expenses)}</td>
                      <td className={`text-end font-weight-bold ${row.netProfit < 0 ? 'text-danger' : 'text-success'}`}>
                        {formatCurrency(row.netProfit)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot style={{ position: 'sticky', bottom: 0, backgroundColor: '#e9ecef', fontWeight: 'bold' }}>
                <tr>
                  <td className="text-end">Grand Total:</td>
                  <td className="text-end">{formatCurrency(totals.revenue)}</td>
                  <td className="text-end text-muted">{formatCurrency(totals.cogs)}</td>
                  <td className="text-end text-primary">{formatCurrency(totals.grossProfit)}</td>
                  <td className="text-end text-danger">{formatCurrency(totals.expenses)}</td>
                  <td className={`text-end ${totals.netProfit < 0 ? 'text-danger' : 'text-success'}`}>
                    {formatCurrency(totals.netProfit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
