"use client";
import { db } from "@/app/utils/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import {
  addDoc,
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { Edit } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

const page = () => {
  const { toast } = useToast();
  const [phone, setPhone] = useState();
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [webInfo, setWebInfo] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [For, setFor] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState();

  useEffect(() => {
    const unsubscribeContacts = onSnapshot(
      doc(db, "webInfo", "data"),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setWebInfo(docSnapshot.data());
        } else {
          console.log("No such document exists!");
          setWebInfo(null);
        }
      }
    );

    const unsubscribeImages = onSnapshot(
      doc(db, "webInfo", "images"),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setImages(docSnapshot.data());
        } else {
          console.log("No such document exists!");
          setImages(null);
        }
      }
    );

    return () => {
      unsubscribeContacts();
      unsubscribeImages();
    };
  }, []);

  const addPhone = async () => {
    try {
      if (isEdit) {
        await updateDoc(doc(db, "webInfo", "data"), { phone }, { merge: true });
        setIsEdit(false);
        toast({
          title: "Success",
          description: "Updated Phone Number",
        });
      } else {
        await setDoc(doc(db, "webInfo", "data"), { phone }, { merge: true });
        toast({
          title: "Success",
          description: "Added Phone Number Successfully",
        });
      }
      setPhone("");
    } catch (error) {
      console.error("Error adding phone number: ", error);
    }
  };

  const addEmail = async () => {
    try {
      if (isEdit) {
        await updateDoc(doc(db, "webInfo", "data"), { email }, { merge: true });
        setIsEdit(false);
        toast({
          title: "Success",
          description: "Updated Email Successfully",
        });
      } else {
        await setDoc(doc(db, "webInfo", "data"), { email }, { merge: true });
        toast({
          title: "Success",
          description: "Added Email Successfully",
        });
      }
      setEmail("");
    } catch (error) {
      console.error("Error adding phone number: ", error);
    }
  };

  const addLocation = async () => {
    try {
      if (isEdit) {
        await updateDoc(
          doc(db, "webInfo", "data"),
          { location },
          { merge: true }
        );
        setIsEdit(false);
        toast({
          title: "Success",
          description: "Updated Location Successfully",
        });
      } else {
        await setDoc(doc(db, "webInfo", "data"), { location }, { merge: true });
        toast({
          title: "Success",
          description: "Added Location Successfully",
        });
      }
      setLocation("");
    } catch (error) {
      console.error("Error adding location: ", error);
    }
  };

  const addMapLink = async () => {
    try {
      if (isEdit) {
        await updateDoc(
          doc(db, "webInfo", "data"),
          { mapLink },
          { merge: true }
        );
        setIsEdit(false);
        toast({
          title: "Success",
          description: "Updated Maplink Successfully",
        });
      } else {
        await setDoc(doc(db, "webInfo", "data"), { mapLink }, { merge: true });
        toast({
          title: "Success",
          description: "Added Maplink Successfully",
        });
      }
      setMapLink("");
    } catch (error) {
      console.error("Error adding map link: ", error);
    }
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
      setImageUrl(imageUrl);
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      alert("Image upload failed. Please try again.");
    }
  };

  const addImages = async () => {
    try {
      await setDoc(
        doc(db, "webInfo", "images"),
        {
          [For]: imageUrl,
        },
        { merge: true }
      );
      toast({
        title: "Success",
        description: "Image Added Successfully",
      });
      setImageUrl("");
      setFor("");
    } catch (error) {
      console.error("Error adding images: ", error);
    }
  };

  return (
    <div className="px-4">
      <div className="mb-8">
        <h1 className="md:text-3xl text-2xl font-[SairaSemibold] text-gray-900">
          Web Info
        </h1>
        <p className="text-sm mb-5 text-muted-foreground font-[SairaRegular]">
          Manage and update website information with real-time syncing and easy
          content organization.
        </p>
      </div>

      <div className="flex md:flex-row flex-col gap-5 w-full">
        <div className="p-3 border rounded-md w-full">
          <label className="font-[SairaSemibold] text-sm">Contact Number</label>
          <div className="flex justify-between gap-2">
            {webInfo?.phone ? (
              <>
                {isEdit ? (
                  <>
                    <Input
                      value={phone}
                      type="number"
                      placeholder="Contact Number*"
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <Button
                      className="bg-[#0190de] text-white"
                      onClick={addPhone}
                    >
                      UPDATE
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="font-[SairaRegular] text-sm text-muted-foreground">
                      {webInfo?.phone}
                    </span>
                    <Edit
                      className="text-[#0190de]0 hover:text-[#0190de] h-5 w-5 cursor-pointer"
                      onClick={() => {
                        setIsEdit(true);
                        setPhone(webInfo?.phone);
                      }}
                    />
                  </>
                )}
              </>
            ) : (
              <>
                <Input
                  value={phone}
                  type="number"
                  placeholder="Contact Number*"
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Button className="bg-[#0190de] text-white" onClick={addPhone}>
                  ADD
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="p-3 border rounded-md w-full">
          <label className="font-[SairaSemibold] text-sm">Contact Number</label>
          <div className="flex gap-2">
            <Input placeholder="Contact Number*" />
            <Button className="bg-[#0190de] text-white">ADD</Button>
          </div>
        </div>
      </div>
      <div className="flex gap-5 w-full mt-5">
        <div className="p-3 border rounded-md w-full">
          <label className="font-[SairaSemibold] text-sm">Contact Email</label>
          <div className="flex justify-between gap-2">
            {webInfo?.email ? (
              <>
                {isEdit ? (
                  <>
                    <Input
                      value={email}
                      type="email"
                      placeholder="Contact Email*"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                      className="bg-[#0190de] text-white"
                      onClick={addEmail}
                    >
                      UPDATE
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="font-[SairaRegular] text-sm text-muted-foreground">
                      {webInfo?.email}
                    </span>
                    <Edit
                      className="text-[#0190de]0 hover:text-[#0190de] h-5 w-5 cursor-pointer"
                      onClick={() => {
                        setIsEdit(true);
                        setEmail(webInfo?.email);
                      }}
                    />
                  </>
                )}
              </>
            ) : (
              <>
                <Input
                  value={email}
                  type="email"
                  placeholder="Contact Email*"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button className="bg-[#0190de] text-white" onClick={addEmail}>
                  ADD
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="p-3 border rounded-md w-full">
          <label className="font-[SairaSemibold] text-sm">Location</label>
          <div className="flex justify-between gap-2">
            {webInfo?.location ? (
              <>
                {isEdit ? (
                  <>
                    <Input
                      value={location}
                      type="text"
                      placeholder="Location*"
                      onChange={(e) => setLocation(e.target.value)}
                    />
                    <Button
                      className="bg-[#0190de] text-white"
                      onClick={addLocation}
                    >
                      UPDATE
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="font-[SairaRegular] text-sm text-muted-foreground">
                      {webInfo?.location}
                    </span>
                    <Edit
                      className="text-[#0190de]0 hover:text-[#0190de] h-5 w-5 cursor-pointer"
                      onClick={() => {
                        setIsEdit(true);
                        setLocation(webInfo?.location);
                      }}
                    />
                  </>
                )}
              </>
            ) : (
              <>
                <Input
                  value={location}
                  type="text"
                  placeholder="Location*"
                  onChange={(e) => setLocation(e.target.value)}
                />
                <Button
                  className="bg-[#0190de] text-white"
                  onClick={addLocation}
                >
                  ADD
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="mt-5">
        <div className="p-3 border rounded-md w-full">
          <div className="flex justify-between items-center">
            <label className="font-[SairaSemibold] text-sm">Map Link</label>
            {webInfo?.mapLink && (
              <Edit
                className="text-[#0190de]0 hover:text-[#0190de] h-5 w-5 cursor-pointer"
                onClick={() => {
                  setIsEdit(true);
                  setMapLink(webInfo?.mapLink);
                }}
              />
            )}
          </div>
          <div className="flex gap-2">
            {webInfo?.mapLink ? (
              <>
                {isEdit ? (
                  <>
                    <Input
                      value={mapLink}
                      type="text"
                      placeholder="Map Link*"
                      onChange={(e) => setMapLink(e.target.value)}
                    />
                    <Button
                      className="bg-[#0190de] text-white"
                      onClick={addMapLink}
                    >
                      UPDATE
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="break-all font-[SairaRegular] text-sm text-muted-foreground">
                      {webInfo?.mapLink}
                    </span>
                  </>
                )}
              </>
            ) : (
              <>
                <Input
                  value={mapLink}
                  type="text"
                  placeholder="Map Link*"
                  onChange={(e) => setMapLink(e.target.value)}
                />
                <Button
                  className="bg-[#0190de] text-white"
                  onClick={addMapLink}
                >
                  ADD
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-[SairaSemibold] mt-8 mb-2">Web Images</h1>
      <div className="p-3 border rounded-md w-full flex justify-center items-end gap-4">
        <div className="w-full flex flex-col gap-2">
          <label className="font-[SairaSemibold] text-sm">Image Url</label>
          <input
            id="fileUpload"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files[0])}
          />
        </div>
        <div className="w-full">
          <label className="font-[SairaSemibold] text-sm">For</label>
          <Select
            // defaultValue="aboutUsSection"
            value={For}
            onValueChange={(value) => setFor(value)}
          >
            <SelectTrigger className="py-5">
              <SelectValue placeholder="For" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="banner">Banner</SelectItem>
              <SelectItem value="aboutUsSection">About Us Section</SelectItem>
              <SelectItem value="aboutUsPage">About Us Page</SelectItem>
              <SelectItem value="servicesPage">Services Page</SelectItem>
              <SelectItem value="CorporatePage">Corporate Page</SelectItem>
              <SelectItem value="ContactPage">Contact Page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-[#0190de] text-white" onClick={addImages}>
          ADD
        </Button>
      </div>

      <div className="mt-6">
        <div className="grid md:grid-cols-4 gap-4">
        <div className="border p-4 rounded-md">
            <h1 className="font-[SairaMedium] pb-2">Banner</h1>
            <img
              className="w-full md:object-contain object-cover h-40"
              src={images?.banner}
            ></img>
          </div>
          <div className="border p-4 rounded-md">
            <h1 className="font-[SairaMedium] pb-2">About Us Section</h1>
            <img
              className="w-full md:object-contain object-cover h-40"
              src={images?.aboutUsSection}
            ></img>
          </div>
          <div className="border p-4 rounded-md">
            <h1 className="font-[SairaMedium] pb-2">About Us Page</h1>
            <img
              className="w-full md:object-contain object-cover h-40"
              src={images?.aboutUsPage}
            ></img>
          </div>
          <div className="border p-4 rounded-md">
            <h1 className="font-[SairaMedium] pb-2">Services Page</h1>
            <img
              className="w-full md:object-contain object-cover h-40"
              src={images?.servicesPage}
            ></img>
          </div>
          <div className="border p-4 rounded-md">
            <h1 className="font-[SairaMedium] pb-2">Corporate Page</h1>
            <img
              className="w-full md:object-contain object-cover h-40"
              src={images?.CorporatePage}
            ></img>
          </div>
          <div className="border p-4 rounded-md">
            <h1 className="font-[SairaMedium] pb-2">Contact Page</h1>
            <img
              className="w-full md:object-contain object-cover h-40"
              src={images?.ContactPage}
            ></img>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default page;
