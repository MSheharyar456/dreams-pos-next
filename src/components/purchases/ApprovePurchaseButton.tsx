'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';
import { approvePurchase } from '@/app/actions/purchases';

export default function ApprovePurchaseButton({ purchaseId }: { purchaseId: string }) {
  const [saving, setSaving] = useState(false);

  async function handleApprove() {
    const result = await Swal.fire({
      title: 'Approve POP?',
      text: 'This will add stock, apply supplier advance, and create the supplier ledger entry.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Approve',
    });
    if (!result.isConfirmed) return;
    setSaving(true);
    const response = await approvePurchase(purchaseId);
    setSaving(false);
    if (!response.success) {
      await Swal.fire('Approval failed', response.error || 'Please try again.', 'error');
      return;
    }
    await Swal.fire({ icon: 'success', title: 'POP approved', timer: 1200, showConfirmButton: false });
    window.location.reload();
  }

  return <button type="button" className="btn btn-sm btn-success" disabled={saving} onClick={handleApprove}>{saving ? 'Approving...' : 'Approve POP'}</button>;
}
