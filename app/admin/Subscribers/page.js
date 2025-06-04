"use client";

import React from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/app/utils/firebaseConfig";
import { Trash2 } from "lucide-react";
import { useAppContext } from "@/app/context/useContext";
import { useToast } from "@/hooks/use-toast";

const SubscribersPage = () => {
  const { toast } = useToast();
  const { subscribers, setSubscribers } = useAppContext();

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "subscribers", id));
      setSubscribers((prevSubscribers) =>
        prevSubscribers.filter((subscriber) => subscriber.id !== id)
      );
      toast({
        title: "Success",
        description: "Subscriber Deleted Successfully",
      });
    } catch (err) {
      console.error("Error deleting subscriber:", err);
      alert("Failed to delete subscriber");
    }
  };

  return (
    <div className="px-4">
      <div className="mb-8">
         <h1 className="md:text-3xl text-2xl font-[SairaSemibold] text-gray-900">Subscribers</h1>
        <p className="text-sm mb-5 text-muted-foreground font-[SairaRegular]">View, manage, and respond to website subscribers with real-time updates and efficient organization.</p>
      </div>
      <div className="w-full bg-white rounded-xl border p-3">
        {subscribers.map((subscriber) => (
          <div key={subscriber.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2 hover:bg-gray-100 transition">
            <span className="text-lg font-[SairaMedium] text-gray-700">{subscriber.email}</span>
            <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(subscriber.id)}>
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscribersPage;