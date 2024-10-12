import { Poppins } from "next/font/google";
import { Button } from "~/components/ui/button";
import { RxMagnifyingGlass } from "react-icons/rx";
import { Input } from "~/components/ui/input";
import Filter_Icon from "public/icons/filter-icon2.svg";
import Image from "next/image";
import { api } from "~/trpc/server";
import UserInfo from "~/components/staff-userInfo";
import StaffSearchAndButtonRouter from "~/components/staff-seach-button";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const StaffPage = async () => {
  const staff = await api.staff.getAll();

  return (
    <section
      className={`h-screen w-screen px-10 pt-10 ${poppins.className} flex flex-col gap-3 overflow-y-scroll`}
    >
      <StaffSearchAndButtonRouter />

      <UserInfo staff={staff} />
    </section>
  );
};

export default StaffPage;
