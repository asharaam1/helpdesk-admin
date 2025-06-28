"use client";
import { useAppContext } from "@/app/context/useContext";
import { db } from "@/app/utils/firebaseConfig";
import { doc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { Trash } from "lucide-react";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useToast } from "@/hooks/use-toast";

const Page = () => {
  const { toast } = useToast();
  const { donations } = useAppContext();

  // 🗑️ Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this donation?")) {
      try {
        // Get the donation data before deleting
        const donationRef = doc(db, "donations", id);
        const donationDoc = await getDoc(donationRef);
        const donationData = donationDoc.data();
        
        // Delete the donation
        await deleteDoc(donationRef);
        
        // Update amountRaised in funRequests if userId exists
        if (donationData.userId) {
          const funRequestRef = doc(db, "funRequests", donationData.userId);
          const funRequestDoc = await getDoc(funRequestRef);
          
          if (funRequestDoc.exists()) {
            const currentAmount = funRequestDoc.data().amountRaised || 0;
            await updateDoc(funRequestRef, {
              amountRaised: currentAmount - (donationData.amount || 0)
            });
          }
        }

        toast({
          title: "Success",
          description: "Donation Deleted Successfully",
        });
      } catch (error) {
        console.error("Error deleting donation:", error);
        toast({
          title: "Error",
          description: "Failed to delete donation",
        });
      }
    }
  };

  return (
    <div className="px-4">
      <div className="mb-8">
        <h1 className="md:text-3xl text-2xl font-[SairaSemibold] text-gray-900">Donations</h1>
        <p className="text-sm mb-5 text-muted-foreground font-[SairaRegular]">
          Track, manage, and update donations with real-time data syncing and seamless organization.
        </p>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg mt-5">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead className="bg-gray-100 border-b">
            <tr className="text-left text-sm font-semibold text-gray-700 font-[SairaSemibold] uppercase">
              <th className="py-3 px-4">Donor Name</th>
              <th className="py-3 px-4">Needy Name</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Donation Time</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {donations.length > 0 ? (
              donations.map((donate) => (
                <tr
                  key={donate.id}
                  className="border-b border-gray-200 md:text-sm text-xs hover:bg-gray-100 transition-all duration-200"
                >
                  <td className="py-4 px-4 text-gray-800 font-[SairaMedium]">
                    {donate.donorName}
                  </td>
                  <td className="py-4 px-4 text-gray-800 font-[SairaMedium]">
                    {donate.needyName || 'N/A'}
                  </td>
                  <td className="py-4 px-4 text-gray-600 font-[SairaMedium]">
                    {donate.amount || 0}
                  </td>
                  <td className="py-4 px-4 w-60 text-gray-600 text-sm font-[SairaRegular]">
                    {donate.donatedAt ? new Date(donate.donatedAt.seconds * 1000).toLocaleString() : "_"}
                  </td>
                  <td className="py-4 px-4">
                    <Trash
                      onClick={() => handleDelete(donate.id)}
                      className="w-5 h-5 text-red-500 cursor-pointer"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="text-center py-8 text-gray-500 font-[SairaRegular]"
                >
                  No Donations Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Page;
