'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteSupplier } from '@/app/actions/suppliers';

export default function SupplierDeleteButton({ id, name }: { id: string; name: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const Swal = (window as any).Swal;
    const warning = `This permanently deletes ${name}, its purchase invoices and returns, supplier loans and ledgers, and supplier payments. Related inventory movements will also be removed. Customer sales are not linked to a supplier and will remain.`;
    const confirmed = Swal
      ? (await Swal.fire({
          title: 'Delete supplier and all its records?',
          text: warning,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Delete supplier and records',
          cancelButtonText: 'Cancel',
        })).isConfirmed
      : window.confirm(warning);

    if (!confirmed) return;

    setIsDeleting(true);
    const result = await deleteSupplier(id);
    setIsDeleting(false);

    if (!result.success) {
      if (Swal) {
        await Swal.fire({ title: 'Supplier was not fully deleted', text: result.error, icon: 'error' });
      } else {
        window.alert(result.error || 'Failed to delete supplier.');
      }
      return;
    }

    if (Swal) {
      await Swal.fire({ title: 'Deleted', text: 'Supplier and linked records were deleted.', icon: 'success' });
    }
    router.refresh();
  };

  return (
    <button
      type="button"
      className="border-0 bg-transparent p-0"
      onClick={handleDelete}
      disabled={isDeleting}
      aria-label={`Delete supplier ${name} and linked records`}
      title={isDeleting ? 'Deleting supplier…' : 'Delete supplier and linked records'}
    >
      <img src="/assets/img/icons/delete.svg" alt="Delete" />
    </button>
  );
}
