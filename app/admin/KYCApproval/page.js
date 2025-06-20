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
  deleteDoc,
} from "firebase/firestore";
import { Loader2, CheckCircle, XCircle, Eye, Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

const KYCApprovalPage = () => {
  const [kycRequests, setKycRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch KYC requests that need approval
  const fetchKYCRequests = async () => {
    try {
      console.log('Fetching KYC requests from Firebase...');
      const q = query(collection(db, "kycRequests"));
      const querySnapshot = await getDocs(q);
      const requests = [];
      querySnapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      console.log('Fetched KYC requests:', requests);
      setKycRequests(requests);
    } catch (error) {
      console.error('Error fetching KYC requests:', error);
      setError('Failed to fetch KYC requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const fetchUsers = async () => {
    try {
        console.log('Fetching users from Firebase...');
      const q = query(
        collection(db, "users"),
          where("role", "==", "needy")
      );
      const querySnapshot = await getDocs(q);
        const userList = [];
      querySnapshot.forEach((doc) => {
          userList.push({ id: doc.id, ...doc.data() });
      });
        console.log('Fetched users:', userList);
        setUsers(userList);
    } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users');
    }
  };

    fetchUsers();
    fetchKYCRequests();
  }, []);

  const handleApprove = async (userId) => {
    try {
      console.log('Approving KYC for user:', userId);
      // Find the KYC request for this user
      const kycRequest = kycRequests.find(request => request.userId === userId);
      if (!kycRequest) {
        console.error('No KYC request found for user:', userId);
        toast.error('No KYC request found for this user');
        return;
      }

      // Update the KYC request status
      await updateDoc(doc(db, "kycRequests", kycRequest.id), {
        status: "approved",
        approvedAt: new Date().toISOString()
      });

      // Also update the user's KYC status
      await updateDoc(doc(db, "users", userId), {
        kycStatus: "approved",
        kycVerifiedAt: new Date().toISOString()
      });
      
      console.log('KYC approved successfully');
      toast.success('KYC approved successfully');
      
      // Refresh both users and KYC requests
      await Promise.all([fetchUsers(), fetchKYCRequests()]);
    } catch (error) {
      console.error('Error in KYC approval:', error);
      toast.error('Failed to approve KYC');
    }
  };

  const handleReject = async (userId) => {
    try {
      console.log('Rejecting KYC for user:', userId);
      // Find the KYC request for this user
      const kycRequest = kycRequests.find(request => request.userId === userId);
      if (!kycRequest) {
        console.error('No KYC request found for user:', userId);
        toast.error('No KYC request found for this user');
        return;
      }

      // Update the KYC request status
      await updateDoc(doc(db, "kycRequests", kycRequest.id), {
        status: "rejected",
        rejectedAt: new Date().toISOString()
      });

      // Also update the user's KYC status
      await updateDoc(doc(db, "users", userId), {
        kycStatus: "rejected",
        kycRejectedAt: new Date().toISOString()
      });
      
      console.log('KYC rejected successfully');
      toast.success('KYC rejected successfully');
      
      // Refresh both users and KYC requests
      await Promise.all([fetchUsers(), fetchKYCRequests()]);
    } catch (error) {
      console.error('Error in KYC rejection:', error);
      toast.error('Failed to reject KYC');
    }
  };

  // Delete KYC request for a user
  const handleDeleteKYCRequest = async (userId) => {
    try {
      const kycRequest = kycRequests.find(request => request.userId === userId);
      if (!kycRequest) {
        toast.error('No KYC request found for this user');
        return;
      }
      await deleteDoc(doc(db, "kycRequests", kycRequest.id));
      toast.success('KYC request deleted successfully');
      await fetchKYCRequests();
    } catch (error) {
      console.error('Error deleting KYC request:', error);
      toast.error('Failed to delete KYC request');
    }
  };

  const ViewDetailsModal = ({ user, onClose }) => {
    if (!user) return null;

    // Find the corresponding KYC request for this user
    const kycRequest = kycRequests.find(request => request.userId === user.id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">User Details</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="mt-1">{user.fullName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Mobile</p>
                <p className="mt-1">{kycRequest?.mobile || user.mobile}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="mt-1">{kycRequest?.address || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">KYC Status</p>
                <p className="mt-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    kycRequest?.status === 'approved' 
                      ? 'bg-green-100 text-green-800'
                      : kycRequest?.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {kycRequest?.status || 'pending'}
                  </span>
                </p>
              </div>
            <div>
                <p className="text-sm font-medium text-gray-500">Submitted At</p>
                <p className="mt-1">
                  {kycRequest?.createdAt ? new Date(kycRequest.createdAt.seconds * 1000).toLocaleDateString() : 'Not submitted'}
                </p>
              </div>
            </div>
            
            {kycRequest && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">KYC Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kycRequest.cnicFrontUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">CNIC Front</p>
                      <div className="border rounded-lg overflow-hidden">
                        <img 
                          src={kycRequest.cnicFrontUrl} 
                          alt="CNIC Front" 
                          className="w-full h-[200px] object-contain bg-gray-50"
                        />
                      </div>
                    </div>
                  )}
                  {kycRequest.cnicBackUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">CNIC Back</p>
                      <div className="border rounded-lg overflow-hidden">
                        <img 
                          src={kycRequest.cnicBackUrl} 
                          alt="CNIC Back" 
                          className="w-full h-[200px] object-contain bg-gray-50"
                        />
                      </div>
                    </div>
                  )}
                  {kycRequest.selfieUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Selfie Photo</p>
                      <div className="border rounded-lg overflow-hidden">
                        <img 
                          src={kycRequest.selfieUrl} 
                          alt="Selfie Photo" 
                          className="w-full h-[200px] object-contain bg-gray-50"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {kycRequest?.status === 'pending' && (
              <div className="flex justify-end gap-3 mt-6">
            <button
                  onClick={() => {
                    handleReject(user.id);
                    onClose();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Reject KYC
            </button>
            <button
                  onClick={() => {
                    handleApprove(user.id);
                    onClose();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Approve KYC
            </button>
              </div>
            )}
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
      <h1 className="text-2xl font-bold mb-6">KYC Approval Requests</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kycRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No KYC requests found
                  </td>
                </tr>
              ) : (
                kycRequests.map((kycRequest) => {
                  const user = users.find(u => u.id === kycRequest.userId);
                  return (
                    <tr key={kycRequest.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user ? user.fullName : null}</div>
                        <div className="text-sm text-gray-500">{user ? user.email : null}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user ? (user.city || 'Not provided') : 'Not provided'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          kycRequest.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : kycRequest.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {kycRequest.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setViewModalOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </button>
                          {kycRequest.status === 'pending' && user && (
                            <>
                              <button
                                onClick={() => handleApprove(user.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(user.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteKYCRequest(kycRequest.userId)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
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

export default KYCApprovalPage; 