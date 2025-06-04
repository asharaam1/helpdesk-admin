"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../context/useContext";
import { ArrowLeft, Bell, LogOut, User } from "lucide-react";

const Header = ({ pageName }) => {
  const { user } = useAppContext();
  const [showDropdown, setShowDropdown] = useState(false);

  const router = useRouter();

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  return (
    <header className="flex justify-between items-center px-4 py-4 bg-white border-b">
      <h1 className="text-xl md:pl-0 pl-10 flex items-center gap-2 font-[SairaSemibold]"><ArrowLeft size={18} className="md:block hidden cursor-pointer" onClick={() => router.back()} /> {pageName}</h1>
      {/* <div className="flex items-center gap-6 relative">
        <button>
          <Bell />
        </button>
        <div>
          {user?.photoURL && (
            <img
              src={user?.photoURL}
              alt="User Avatar"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={toggleDropdown}
            />
          )}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg">
              <ul>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <Link href="/admin/Account" className="flex items-center gap-2"><User size={20} /> Profile</Link>
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut size={20} /> Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div> */}
    </header>
  );
};

export default Header;