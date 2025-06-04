"use client";
import { ChevronDown, ChevronRight, Loader2, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState, Suspense } from "react";
import { db } from "@/app/utils/firebaseConfig";
import { addDoc, collection, doc, setDoc, updateDoc } from "firebase/firestore";
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
  const { setPatients, patients } = useAppContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    nameEN: "",
    nameUR: "",
    dob: "",
    age: "",
    cell: "",
    addressEN: "",
    addressUR: "",
    CNIC: "",
    imageUrl: "",
    gender: "",
    disabilityType: "none",
    city: "",
    province: "",
    patientId: "",
  });

  useEffect(() => {
    if (searchParams) {
      const data = searchParams.get("patient");
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

  const handleSelectChange = (name, value) => {
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

  const handleSave = async () => {
    if (
      !formData?.nameEN ||
      !formData?.dob ||
      !formData?.age ||
      !formData?.cell ||
      !formData?.addressEN ||
      !formData?.addressUR ||
      !formData?.CNIC ||
      !formData?.nameUR ||
      !formData?.patientId ||
      !formData?.city || !formData?.province || !formData?.gender
    ) {
      toast({
        title: "Error",
        description: "All Fields are required",
      });
      return;
    }
    setIsLoading(true);
    if (isEdit) {
      await updateDoc(doc(db, "patients", formData?.id), formData);
      setPatients((prevPatients) =>
        prevPatients.map((patient) =>
          patient.id === formData?.id ? { ...patient, ...formData } : patient
        )
      );
      setIsEdit(false);
      toast({
        title: "Success",
        description: "Patient Updated Successfully",
      });
    } else {
      setDoc(doc(db, "patients", formData?.patientId), {
        ...formData,
        createdAt: Date.now(),
      });
      const newPatient = { id: formData?.patientId, ...formData };
      setPatients((prevPatients) => [newPatient, ...prevPatients]);
      toast({
        title: "Success",
        description: "Patient Added Successfully",
      });
    }
    router.back();
    setFormData({
        nameEN: "",
        nameUR: "",
        dob: "",
        age: "",
        cell: "",
        addressEN: "",
        addressUR: "",
        CNIC: "",
        imageUrl: "",
        gender: "",
        disabilityType: "",
        city: "",
        province: "",
    });
    setIsLoading(false);
  };

  return (
    <div className=" px-4">
      <div className="mb-8">
        <h1 className="md:text-3xl text-2xl font-[SairaSemibold]">
          {isEdit ? "UPDATE PATIENT HISTORY" : "ADD PATIENT HISTORY"}
        </h1>
      </div>
      <div className="space-y-4">
        <div className="flex flex-col border rounded-tr-md rounded-tl-md">
          <div className="border-b py-3 px-3">
            <label className="font-[SairaRegular] text-sm">PATIENT NAME</label>
          </div>
          <div className="flex items-center gap-4 py-3 px-3">
            <div className="w-full">
              <label className="font-[SairaRegular] text-sm">Name (EN)</label>
              <Input
                className="h-11"
                name="nameEN"
                placeholder="Enter Patient's name"
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
                placeholder="Enter Patient's name"
                value={formData?.nameUR}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col border rounded-tr-md rounded-tl-md">
          <div className="border-b py-3 px-3">
            <label className="font-[SairaRegular] text-sm">PATIENT AGE</label>
          </div>
          <div className="flex items-center gap-4 py-3 px-3">
            <div className="w-full">
              <label className="font-[SairaRegular] text-sm">
                Date Of Birth
              </label>
              <Input
                type="date"
                className="h-11"
                name="dob"
                value={formData?.dob}
                onChange={handleChange}
                required
              />
            </div>
            <div className="w-full">
              <label className="font-[SairaRegular] text-sm">Age</label>
              <Input
                className="h-11"
                name="age"
                placeholder="Enter Age"
                value={formData?.age}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col border rounded-tr-md rounded-tl-md">
          <div className="border-b py-3 px-3">
            <label className="font-[SairaRegular] text-sm">
              PATIENT PERSONAL INFO
            </label>
          </div>
          <div className="flex flex-col gap-3 py-3 px-3">
            <div className="flex items-center gap-4">
              <div className="w-full">
                <label className="font-[SairaRegular] text-sm">Gender</label>
                <Select value={formData?.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full">
                <label className="font-[SairaRegular] text-sm">
                  Disability Type
                </label>
                <Select value={formData?.disabilityType} onValueChange={(value) => handleSelectChange("disabilityType", value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Disability Type" />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                    <SelectItem value="visual">Visual Impairment</SelectItem>
                    <SelectItem value="hearing">Hearing Impairment</SelectItem>
                    <SelectItem value="physical">
                      Physical Disability
                    </SelectItem>
                    <SelectItem value="cognitive">
                      Cognitive Disability
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-4">
            <div className="w-full">
                <label className="font-[SairaRegular] text-sm">
                  Patient ID
                </label>
                <Input
                  className="h-11"
                  name="patientId"
                  placeholder="Enter Patient ID"
                  value={formData?.patientId}
                  onChange={handleChange}
                />
              </div>
              <div className="w-full">
                <label className="font-[SairaRegular] text-sm">
                  Cell No.
                </label>
                <Input
                  className="h-11"
                  name="cell"
                  placeholder="Enter a Cell Number"
                  value={formData?.cell}
                  onChange={handleChange}
                />
              </div>
              <div className="w-full">
                <label className="font-[SairaRegular] text-sm">
                  CNIC
                </label>
                <Input
                  className="h-11"
                  name="CNIC"
                  placeholder="Enter CNIC"
                  value={formData?.CNIC}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col border rounded-tr-md rounded-tl-md">
          <div className="border-b py-3 px-3">
            <label className="font-[SairaRegular] text-sm">
              PATIENT ADDRESS
            </label>
          </div>
          <div className="flex flex-col gap-3 px-3 py-3">
            <div className="flex items-center gap-4">
            <div className="w-full">
                <label className="font-[SairaRegular] text-sm">Province</label>
                <Select value={formData?.province} onValueChange={(value) => handleSelectChange("province", value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sindh">Sindh</SelectItem>
                    <SelectItem value="Punjab">Punjab</SelectItem>
                    <SelectItem value="KPK">KPK</SelectItem>
                    <SelectItem value="Balochistan">Balochistan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full">
                <label className="font-[SairaRegular] text-sm">City</label>
                <Select value={formData?.city} onValueChange={(value) => handleSelectChange("city", value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Karachi">Karachi</SelectItem>
                    <SelectItem value="Lahore">Lahore</SelectItem>
                    <SelectItem value="Islamabad">Islamabad</SelectItem>
                    <SelectItem value="Faislabad">Faislabad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-4">
            <div className="w-full">
              <label className="font-[SairaRegular] text-sm">Address (English)</label>
              <Textarea
                className="h-11"
                name="addressEN"
                placeholder="Enter address"
                value={formData?.addressEN}
                onChange={handleChange}
                required
              />
            </div>
            <div className="w-full">
              <label className="font-[SairaRegular] text-sm">Address (Urdu)</label>
              <Textarea
                className="h-11"
                name="addressUR"
                placeholder="Enter address"
                value={formData?.addressUR}
                onChange={handleChange}
                required
              />
            </div>
            </div>
          </div>
        </div>
        <div className="md:w-full border rounded-xl">
          <div className="border-b px-5 p-3 text-lg">
            <div className="cursor-pointer">Upload image (Optional)</div>
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
              "Add Patient"
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
