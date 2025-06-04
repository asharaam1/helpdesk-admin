"use client";
import { useAppContext } from "@/app/context/useContext";
import { db } from "@/app/utils/firebaseConfig";
import { Button } from "@/components/ui/button";
import { doc, deleteDoc } from "firebase/firestore";
import { Edit, Search, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useToast } from "@/hooks/use-toast";

const page = () => {
  const { toast } = useToast();
  const { events, setEvents } = useAppContext();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      await deleteDoc(doc(db, "doctors", id));
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
      toast({
        title: "Success",
        description: "Event Deleted Successfully",
      });
    }
  };

  const filteredEvents = events.filter((user) => {
    const eventName = user.titleEN || user.titleUR;
    return eventName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="px-6 py-8">
      <div className="mb-8">
         <h1 className="md:text-3xl text-2xl font-[SairaSemibold] text-gray-900">Manage Events</h1>
        <p className="text-sm text-gray-500">Organize, update, and track events seamlessly with our scheduling tools.</p>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Search by Event Name"
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <Button
          className="flex gap-2 items-center bg-[#0190de] hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-200"
          onClick={() => { router.push("/admin/AddEvent"); }}
        >
          Schedule An Event
        </Button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg mt-5">
      <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead className="bg-gray-100 border-b">
            <tr className="text-left text-sm font-semibold text-gray-700 font-[SairaSemibold] uppercase">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Purpose</th>
              <th className="py-3 px-4">Age</th>
              <th className="py-3 px-4">Gender</th>
              <th className="py-3 px-4">Service</th>
              <th className="py-3 px-4">Visit</th>
              <th className="py-3 px-4">Comments</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <img className="w-20 h-20 object-cover rounded-md" src={event.imageUrl} alt={event.titleEN || event.titleUR} />
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-900 w-60">
                    {event.titleEN || event.titleUR}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 w-60 line-clamp-2">
                    {event.descriptionEN || event.descriptionUR}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 w-60 ">{event.venue}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{event.date}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{event.startTime} to {event.endTime}</td>
                  <td className="py-4 px-4 flex gap-4">
                    <Edit
                      className="h-5 w-5 text-blue-600 cursor-pointer hover:text-blue-700"
                      onClick={() => { router.push(`/admin/AddEvent?event=${encodeURIComponent(JSON.stringify(event))}`); }}
                    />
                    <Trash
                      className="h-5 w-5 text-red-600 cursor-pointer hover:text-red-700"
                      onClick={() => handleDelete(event.id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-4 text-center text-gray-500 font-medium">No events found</td>
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
