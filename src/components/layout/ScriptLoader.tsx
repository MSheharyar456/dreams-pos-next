'use client';

import Script from 'next/script';

export default function ScriptLoader() {
  return (
    <>
      <Script src="/assets/js/jquery-3.6.0.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/jquery.dataTables.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/dataTables.bootstrap4.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/feather.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/jquery.slimscroll.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/assets/plugins/apexchart/apexcharts.min.js" strategy="afterInteractive" />
      <Script src="/assets/plugins/apexchart/chart-data.js" strategy="afterInteractive" />
      <Script src="/assets/plugins/sweetalert/sweetalert2.all.min.js" strategy="afterInteractive" />
      <Script src="/assets/plugins/sweetalert/sweetalerts.min.js" strategy="afterInteractive" />
      {/* DataTables Export Extensions */}
      <Script src="https://cdn.datatables.net/buttons/2.4.1/js/dataTables.buttons.min.js" strategy="afterInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js" strategy="afterInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js" strategy="afterInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js" strategy="afterInteractive" />
      <Script src="https://cdn.datatables.net/buttons/2.4.1/js/buttons.html5.min.js" strategy="afterInteractive" />
      <Script src="https://cdn.datatables.net/buttons/2.4.1/js/buttons.print.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/script.js" strategy="afterInteractive" />
    </>
  );
}
