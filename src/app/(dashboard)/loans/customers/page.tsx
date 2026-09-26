import EditLoanButton from '@/components/loans/EditLoanButton';
import { getCustomerLedgers, getCustomersWithOpeningBalanceOnly } from '@/app/actions/loans';
import { formatSignedAmount, toSignedNumber } from '@/lib/finance';

type LedgerRow = {
  id: string;
  customer_id?: string | null;
  sale_id?: string | null;
  invoice_number?: string | null;
  customers?: { name?: string | null; opening_balance?: number | string | null } | null;
  total_amount?: number | string | null;
  paid_amount?: number | string | null;
  remaining_amount?: number | string | null;
  display_advance?: number;
  remarks?: string | null;
  created_at: string;
};

export default async function LedgerPage() {
  const [ledgers, customersWithOBOnly] = await Promise.all([
    getCustomerLedgers(),
    getCustomersWithOpeningBalanceOnly()
  ]);
  
  const allLedgers = [...ledgers, ...customersWithOBOnly];

  // Group by customer to combine the net balances into a single row per customer
  const customerGroups = new Map<string, { latestInvoice: LedgerRow | null; advanceRow: LedgerRow | null; totalInvoiceRemaining: number; negativeInvoiceCredit: number }>();
  
  allLedgers.forEach(item => {
    const customerId = item.customer_id;
    if (!customerId) return;

    if (!customerGroups.has(customerId)) {
      customerGroups.set(customerId, { latestInvoice: null, advanceRow: null, totalInvoiceRemaining: 0, negativeInvoiceCredit: 0 });
    }
    
    const group = customerGroups.get(customerId)!;

    if (!item.invoice_number) {
      group.advanceRow = item;
    } else {
      const remaining = toSignedNumber(item.remaining_amount);
      if (remaining < 0) group.negativeInvoiceCredit += Math.abs(remaining);
      group.totalInvoiceRemaining += remaining;

      // Always use the newest invoice row, including when it is individually
      // cleared, because older invoice balances are rolled into this row.
      if (!group.latestInvoice || new Date(item.created_at).getTime() > new Date(group.latestInvoice.created_at).getTime()) {
        group.latestInvoice = item;
      }
    }
  });

  const finalLedgerRows: LedgerRow[] = [];
  
  customerGroups.forEach((group) => {
    // Keep a pure customer advance on its Advance row when every invoice is
    // cleared. A cleared invoice should only be used as the display row when
    // there is an invoice balance to carry onto it (or it is a loan-sale row).
    const latestIsSystemLoan = typeof group.latestInvoice?.remarks === 'string'
      && group.latestInvoice.remarks.includes('"loan_sale"');
    if (group.advanceRow && Math.abs(group.totalInvoiceRemaining) <= 0.009 && !latestIsSystemLoan) {
      finalLedgerRows.push(group.advanceRow);
      return;
    }

    const advanceRemaining = group.advanceRow
      ? toSignedNumber(group.advanceRow.remaining_amount)
      : -Math.max(0, Number(group.latestInvoice?.customers?.opening_balance || 0));
    const netRemaining = group.totalInvoiceRemaining + advanceRemaining;

    // 1. Push the advance row ONLY if there is no invoice for this customer
    if (group.advanceRow && !group.latestInvoice) {
      finalLedgerRows.push(group.advanceRow);
    }
    
    // 2. Push the latest invoice row if it exists
    if (group.latestInvoice) {
      // Show latest invoice but with the net remaining balance so it appears in Need Pay / Need Receive
      finalLedgerRows.push({
        ...group.latestInvoice,
        remaining_amount: netRemaining,
        display_advance: Math.max(0, Math.abs(advanceRemaining) + group.negativeInvoiceCredit)
      });
    }
  });


  const customerLedgerRows = finalLedgerRows.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const totalBakayaLena = customerLedgerRows.reduce((sum: number, item: LedgerRow) => {
    const remaining = toSignedNumber(item.remaining_amount);
    return sum + Math.max(0, remaining);
  }, 0);

  const totalBakayaDena = customerLedgerRows.reduce((sum: number, item: LedgerRow) => {
    const remaining = toSignedNumber(item.remaining_amount);
    return sum + Math.max(0, -remaining);
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
                {customerLedgerRows.map((item: LedgerRow) => {
                  const remaining = toSignedNumber(item.remaining_amount);
                  const receive = Math.max(0, remaining); // Positive = to receive
                  const pay = Math.max(0, -remaining); // Negative shown as positive = to pay
                  let ledgerMeta: { type?: string; note?: string; cash_paid?: number; advance_used?: number; available_advance?: number; adjustment_history?: Array<{ balance_after?: number }> } = {};
                  try {
                    const parsed = item.remarks ? JSON.parse(item.remarks) : {};
                    if (parsed && typeof parsed === 'object') ledgerMeta = parsed;
                  } catch {
                    ledgerMeta = {};
                  }

                  const type = item.invoice_number ? 'Invoice' : 'Advance';
                  const advanceUsed = Math.max(0, Number(ledgerMeta.advance_used ?? 0));
                  const adjustmentHistory = Array.isArray(ledgerMeta.adjustment_history)
                    ? ledgerMeta.adjustment_history
                    : [];
                  const latestAdjustment = adjustmentHistory.length > 0
                    ? adjustmentHistory[adjustmentHistory.length - 1]
                    : null;
                  const availableAdvanceValue = Number(
                    ledgerMeta.available_advance ?? latestAdjustment?.balance_after ?? item.customers?.opening_balance ?? 0
                  );
                  const remainingAdvance = item.invoice_number
                    ? Math.max(0, Number(item.display_advance ?? (Number.isFinite(availableAdvanceValue) ? availableAdvanceValue : 0)))
                    : Math.max(0, Number(item.customers?.opening_balance ?? 0));
                  const paidAmount = item.invoice_number && ledgerMeta.cash_paid !== undefined
                    ? Number(ledgerMeta.cash_paid)
                    : toSignedNumber(item.paid_amount);
                  
                  const openingAdvance = Number(ledgerMeta.opening_advance || 0);
                  const showAdvanceBadge = item.invoice_number && openingAdvance > 0;
                  
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
                      <td>
                        <div style={{ color: '#000' }}>{paidAmount.toFixed(2)}</div>
                        {showAdvanceBadge && (
                          <div style={{ color: '#ea5455', fontSize: '12px', fontWeight: 600 }}>
                            Advance: {remainingAdvance.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td style={{ color: receive > 0 ? '#28c76f' : '#999', fontWeight: receive > 0 ? 600 : 400 }}>
                        {receive > 0 ? receive.toFixed(2) : '—'}
                      </td>
                      <td style={{ color: pay > 0 ? '#ea5455' : '#999', fontWeight: pay > 0 ? 600 : 400 }}>
                        {pay > 0 ? pay.toFixed(2) : '—'}
                      </td>
                      <td>{new Date(item.created_at).toLocaleDateString('en-GB')}</td>
                      <td>
                        <EditLoanButton 
                          ledgerId={item.id} 
                          currentRemaining={item.invoice_number
                            ? remaining !== 0
                              ? remaining
                              : remainingAdvance > 0
                                ? -remainingAdvance
                                : 0
                            : remaining}
                          type="customer"
                          remarks={item.remarks}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}>
                <tr>
                  <td colSpan={4} style={{ textAlign: "right", color: "#333", fontWeight: 700 }}>Grand Total:</td>
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
