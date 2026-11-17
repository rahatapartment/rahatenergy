import { currentAdmin } from "@/lib/admin-auth";
import { AdminProvider } from "@/components/admin/AdminProvider";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminProvider actor={await currentAdmin()}>{children}</AdminProvider>;
}
