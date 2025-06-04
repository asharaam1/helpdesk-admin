"use client";
import { Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState, Suspense } from "react";
import { db } from "@/app/utils/firebaseConfig";
import { addDoc, collection, doc, updateDoc, getDoc } from "firebase/firestore";
import "react-toastify/dist/ReactToastify.css";
import { useAppContext } from "../../context/useContext";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { sendEmail } from "../../utils/emailUtils";
import { Textarea } from "@/components/ui/textarea";

const AddAppointment = () => {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { patients, doctors, services } = useAppContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    patientId: "",
    doctor: "",
    service: "",
    notes: "",
    appointmentDate: new Date().toISOString().split("T")[0], // Set default to today's date
    appointmentTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  });

  const isEditing = searchParams.get("edit") === "true";
  const editPatientId = searchParams.get("patientId");

  useEffect(() => {
    if (isEditing) {
      const appointmentData = JSON.parse(decodeURIComponent(searchParams.get("appointment")));
      setFormData({ ...appointmentData, patientId: editPatientId });
    }
  }, [isEditing, searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData?.patientId || !formData?.doctor || !formData?.service || !formData?.appointmentDate || !formData?.appointmentTime) {
      toast({
        title: "Error",
        description: "All Fields are required",
      });
      return;
    }
  
    setIsLoading(true);
  
    try {
      const patientRef = doc(db, "patients", formData.patientId);
      const patientDoc = await getDoc(patientRef);
  
      if (!patientDoc.exists()) {
        toast({ title: "Error", description: "Patient not found" });
        return;
      }
  
      const existingAppointments = patientDoc.data().appointments || [];
  
      let updatedAppointments;

      const appointData = {
        doctor: formData.doctor,
        service: formData.service,
        notes: formData.notes,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        createdAt: Date.now(),
      }
  
      if (isEditing) {
        // Find and update the existing appointment
        updatedAppointments = existingAppointments.map((appt) =>
          appt.createdAt === formData.createdAt ? appointData : appt
        );
      } else {
        // Add a new appointment
        updatedAppointments = [
          ...existingAppointments,
          appointData
          // {
          //   doctor: formData.doctor,
          //   service: formData.service,
          //   notes: formData.notes,
          //   appointmentDate: formData.appointmentDate,
          //   createdAt: Date.now(),
          // },
        ];
      }
  
      // Update Firestore document
      await updateDoc(patientRef, {
        appointments: updatedAppointments,
      });
  
      await sendEmail("dilshadalhan@gmail.com", "Appointment", isEditing ? "Appointment updated successfully" : "Appointment added successfully");
  
      toast({
        title: "Success",
        description: isEditing ? "Appointment Updated Successfully" : "Appointment Added Successfully",
      });
  
      router.back();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save appointment",
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="px-4">
      <div className="mb-8">
        <h1 className="md:text-3xl text-2xl font-[SairaSemibold]">
          {isEditing ? 'UPDATE APPOINTMENT' : 'ADD APPOINTMENT'}
        </h1>
      </div>
      <div className="space-y-4">
        <div className="border rounded-tr-md rounded-tl-md">
          <div className="border-b py-3 px-3">
            <label className="font-[SairaRegular] text-sm">APPOINTMENT DETAILS</label>
          </div>
          <div className="space-y-4 p-4">
            {/* Patient ID and Appointment Date in a row */}
            <div className="flex items-center gap-4">
              <div className="w-full">
                <label className="font-[SairaRegular] text-sm">PATIENT ID</label>
                <Input
                  className="h-11"
                  name="patientId"
                  placeholder="Enter Patient ID"
                  value={formData?.patientId}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-full">
                <label className="font-[SairaRegular] text-sm">APPOINTMENT DATE</label>
                <Input
                  type="date"
                  className="h-11"
                  name="appointmentDate"
                  value={formData?.appointmentDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-full">
                <label className="font-[SairaRegular] text-sm">APPOINTMENT TIME</label>
                <Input
                  type="time"
                  className="h-11"
                  name="appointmentTime"
                  value={formData?.appointmentTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Doctor and Service in a row */}
            <div className="flex items-center gap-4">
              <div className="w-full">
                <label className="font-[SairaRegular] text-sm">DOCTOR</label>
                <Select
                  value={formData?.doctor}
                  onValueChange={(value) => handleSelectChange("doctor", value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.nameEN}>
                        {doctor.nameEN}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full">
                <label className="font-[SairaRegular] text-sm">SERVICE</label>
                <Select
                  value={formData?.service}
                  onValueChange={(value) => handleSelectChange("service", value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.titleEN}>
                        {service.titleEN}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-full">
                <label className="font-[SairaRegular] text-sm">Notes (Optional)</label>
                <Textarea value={formData.notes} onChange={handleChange} className="h-24" placeholder="Enter Notes" />
              </div>
            </div>
          </div>
        </div>

        <div className="text-right">
          <Button
            className="bg-[#0190de] hover:bg-[#0190de] font-[SairaMedium] text-xl"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              isEditing ? 'Update Appointment' : 'Add Appointment'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddAppointment />
    </Suspense>
  );
}