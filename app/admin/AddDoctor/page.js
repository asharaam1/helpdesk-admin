"use client";
import { ChevronDown, ChevronRight, Loader2, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState, Suspense } from "react";
import { db } from "@/app/utils/firebaseConfig";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
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

const AddDoctor = () => {
  const { toast } = useToast();
  const { setDoctors } = useAppContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);

  const [formData, setFormData] = useState({
    nameEN: "",
    nameUR: "",
    roleEN: "",
    roleUR: "",
    descriptionEN: "",
    descriptionUR: "",
    startTime: "",
    endTime: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (searchParams) {
      const data = searchParams.get("doctor");
      const parsedData = JSON.parse(data);
      try {
        setFormData(parsedData);
        setPreviewUrl(parsedData.imageUrl);
        setSelectedDays(parsedData.days);
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
    uploadFormData?.append("file", file);
    uploadFormData?.append("upload_preset", "ml_default");
    uploadFormData?.append("cloud_name", "dqzknasup");

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

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleDaySelection = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
    setIsOpen(false);
  };

  const handleSave = async () => {
    if (
      !formData?.nameEN ||
      !formData?.nameUR ||
      !formData?.roleEN ||
      !formData?.roleUR ||
      !formData?.descriptionEN ||
      !formData?.descriptionUR ||
      !formData?.startTime ||
      !formData?.endTime ||
      selectedDays.length === 0 ||
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
      await updateDoc(doc(db, "doctors", formData?.id), {
        ...formData,
        days: selectedDays
      });
      setDoctors((prevDoctors) =>
        prevDoctors.map((doctor) =>
          doctor.id === formData?.id ? { ...doctor, ...formData } : doctor
        )
      );
      setIsEdit(false);
      toast({
        title: "Success",
        description: "Doctor Updated Successfully",
      });
    } else {
      const docRef = await addDoc(collection(db, "doctors"), {
        ...formData,
        days: selectedDays,
      });
      const newDoctor = { id: docRef.id, ...formData };
      setDoctors((prevDoctors) => [newDoctor, ...prevDoctors]);
      toast({
        title: "Success",
        description: "Doctor Added Successfully",
      });
    }
    router.back();
    setFormData({
      nameEN: "",
      nameUR: "",
      roleEN: "",
      roleUR: "",
      descriptionEN: "",
      descriptionUR: "",
      startTime: "",
      endTime: "",
      imageUrl: "",
    });
    setIsLoading(false);
  };

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <div className=" px-4">
      <div className="mb-8">
        <h1 className="md:text-3xl text-2xl font-[SairaSemibold]">
          {isEdit ? "UPDATE DOCTOR" : "ADD DOCTOR"}
        </h1>
      </div>
      <div className="space-y-4">
        <div className="flex flex-col border rounded-tr-md rounded-tl-md">
          <div className="border-b py-3 px-3">
            <label className="font-[SairaRegular] text-sm">DOCTOR NAME</label>
          </div>
          <div className="flex items-center gap-4 py-3 px-3">
            <div className="w-full">
              <label className="font-[SairaRegular] text-sm">Name (EN)</label>
              <Input
                className="h-11"
                name="nameEN"
                placeholder="Enter doctor's name"
                value={formData?.nameEN}
                onChange={handleChange}
                required
              />
            </div>
            <div className="w-full">
              <label className="font-[SairaRegular] text-sm">Name (UR)</label>
              <Input
                className="h-11"
                name="nameUR"
                placeholder="Enter doctor's name"
                value={formData?.nameUR}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col border rounded-tr-md rounded-tl-md">
          <div className="border-b py-3 px-3">
            <label className="font-[SairaRegular] text-sm">DOCTOR ROLE</label>
          </div>
          <div className="flex items-center gap-4 py-3 px-3">
            <div className="w-full">
              <label className="font-[SairaRegular] text-sm">
                Role/Specialization (EN)
              </label>
              <Input
                className="h-11"
                name="roleEN"
                placeholder="Enter specialization (e.g., Surgeon)"
                value={formData?.roleEN}
                onChange={handleChange}
                required
              />
            </div>
            <div className="w-full">
              <label className="font-[SairaRegular] text-sm">
                Role/Specialization (UR)
              </label>
              <Input
                className="h-11"
                name="roleUR"
                placeholder="Enter specialization (e.g., Surgeon)"
                value={formData?.roleUR}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col border rounded-tr-md rounded-tl-md">
          <div className="border-b py-3 px-3">
            <label className="font-[SairaRegular] text-sm">
              DOCTOR DESCRIPTION
            </label>
          </div>
          <div className="py-3 px-3">
            <div>
              <label className="font-[SairaRegular] text-sm">
                Description (EN)
              </label>
              <Textarea
                name="descriptionEN"
                placeholder="Enter a brief description"
                value={formData?.descriptionEN}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="font-[SairaRegular] text-sm">
                Description (UR)
              </label>
              <Textarea
                name="descriptionUR"
                placeholder="Enter a brief description"
                value={formData?.descriptionUR}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col border rounded-tr-md rounded-tl-md">
          <div className="border-b py-3 px-3">
            <label className="font-[SairaRegular] text-sm">
              DOCTOR TIMINGS
            </label>
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
        <div>
          <label className="font-[SairaRegular] text-sm">Days</label>
          <div className="relative">
            <div
              className="flex h-11 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm cursor-pointer"
              onClick={toggleDropdown}
            >
              {selectedDays.length > 0
                ? selectedDays.join(", ")
                : "Select Days"}
              <span className="ml-2">{isOpen ? <ChevronDown /> : <ChevronRight />}</span>
            </div>
            {isOpen && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    onClick={() => handleDaySelection(day)}
                    className="flex items-center p-2 text-sm cursor-pointer hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day)}
                      className="mr-2"
                      readOnly
                    />
                    {day}
                  </div>
                ))}
              </div>
            )}
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
              "Add Doctor"
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
      <AddDoctor />
    </Suspense>
  );
}
