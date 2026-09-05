'use client';

import React, { useState } from 'react';
import EditLoanModal from './EditLoanModal';
import { deleteLoanLedger, updateLoanBalance } from '@/app/actions/loans';

type EditLoanButtonProps = {
  ledgerId: string;
  currentRemaining: number;
  type: 'customer' | 'supplier';
};

export default function EditLoanButton({ ledgerId, currentRemaining, type }: EditLoanButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdate = async (amount: number, remarks: string) => {
    const res = await updateLoanBalance(type, ledgerId, amount, remarks);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error || 'Failed to update balance');
    }
  };

  const handleDelete = async () => {
    const Swal = (window as Window & {
      Swal?: {
        fire: (options: Record<string, unknown>) => Promise<{ isConfirmed: boolean }>;
      };
    }).Swal;

    if (Math.abs(currentRemaining) > 0.009) {
      if (Swal) {
        await Swal.fire({
          icon: 'warning',
          title: 'Loan not cleared',
          text: 'This loan cannot be deleted until the remaining balance is fully cleared.',
          confirmButtonText: 'OK'
        });
      } else {
        alert('This loan cannot be deleted until the remaining balance is fully cleared.');
      }
      return;
    }

    if (!Swal) {
      if (window.confirm('Are you sure you want to delete this cleared loan?')) {
        const res = await deleteLoanLedger(type, ledgerId);
        if (res.success) {
          window.location.reload();
        } else {
          alert(res.error || 'Failed to delete loan');
        }
      }
      return;
    }

    const result = await Swal.fire({
      title: 'Delete cleared loan?',
      text: 'This action will permanently remove this loan record.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) {
      return;
    }

    const res = await deleteLoanLedger(type, ledgerId);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error || 'Failed to delete loan');
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
      <a 
        href="#" 
        onClick={(e) => {
          e.preventDefault();
          setIsModalOpen(true);
        }}
        aria-label="Edit loan"
      >
        <img src="/assets/img/icons/edit.svg" alt="img" />
      </a>

      <button
        type="button"
        onClick={handleDelete}
        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
        aria-label="Delete loan"
      >
        <img src="/assets/img/icons/delete.svg" alt="delete" />
      </button>
      
      <EditLoanModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleUpdate}
        currentRemaining={currentRemaining}
        type={type}
      />
    </div>
  );
}
