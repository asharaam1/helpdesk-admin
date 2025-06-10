"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Home,
  Box,
  Users,
  FileText,
  PieChart,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Watch,
  Tag,
  Menu,
  X,
  ScrollText,
  CalendarCheck,
  HandHeart,
  Aperture,
  Building,
  Contact,
  UserPlus,
  Bell,
  Settings2
} from "lucide-react";
import { auth } from "../utils/firebaseConfig";
import { usePathname, useRouter } from "next/navigation";

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const router = useRouter();
  const path = usePathname();
  const pageName = path.split("/").pop();

  const menuItems = [
    { name: "Dashboard", icon: Home, link: "/admin/Dashboard", path: "Dashboard" },
    { name: "Services", icon: Box, link: "/admin/Services", path: "Services" },
    // { name: "Facilities", icon: Building, link: "/admin/Facilities", path: "Facilities" },
    // { name: "Doctor List", icon: ScrollText, link: "/admin/DoctorList", path: "DoctorsList" },
    // { name: "Staff", icon: Users, link: "/admin/Staff", path: "Staff" },
    { name: "Patients History", icon: Users, link: "/admin/Patients", path: "Patients" },
    { name: "Appointments", icon: FileText, link: "/admin/Appointments", path: "Appointments" },
    { name: "Events", icon: CalendarCheck, link: "/admin/Events", path: "Events" },
    { name: "Donations", icon: HandHeart, link: "/admin/Donations", path: "Donations" },
    { name: "Web Info", icon: Aperture, link: "/admin/WebThings", path: "WebThings"  },
    { name: "Contact Inqueries", icon: Contact, link: "/admin/ContactInqueries", path: "ContactInqueries" },
    { name: "Web Subscribers", icon: UserPlus, link: "/admin/Subscribers", path: "Subscribers" },
    { name: "Notifications", icon: Bell, link: "/admin/Notification", path: "Notification" },
    { name: "Users", icon: Users, link: "/admin/Users", path: "Users" },
    { name: "Settings", icon: Settings2, link: "/admin/Settings", path: "Settings" },

  ];

  const handleMenuClick = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    auth.signOut();
    localStorage.removeItem("user");
    router.push("/auth/Login");
  };

  return (
    <div>
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="block md:hidden p-2 text-gray-700 md:fixed absolute top-3 left-2 z-10"
      >
        {/* {isSidebarOpen ? <X size={32} /> : <Menu size={24} color="black" />} */}
        <Menu size={24} color="black" />
      </button>

      <aside
          className={`fixed top-0 left-0 w-64 overflow-y-auto flex flex-col border-r h-full z-40 bg-white transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div onClick={() => setIsSidebarOpen(!isSidebarOpen)} className=" md:hidden fixed top-3 left-4">
          <X size={32} /> 
        </div>

        <div className="p-8">
          <img src="/mmt-logo-processed.png" alt="Logo" />
        </div>

        <nav className="flex-1">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.link}
              onClick={handleMenuClick}
              className={`flex items-center gap-4 px-6 cursor-pointer md:py-3 py-4 text-sm font-[SairaMedium] ${
                pageName === item.path
                  ? "bg-gray-50"
                  : ""
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-6">
          <button
            className="flex items-center font-[SairaMedium] gap-4 hover:text-red-500 text-sm "
            onClick={handleLogout}
          >
            <LogOut size={20} />
            Log out
          </button>
        </div>
      </aside>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;
