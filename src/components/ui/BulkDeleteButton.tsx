'use client';

import { useTransition, useEffect, useState } from 'react';

export default function BulkDeleteButton({ 
  onDelete 
}: { 
  onDelete: (ids: string[]) => Promise<{success?: boolean, error?: string}> 
}) {
  const [isPending, startTransition] = useTransition();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // We attach an event listener to the document to listen for changes on any .datanew checkboxes
    const handleCheckboxChange = () => {
      const $ = (window as any).$;
      if ($) {
        const checkedBoxes = $('.datanew tbody input[type="checkbox"]:checked');
        setIsVisible(checkedBoxes.length > 0);
      }
    };

    // Listen to change events using event delegation
    document.addEventListener('change', handleCheckboxChange);
    return () => document.removeEventListener('change', handleCheckboxChange);
  }, []);

  const handleBulkDelete = () => {
    const $ = (window as any).$;
    const Swal = (window as any).Swal;

    if (!$ || !Swal) return;

    // Find all checked checkboxes in the datatable (excluding the select-all header)
    const checkedBoxes = $('.datanew tbody input[type="checkbox"]:checked');
    if (checkedBoxes.length === 0) {
      Swal.fire({
        title: "No items selected",
        text: "Please select at least one item to delete.",
        type: "info",
        confirmButtonClass: "btn btn-primary",
        buttonsStyling: false
      });
      return;
    }

    // Extract IDs from data attributes or hidden inputs next to them
    const ids: string[] = [];
    const rows: any[] = [];

    checkedBoxes.each(function(this: HTMLElement) {
      const row = $(this).closest('tr');
      const idInput = row.find('input[name="id"]');
      if (idInput.length > 0) {
        ids.push(idInput.val());
        rows.push(row);
      }
    });

    if (ids.length === 0) return;

    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${ids.length} items!`,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete them!",
      confirmButtonClass: "btn btn-primary",
      cancelButtonClass: "btn btn-danger ml-1",
      buttonsStyling: false
    }).then((t: any) => {
      if (t.value) {
        // Visually remove rows instantly
        rows.forEach(r => r.fadeOut(400));
        
        // Execute server action in background
        startTransition(async () => {
          await onDelete(ids);
          Swal.fire({ 
            type: "success", 
            title: "Deleted!", 
            text: "Your items have been deleted.", 
            confirmButtonClass: "btn btn-success" 
          });
        });
      }
    });
  };

  if (!isVisible) return null;

  return (
    <li>
      <a 
        href="#" 
        onClick={(e) => { e.preventDefault(); handleBulkDelete(); }}
        data-bs-toggle="tooltip" 
        data-bs-placement="top" 
        title="Delete Selected"
        style={{ opacity: isPending ? 0.5 : 1, pointerEvents: isPending ? 'none' : 'auto' }}
      >
        <img src="/assets/img/icons/delete.svg" alt="img" />
      </a>
    </li>
  );
}
