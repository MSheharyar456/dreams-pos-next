import Link from 'next/link';
import { getAllPurchases, deletePurchase } from '@/app/actions/purchases';
import DeleteButton from '@/components/ui/DeleteButton';

export default async function PurchasesPage() {
  const allPurchases = await getAllPurchases();
  const purchases = allPurchases.filter((purchase: any) => {
    try {
      return JSON.parse(purchase.notes || '{}')?.type !== 'pending_pop';
    } catch {
      return true;
    }
  });
  const totalPurchaseAmount = purchases.reduce((sum: number, purchase: any) => sum + Number(purchase.total_amount || 0), 0);
  const totalPaidAmount = purchases.reduce((sum: number, purchase: any) => sum + Number(purchase.paid_amount || 0), 0);
  const totalRemainingAmount = purchases.reduce((sum: number, purchase: any) => sum + Number(purchase.remaining_amount || 0), 0);

  async function handleDelete(formData: FormData) {
    'use server';
    await deletePurchase(
      formData.get('purchase_id') as string,
      formData.get('supplier_id') as string,
    );
  }

  return (
    <>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="page-title">
          <h4>Purchase List</h4>
          <h6>Approved purchase invoices and supplier payments</h6>
        </div>
        <div className="d-flex align-items-center flex-wrap gap-3">
          <div className="btn-group shadow-sm" role="group" aria-label="Choose list">
            <Link href="/sales" className="btn btn-outline-secondary fw-semibold px-4">
              <i className="fa fa-chart-line me-2" aria-hidden="true"></i>Sales List
            </Link>
            <Link href="/purchases" aria-current="page" className="btn btn-warning text-white fw-semibold px-4">
              <i className="fa fa-shopping-bag me-2" aria-hidden="true"></i>Purchase List
            </Link>
          </div>
          <Link href="/suppliers" className="btn btn-added">
            <img src="/assets/img/icons/plus.svg" alt="" className="me-1" />Add Purchase
          </Link>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="table-top">
            <div className="search-set">
              <div className="search-path">
                <a className="btn btn-filter" id="filter_search">
                  <img src="/assets/img/icons/filter.svg" alt="Filter" />
                  <span><img src="/assets/img/icons/closes.svg" alt="Close filter" /></span>
                </a>
              </div>
              <div className="search-input">
                <a className="btn btn-searchset"><img src="/assets/img/icons/search-white.svg" alt="Search" /></a>
              </div>
            </div>
            <div className="wordset">
              <ul>
                <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="pdf"><img src="/assets/img/icons/pdf.svg" alt="PDF" /></a></li>
                <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="excel"><img src="/assets/img/icons/excel.svg" alt="Excel" /></a></li>
                <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="print"><img src="/assets/img/icons/printer.svg" alt="Print" /></a></li>
              </ul>
            </div>
          </div>
          {purchases.length === 0 ? (
            <div className="text-center py-4 text-muted">No purchases have been recorded.</div>
          ) : (
            <div className="table-responsive">
              <table className="table datanew">
                <thead>
                  <tr>
                    <th>Purchase No.</th>
                    <th>Supplier</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Remaining</th>
                    <th>Status</th>
                    <th>Invoice</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase: any) => (
                      <tr key={purchase.id}>
                        <td>{purchase.purchase_number}</td>
                        <td>{purchase.suppliers?.name || 'Unknown supplier'}</td>
                        <td>{new Date(purchase.created_at).toLocaleDateString()}</td>
                        <td>{purchase.purchase_items?.length || 0}</td>
                        <td data-total-amount={Number(purchase.total_amount || 0)}>Rs. {Number(purchase.total_amount || 0).toFixed(2)}</td>
                        <td data-paid-amount={Number(purchase.paid_amount || 0)}>Rs. {Number(purchase.paid_amount || 0).toFixed(2)}</td>
                        <td data-remaining-amount={Number(purchase.remaining_amount || 0)}>Rs. {Number(purchase.remaining_amount || 0).toFixed(2)}</td>
                        <td>{purchase.payment_status}</td>
                        <td>
                          <Link href={`/suppliers/${purchase.supplier_id}/purchases/${purchase.id}`} className="btn btn-sm btn-outline-primary">View</Link>
                        </td>
                        <td>
                          <form action={handleDelete} className="d-inline">
                            <input type="hidden" name="purchase_id" value={purchase.id} />
                            <input type="hidden" name="supplier_id" value={purchase.supplier_id} />
                            <DeleteButton id={purchase.id} />
                          </form>
                        </td>
                      </tr>
                  ))}
                </tbody>
                <tfoot className="bg-light">
                  <tr>
                    <td colSpan={4} className="fw-bold">Grand Total ({purchases.length} purchases)</td>
                    <td className="fw-bold" data-total-footer="total">Rs. {totalPurchaseAmount.toFixed(2)}</td>
                    <td className="fw-bold" data-total-footer="paid">Rs. {totalPaidAmount.toFixed(2)}</td>
                    <td className="fw-bold" data-total-footer="remaining">Rs. {totalRemainingAmount.toFixed(2)}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
