"use client";
import { useAppContext } from "@/app/context/useContext";
import { db } from "@/app/utils/firebaseConfig";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useToast } from "@/hooks/use-toast";

const page = () => {
  const { toast } = useToast();
  const { donations, setDonations } = useAppContext();

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

  return (
    <div className="px-4">
      <div className="mb-8">
         <h1 className="md:text-3xl text-2xl font-[SairaSemibold] text-gray-900">Donations</h1>
        <p className="text-sm mb-5 text-muted-foreground font-[SairaRegular]">Track, manage, and update donations with real-time data syncing and seamless organization.</p>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg mt-5">
      <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead className="bg-gray-100 border-b">
            <tr className="text-left text-sm font-semibold text-gray-700 font-[SairaSemibold] uppercase">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Number</th>
              <th className="py-3 px-4">Behalf Of</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Time</th>
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
                    {donate.firstName} {donate.lastName}
                  </td>
                  <td className="py-4 px-4 text-gray-800 font-[SairaMedium]">
                    {donate.email}
                  </td>
                  <td className="py-4 px-4 text-gray-600 font-[SairaRegular]">
                    {donate.number}
                  </td>
                  <td className="py-4 px-4 text-gray-800 font-[SairaMedium]">
                    <span className="px-4 py-1 rounded-full text-gray-800">
                      {donate.behalf}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600 font-[SairaMedium]">
                    {donate.amount}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm font-[SairaMedium]`}>
                      {donate.status === "Pending" ? "Pending" : "Completed"}
                    </span>
                  </td>
                  <td className="py-4 px-4 w-60 text-gray-600 text-sm font-[SairaRegular]">
                    {new Date(donate.createdAt).toLocaleString()}
                  </td>
                  <td>
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
                  colSpan="6"
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

export default page;
