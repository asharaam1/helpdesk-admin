"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/utils/firebaseConfig";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

const Userpage = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [Email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [showUserDetails, setShowUserDetails] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [userRole, setUserRole] = useState("user");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userActivity, setUserActivity] = useState({});
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [showExportModal, setShowExportModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [roles] = useState(["admin", "donor", "needy"]);
  const [selectedRole, setSelectedRole] = useState("user");

  const categories = [
    "all",
    ...new Set(data.map((item) => item.category).filter(Boolean)),
  ];

  useEffect(() => {
    getUsers();
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const activityInterval = setInterval(() => {
        updateUserActivity();
      }, 30000);
      return () => clearInterval(activityInterval);
    }
  }, [isClient, data]);

  const updateUserActivity = () => {
    const newActivity = {};
    data.forEach((user) => {
      const isActive = Math.random() > 0.2;
      newActivity[user.id] = {
        lastActive: new Date().toLocaleString(),
        status: isActive ? "active" : "idle",
      };
    });
    setUserActivity(newActivity);
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;

    try {
      switch (action) {
        case "delete":
          await Promise.all(
            selectedUsers.map((userId) => deleteDoc(doc(db, "users", userId)))
          );
          break;
        case "activate":
          await Promise.all(
            selectedUsers.map((userId) =>
              updateDoc(doc(db, "users", userId), { status: "Active" })
            )
          );
          break;
        case "deactivate":
          await Promise.all(
            selectedUsers.map((userId) =>
              updateDoc(doc(db, "users", userId), { status: "Inactive" })
            )
          );
          break;
        default:
          break;
      }
      getUsers();
      setSelectedUsers([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  const handleExport = async (format) => {
    try {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Merge userActivity with users data for export
      const exportUsers = users.map((user) => ({
        ...user,
        lastActive: userActivity[user.id]?.lastActive || user.lastActive, // Use real-time activity if available
      }));

      if (format === "csv") {
        const csv = convertToCSV(exportUsers);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
      } else if (format === "excel") {
        const excel = convertToExcel(exportUsers);
        const blob = new Blob([excel], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `users_${new Date().toISOString().split("T")[0]}.xlsx`;
        link.click();
      }
    } catch (error) {
      console.error("Error exporting users:", error);
    }
  };

  const convertToCSV = (data) => {
    const headers = [
      "Name",
      "Email",
      "Category",
      "Role",
      "Status",
      "Last Active",
      "Created At",
    ];
    const rows = data.map((user) => [
      `"${user.fullName || ""}"`,
      `"${user.email || ""}"`,
      `"${user.category || ""}"`,
      `"${user.role || ""}"`,
      `"${user.status || ""}"`,
      `"${user.lastActive ? new Date(user.lastActive).toLocaleString() : ""}"`,
      `"${
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""
      }"`,
    ]);
    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  };

  const convertToExcel = (data) => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Convert data to worksheet format
      const wsData = data.map((user) => ({
        Name: user.fullName || "",
        Email: user.email || "",
        Category: user.category || "",
        Role: user.role || "",
        Status: user.status || "",
        "Last Active": user.lastActive
          ? new Date(user.lastActive).toLocaleString()
          : "",
        "Created At": user.createdAt
          ? new Date(user.createdAt).toLocaleDateString()
          : "",
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(wsData);

      // Add basic styling for headers if possible using xlsx library (limited)
      // Auto-width columns
      const wscols = Object.keys(wsData[0] || {}).map((key) => ({
        wch:
          Math.max(
            key.length,
            ...wsData.map((row) => (row[key] ? String(row[key]).length : 0))
          ) + 2,
      }));
      ws["!cols"] = wscols;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Users");

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      return new Uint8Array(excelBuffer);
    } catch (error) {
      console.error("Error converting to Excel:", error);
      throw error;
    }
  };

  const updateUserRole = async (userId, newRole) => {
    if (!userId || !newRole) {
      alert("Invalid user or role selected");
      return;
    }

    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      getUsers();
      setShowRoleModal(false);
      alert("User role updated successfully");
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role. Please try again.");
    }
  };

  const submitDetails = async () => {
    if (!name || !Email || !category) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "users"), {
        name: name,
        email: Email,
        category: category,
        createdAt: new Date().toISOString(),
        status: "Active",
        lastActive: new Date().toISOString(),
      });
      console.log("Document written with ID: ", docRef.id);
      setShowAddModal(false);
      getUsers();
      // Clear form
      setName("");
      setEmail("");
      setCategory("");
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Failed to add user. Please try again.");
    }
  };

  const getUsers = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      setData(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      // Add user-friendly error handling
      alert("Failed to fetch users. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...data].sort((a, b) => {
    if (sortConfig.direction === "asc") {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  const filteredUsers = sortedUsers.filter((item) => {
    const matchesSearch =
      (item.fullName?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (item.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;

    // Status filter with improved handling
    const itemStatus = item.status?.toLowerCase() || "inactive";
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && itemStatus === "active") ||
      (statusFilter === "inactive" &&
        (itemStatus === "inactive" || !item.status));

    // Date filter with improved handling
    const itemDate = item.createdAt ? new Date(item.createdAt) : new Date();
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" && itemDate >= startOfToday) ||
      (dateFilter === "week" && itemDate >= startOfWeek) ||
      (dateFilter === "month" && itemDate >= startOfMonth);

    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    if (!status) {
      return "bg-gradient-to-r from-red-500/10 to-red-600/10 text-red-500 border border-red-500/20";
    }

    switch (status.toLowerCase()) {
      case "active":
        return "bg-gradient-to-r from-green-500/10 to-green-600/10 text-green-500 border border-green-500/20";
      case "inactive":
        return "bg-gradient-to-r from-red-500/10 to-red-600/10 text-red-500 border border-red-500/20";
      case "pending":
        return "bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 text-yellow-500 border border-yellow-500/20";
      default:
        return "bg-gradient-to-r from-red-500/10 to-red-600/10 text-red-500 border border-red-500/20";
    }
  };

  const handleUserClick = (username) => {
    router.push(`/admin/Users/${username.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#343434] via-black to-[#343434] py-8 px-4  sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ff5528]/5 to-transparent"></div>

      <div className="max-w-7xl mx-auto relative">
        <div className="bg-[#343434]/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-[#ff5528]/20 transform transition-all duration-300 hover:shadow-[#ff5528]/10 relative">
          <div className="bg-gradient-to-r from-[#ff5528] via-[#ff7d5a] to-[#ff5528] px-6 py-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10"></div>
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="transform transition-all duration-300 hover:scale-105">
                <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
                  User Management
                </h1>
                <p className="mt-2 text-white/90 text-lg">
                  Manage your users efficiently
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleExport(exportFormat)}
                  disabled={isExporting}
                  className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center gap-2 group hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-white/10"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 transform group-hover:translate-y-[-2px] transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Export
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-black/80 transition-all duration-300 flex items-center gap-2 group hover:scale-105 transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-[#ff5528]/20"
                >
                  <svg
                    className="w-4 h-4 transform group-hover:rotate-90 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add User
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-6 bg-black/30 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
            <div className="bg-gradient-to-br from-[#343434] to-black p-4 rounded-lg border border-[#ff5528]/20 hover:border-[#ff5528]/40 transition-all duration-300 group hover:scale-105 transform hover:translate-y-[-2px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff5528]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {data.length}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-[#ff5528]/20 to-[#ff7d5a]/20 rounded-full group-hover:from-[#ff5528]/30 group-hover:to-[#ff7d5a]/30 transition-all duration-300">
                    <svg
                      className="w-6 h-6 text-[#ff5528]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#343434] to-black p-4 rounded-lg border border-[#ff5528]/20 hover:border-[#ff5528]/40 transition-all duration-300 group hover:scale-105 transform hover:translate-y-[-2px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {data.filter((user) => user.status === "Active").length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#ff5528]/20 to-[#ff7d5a]/20 rounded-full group-hover:from-[#ff5528]/30 group-hover:to-[#ff7d5a]/30 transition-all duration-300">
                  <svg
                    className="w-6 h-6 text-[#ff5528]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#343434] to-black p-4 rounded-lg border border-[#ff5528]/20 hover:border-[#ff5528]/40 transition-all duration-300 group hover:scale-105 transform hover:translate-y-[-2px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Categories</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {new Set(data.map((user) => user.category)).size}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#ff5528]/20 to-[#ff7d5a]/20 rounded-full group-hover:from-[#ff5528]/30 group-hover:to-[#ff7d5a]/30 transition-all duration-300">
                  <svg
                    className="w-6 h-6 text-[#ff5528]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#343434] to-black p-4 rounded-lg border border-[#ff5528]/20 hover:border-[#ff5528]/40 transition-all duration-300 group hover:scale-105 transform hover:translate-y-[-2px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Now</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {
                      Object.values(userActivity).filter(
                        (activity) => activity.status === "active"
                      ).length
                    }
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#ff5528]/20 to-[#ff7d5a]/20 rounded-full group-hover:from-[#ff5528]/30 group-hover:to-[#ff7d5a]/30 transition-all duration-300">
                  <svg
                    className="w-6 h-6 text-[#ff5528]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-[#343434] border-b border-[#ff5528]/20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
            <div className="relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 w-full">
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg focus:ring-2 focus:ring-[#ff5528] focus:border-[#ff5528] text-white placeholder-gray-400 transition-all duration-300 group-hover:border-[#ff5528]/40 shadow-lg shadow-black/20"
                    />
                    <div className="absolute left-3 top-2.5">
                      <svg
                        className="h-5 w-5 text-[#ff5528] transform group-hover:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg focus:ring-2 focus:ring-[#ff5528] focus:border-[#ff5528] text-white transition-all duration-300 hover:border-[#ff5528]/40 shadow-lg shadow-black/20"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#343434]">
                        {cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg text-[#ff5528] hover:bg-[#ff5528]/10 transition-all duration-300 flex items-center gap-2 group hover:scale-105 transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-[#ff5528]/10"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Export
                  </button>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg text-[#ff5528] hover:bg-[#ff5528]/10 transition-all duration-300 flex items-center gap-2 group hover:scale-105 transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-[#ff5528]/10"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    Filters
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg focus:ring-2 focus:ring-[#ff5528] focus:border-[#ff5528] text-white transition-all duration-300 hover:border-[#ff5528]/40 shadow-lg shadow-black/20"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg focus:ring-2 focus:ring-[#ff5528] focus:border-[#ff5528] text-white transition-all duration-300 hover:border-[#ff5528]/40 shadow-lg shadow-black/20"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="px-6 py-3 bg-black/30 border-b border-[#ff5528]/20">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-300">
                  {selectedUsers.length} users selected
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction("activate")}
                    className="px-3 py-1.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-all duration-200"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction("deactivate")}
                    className="px-3 py-1.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/20 transition-all duration-200"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleBulkAction("delete")}
                    className="px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto relative">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff5528]"></div>
              </div>
            ) : viewMode === "table" ? (
              <table className="min-w-full divide-y divide-[#ff5528]/20">
                <thead className="bg-black/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === data.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(data.map((user) => user.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        className="form-checkbox h-4 w-4 text-[#ff5528] border-gray-300 rounded focus:ring-[#ff5528] transition duration-150 ease-in-out"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#343434] divide-y divide-[#ff5528]/20">
                  {filteredUsers.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-black/30 transition-all duration-200 group relative"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, item.id]);
                            } else {
                              setSelectedUsers(
                                selectedUsers.filter((id) => id !== item.id)
                              );
                            }
                          }}
                          className="form-checkbox h-4 w-4 text-[#ff5528] border-gray-300 rounded focus:ring-[#ff5528] transition duration-150 ease-in-out"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#ff5528] to-[#ff7d5a] flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 shadow-lg shadow-[#ff5528]/20">
                              <span className="text-white font-medium text-lg">
                                {item.fullName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <button
                              onClick={() => handleUserClick(item.fullName)}
                              className="text-sm font-medium text-white group-hover:text-[#ff5528] transition-colors duration-200 hover:underline"
                            >
                              {item.fullName}
                            </button>
                            <div className="text-xs text-gray-400">
                              Added date:{" "}
                              {item.createdAt
                                ? new Date(
                                    item.createdAt.seconds
                                      ? item.createdAt.seconds * 1000
                                      : item.createdAt
                                  ).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  })
                                : "Unknown"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {item.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#ff5528]/10 text-[#ff5528]">
                          {item.category
                            ? item.category.charAt(0).toUpperCase() +
                              item.category.slice(1)
                            : "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-500">
                          {item.role || "user"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status &&
                          item.status.toLowerCase() === "active" ? (
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                          {item.status && item.status.toLowerCase() === "active"
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(item);
                              setShowRoleModal(true);
                            }}
                            className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(item);
                              setShowActivityModal(true);
                            }}
                            className="text-purple-500 hover:text-purple-600 transition-colors duration-200"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                          </button>
                          <button className="text-red-500 hover:text-red-600 transition-colors duration-200">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {filteredUsers.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-[#343434] to-black rounded-lg border border-[#ff5528]/20 hover:border-[#ff5528]/40 transition-all duration-300 group hover:scale-105 transform hover:translate-y-[-2px] relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ff5528]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="p-4 relative">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#ff5528] to-[#ff7d5a] flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 shadow-lg shadow-[#ff5528]/20">
                          <span className="text-white font-medium text-lg">
                            {item.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-white group-hover:text-[#ff5528] transition-colors duration-200">
                            {item.fullName}
                          </h3>
                          <p className="text-sm text-gray-400">{item.email}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#ff5528]/10 text-[#ff5528]">
                          {item.category
                            ? item.category.charAt(0).toUpperCase() +
                              item.category.slice(1)
                            : "Uncategorized"}
                        </span>
                        <span
                          className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status &&
                          item.status.toLowerCase() === "active" ? (
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                          {item.status && item.status.toLowerCase() === "active"
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-end gap-2">
                        <button className="p-2 text-[#ff5528] hover:text-[#ff7d5a] transition-colors duration-200">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button className="p-2 text-red-500 hover:text-red-600 transition-colors duration-200">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#343434] px-6 py-4 border-t border-[#ff5528]/20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-300">
                Showing{" "}
                <span className="font-medium text-white">
                  {filteredUsers.length}
                </span>{" "}
                of <span className="font-medium text-white">{data.length}</span>{" "}
                results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-[#ff5528]/20 rounded-md text-sm font-medium text-[#ff5528] hover:bg-[#ff5528]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-lg hover:shadow-[#ff5528]/10"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage * itemsPerPage >= filteredUsers.length}
                  className="px-3 py-1 border border-[#ff5528]/20 rounded-md text-sm font-medium text-[#ff5528] hover:bg-[#ff5528]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-lg hover:shadow-[#ff5528]/10"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-[#343434] to-black rounded-lg p-6 w-full max-w-md border border-[#ff5528]/20 transform transition-all duration-300 hover:shadow-[#ff5528]/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5"></div>
            <div className="relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Export Users</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Export Format
                  </label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg focus:ring-2 focus:ring-[#ff5528] focus:border-[#ff5528] text-white transition-all duration-300"
                  >
                    <option value="csv">CSV</option>
                    <option value="excel">Excel</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 border border-[#ff5528]/20 rounded-lg text-[#ff5528] hover:bg-[#ff5528]/10 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleExport(exportFormat)}
                    disabled={isExporting}
                    className="px-4 py-2 bg-gradient-to-r from-[#ff5528] to-[#ff7d5a] text-white rounded-lg hover:from-[#ff7d5a] hover:to-[#ff5528] transition-all duration-200"
                  >
                    {isExporting ? "Exporting..." : "Export"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-[#343434] to-black rounded-lg p-6 w-full max-w-md border border-[#ff5528]/20 transform transition-all duration-300 hover:shadow-[#ff5528]/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5"></div>
            <div className="relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  Manage User Role
                </h2>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Role
                  </label>
                  <select
                    value={selectedUser.role || "user"}
                    onChange={(e) =>
                      updateUserRole(selectedUser.id, e.target.value)
                    }
                    className="w-full px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg focus:ring-2 focus:ring-[#ff5528] focus:border-[#ff5528] text-white transition-all duration-300"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role} className="bg-[#343434]">
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showActivityModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-[#343434] to-black rounded-lg p-6 w-full max-w-md border border-[#ff5528]/20 transform transition-all duration-300 hover:shadow-[#ff5528]/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5"></div>
            <div className="relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">User Activity</h2>
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-black/30 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-2">
                    {selectedUser.name}
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300">
                      <span className="text-gray-400">Status:</span>{" "}
                      {isClient ? (
                        <span
                          className={`${
                            userActivity[selectedUser.id]?.status === "active"
                              ? "text-green-500"
                              : "text-yellow-500"
                          }`}
                        >
                          {userActivity[selectedUser.id]?.status || "Unknown"}
                        </span>
                      ) : (
                        "Loading..."
                      )}
                    </p>
                    <p className="text-sm text-gray-300">
                      <span className="text-gray-400">Last Active:</span>{" "}
                      {isClient
                        ? userActivity[selectedUser.id]?.lastActive
                          ? new Date(
                              userActivity[selectedUser.id].lastActive
                            ).toLocaleString()
                          : "N/A"
                        : "Loading..."}
                    </p>
                    <p className="text-sm text-gray-300">
                      <span className="text-gray-400">Role:</span>{" "}
                      {selectedUser.role || "user"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-[#343434] to-black rounded-lg p-6 w-full max-w-md border border-[#ff5528]/20 transform transition-all duration-300 hover:shadow-[#ff5528]/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5"></div>
            <div className="relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Add New User</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitDetails();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg focus:ring-2 focus:ring-[#ff5528] focus:border-[#ff5528] text-white placeholder-gray-400 transition-all duration-300 shadow-lg shadow-black/20"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={Email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg focus:ring-2 focus:ring-[#ff5528] focus:border-[#ff5528] text-white placeholder-gray-400 transition-all duration-300 shadow-lg shadow-black/20"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg focus:ring-2 focus:ring-[#ff5528] focus:border-[#ff5528] text-white placeholder-gray-400 transition-all duration-300 shadow-lg shadow-black/20"
                    placeholder="Enter category"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-[#ff5528]/20 rounded-lg text-[#ff5528] hover:bg-[#ff5528]/10 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-[#ff5528] to-[#ff7d5a] text-white rounded-lg hover:from-[#ff7d5a] hover:to-[#ff5528] transition-all duration-200"
                  >
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Userpage;
