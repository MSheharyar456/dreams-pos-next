import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dreams POS Next.js",
  description: "POS - Bootstrap Admin Template migrated to Next.js",
};

import PageLoader from "@/components/layout/PageLoader";
import ScriptLoader from "@/components/layout/ScriptLoader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" type="image/x-icon" href="/assets/img/favicon.png" />
        <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/animate.css" />
        <link rel="stylesheet" href="/assets/css/dataTables.bootstrap4.min.css" />
        <link rel="stylesheet" href="/assets/plugins/fontawesome/css/fontawesome.min.css" />
        <link rel="stylesheet" href="/assets/plugins/fontawesome/css/all.min.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
      </head>
      <body suppressHydrationWarning>
        <Suspense fallback={null}>
          <PageLoader />
        </Suspense>
        {children}
        <ScriptLoader />
      </body>
    </html>
  );
}



