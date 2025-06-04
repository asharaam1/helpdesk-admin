"use client";
import { Loader2, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState, Suspense } from "react";
import { db } from "@/app/utils/firebaseConfig";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const AddStaff = () => {
  const { toast } = useToast();
  const [isEdit, setIsEdit] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    nameEN: "",
    nameUR: "",
    roleEN: "",
    roleUR: "",
    descriptionEN: "",
    descriptionUR: "",
    imageUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
      if (searchParams) {
        const data = searchParams.get("staff");
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
      !formData?.nameEN ||
      !formData?.nameUR ||
      !formData?.roleEN ||
      !formData?.roleUR ||
      !formData?.imageUrl
    ) {
      toast({
        title: "Error",
        description: "All fields are required",
      });
      return;
    }
    setIsLoading(true);
    if (isEdit) {
      await updateDoc(doc(db, "staff", formData?.id), formData);
      setStaff((prevStaff) =>
        prevStaff.map((staff) =>
          staff.id === formData?.id ? { ...staff, ...formData } : staff
        )
      );
      setIsEdit(false);
      toast({
        title: "Success",
        description: "Staff Updated Successfully",
      });
    } else {
      const docRef = await addDoc(collection(db, "staff"), formData);
      const newDoctor = { id: docRef.id, ...formData };
      setStaff((prevStaff) => [newDoctor, ...prevStaff]);
      toast({
        title: "Success",
        description: "Staff Added Successfully",
      });
    }
    router.back();
    setFormData({
      nameEN: "",
      nameUR: "",
      roleEN: "",
      roleUR: "",
      imageUrl: "",
    });
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="md:text-3xl text-2xl font-[SairaSemibold]">
          {isEdit ? "UPDATE STAFF MEMBER" : "ADD STAFF MEMBER"}
        </h1>
        <div className="mt-2 font-[SairaRegular] flex items-center">
          <span>Dashboard</span>
          <span className="mx-2">/</span>
          <span className="text-[#0190de]">
            {isEdit ? "Update Staff Member" : "Add Staff Member"}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col border rounded-tr-md rounded-tl-md">
          <div className="border-b px-3 py-3">
            <label className="font-[SairaRegular] text-sm">
              STAFF MEMBER NAME
            </label>
          </div>
          <div className="flex items-center gap-4 px-3 py-3">
            <div className="w-full">
              <label className="font-[SairaRegular] text-sm">
                Name (English)
              </label>
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
              <label className="font-[SairaRegular] text-sm">Name (Urdu)</label>
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
          <div className="border-b px-3 py-3">
            <label className="font-[SairaRegular] text-sm">
              STAFF MEMBER ROLE
            </label>
          </div>
          <div className="flex items-center gap-4 px-3 py-3">
            <div className="w-full">
              <label className="font-[SairaRegular] text-sm">
                Role/Specialization (English)
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
                Role/Specialization (Urdu)
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
              STAFF MEMBER DESCRIPTION
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
              "Add Staff"
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
      <AddStaff />
    </Suspense>
  );
}