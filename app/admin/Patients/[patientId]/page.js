"use client";

import { useParams, useRouter } from "next/navigation";
// import { useAppContext } from "../../../../context/useContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/utils/firebaseConfig";
import { useAppContext } from "@/app/context/useContext";
import { Edit, Trash } from "lucide-react";

const PatientDetails = ({ params }) => {
  const { patientId } = useParams();
  const { patients } = useAppContext();
  const router = useRouter();

  const selectedPatient = patients.filter((p) => p.id === patientId);


  const editAppointment = (appointment) => {
    router.push(`/admin/AddAppointment?patientId=${patientId}&appointment=${encodeURIComponent(JSON.stringify(appointment))}&edit=true`);
  };

  return (
    <div className="px-4">
      <div className="mb-8">
        <h1 className="md:text-3xl text-2xl font-semibold text-gray-900">
          Patient Details
        </h1>
        <p className="text-sm mb-5 text-muted-foreground font-[SairaRegular]">
          View and manage patient details and appointments.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name (EN)</p>
              <p className="text-lg font-medium">
                {selectedPatient[0]?.nameEN}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Name (UR)</p>
              <p className="text-lg font-medium">
                {selectedPatient[0]?.nameUR}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Age</p>
              <p className="text-lg font-medium">{selectedPatient[0]?.age}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="text-lg font-medium">
                {selectedPatient[0]?.gender}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">CNIC</p>
              <p className="text-lg font-medium">{selectedPatient[0]?.CNIC}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cell No</p>
              <p className="text-lg font-medium">{selectedPatient[0]?.cell}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address (EN)</p>
              <p className="text-lg font-medium">
                {selectedPatient[0]?.addressEN}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address (UR)</p>
              <p className="text-lg font-medium">
                {selectedPatient[0]?.addressUR}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date/Time</p>
              <p className="text-lg font-medium">
                {new Date(selectedPatient[0]?.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Disability</p>
              <p className="text-lg font-medium">
                {selectedPatient[0]?.disabilityType}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Appointments</h2>
          {selectedPatient[0]?.appointments?.length > 0 ? (
            <div className="space-y-4">
              {selectedPatient[0]?.appointments.map((appointment, index) => (
                <div
                  key={index}
                  className="border p-4 rounded-lg flex justify-between"
                >
                  <div>
                    <p className="text-sm text-gray-500">Appointment Date</p>
                    <p className="text-lg font-medium">
                      {appointment.appointmentDate}
                    </p>
                    <p className="text-sm text-gray-500">Doctor</p>
                    <p className="text-lg font-medium">{appointment.doctor}</p>
                    <p className="text-sm text-gray-500">Service</p>
                    <p className="text-lg font-medium">{appointment.service}</p>
                  </div>
                  <div className="flex gap-2">
                    <Edit className="h-5 w-5 cursor-pointer" onClick={() => editAppointment(appointment)} />
                    <Trash className="h-5 w-5 cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No appointments found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
