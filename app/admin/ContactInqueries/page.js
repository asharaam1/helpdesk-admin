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
  const { inqueries, setInqueries } = useAppContext();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Contact?")) {
      await deleteDoc(doc(db, "contactInqueries", id));
      setInqueries((previnquery) =>
        previnquery.filter((inquery) => inquery.id !== id)
      );
      toast({
        title: "Success",
        description: "Contact Deleted Successfully",
      });
    }
  };

  return (
    <div className="mx-auto px-4">
      <div className="mb-8">
         <h1 className="md:text-3xl text-2xl font-[SairaSemibold] text-gray-900">Contact Inqueries</h1>
        <p className="text-sm mb-5 text-muted-foreground font-[SairaRegular]">View, manage, and respond to contact inquiries with real-time updates and efficient organization.</p>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg mt-5">
      <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead className="bg-gray-100 border-b">
            <tr className="text-left text-sm font-semibold text-gray-700 font-[SairaSemibold] uppercase">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Message</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {inqueries.length > 0 ? (
              inqueries.map((donate) => (
                <tr
                  key={donate.id}
                  className="border-b md:text-sm text-xs border-gray-200 hover:bg-gray-100 transition-all duration-200"
                >
                  <td className="py-4 md:px-4 px-2 text-gray-800 font-[SairaMedium]">
                    {donate.firstName} {donate.lastName}
                  </td>
                  <td className="py-4 md:px-4 px-2 text-gray-800 font-[SairaMedium]">
                    {donate.email}
                  </td>
                  <td className="md:py-4 pt-3 line-clamp-2 md:px-4 px-2 font-[SairaRegular]">
                    {donate.message}
                  </td>
                  <td className="py-4 md:px-4 px-2 text-gray-600 font-[SairaRegular]">
                    {new Date(donate.createdAt).toLocaleString()}
                  </td>
                  <td className="justify-items-end md:justify-items-center p-2">
                    <Trash onClick={() => handleDelete(donate.id)}className="w-5 h-5 text-red-500 cursor-pointer"/>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-8 text-gray-500 font-[SairaRegular]"
                >
                  No Inqueries Found
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
