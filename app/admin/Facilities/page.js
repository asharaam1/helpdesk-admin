"use client";
import { db } from "@/app/utils/firebaseConfig";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import {
  BriefcaseBusiness,
  Edit,
  Hospital,
  Pill,
  Plus,
  Radio,
  Search,
  Trash,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppContext } from "../../context/useContext";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const page = () => {
  const { toast } = useToast();
  const { facilities, setFacilities } = useAppContext();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAndSortedFacilities, setFilteredAndSortedFacilities] =
    useState([]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Facility?")) {
      await deleteDoc(doc(db, "facilities", id));
      setFacilities((prevFacilities) =>
        prevFacilities.filter((facility) => facility.id !== id)
      );
      toast({
        title: "Success",
        description: "Facility Deleted Successfully",
      });
    }
  };

  useEffect(() => {
    const filteredFacilities = facilities.filter((user) => {
      const titleName = user?.titleEN || user.titleUR;
      return titleName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const sortedFilteredFacilities = filteredFacilities.sort(
      (a, b) => (a?.order || 0) - (b?.order || 0)
    );

    setFilteredAndSortedFacilities(sortedFilteredFacilities);
  }, [facilities, searchQuery]);

  const iconMap = {
    Hospital: Hospital,
    Radio: Radio,
    BriefcaseBusiness: BriefcaseBusiness,
    Pill: Pill,
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;
    const updatedFacilities = Array.from(filteredAndSortedFacilities);
    const [movedItem] = updatedFacilities.splice(source.index, 1);
    updatedFacilities.splice(destination.index, 0, movedItem);

    setFilteredAndSortedFacilities(updatedFacilities);

    setFacilities((prevFacilities) => {
      return prevFacilities.map((facility) => {
        const newIndex = updatedFacilities.findIndex(
          (f) => f.id === facility.id
        );
        return { ...facility, order: newIndex };
      });
    });

    updatedFacilities.forEach((facility, index) => {
      updateDoc(doc(db, "facilities", facility.id), { order: index });
    });
  };

  return (
    <div className="px-4">
      <div className="mb-8">
         <h1 className="md:text-3xl text-2xl font-[SairaSemibold] text-gray-900">Manage Facilities</h1>
        <p className="text-sm mb-5 text-muted-foreground font-[SairaRegular]">Manage, organize, and update facilities effortlessly with search, drag-and-drop, and real-time database syncing.</p>
      </div>

      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">

          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              placeholder="Search Facilities..."
              className="w-full rounded-md border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-[#0190de]-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

          <Button className="gap-2 bg-[#0190de] font-[SairaSemibold] hover:bg-[#0190de] uppercase" onClick={() => {router.push("/admin/AddFacility"); }}>
            Add Facilities
          </Button>
        </div>

      <div className="gap-5">
        {filteredAndSortedFacilities.length > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="services">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="w-full space-x-2 space-y-2 gap-5"
                >
                  {filteredAndSortedFacilities.map((facility, index) => (
                    <Draggable
                      key={facility.id}
                      draggableId={facility.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => {
                            router.push(
                              `/admin/AddFacility?facility=${encodeURIComponent(
                                JSON.stringify(facility)
                              )}`
                            );
                          }}
                          className="relative py-3 rounded-lg w-full duration-300 w-full cursor-pointer flex gap-5 justify-start items-center"
                        >
                          <div className="md:w-24 px-4 bg-slate-50">
                            {iconMap[facility.icon]
                              ? React.createElement(iconMap[facility.icon], {
                                  className: "h-16 w-16 text-[#0190de]0",
                                }) :
                                facility.imageUrl ?
                                <img
                                src={facility.imageUrl}
                                alt={facility.titleEN || facility.titleUR}
                                className="h-auto w-60 object-cover rounded-md"
                                />
                                : "N/A"
                            }
                          </div>
                          <div className="text-left md:w-4/5">
                            <h3 className="text-2xl font-[SairaSemibold] text-gray-800 md:w-5/5">
                              {facility.titleEN || facility.titleUR}
                            </h3>
                            <p className="text-sm line-clamp-2 font-[SairaRegular] text-gray-600 mt-2">
                              {facility.descriptionEN || facility.descriptionUR}
                            </p>
                          </div>
                          <div className="absolute flex top-3 right-3 gap-2 z-10">
                            <Trash
                              onClick={() => handleDelete(facility.id)}
                              className="w-5 h-5 text-gray-800 cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="mt-10 w-full">
            <p className="text-center text-gray-500 font-[SairaMedium]">
              No Facilities found
            </p>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default page;
