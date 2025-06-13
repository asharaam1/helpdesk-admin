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
  getDoc,
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

  const fetchKYCRequests = async () => {
    try {
      const q = query(
        collection(db, "kycRequests"),
        where("status", "==", "pending")
      );
      const querySnapshot = await getDocs(q);
      const requests = [];

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        let userData = {};
        if (data.userId) {
          const userRef = doc(db, "users", data.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            userData = userSnap.data();
          }
        }
        requests.push({
          id: docSnap.id,
          ...data,
          name: userData.fullName || "",
          email: userData.email || "",
        });
      }

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

      const request = kycRequests.find((r) => r.id === requestId);
      if (request?.userId) {
        await updateDoc(doc(db, "users", request.userId), {
          kycStatus: "verified",
          kycVerifiedAt: new Date().toISOString(),
        });
      }

      toast.success("KYC approved successfully");
      fetchKYCRequests();
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

      const request = kycRequests.find((r) => r.id === requestId);
      if (request?.userId) {
        await updateDoc(doc(db, "users", request.userId), {
          kycStatus: "rejected",
        });
      }

      toast.success("KYC rejected successfully");
      fetchKYCRequests();
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
              <h3 className="font-semibold mb-2">Personal Info</h3>
              <p>
                <b>Name:</b> {request.fullName}
              </p>
              <p>
                <b>Email:</b> {request.email}
              </p>
              <p>
                <b>Mobile:</b> {request.mobile}
              </p>
              <p>
                <b>Address:</b> {request.idType}
              </p>
              <p>
                <b>ID Number:</b> {request.idNumber}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Documents</h3>
              <div className="space-y-3">
                {request.cnicFrontUrl && (
                  <Image
                    src={request.cnicFrontUrl}
                    alt="Front"
                    width={200}
                    height={120}
                    className="rounded"
                  />
                )}
                {request.cnicBackUrl && (
                  <Image
                    src={request.cnicBackUrl}
                    alt="Back"
                    width={200}
                    height={120}
                    className="rounded"
                  />
                )}
                {request.selfieUrl && (
                  <Image
                    src={request.selfieUrl}
                    alt="Selfie"
                    width={200}
                    height={120}
                    className="rounded"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => handleReject(request.id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Reject
            </button>
            <button
              onClick={() => handleApprove(request.id)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Approve
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
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
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">User ID</th>
              <th className="px-4 py-3">CNIC Front</th>
              <th className="px-4 py-3">CNIC Back</th>
              <th className="px-4 py-3">Selfie</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {kycRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td
                  className="px-4 py-3 truncate max-w-[150px]"
                  title={request.name}>
                  {request.name}
                </td>
                <td
                  className="px-4 py-3 truncate max-w-[150px]"
                  title={request.email}>
                  {request.email}
                </td>
                <td className="px-4 py-3">{request.mobile}</td>
                <td className="px-4 py-3">{request.address}</td>
                <td
                  className="px-4 py-3 truncate max-w-[150px]"
                  title={request.userId}>
                  {request.userId}
                </td>
                <td className="px-4 py-3">
                  {request.cnicFrontUrl ? (
                    <img
                      src={request.cnicFrontUrl}
                      alt="Front"
                      className="h-12 w-16 object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">N/A</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {request.cnicBackUrl ? (
                    <img
                      src={request.cnicBackUrl}
                      alt="Back"
                      className="h-12 w-16 object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">N/A</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {request.selfieUrl ? (
                    <img
                      src={request.selfieUrl}
                      alt="Selfie"
                      className="h-12 w-12 object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">N/A</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Pending
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setViewModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800">
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="text-green-600 hover:text-green-800">
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="text-red-600 hover:text-red-800">
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
