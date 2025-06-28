 "use client";
import React, { useState } from "react";
import { db } from "@/app/utils/firebaseConfig";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Loader2, CheckCircle, XCircle, Eye, Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { useAppContext } from "@/app/context/useContext";

const NeedyApprovalPage = () => {
  const { allUsers, funds } = useAppContext();
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFund, setSelectedFund] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const handleApprove = async (fundId) => {
    try {
      const fundRequestRef = doc(db, "fundRequests", fundId);
      await updateDoc(fundRequestRef, {
        status: "approved",
        approvedAt: new Date().toISOString(),
      });
      toast.success("Fund request approved successfully");
    } catch (error) {
      console.error("Error approving fund request:", error);
      toast.error("Error approving fund request");
    }
  };

  const handleReject = async (fundId) => {
    try {
      const fundRequestRef = doc(db, "fundRequests", fundId);
      await updateDoc(fundRequestRef, {
        status: "rejected",
        rejectedAt: new Date().toISOString(),
      });
      toast.success("Fund request rejected successfully");
    } catch (error) {
      console.error("Error rejecting fund request:", error);
      toast.error("Error rejecting fund request");
    }
  };

  const handleDelete = async (fundId) => {
    if (window.confirm("Are you sure you want to delete this fund request?")) {
      try {
        await deleteDoc(doc(db, "fundRequests", fundId));
        toast.success("Fund request deleted successfully");
      } catch {
        toast.error("Failed to delete fund request");
      }
    }
  };

  const ViewDetailsModal = ({ user, fund, onClose }) => {
    if (!user || !fund) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">User Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Personal Information</h3>
              <p><span className="font-medium">Name:</span> {user.fullName}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Phone:</span> {user.mobile}</p>
              <p><span className="font-medium">Address:</span> {user.address}</p>
              <p><span className="font-medium">Title:</span> {fund.title || 'N/A'}</p>
              <p><span className="font-medium">Description:</span> {fund.description || 'N/A'}</p>
              <p><span className="font-medium">Amount Raised:</span> {fund.amountRaised || 0}</p>
              <p><span className="font-medium">Amount Requested:</span> {fund.amountRequested || 0}</p>
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
              {fund.blogImg && (
                <div className="mb-2">
                  <p className="font-medium">Blog Image:</p>
                  <Image
                    src={fund.blogImg}
                    alt="Blog Image"
                    width={200}
                    height={150}
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={() => handleReject(fund.id)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Reject
            </button>
            <button
              onClick={() => handleApprove(fund.id)}
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Needy Approval Requests</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {funds.map((fund) => {
                const user = allUsers?.find(u => u.id === fund.userId);
                return (
                  <tr key={fund.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user ? user.fullName : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user ? user.email : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user ? user.mobile : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${fund.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : fund.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {fund.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            if (user) {
                              setSelectedUser(user);
                              setSelectedFund(fund);
                              setViewModalOpen(true);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          disabled={!user}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleApprove(fund.id)}
                          className="text-green-600 hover:text-green-900"
                          disabled={fund.status === 'approved'}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReject(fund.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={fund.status === 'rejected'}
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(fund.id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {viewModalOpen && selectedUser && selectedFund && (
        <ViewDetailsModal
          user={selectedUser}
          fund={selectedFund}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedUser(null);
            setSelectedFund(null);
          }}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default NeedyApprovalPage;
