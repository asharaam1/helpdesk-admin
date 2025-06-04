"use client"
import { usePathname } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header"

export default function layout({ children }) {
  const name = usePathname();
  const pageName = name.split("admin")[1].split("/")[1];
  
  return (
    <div className="md:flex">
        <div className="md:w-64 w-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col">
          <Header pageName={pageName} />
          <main className="flex-1 overflow-y-auto md:p-4 py-4">{children}</main>
        </div>
    </div>
  );
}
