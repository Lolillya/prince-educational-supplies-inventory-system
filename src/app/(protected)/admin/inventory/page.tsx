import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const InventoryPage = () => {
  return (
    <section
      className={`h-auto w-screen p-5 ${poppins.className} m-10 mb-0 flex flex-col gap-3 overflow-y-scroll`}
    ></section>
  );
};

export default InventoryPage;
