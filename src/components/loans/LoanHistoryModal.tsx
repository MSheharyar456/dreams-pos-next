'use client';

import React, { useState } from 'react';
import { getCustomerLoanHistory, getSupplierLoanHistory, updateLoanRemarks } from '@/app/actions/loans';

type LoanHistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  remarks: string | undefined;
  type: 'customer' | 'supplier';
  ledgerId: string;
};

export default function LoanHistoryModal({ isOpen, onClose, remarks, type, ledgerId }: LoanHistoryModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRemarks, setEditedRemarks] = useState(remarks || '');
  const [isSaving, setIsSaving] = useState(false);
  const [customerHistory, setCustomerHistory] = useState<any[]>([]);
  const [supplierHistory, setSupplierHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [secretClickCount, setSecretClickCount] = useState(0);
  let historyData: any = null;
  if (remarks) {
    try {
      const parsed = JSON.parse(remarks);
      if (parsed && typeof parsed === 'object') historyData = parsed;
    } catch {
      historyData = null;
    }
  }

  React.useEffect(() => {
    if (!isOpen) return;
    setSecretClickCount(0);
    setIsEditing(false);
    setIsLoadingHistory(true);
    const historyRequest = type === 'customer'
      ? getCustomerLoanHistory(ledgerId).then(setCustomerHistory)
      : getSupplierLoanHistory(ledgerId).then(setSupplierHistory);
    historyRequest
      .finally(() => setIsLoadingHistory(false));
  }, [isOpen, ledgerId, type]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    const res = await updateLoanRemarks(type, ledgerId, editedRemarks);
    setIsSaving(false);
    
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error || 'Failed to update history');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, 
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: '#fff', padding: '30px', borderRadius: '12px', 
        width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <h3
            onClick={() => setSecretClickCount((count) => Math.min(5, count + 1))}
            style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#333', display: 'flex', alignItems: 'center', cursor: 'default', userSelect: 'none' }}
          >
            <span style={{ marginRight: '10px', fontSize: '20px' }}>🕒</span>
            {type === 'customer' ? 'Customer' : 'Supplier'} Loan History
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#999', lineHeight: '1' }}>&times;</button>
        </div>

        {isEditing ? (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>
              Edit History Records
            </label>
            <p style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>
              You can manually correct the payment history text below. Make sure the dates and amounts are accurate before saving.
            </p>
            <textarea 
              value={editedRemarks}
              onChange={(e) => setEditedRemarks(e.target.value)}
              rows={8}
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px', resize: 'vertical' }}
            />
          </div>
        ) : (
          <div style={{ marginBottom: '20px', color: '#555', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '6px', minHeight: '100px' }}>
            {isLoadingHistory ? (
              <span>Loading {type} loan history...</span>
            ) : (type === 'customer' ? customerHistory : supplierHistory).length > 0 ? (
              <div>
                {(type === 'customer' ? customerHistory : supplierHistory).map((entry, index) => {
                  let entryMeta: any = {};
                  try {
                    entryMeta = entry.remarks ? JSON.parse(entry.remarks) : {};
                  } catch {
                    entryMeta = {};
                  }
                  if (entryMeta.type === 'customer_advance_note') {
                    return (
                      <div key={entry.id} style={{ borderBottom: index < customerHistory.length - 1 ? '1px solid #ddd' : 'none', paddingBottom: '12px', marginBottom: '12px' }}>
                        <div style={{ fontWeight: 700, color: '#333' }}>
                          Advance · {entryMeta.transaction_note_date || new Date(entry.created_at).toLocaleDateString('en-GB')}
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>Transaction details: {entryMeta.transaction_details}</div>
                      </div>
                    );
                  }
                  const openingAdvance = Number(entryMeta.opening_advance || 0);
                  const advanceUsed = Number(entryMeta.advance_used || 0);
                  const manualAdjustment = entryMeta.manual_adjustment !== undefined
                    ? Number(entryMeta.manual_adjustment)
                    : null;
                  const manualAdjustmentDate = entryMeta.manual_adjustment_date || entryMeta.adjustment_date;
                  const availableBeforeAdjustment = Math.max(0, openingAdvance - advanceUsed);
                  const availableAfterAdjustment = Number(entryMeta.manual_available_advance ?? entryMeta.available_advance ?? availableBeforeAdjustment);
                  const calculatedRemainingAdvance = manualAdjustment !== null
                    ? availableBeforeAdjustment + manualAdjustment
                    : Number(availableAfterAdjustment || 0);
                  const remainingAdvance = Math.max(0, calculatedRemainingAdvance);
                  const advanceOverdue = Math.max(0, -calculatedRemainingAdvance);
                  const invoiceTotal = Number(entryMeta.total_amount ?? entry.total_amount ?? 0);
                  const storedInvoiceRemaining = Number(entry.remaining_amount ?? entryMeta.remaining_amount ?? 0);
                  const legacyInvoiceCredit = type === 'customer' && entry.invoice_number
                    ? Math.max(0, -storedInvoiceRemaining)
                    : 0;
                  const invoiceRemaining = type === 'customer' && entry.invoice_number
                    ? Math.max(0, storedInvoiceRemaining)
                    : entry.invoice_number
                      ? Math.max(0, Number(entryMeta.manual_remaining ?? entryMeta.remaining_amount ?? storedInvoiceRemaining))
                      : 0;
                  const cashPaid = Math.max(0, Number(entryMeta.cash_paid || 0));
                  const invoiceRemainingBeforeAdjustments = Math.max(0, invoiceTotal - cashPaid - advanceUsed);
                  const adjustmentHistory = Array.isArray(entryMeta.adjustment_history)
                    ? entryMeta.adjustment_history
                    : [];
                  let runningNetBalance = invoiceRemainingBeforeAdjustments - availableBeforeAdjustment;
                  const formattedAdjustmentHistory = adjustmentHistory.map((adjustment: any) => {
                    const amount = Number(adjustment.amount || 0);
                    const nextBalance = adjustment.balance_type === 'net'
                      ? Number(adjustment.balance_after || 0)
                      : Number((runningNetBalance - amount).toFixed(2));
                    runningNetBalance = nextBalance;
                    return {
                      ...adjustment,
                      computed_balance_after: nextBalance
                    };
                  });
                  const currentRemainingAdvance = Number(
                    type === 'supplier'
                      ? entryMeta.manual_available_advance
                        ?? (manualAdjustment !== null ? calculatedRemainingAdvance : entryMeta.available_advance ?? remainingAdvance)
                      : entryMeta.available_advance ?? remainingAdvance
                  ) + legacyInvoiceCredit;
                  return (
                    <div key={entry.id} style={{ borderBottom: index < (type === 'customer' ? customerHistory : supplierHistory).length - 1 ? '1px solid #ddd' : 'none', paddingBottom: '12px', marginBottom: '12px' }}>
                      <div style={{ fontWeight: 700, color: '#333' }}>
                        {entry.invoice_number || 'Advance'} · {new Date(entry.created_at).toLocaleDateString('en-GB')}
                      </div>
                      <div>Invoice total: Rs. {invoiceTotal.toFixed(2)}</div>
                      <div>Opening advance: Rs. {openingAdvance.toFixed(2)}</div>
                      <div>Cash paid: Rs. {Number(entryMeta.cash_paid || 0).toFixed(2)}</div>
                      <div>Advance used: Rs. {advanceUsed.toFixed(2)}</div>
                      <div style={{ color: '#666', fontWeight: 600 }}>
                        Remaining before adjustment: Rs. {availableBeforeAdjustment.toFixed(2)}
                      </div>
                      {manualAdjustment !== null && type === 'supplier' && adjustmentHistory.length === 0 && (
                        <div style={{ color: '#ea5455', fontWeight: 600 }}>
                          Adjustment: {manualAdjustment >= 0 ? '+' : ''}{manualAdjustment.toFixed(2)} (Need Receive){manualAdjustmentDate ? ` · ${manualAdjustmentDate}` : ''}
                        </div>
                      )}
                      <div style={{ color: '#28c76f', fontWeight: 700 }}>
                        Current remaining advance: Rs. {currentRemainingAdvance.toFixed(2)}
                      </div>
                      {advanceOverdue > 0 && type === 'supplier' && (
                        <div style={{ color: '#ea5455', fontWeight: 600 }}>
                          Need Pay: Rs. {advanceOverdue.toFixed(2)}
                        </div>
                      )}
                      <div>Invoice remaining: Rs. {invoiceRemaining.toFixed(2)}</div>
                      {Number(entryMeta.carried_forward_balance || 0) !== 0 && (
                        <div style={{ color: '#666', fontWeight: 600 }}>
                          Balance carried forward to {entryMeta.carried_forward_to}: Rs. {Number(entryMeta.carried_forward_balance).toFixed(2)}
                        </div>
                      )}
                      {formattedAdjustmentHistory.length > 0 && (
                        <div style={{ marginTop: '6px' }}>
                          <strong>Adjustments:</strong>
                          {formattedAdjustmentHistory.map((adjustment: any, adjustmentIndex: number) => (
                            <div key={adjustmentIndex} style={{ marginTop: '4px' }}>
                              <span>{adjustment.date}: </span>
                              <span style={{ color: '#ea5455', fontWeight: 600 }}>
                                {Number(adjustment.amount || 0) >= 0 ? '+' : ''}{Number(adjustment.amount || 0).toFixed(2)}
                              </span>
                              <span> {'->'} Rs. </span>
                              <span style={{ color: Number(adjustment.computed_balance_after) >= 0 ? '#28c76f' : '#ea5455', fontWeight: 600 }}>
                                {Math.abs(Number(adjustment.computed_balance_after ?? adjustment.balance_after ?? 0)).toFixed(2)}
                              </span>
                              {adjustment.remarks && (
                                <span style={{ color: '#666', marginLeft: '6px' }}>({adjustment.remarks})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : historyData ? (
              <>
                <div><strong>Opening advance:</strong> Rs. {Number(historyData.opening_advance || 0).toFixed(2)}</div>
                <div><strong>Cash paid:</strong> Rs. {Number(historyData.cash_paid || 0).toFixed(2)}</div>
                <div><strong>Advance used:</strong> Rs. {Number(historyData.advance_used || 0).toFixed(2)}</div>
                <div><strong>Remaining before adjustment:</strong> Rs. {Math.max(0, Number(historyData.opening_advance || 0) - Number(historyData.advance_used || 0)).toFixed(2)}</div>
                <div><strong>Current remaining advance:</strong> Rs. {Math.max(0, Number(historyData.available_advance || 0)).toFixed(2)}</div>
                <div><strong>Invoice total:</strong> Rs. {Number(historyData.total_amount || 0).toFixed(2)}</div>
                <div><strong>Invoice remaining:</strong> Rs. {Number(historyData.remaining_amount || 0).toFixed(2)}</div>
                {Array.isArray(historyData.adjustment_history) && historyData.adjustment_history.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    <strong>Adjustments</strong>
                    {historyData.adjustment_history.map((entry: any, index: number) => (
                      <div key={index} style={{ marginTop: '6px' }}>
                        {entry.date}: {Number(entry.amount || 0) >= 0 ? '+' : ''}{Number(entry.amount || 0).toFixed(2)}
                        {' -> '}Rs. {Number(entry.balance_after || 0).toFixed(2)}
                        {entry.remarks ? ` (${entry.remarks})` : ''}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <span style={{ whiteSpace: 'pre-wrap' }}>{remarks || 'No payment history available for this loan.'}</span>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          {isEditing ? (
            <>
              <button 
                onClick={() => { setIsEditing(false); setEditedRemarks(remarks || ''); }}
                style={{ 
                  flex: 1, padding: '12px', backgroundColor: '#e9ecef', color: '#333', 
                  border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                style={{ 
                  flex: 2, padding: '12px', backgroundColor: '#28c76f', color: '#fff', 
                  border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              {secretClickCount >= 5 && (
                <button 
                  onClick={() => setIsEditing(true)}
                  style={{ 
                    flex: 1, padding: '12px', backgroundColor: '#7367f0', color: '#fff', 
                    border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Edit History
                </button>
              )}
              <button 
                onClick={onClose}
                style={{ 
                  flex: 1, padding: '12px', backgroundColor: '#e9ecef', color: '#333', 
                  border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
