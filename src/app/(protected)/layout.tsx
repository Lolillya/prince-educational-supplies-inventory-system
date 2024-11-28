import { SessionProvider } from "next-auth/react";
import { Poppins } from "next/font/google";
import { ReactNode } from "react";
import { auth } from "~/auth";
import Sidebar from "~/components/sidebar";

import { HydrateClient } from "~/trpc/server";

interface AdminLayoutProps {
  children: ReactNode;
}

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const AdminLayout: React.FC<AdminLayoutProps> = async ({ children }) => {
  const session = await auth();
  return (
    <HydrateClient>
      <section
        className={`relative flex max-h-[100vh] max-w-[100vw] ${poppins.className}`}
      >
        <SessionProvider session={session}>
          <Sidebar />
          {children}
        </SessionProvider>
      </section>
    </HydrateClient>
  );
};

export default AdminLayout;
