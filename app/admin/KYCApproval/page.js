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

const KYCApprovalPage = () => {
  const [kycRequests, setKycRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Fetch KYC requests that need approval
  const fetchKYCRequests = async () => {
    try {
      const q = query(
        collection(db, "kycRequests"),
        where("status", "==", "pending")
      );
      const querySnapshot = await getDocs(q);
      const requests = [];
      querySnapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      setKycRequests(requests);
    } catch (error) {
      toast.error("Error fetching KYC requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKYCRequests();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      await updateDoc(doc(db, "kycRequests", requestId), {
        status: "approved",
        approvedAt: new Date().toISOString(),
      });
      // Update user's KYC status
      const request = kycRequests.find((r) => r.id === requestId);
      if (request?.userId) {
        await updateDoc(doc(db, "users", request.userId), {
          kycStatus: "verified",
          kycVerifiedAt: new Date().toISOString(),
        });
      }
      toast.success("KYC approved successfully");
      fetchKYCRequests(); // Refresh the list
    } catch (error) {
      toast.error("Error approving KYC");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await updateDoc(doc(db, "kycRequests", requestId), {
        status: "rejected",
        rejectedAt: new Date().toISOString(),
      });
      // Update user's KYC status
      const request = kycRequests.find((r) => r.id === requestId);
      if (request?.userId) {
        await updateDoc(doc(db, "users", request.userId), {
          kycStatus: "rejected",
        });
      }
      toast.success("KYC rejected successfully");
      fetchKYCRequests(); // Refresh the list
    } catch (error) {
      toast.error("Error rejecting KYC");
    }
  };

  const ViewDetailsModal = ({ request, onClose }) => {
    if (!request) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">KYC Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Personal Information</h3>
              <p><span className="font-medium">Name:</span> {request.fullName}</p>
              <p><span className="font-medium">Email:</span> {request.email}</p>
              <p><span className="font-medium">Phone:</span> {request.phone}</p>
              <p><span className="font-medium">Address:</span> {request.address}</p>
              <p><span className="font-medium">ID Type:</span> {request.idType}</p>
              <p><span className="font-medium">ID Number:</span> {request.idNumber}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Documents</h3>
              <div className="space-y-4">
                {request.idFront && (
                  <div>
                    <p className="font-medium mb-1">ID Front:</p>
                    <Image
                      src={request.idFront}
                      alt="ID Front"
                      width={200}
                      height={150}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
                {request.idBack && (
                  <div>
                    <p className="font-medium mb-1">ID Back:</p>
                    <Image
                      src={request.idBack}
                      alt="ID Back"
                      width={200}
                      height={150}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
                {request.selfie && (
                  <div>
                    <p className="font-medium mb-1">Selfie with ID:</p>
                    <Image
                      src={request.selfie}
                      alt="Selfie with ID"
                      width={200}
                      height={150}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={() => handleReject(request.id)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Reject KYC
            </button>
            <button
              onClick={() => handleApprove(request.id)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Approve KYC
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
      <h1 className="text-2xl font-bold mb-6">KYC Approval Requests</h1>

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
                  ID Type
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
              {kycRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{request.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{request.idType}</div>
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
                          setSelectedRequest(request);
                          setViewModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
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

      {viewModalOpen && selectedRequest && (
        <ViewDetailsModal
          request={selectedRequest}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedRequest(null);
          }}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default KYCApprovalPage; 