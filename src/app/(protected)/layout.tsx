import { ReactNode } from "react";
import Sidebar from "~/components/ui/sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <section className="relative flex max-h-[100vh] max-w-[100vw]">
      <Sidebar />
      {children}
    </section>
  );
};

export default AdminLayout;
