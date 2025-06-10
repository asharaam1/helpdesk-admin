"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/app/utils/firebaseConfig";
import {
  collection,
  query,
  getDocs,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Loader2, CheckCircle, XCircle, Eye } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

const NeedyApprovalPage = () => {
  const [needyUsers, setNeedyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Fetch needy users that need approval
  const fetchNeedyUsers = async () => {
    try {
      const q = query(
        collection(db, "needyUsers"),
        where("status", "==", "pending")
      );
      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      setNeedyUsers(users);
    } catch (error) {
      toast.error("Error fetching needy users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeedyUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await updateDoc(doc(db, "needyUsers", userId), {
        status: "approved",
        approvedAt: new Date().toISOString(),
      });
      toast.success("User approved successfully");
      fetchNeedyUsers(); // Refresh the list
    } catch (error) {
      toast.error("Error approving user");
    }
  };

  const handleReject = async (userId) => {
    try {
      await updateDoc(doc(db, "needyUsers", userId), {
        status: "rejected",
        rejectedAt: new Date().toISOString(),
      });
      toast.success("User rejected successfully");
      fetchNeedyUsers(); // Refresh the list
    } catch (error) {
      toast.error("Error rejecting user");
    }
  };

  const ViewDetailsModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">User Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Personal Information</h3>
              <p><span className="font-medium">Name:</span> {user.name}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Phone:</span> {user.phone}</p>
              <p><span className="font-medium">Address:</span> {user.address}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Documents</h3>
              {user.documents?.map((doc, index) => (
                <div key={index} className="mb-2">
                  <p className="font-medium">{doc.type}:</p>
                  {doc.url && (
                    <Image
                      src={doc.url}
                      alt={doc.type}
                      width={200}
                      height={150}
                      className="rounded-lg object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={() => handleReject(user.id)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Reject
            </button>
            <button
              onClick={() => handleApprove(user.id)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Approve
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-gray-800" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Needy Approval Requests</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {needyUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setViewModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleReject(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewModalOpen && selectedUser && (
        <ViewDetailsModal
          user={selectedUser}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default NeedyApprovalPage; 