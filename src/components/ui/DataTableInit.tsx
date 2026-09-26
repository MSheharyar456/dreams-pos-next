'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function DataTableInit() {
  const pathname = usePathname();

  useEffect(() => {
    const initializeTables = () => {
      const jquery = (window as any).$;
      if (!jquery || typeof jquery.fn?.DataTable !== 'function') return;

      const $ = jquery;
      const listControlsPath = pathname === '/sales' || pathname === '/purchases';
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
            ...(listControlsPath ? {
              pageLength: 10,
              lengthMenu: [[5, 10, 20, 50], [5, 10, 20, 50]],
              pagingType: 'simple_numbers',
              footerCallback: function (this: any) {
                const api = this.api();
                const visibleRows = api.rows({ page: 'current' }).nodes().toArray() as HTMLTableRowElement[];
                const footer = api.table().node().querySelector('tfoot') as HTMLElement | null;
                if (!footer) return;

                const rowAttributes: Record<string, string> = {
                  total: 'data-total-amount',
                  paid: 'data-paid-amount',
                  remaining: 'data-remaining-amount',
                };
                footer.querySelectorAll('[data-total-footer]').forEach((cell) => {
                  const footerCell = cell as HTMLElement;
                  const totalType = footerCell.dataset.totalFooter || '';
                  const attribute = rowAttributes[totalType];
                  if (!attribute) return;
                  const total = visibleRows.reduce((sum, row) => {
                    const amountCell = row.querySelector<HTMLElement>(`[${attribute}]`);
                    return sum + Number(amountCell?.getAttribute(attribute) || 0);
                  }, 0);
                  footerCell.textContent = `Rs. ${total.toFixed(2)}`;
                });
              },
            } : { pagingType: 'numbers' }),
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
    };

    const timer = window.setTimeout(initializeTables, 100);
    const handleScriptsReady = () => initializeTables();
    window.addEventListener('legacy-scripts-ready', handleScriptsReady);

    if ((window as Window & { __legacyScriptsReady?: boolean }).__legacyScriptsReady) {
      initializeTables();
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('legacy-scripts-ready', handleScriptsReady);
    };
  }, [pathname]);

  return null;
}
