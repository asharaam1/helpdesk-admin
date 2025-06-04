import React from "react";
import { Badge } from "@/components/ui/badge";
import { Trash } from "lucide-react";

export function AppointmentList({ appointments }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h3 className="font-[SairaSemibold] text-xl ">All Appointments</h3>
          <p className="text-sm text-muted-foreground font-[SairaRegular]">
            Search anything about patients here
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-[SairaMedium]">
            Filter
          </Badge>
          <Badge variant="outline" className="font-[SairaMedium]">
            Search
          </Badge>
        </div>
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
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="border-b md:text-sm text-xs border-gray-200 hover:bg-gray-100 transition-all duration-200"
                  onClick={() => {
                    setDetailsModal(true);
                    setDetails(appointment);
                  }}
                >
                  <td className="py-4 md:px-4 px-2 text-gray-800 font-[SairaMedium]"> {appointment.firstName} {appointment.lastName} </td>
                  <td className="py-4 md:px-4 px-2 text-gray-800 font-[SairaMedium]"> {appointment.title} </td>
                  <td className="py-4 md:px-4 text-center px-2 text-gray-600 font-[SairaRegular]"> {appointment.age} </td>
                  <td className="py-4 md:px-4 px-2 text-center text-gray-600 capitalize font-[SairaRegular]"> {appointment.gender} </td>
                  <td className="py-4 md:px-4 px-2 text-gray-600 font-[SairaRegular]"> {appointment.service} </td>
                  <td className="py-4 md:px-4 px-2"> {appointment.visitFirstTime === "yes" ? "First Visit" : "Returning"} </td>
                  <td className="py-4 md:px-4 p-2  text-gray-600 md:text-sm text-xs line-clamp-2 font-[SairaRegular] w-60 capitalize"> {appointment.comments || "N/A"} </td>
                  <td className="py-4 md:px-4 p-2">
                    <Trash
                      onClick={() => handleDeleteAppoint(appointment.id)}
                      className="w-5 h-5 text-[#0190de] cursor-pointer"
                    />
                  </td>
                </tr>
              ))) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-8 text-gray-500 font-[SairaRegular]">
                  No Appointments Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
