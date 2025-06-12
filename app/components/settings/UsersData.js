"use client";
import { useEffect, useState } from "react";
import { db } from "@/app/utils/firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export default function UsersData() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ fullName: "", email: "" });

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    };
    fetchUsers();
  }, []);
  
  console.log("helooooooooooooo");

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setFormData({ fullName: user.fullName || "", email: user.email || "" });
  };

  const handleSave = async (userId) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      fullName: formData.fullName,
      email: formData.email,
    });

    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, ...formData } : user
      )
    );

    alert("User details updated");
    setEditingUser(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">User Management</h2>
        <div className="badge badge-primary p-3">
          Total Users: {users.length}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  {editingUser === user.id ? (
                    <input
                      type="text"
                      className="input input-bordered w-full max-w-xs"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                    />
                  ) : (
                    <span className="font-medium">{user.fullName || "No Name"}</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {editingUser === user.id ? (
                    <input
                      type="email"
                      className="input input-bordered w-full max-w-xs"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td className="py-3 px-4">
                  {editingUser === user.id ? (
                    <button
                      onClick={() => handleSave(user.id)}
                      className="btn btn-success btn-sm mr-2"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(user)}
                      className="btn btn-outline btn-sm"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}