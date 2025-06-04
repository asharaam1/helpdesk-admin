"use client";
import { db } from "@/app/utils/firebaseConfig";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import {
  Trash,
  Edit,
  Plus,
  Search,
  Bandage,
  BriefcaseMedical,
  Eye,
  FlaskConical,
  Loader2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppContext } from "@/app/context/useContext";
import { useToast } from "@/hooks/use-toast";

const page = () => {
  const { toast } = useToast();
  const {
    appointments,
    setAppointments,
    appointmentTitles,
    setAppointmentTitles,
  } = useAppContext();
  const [detailsModal, setDetailsModal] = useState(false);
  const [details, setDetails] = useState();
  const [titleEN, setTitleEN] = useState("");
  const [titleUR, setTitleUR] = useState("");
  const [icon, setIcon] = useState("Eye");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!titleEN || !titleUR) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }
    setIsLoading(true);
    const titleData = { titleEN, titleUR, icon };
    if (isEdit) {
      await updateDoc(doc(db, "appointTitle", editId), titleData);
      setAppointmentTitles((prevTitle) =>
        prevTitle.map((title) =>
          title.id === editId ? { ...title, ...titleData } : title
        )
      );
      setIsEdit(false);
      toast({
        title: "Success",
        description: "Appointment Updated Successfully",
      });
    } else {
      const docRef = await addDoc(collection(db, "appointTitle"), titleData);
      const newTitle = { id: docRef.id, ...titleData };
      setAppointmentTitles((prevTitles) => [newTitle, ...prevTitles]);
      toast({
        title: "Success",
        description: "Appoint title added successfull",
      });
    }

    setIcon("Eye");
    setTitleEN("");
    setTitleUR("");
    setIsLoading(false);
  };

  const handleDeleteAppoint = async (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      await deleteDoc(doc(db, "Appointments", id));
      setAppointments((prevAppoint) =>
        prevAppoint.filter((appoint) => appoint.id !== id)
      );
      toast({
        title: "Success",
        description: "Appointment Deleted",
      });
    }
  };

  const handleDeleteAppointTitle = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this appointment title?")
    ) {
      await deleteDoc(doc(db, "appointTitle", id));
      setAppointmentTitles((prevAppointTitle) =>
        prevAppointTitle.filter((appointTitle) => appointTitle.id !== id)
      );
      toast({
        title: "Success",
        description: "Appointment Title Deleted",
      });
    }
  };

  const iconMap = {
    Eye: Eye,
    Bandage: Bandage,
    BriefcaseMedical: BriefcaseMedical,
    FlaskConical: FlaskConical,
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const appointmentRef = doc(db, "Appointments", appointmentId);
      await updateDoc(appointmentRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="px-4">
      <div className="mb-8">
        <h1 className="md:text-3xl text-2xl font-[SairaSemibold] text-gray-900">
          Appointments
        </h1>
        <p className="text-sm mb-5 text-muted-foreground font-[SairaRegular]">
          Manage, track, and update appointments with real-time scheduling and
          seamless organization.
        </p>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list" className="font-[SairaMedium]">
            Appointment List
          </TabsTrigger>
          <TabsTrigger value="title" className="font-[SairaMedium]">
            Appointment Title
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list">
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
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="border-b md:text-sm text-xs border-gray-200 hover:bg-gray-100 transition-all duration-200"
                      // onClick={() => {
                      //   setDetailsModal(true);
                      //   setDetails(appointment);
                      // }}
                    >
                      <td
                        onClick={() => {
                          setDetailsModal(true);
                          setDetails(appointment);
                        }}
                        className="py-4 md:px-4 px-2 text-gray-800 font-[SairaMedium]"
                      >
                        {appointment.firstName} {appointment.lastName}
                      </td>
                      <td className="py-4 md:px-4 px-2 text-gray-800 font-[SairaMedium]">
                        {/* <Badge className={`p-2 rounded-sm text-sm font-[SairaMedium] bg-[#0190de]`}> */}
                        {appointment.title}
                        {/* </Badge> */}
                      </td>
                      <td className="py-4 md:px-4 text-center px-2 text-gray-600 font-[SairaRegular]">
                        {appointment.age}
                      </td>
                      <td className="py-4 md:px-4 px-2 text-center text-gray-600 capitalize font-[SairaRegular]">
                        {appointment.gender}
                      </td>
                      <td className="py-4 md:px-4 px-2 text-gray-600 font-[SairaRegular]">
                        {appointment.service}
                      </td>
                      <td className="py-4 md:px-4 px-2">
                        {/* <Badge className={`p-2 rounded-sm text-sm font-[SairaMedium] bg-[#0190de]`}> */}
                        {appointment.visitFirstTime === "yes"
                          ? "First Visit"
                          : "Returning"}
                        {/* </Badge> */}
                      </td>
                      <td className="py-4 md:px-4 p-2  text-gray-600 md:text-sm text-xs line-clamp-2 font-[SairaRegular] w-60 capitalize">
                        {appointment.comments || "N/A"}
                      </td>
                      <td className="py-4 md:px-4 px-2">
                        <select
                          className="border p-2 rounded-md bg-gray-100 text-gray-700"
                          value={appointment.status || "pending"}
                          onChange={(e) =>
                            handleStatusChange(appointment.id, e.target.value)
                          }
                        >
                          <option value="completed">Completed</option>
                          <option value="canceled">Canceled</option>
                          <option value="rescheduled">Rescheduled</option>
                        </select>
                      </td>

                      <td>
                        <Trash
                          onClick={() => handleDeleteAppoint(appointment.id)}
                          className="w-5 h-5 text-[#0190de] cursor-pointer"
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
                      No Appointments Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Dialog open={detailsModal} onOpenChange={setDetailsModal}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-[SairaSemibold] text-2xl text-[#0190de] border-b pb-4 mb-4">
                  Appointment Details
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {details && (
                  <div className="space-y-4">
                    {/* Name and Email */}
                    <div className="flex justify-between items-center">
                      <div className="flex gap-3">
                        <span className="font-[SairaMedium] text-gray-600 block">
                          Name:
                        </span>
                        <span className="font-[SairaRegular] text-gray-800">
                          {details.firstName} {details.lastName}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <span className="font-[SairaMedium] text-gray-600 block">
                          Email:
                        </span>
                        <span className="font-[SairaRegular] text-gray-800">
                          {details.email}
                        </span>
                      </div>
                    </div>

                    {/* Age and Gender */}
                    <div className="flex justify-between items-center">
                      <div className="flex gap-3">
                        <span className="font-[SairaMedium] text-gray-600 block">
                          Age:
                        </span>
                        <span className="font-[SairaRegular] text-gray-800">
                          {details.age}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <span className="font-[SairaMedium] text-gray-600 block">
                          Gender:
                        </span>
                        <span className="font-[SairaRegular] text-gray-800 capitalize">
                          {details.gender}
                        </span>
                      </div>
                    </div>

                    {/* Record Number and Service */}
                    <div className="flex justify-between items-center">
                      <div className="flex gap-3">
                        <span className="font-[SairaMedium] text-gray-600 block">
                          Record No:
                        </span>
                        <span className="font-[SairaRegular] text-gray-800">
                          {details.recordNo}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <span className="font-[SairaMedium] text-gray-600 block">
                          Service:
                        </span>
                        <span className="font-[SairaRegular] text-gray-800">
                          {details.services}
                        </span>
                      </div>
                    </div>

                    {/* Visit Type */}
                    <div className="flex items-center">
                      <span className="font-[SairaMedium] text-gray-600 w-36">
                        Visit Type:
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-[SairaMedium] ${
                          details.visitFirstTime === "yes"
                        }`}
                      >
                        {details.visitFirstTime === "yes"
                          ? "First Visit"
                          : "Returning"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-[SairaMedium] text-gray-600 w-36">
                        Appointment Title:
                      </span>
                      <span
                        className={`px-3 py-1 text-[#0190de]0 text-sm font-[SairaMedium] capitalize`}
                      >
                        {details.title}
                      </span>
                    </div>

                    {/* Address */}
                    <div>
                      <span className="block font-[SairaMedium] text-gray-600 mb-2">
                        Address:
                      </span>
                      <p className="font-[SairaRegular] text-gray-800 bg-gray-100 p-4 text-sm rounded-md">
                        {details.address}
                      </p>
                    </div>

                    {/* Comments */}
                    <div>
                      <span className="block font-[SairaMedium] text-gray-600 mb-2">
                        Comments:
                      </span>
                      <p className="font-[SairaRegular] text-gray-800 bg-gray-100 p-4 text-sm rounded-md">
                        {details.comments || "N/A"}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center">
                      <span className="font-[SairaMedium] text-gray-600 w-36">
                        Timestamp:
                      </span>
                      <span className="font-[SairaRegular] text-gray-800">
                        {new Date(details.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
        <TabsContent value="title">
          <div className="p-4 flex md:flex-row flex-col items-center gap-3 border rounded-md mt-5">
            <div className="w-full">
              <label className="font-[SairaRegular] text-sm">
                Appointment Title (English)
              </label>
              <Input
                value={titleEN}
                onChange={(e) => setTitleEN(e.target.value)}
                className="py-5"
                type="text"
                placeholder="Title English"
              />
            </div>
            <div className="w-full">
              <label className="font-[SairaRegular] text-sm">
                Appointment Title (Urdu)
              </label>
              <Input
                value={titleUR}
                onChange={(e) => setTitleUR(e.target.value)}
                className="py-5"
                type="text"
                placeholder="Title Urdu"
              />
            </div>
            <div className="w-full">
              <label className="font-[SairaRegular] text-sm">Icon</label>
              <Select
                defaultValue="Eye"
                value={icon}
                onValueChange={(value) => setIcon(value)}
              >
                <SelectTrigger className="py-5">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Eye">
                    <Eye />
                  </SelectItem>
                  <SelectItem value="Bandage">
                    <Bandage />
                  </SelectItem>
                  <SelectItem value="BriefcaseMedical">
                    <BriefcaseMedical />
                  </SelectItem>
                  <SelectItem value="FlaskConical">
                    <FlaskConical />
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSave}
              className="gap-2 py-5 bg-[#0190de] font-[SairaSemibold] hover:bg-[#0190de] mt-5"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
          <div className="overflow-x-auto mt-5">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead className="bg-gray-100 border-b">
                <tr className="text-left text-sm font-semibold text-gray-700">
                  <th className="py-3 px-4">Icon</th>
                  <th className="py-3 px-4">Title (English)</th>
                  <th className="py-3 px-4">Title (Urdu)</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointmentTitles.map((event) => (
                  <tr key={event.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 flex items-center justify-start">
                      {iconMap[event.icon]
                        ? React.createElement(iconMap[event.icon], {
                            className: "h-8 w-8 text-[#0190de]0",
                          })
                        : "N/A"}
                    </td>
                    <td className="px-4 py-2 font-[SairaSemibold] text-left">
                      {event.titleEN}
                    </td>
                    <td className="px-4 py-2 font-[SairaSemibold] text-left">
                      {event.titleUR}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-start gap-2">
                        <Edit
                          className="h-5 w-5 cursor-pointer text-[#0190de]0"
                          onClick={() => {
                            setIsEdit(true);
                            setEditId(event.id);
                            setTitleEN(event.titleEN);
                            setTitleUR(event.titleUR);
                            setIcon(event.icon);
                          }}
                        />
                        <Trash
                          className="h-5 w-5 cursor-pointer text-[#0190de]"
                          onClick={() => handleDeleteAppointTitle(event.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
      <ToastContainer />
    </div>
  );
};

export default page;
