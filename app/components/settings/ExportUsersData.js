"use client";
import { useEffect, useState } from "react";
import { db } from "@/app/utils/firebaseConfig";
import {
  collection,
  getDocs,
} from "firebase/firestore";

export default function ExportUsersData() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const GetUsersData = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    };

    GetUsersData();
  }, []);

  const exportToCSV = () => {
    if (users.length === 0) {
      alert("No users data to export.");
      return;
    }

    const headers = Object.keys(users[0]).join(",");
    const rows = users.map((user) =>
      Object.values(user)
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "users_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">📤 Export All Users' Data</h2>
      <p className="text-gray-600">Download all user records in CSV format for backup or reporting.</p>
      <button
        onClick={exportToCSV}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Export to CSV
      </button>
    </div>
  );
}
