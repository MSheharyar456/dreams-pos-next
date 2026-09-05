'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function DataTableInit() {
  const pathname = usePathname();

  useEffect(() => {
    // Small delay to ensure the DOM is fully rendered by Next.js Server Components
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).$) {
        const $ = (window as any).$;
        
        $('.datanew').each(function(this: HTMLTableElement) {
          const columnCount = this.tHead?.rows[0]?.cells.length || 0;
          const hasCompatibleRows = Array.from(this.tBodies).every((body) =>
            Array.from(body.rows).every((row) => row.cells.length === columnCount)
          );

          // DataTables cannot initialize a tbody row using colSpan. Leave these
          // template tables alone rather than crashing the dashboard on navigation.
          if (!columnCount || !hasCompatibleRows) return;

          const $table = $(this);
          if ($.fn.DataTable.isDataTable(this)) {
            $table.DataTable().destroy();
          }

          const table = $table.DataTable({
            "destroy": true,
            "bFilter": true,
            "sDom": 'fBtlpi',
            'pagingType': 'numbers',
            "ordering": true,
            "language": {
              search: ' ',
              sLengthMenu: '_MENU_',
              searchPlaceholder: "Search...",
              info: "_START_ - _END_ of _TOTAL_ items",
            },
            "buttons": [
              { extend: 'pdfHtml5', className: 'd-none' },
              { extend: 'excelHtml5', className: 'd-none' },
              { extend: 'print', className: 'd-none' }
            ],
            initComplete: (settings: any, json: any) => {
              $('.dataTables_filter').appendTo('#tableSearch');
              $('.dataTables_filter').appendTo('.search-input');
            },
          });

          // Unbind first to prevent multiple triggers on soft-navigation
          $('a[title="pdf"]').off('click').on('click', function(e: any) { e.preventDefault(); table.button(0).trigger(); });
          $('a[title="excel"]').off('click').on('click', function(e: any) { e.preventDefault(); table.button(1).trigger(); });
          $('a[title="print"]').off('click').on('click', function(e: any) { e.preventDefault(); table.button(2).trigger(); });
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
