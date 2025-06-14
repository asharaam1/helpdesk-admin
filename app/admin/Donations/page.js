"use client";
import { useAppContext } from "@/app/context/useContext";
import { db } from "@/app/utils/firebaseConfig";
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useToast } from "@/hooks/use-toast";

const Page = () => {
  const { toast } = useToast();
  const { donations, setDonations } = useAppContext();
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState("");

  // 🔄 Real-time Firestore data fetch
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "donations"),
      (snapshot) => {
        const fetchedDonations = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDonations(fetchedDonations);
      },
      (error) => {
        console.error("Error fetching donations:", error);
      }
    );

    return () => unsubscribe(); // cleanup
  }, [setDonations]);

  // 🗑️ Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this donation?")) {
      await deleteDoc(doc(db, "donations", id));
      setDonations((prevDonations) =>
        prevDonations.filter((donation) => donation.id !== id)
      );
      toast({
        title: "Success",
        description: "Donation Deleted Successfully",
      });
    }
  };

  // 💾 Handle Amount Update
  const handleAmountUpdate = async (id) => {
    if (!editAmount) return;

    try {
      await updateDoc(doc(db, "donations", id), {
        amount: Number(editAmount)
      });
      
      toast({
        title: "Success!",
        description: "Amount updated successfully",
        duration: 2000,
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error updating amount:", error);
      toast({
        title: "Error!",
        description: "Failed to update amount",
        duration: 2000,
      });
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
              {/* <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Number</th> */}
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
                    {editingId === donate.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAmountUpdate(donate.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span 
                        onClick={() => {
                          setEditingId(donate.id);
                          setEditAmount(donate.amount || "");
                        }}
                        className="cursor-pointer hover:text-blue-600"
                      >
                        {donate.amount || 0}
                      </span>
                    )}
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
