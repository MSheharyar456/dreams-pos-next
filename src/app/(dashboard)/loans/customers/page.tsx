import EditLoanButton from '@/components/loans/EditLoanButton';
import { getCustomerLedgers, getCustomersWithOpeningBalanceOnly } from '@/app/actions/loans';
import { formatSignedAmount, toSignedNumber } from '@/lib/finance';

type LedgerRow = {
  id: string;
  invoice_number?: string | null;
  customers?: { name?: string | null } | null;
  total_amount?: number | string | null;
  paid_amount?: number | string | null;
  remaining_amount?: number | string | null;
  created_at: string;
};

export default async function LedgerPage() {
  const [ledgers, customersWithOBOnly] = await Promise.all([
    getCustomerLedgers(),
    getCustomersWithOpeningBalanceOnly()
  ]);
  
  // Combine ledgers with customers that have opening balance only
  const allLedgers = [...ledgers, ...customersWithOBOnly];
  
  // Calculate BAKAYA LENA (Amount to Receive - positive amounts)
  const totalBakayaLena = allLedgers.reduce((sum, item) => {
    const remaining = toSignedNumber(item.remaining_amount);
    return sum + Math.max(0, remaining); // Only positive amounts
  }, 0);
  
  // Calculate BAKAYA DENA (Amount to Pay - negative amounts shown as positive)
  const totalBakayaDena = allLedgers.reduce((sum, item) => {
    const remaining = toSignedNumber(item.remaining_amount);
    return sum + Math.max(0, -remaining); // Only negative amounts shown as positive
  }, 0);

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Customer Ledger</h4>
          <h6>Manage your customer balances</h6>
        </div>
        <div className="page-btn">
          <button className="btn btn-added">
            <img src="/assets/img/icons/plus.svg" alt="img" className="me-1" />
            Add Customer
          </button>
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
                  <th>Invoice Number</th>
                  <th>Customer Name</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th style={{ color: '#28c76f' }}>Need Receive</th>
                  <th style={{ color: '#ea5455' }}>Need Pay</th>
                  <th>Update Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allLedgers.map((item: LedgerRow) => {
                  const remaining = toSignedNumber(item.remaining_amount);
                  const receive = Math.max(0, remaining); // Positive = to receive
                  const pay = Math.max(0, -remaining); // Negative shown as positive = to pay
                  const type = item.invoice_number ? 'Invoice' : 'Advance';
                  
                  return (
                    <tr key={item.id}>
                      <td>{item.invoice_number || '—'}</td>
                      <td>{item.customers?.name || 'Unknown'}</td>
                      <td>{new Date(item.created_at).toLocaleDateString('en-GB')}</td>
                      <td>
                        <span style={{
                          backgroundColor: type === 'Invoice' ? '#e3f2fd' : '#fff3e0',
                          color: type === 'Invoice' ? '#1976d2' : '#f57c00',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          fontSize: '12px'
                        }}>
                          {type}
                        </span>
                      </td>
                      <td>{toSignedNumber(item.total_amount).toFixed(2)}</td>
                      <td>{toSignedNumber(item.paid_amount).toFixed(2)}</td>
                      <td style={{ color: receive > 0 ? '#28c76f' : '#999', fontWeight: receive > 0 ? 600 : 400 }}>
                        {receive > 0 ? receive.toFixed(2) : '—'}
                      </td>
                      <td style={{ color: pay > 0 ? '#ea5455' : '#999', fontWeight: pay > 0 ? 600 : 400 }}>
                        {pay > 0 ? pay.toFixed(2) : '—'}
                      </td>
                      <td>{new Date(item.created_at).toLocaleDateString('en-GB')}</td>
                      <td>
                        {item.invoice_number ? (
                          <EditLoanButton 
                            ledgerId={item.id} 
                            currentRemaining={remaining}
                            type="customer"
                          />
                        ) : (
                          <span style={{ fontSize: '12px', color: '#999' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}>
                <tr>
                  <td colSpan={3} style={{ textAlign: "right", color: "#333", fontWeight: 700 }}>Grand Total:</td>
                  <td style={{ fontWeight: 700 }}>—</td>
                  <td style={{ fontWeight: 700 }}>—</td>
                  <td style={{ color: "#28c76f", fontWeight: 700 }}>{totalBakayaLena.toFixed(2)}</td>
                  <td style={{ color: "#ea5455", fontWeight: 700 }}>{totalBakayaDena.toFixed(2)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}