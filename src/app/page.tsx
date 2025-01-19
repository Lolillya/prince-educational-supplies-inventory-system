import Link from "next/link";

import { auth } from "~/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex max-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          {/* <LatestPost /> */}
          hello world
        </div>
      </main>
    </HydrateClient>
  );
}
