"use client";
import { useAppContext } from "@/app/context/useContext";
import { db } from "@/app/utils/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { Loader2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useToast } from "@/hooks/use-toast";

const AddEvent = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { setEvents } = useAppContext();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    titleEN: "",
    titleUR: "",
    descriptionEN: "",
    descriptionUR: "",
    venue: "",
    date: "",
    startTime: "",
    endTime: "",
    imageUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (searchParams) {
      const data = searchParams.get("event");
      const parsedData = JSON.parse(data);
      try {
        setFormData(parsedData);
        setPreviewUrl(parsedData.imageUrl);
        setIsEdit(true);
      } catch (error) {
        console.log("error", error.message);
      }
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageUpload = async (file) => {
    const uploadFormData = new FormData();
    uploadformData?.append("file", file);
    uploadformData?.append("upload_preset", "ml_default");
    uploadformData?.append("cloud_name", "dqzknasup");

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dqzknasup/image/upload`,
        uploadFormData
      );
      const imageUrl = response.data.secure_url;
      setFormData((prev) => ({ ...prev, imageUrl }));
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      alert("Image upload failed. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      handleImageUpload(file);
    }
  };

  const handleSave = async () => {
    if (
      !formData?.titleEN ||
      !formData?.titleUR ||
      !formData?.descriptionEN ||
      !formData?.descriptionUR ||
      !formData?.venue ||
      !formData?.date ||
      !formData?.startTime ||
      !formData?.endTime ||
      !formData?.imageUrl
    ) {
      toast({
        title: "Error",
        description: "All Fields are required",
      });
      return;
    }
    setIsLoading(true);
    if (isEdit) {
      await updateDoc(doc(db, "events", formData?.id), formData);
      setEvents((prevEvents) =>
        prevEvents.map((events) =>
          events.id === formData?.id ? { ...events, ...formData } : events
        )
      );
      setIsEdit(false);
      toast({
        title: "Success",
        description: "Event Updated Successfully",
      });
    } else {
      const docRef = await addDoc(collection(db, "events"), formData);
      const newEvent = { id: docRef.id, ...formData };
      setEvents((prevEvents) => [newEvent, ...prevEvents]);
      toast({
        title: "Success",
        description: "Event Added Successfully",
      });
    }
    router.back();
    setFormData({
      titleEN: "",
      titleUR: "",
      descriptionEN: "",
      descriptionUR: "",
      venue: "",
      date: "",
      startTime: "",
      endTime: "",
      imageUrl: "",
    });
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4">
      {/* <ArrowLeft
        className="cursor-pointer mb-2"
        size={20}
        onClick={() => router.back()}
      /> */}
      <div className="mb-8">
        <h1 className="md:text-3xl text-2xl font-[SairaSemibold]">
          {isEdit ? "UPDATE EVENT" : "ADD EVENT"}
        </h1>
        <div className="mt-2 font-[SairaRegular] flex items-center">
          <span>Dashboard</span>
          <span className="mx-2">/</span>
          <span className="text-[#0190de]">
            {isEdit ? "Update Events" : "Add Events"}
          </span>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex flex-col border rounded-tr-md rounded-tl-md">
          <div className="border-b px-3 py-3">
            <label className="font-[SairaRegular] text-sm">EVENT TITLE</label>
          </div>
          <div className="flex items-center gap-4 px-3 py-3">
            <div className="w-full">
              <label className="font-[SairaRegular] text-sm">
                Title (English)
              </label>
              <Input
                className="h-11"
                name="titleEN"
                placeholder="Enter Event title"
                value={formData?.titleEN}
                onChange={handleChange}
                required
              />
            </div>
            <div className="w-full">
              <label className="font-[SairaRegular] text-sm">
                Title (Urdu)
              </label>
              <Input
                className="h-11"
                name="titleUR"
                placeholder="Enter Event title"
                value={formData?.titleUR}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col border rounded-tr-md rounded-tl-md">
          <div className="border-b px-3 py-3">
            <label className="font-[SairaRegular] text-sm">
              EVENT DESCRIPTION
            </label>
          </div>
          <div className="px-3 py-3">
            <div>
              <label className="font-[SairaRegular] text-sm">
                Description (English)
              </label>
              <Textarea
                className="min-h-[100px]"
                name="descriptionEN"
                placeholder="Enter a brief description"
                value={formData?.descriptionEN}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="font-[SairaRegular] text-sm">
                Description (Urdu)
              </label>
              <Textarea
                className="min-h-[100px]"
                name="descriptionUR"
                placeholder="Enter a brief description"
                value={formData?.descriptionUR}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col border rounded-tr-md rounded-tl-md">
          <div className="border-b px-3 py-3">
            <label className="font-[SairaRegular] text-sm">
              EVENT VENUE AND DATE
            </label>
          </div>
          <div className="flex items-center px-3 py-3 gap-4">
            <div className="flex-1">
              <label className="font-[SairaRegular] text-sm">Venue</label>
              <Input
                className="h-11"
                name="venue"
                type="text"
                placeholder="Enter Venue"
                value={formData?.venue}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="font-[SairaRegular] text-sm">Date</label>
              <Input
                className="h-11"
                name="date"
                type="date"
                value={formData?.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col border rounded-tr-md rounded-tl-md">
          <div className="border-b px-3 py-3">
            <label className="font-[SairaRegular] text-sm">EVENT TIMINGS</label>
          </div>
          <div className="flex items-center gap-4 px-3 py-3">
            <div className="flex-1">
              <label className="font-[SairaRegular] text-sm">Start Time</label>
              <Input
                className="h-11"
                name="startTime"
                type="time"
                value={formData?.startTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="font-[SairaRegular] text-sm">End Time</label>
              <Input
                className="h-11"
                name="endTime"
                type="time"
                value={formData?.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        <div className="md:w-full border rounded-xl">
          <div className="border-b px-5 p-3 text-lg">
            <div className="cursor-pointer">Upload image</div>
          </div>
          <div className="p-3 w-full px-5 flex h-32">
            {previewUrl && (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Uploaded preview"
                  className="w-32 h-full object-cover border rounded"
                />
                <button
                  onClick={() => {
                    setPreviewUrl(null);
                    setFormData((prev) => ({ ...prev, imageUrl: "" }));
                  }}
                  className="bg-white p-1 rounded-full absolute top-2 right-2"
                >
                  <X color="black" size={18} />
                </button>
              </div>
            )}
            <input
              id="fileUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {!previewUrl && (
              <label
                htmlFor="fileUpload"
                className="w-32 mx-3 flex justify-center items-center border p-5 h-full border-dashed rounded-sm border-black"
              >
                <span className="bg-black text-white px-3.5 py-1 text-3xl rounded-full">
                  +
                </span>
              </label>
            )}
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
              "Add Event"
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
      <AddEvent />
    </Suspense>
  );
}
