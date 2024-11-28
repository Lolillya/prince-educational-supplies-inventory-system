import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { auth } from "~/auth";
import Sidebar from "~/components/sidebar";
import { HydrateClient } from "~/trpc/server";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = async ({ children }) => {
  const session = await auth();
  return (
    <HydrateClient>
      <section className="relative flex max-h-[100vh] max-w-[100vw]">
        <SessionProvider session={session}>
          <Sidebar />
          {children}
        </SessionProvider>
      </section>
    </HydrateClient>
  );
};

export default AdminLayout;
