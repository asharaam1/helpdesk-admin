"use client";
import { useState } from "react";
import RoleManagement from "@/app/components/settings/RoleManagement";
import UsersData from "@/app/components/settings/UsersData";
import ExportUsersData from "@/app/components/settings/ExportUsersData";


const tabs = [
  { id: "role", label: "Role Management" },
  { id: "Users data", label: "Users data" },
  { id: "Other settings", label: "Other settings" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("role");

  const renderTabContent = () => {
    switch (activeTab) {
      case "role":
        return <RoleManagement />;
      case "Users data":
        return <UsersData />; 
      case "Other settings":
        return <ExportUsersData />; 
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-semibold mb-6">Admin Settings</h1>

     
      <div className="flex space-x-4 border-b border-gray-300">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      
      <div className="pt-4">
        {renderTabContent()}
      </div>
    </div>
  );
}
