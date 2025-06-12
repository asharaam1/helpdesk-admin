"use client";
import { useEffect, useState } from "react";
import { db } from "@/app/utils/firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export default function RoleManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  const updateRole = async (id, newRole) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { role: newRole });
      alert(`Role updated to ${newRole}`);
    } catch (error) {
      alert("Error updating role: " + error.message);
    }
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Role Management</h1>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600">Total Users</p>
          <p className="text-3xl font-semibold">{users.length}</p>
        </div>
      </div>



      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="table w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Current Role</th>
              <th className="py-3 px-4 text-left">Change Role</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className="text-center py-4">Loading...</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{user.fullName || "No Name"}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === "admin" ? "bg-blue-100 text-blue-800" :
                      user.role === "donor" ? "bg-green-100 text-green-800" :
                      "bg-orange-100 text-orange-800"
                    }`}>
                      {user.role || "None"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={user.role || "none"}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      className="select select-bordered select-sm w-full max-w-xs"
                    >
                      <option value="admin">Admin</option>
                      <option value="donor">Donor</option>
                      <option value="needy">Needy</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}