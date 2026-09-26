import EditLoanButton from '@/components/loans/EditLoanButton';
import { getSupplierLedgers, getSuppliersWithOpeningBalanceOnly } from '@/app/actions/loans';
import { formatSignedAmount, toSignedNumber } from '@/lib/finance';

type LedgerRow = {
  id: string;
  supplier_id?: string | null;
  invoice_number?: string | null;
  suppliers?: { name?: string | null } | null;
  total_amount?: number | string | null;
  paid_amount?: number | string | null;
  remaining_amount?: number | string | null;
  remarks?: string | null;
  created_at: string;
};

export default async function LedgerPage() {
  const ledgers = await getSupplierLedgers();
  const suppliersWithOBOnly = await getSuppliersWithOpeningBalanceOnly();
  const allSupplierLedgers = [...ledgers, ...suppliersWithOBOnly];
  const supplierGroups = new Map<string, {
    latestInvoice: LedgerRow | null;
    advanceRow: LedgerRow | null;
    totalInvoiceRemaining: number;
  }>();

  allSupplierLedgers.forEach((item: LedgerRow) => {
    const supplierKey = item.suppliers?.name?.trim().replace(/\s+/g, ' ').toLocaleLowerCase()
      || item.supplier_id
      || item.id;
    if (!supplierGroups.has(supplierKey)) {
      supplierGroups.set(supplierKey, { latestInvoice: null, advanceRow: null, totalInvoiceRemaining: 0 });
    }

    const group = supplierGroups.get(supplierKey)!;
    if (!item.invoice_number) {
      group.advanceRow = item;
      return;
    }

    group.totalInvoiceRemaining += toSignedNumber(item.remaining_amount);
    if (!group.latestInvoice || new Date(item.created_at).getTime() > new Date(group.latestInvoice.created_at).getTime()) {
      group.latestInvoice = item;
    }
  });

  const allLedgers: LedgerRow[] = [];
  supplierGroups.forEach((group) => {
    if (group.advanceRow && !group.latestInvoice) {
      allLedgers.push(group.advanceRow);
    }
    if (group.latestInvoice) {
      allLedgers.push({
        ...group.latestInvoice,
        remaining_amount: group.totalInvoiceRemaining + toSignedNumber(group.advanceRow?.remaining_amount),
      });
    }
  });
  
  // For Suppliers:
  // BAKAYA DENA (Amount to Pay - positive) = what we owe supplier
  // BAKAYA LENA (Amount to Receive - negative shown as positive) = what supplier owes us
  const totalBakayaDena = allLedgers.reduce((sum: number, item: LedgerRow) => {
    const remaining = toSignedNumber(item.remaining_amount);
    return sum + Math.max(0, remaining); // Only positive amounts
  }, 0);
  
  const totalBakayaLena = allLedgers.reduce((sum: number, item: LedgerRow) => {
    const remaining = toSignedNumber(item.remaining_amount);
    return sum + Math.max(0, -remaining); // Only negative amounts shown as positive
  }, 0);

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Supplier Ledger</h4>
          <h6>Manage your supplier balances</h6>
        </div>
        <div className="page-btn">
          <button className="btn btn-added">
            <img src="/assets/img/icons/plus.svg" alt="img" className="me-1" />
            Add Supplier
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
                  <th>Supplier Name</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th style={{ color: '#ea5455' }}>Need Pay</th>
                  <th style={{ color: '#28c76f' }}>Need Receive</th>
                  <th>Update Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allLedgers.map((item: LedgerRow) => {
                  const remaining = toSignedNumber(item.remaining_amount);
                  const receive = Math.max(0, -remaining); // Negative shown as positive = to receive
                  const type = item.invoice_number ? 'Invoice' : 'Advance';
                  let ledgerMeta: any = {};
                  try { ledgerMeta = JSON.parse(item.remarks || '{}'); } catch { ledgerMeta = {}; }
                  const advanceUsed = Number(ledgerMeta.advance_used || 0);
                  const advanceBalanceBeforeAdjustment = Number(ledgerMeta.available_advance || 0);
                  const adjustedAdvance = Number(ledgerMeta.manual_available_advance
                    ?? (ledgerMeta.manual_adjustment !== undefined
                      ? advanceBalanceBeforeAdjustment + Number(ledgerMeta.manual_adjustment || 0)
                      : advanceBalanceBeforeAdjustment));
                  const remainingAdvance = Math.max(0, adjustedAdvance);
                  const advanceOverdue = Math.max(0, -adjustedAdvance);
                  const pay = Math.max(0, remaining, advanceOverdue); // Positive = to pay
                  const advanceBefore = remainingAdvance;
                  
                  return (
                    <tr key={item.id}>
                      <td>{item.invoice_number || '—'}</td>
                      <td>{item.suppliers?.name || 'Unknown'}</td>
                      <td>{new Date(item.created_at).toLocaleDateString('en-GB')}</td>
                      <td>
                        <span style={{
                          backgroundColor: type === 'Invoice' ? '#e3f2fd' : '#fff3e0',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          fontSize: '12px'
                        }}>
                          {type}
                        </span>
                      </td>
                      <td>{toSignedNumber(item.total_amount).toFixed(2)}</td>
                      <td style={{ color: type === 'Advance' ? '#ea5455' : undefined, fontWeight: type === 'Advance' ? 600 : undefined }}>
                        {type === 'Advance' && <div style={{ fontSize: '12px' }}>Advance paid</div>}
                        <div>{toSignedNumber(item.paid_amount).toFixed(2)}</div>
                        {type === 'Invoice' && advanceUsed > 0 && (
                          <div style={{ color: '#28c76f', fontSize: '12px', fontWeight: 600, lineHeight: 1.4 }}>
                            <div>Advance: {advanceBefore.toFixed(2)}</div>
                          </div>
                        )}
                      </td>
                      <td style={{ color: pay > 0 ? '#ea5455' : '#999', fontWeight: pay > 0 ? 600 : 400 }}>
                        {pay > 0 ? pay.toFixed(2) : '—'}
                      </td>
                      <td style={{ color: receive > 0 ? '#28c76f' : '#999', fontWeight: receive > 0 ? 600 : 400 }}>
                        {receive > 0 ? receive.toFixed(2) : '—'}
                      </td>
                      <td>{new Date(item.created_at).toLocaleDateString('en-GB')}</td>
                      <td>
                        {item.invoice_number ? (
                          <EditLoanButton 
                            ledgerId={item.id} 
                            currentRemaining={remaining}
                            type="supplier"
                            remarks={item.remarks}
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
                  <td style={{ fontWeight: 700 }}>—</td>
                  <td style={{ color: "#ea5455", fontWeight: 700 }}>{totalBakayaDena.toFixed(2)}</td>
                  <td style={{ color: "#28c76f", fontWeight: 700 }}>{totalBakayaLena.toFixed(2)}</td>
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
