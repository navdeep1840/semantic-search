import { searchPokedex } from "@/app/actions";
import ExpandingArrow from "@/components/expanding-arrow";
import { Search } from "@/components/search";
import Image from "next/image";
import Link from "next/link";

// Prisma does not support Edge without the Data Proxy currently
export const runtime = "nodejs"; // default
export const preferredRegion = "home";
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="bg-white/30 p-6 lg:p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-xl mx-auto w-full">
        <div className="divide-y divide-gray-900/5">
          <Search searchPokedex={searchPokedex} />
        </div>
      </div>
    </main>
  );
}
