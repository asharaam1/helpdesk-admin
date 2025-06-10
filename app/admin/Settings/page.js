"use client";
import RoleManagement from "@/app/components/settings/RoleManagement";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-12">
      <h1 className="text-3xl font-semibold mb-4">⚙️ Admin Settings</h1>


      <section>
        <h2 className="text-xl font-bold mb-2">Role Management</h2>
        <RoleManagement />
      </section>
    </div>
  );
}
