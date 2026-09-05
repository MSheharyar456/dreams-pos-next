import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import DataTableInit from "@/components/ui/DataTableInit";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div id="global-loader" style={{ display: "none" }}>
        <div className="whirly-loader"> </div>
      </div>
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content">
            {children}
            <DataTableInit />
          </div>
        </div>
      </div>
    </>
  );
}
