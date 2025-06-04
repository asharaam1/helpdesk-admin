"use client";
import { useAppContext } from "@/app/context/useContext";
import { db } from "@/app/utils/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { Loader2, X } from "lucide-react";
import React, { useEffect, useState, Suspense } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const AddService = () => {
  const { toast } = useToast();
  const { setServices } = useAppContext();
  const searchParams = useSearchParams();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const router = useRouter();

  const [formData, setFormData] = useState({
    titleEN: "",
    titleUR: "",
    descriptionEN: "",
    descriptionUR: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (searchParams) {
      const data = searchParams.get("service");
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
    console.log("🚀 ~ handleChange ~ value:", value);
    console.log("🚀 ~ handleChange ~ name:", name);
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
      setIsUploading(true);
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dqzknasup/image/upload`,
        uploadFormData
      );
      const imageUrl = response.data.secure_url;
      setFormData((prev) => ({ ...prev, imageUrl }));
      setIsUploading(false);
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      alert("Image upload failed. Please try again.");
      setIsUploading(false);
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
      await updateDoc(doc(db, "services", formData?.id), formData);
      setServices((prevServices) =>
        prevServices.map((service) =>
          service.id === formData?.id ? { ...service, ...formData } : service
        )
      );
      setIsEdit(false);
      toast({
        title: "Success",
        description: "Service Updated Successfully",
      });
    } else {
      const docRef = await addDoc(collection(db, "services"), formData);
      const newServices = { id: docRef.id, ...formData };
      setServices((prevServices) => [newServices, ...prevServices]);
      toast({
        title: "Success",
        description: "Service Added successfully",
      });
    }
    router.back();
    setFormData({
      titleEN: "",
      titleUR: "",
      descriptionEN: "",
      descriptionUR: "",
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
          {isEdit ? "UPDATE SERVICE" : "ADD SERVICE"}
        </h1>
        <div className="mt-2 font-[SairaRegular] flex items-center">
          <span>Dashboard</span>
          <span className="mx-2">/</span>
          <span className="text-[#0190de]">
            {isEdit ? "Update Service" : "Add Service"}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col border rounded-tr-md rounded-tl-md">
          <div className="border-b px-3 py-3">
            <label className="font-[SairaRegular] text-sm">SERVICE TITLE</label>
          </div>
          <div className="flex items-center gap-4 px-3 py-3">
            <div className="w-full">
              <label className="font-[SairaRegular] text-sm">
                Title (English)
              </label>
              <Input
                className="h-11"
                name="titleEN"
                placeholder="Enter service title"
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
                placeholder="Enter service title"
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
              SERVICE DESCRIPTION
            </label>
          </div>
          <div className="py-3 px-3">
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
              "Add Service"
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
      <AddService />
    </Suspense>
  );
}
