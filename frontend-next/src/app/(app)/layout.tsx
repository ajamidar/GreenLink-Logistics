import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pt-16 md:pl-64 md:pt-0">
      <Sidebar />
      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}
