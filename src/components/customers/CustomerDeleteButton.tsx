'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCustomer } from '@/app/actions/customers';

export default function CustomerDeleteButton({ id, name }: { id: string; name: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const Swal = (window as any).Swal;
    const warning = `This permanently deletes ${name}, their sales and returns, customer loans and ledgers, and customer payments. Related inventory movements will also be removed.`;
    const confirmed = Swal
      ? (await Swal.fire({
          title: 'Delete customer and all their records?',
          text: warning,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Delete customer and records',
          cancelButtonText: 'Cancel',
        })).isConfirmed
      : window.confirm(warning);

    if (!confirmed) return;

    setIsDeleting(true);
    const result = await deleteCustomer(id);
    setIsDeleting(false);

    if (!result.success) {
      if (Swal) {
        await Swal.fire({ title: 'Customer was not fully deleted', text: result.error, icon: 'error' });
      } else {
        window.alert(result.error || 'Failed to delete customer.');
      }
      return;
    }

    if (Swal) {
      await Swal.fire({ title: 'Deleted', text: 'Customer and linked records were deleted.', icon: 'success' });
    }
    router.refresh();
  };

  return (
    <button
      type="button"
      className="border-0 bg-transparent p-0"
      onClick={handleDelete}
      disabled={isDeleting}
      aria-label={`Delete customer ${name} and linked records`}
      title={isDeleting ? 'Deleting customer…' : 'Delete customer and linked records'}
    >
      <img src="/assets/img/icons/delete.svg" alt="Delete" />
    </button>
  );
}
