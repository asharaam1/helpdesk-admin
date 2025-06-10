"use client";
import { useEffect, useState } from "react";
import { db } from "@/app/utils/firebaseConfig"; 
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function RoleManagement() {
  const [users, setUsers] = useState([]);

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
    console.log("Users fetched:", users);
  }, []);

  const updateRole = async (id, newRole) => {
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, { role: newRole });
    alert(`Role updated to ${newRole}`);
  };

  return (
    <table className="table w-full">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Current Role</th>
          <th>Change Role</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.fullName || "No Name"}</td>
            <td>{user.email}</td>
            <td>{user.role || "None"}</td>
            <td>
              <select
                value={user.role}
                onChange={(e) => updateRole(user.id, e.target.value)}
                className="select select-bordered"
              >
                <option value="admin">Admin</option>
                <option value="donor">Donor</option>
                <option value="needy">Needy</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
