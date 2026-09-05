'use client';

import React, { useState } from 'react';
import { formatSignedAmount } from '@/lib/finance';

type EditLoanModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, remarks: string) => Promise<void>;
  currentRemaining: number;
  type: 'customer' | 'supplier';
};

export default function EditLoanModal({ isOpen, onClose, onSubmit, currentRemaining, type }: EditLoanModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(Number(amount), remarks);
      setAmount('');
      setRemarks('');
      onClose();
    } catch (error) {
      console.error('Error submitting loan update:', error);
    } finally {
      setIsSubmitting(false);
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
        width: '100%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#333', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px', fontSize: '20px' }}>✏️</span>
            Edit {type === 'customer' ? 'Customer' : 'Supplier'} Loan
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#999', lineHeight: '1' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555', fontSize: '15px' }}>
              Current Remaining Balance: <span style={{ color: '#ea5455' }}>{formatSignedAmount(currentRemaining)}</span>
            </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>
              Amount to adjust balance
            </label>
            <input 
              type="number" 
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to adjust the current loan"
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>
              Transaction Details / Remarks
            </label>
            <textarea 
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Received via Cash, Paid via Bank Transfer, etc."
              rows={4}
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '15px', resize: 'vertical' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              width: '100%', padding: '14px', backgroundColor: '#28c76f', color: '#fff', 
              border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

      </div>
    </div>
  );
}
