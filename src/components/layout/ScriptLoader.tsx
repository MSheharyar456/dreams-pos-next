'use client';

import { useState } from 'react';
import Script from 'next/script';

const scripts = [
  '/assets/js/jquery-3.6.0.min.js',
  '/assets/js/jquery.dataTables.min.js',
  '/assets/js/dataTables.bootstrap4.min.js',
  '/assets/js/feather.min.js',
  '/assets/js/jquery.slimscroll.min.js',
  '/assets/js/bootstrap.bundle.min.js',
  '/assets/plugins/apexchart/apexcharts.min.js',
  '/assets/plugins/apexchart/chart-data.js',
  '/assets/plugins/sweetalert/sweetalert2.all.min.js',
  '/assets/plugins/sweetalert/sweetalerts.min.js',
  'https://cdn.datatables.net/buttons/2.4.1/js/dataTables.buttons.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js',
  'https://cdn.datatables.net/buttons/2.4.1/js/buttons.html5.min.js',
  'https://cdn.datatables.net/buttons/2.4.1/js/buttons.print.min.js',
  '/assets/js/script.js',
];

export default function ScriptLoader() {
  const [loadedCount, setLoadedCount] = useState(0);

  return (
    <>
      {scripts.slice(0, loadedCount + 1).map((src, index) => (
        <Script
          key={src}
          src={src}
          strategy="afterInteractive"
          onLoad={() => {
            if (index === loadedCount) {
              if (index === scripts.length - 1) {
                (window as Window & { __legacyScriptsReady?: boolean }).__legacyScriptsReady = true;
                window.dispatchEvent(new Event('legacy-scripts-ready'));
              }
              setLoadedCount((count) => count + 1);
            }
          }}
        />
      ))}
    </>
  );
}