"use client";

import { Search, Trash } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useEffect, useState } from "react";
import { db } from "@/app/utils/firebaseConfig";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppContext } from "../../context/useContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

export default function DoctorsPage() {
  const { toast } = useToast();
  const { staff, setStaff } = useAppContext();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAndSortedStaff, setFilteredAndSortedStaff] = useState([]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      await deleteDoc(doc(db, "staff", id));
      setStaff((prevStaff) => prevStaff.filter((staff) => staff.id !== id));
      toast({
        title: "Success",
        description: "Staff Deleted Successfully",
      });
    }
  };

  useEffect(() => {
    const filteredStaff = staff.filter((staffMember) => {
      const staffName = staffMember.nameEN || staffMember.nameUR;
      return staffName.toLowerCase().includes(searchQuery.toLowerCase());
    });
    const sortedFilteredStaff = filteredStaff.sort(
      (a, b) => (a?.order || 0) - (b?.order || 0)
    );
    setFilteredAndSortedStaff(sortedFilteredStaff);
  }, [staff, searchQuery]);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;
    const updatedStaff = Array.from(filteredAndSortedStaff);
    const [movedItem] = updatedStaff.splice(source.index, 1);
    updatedStaff.splice(destination.index, 0, movedItem);

    setFilteredAndSortedStaff(updatedStaff);

    setStaff((prevStaff) => {
      return prevStaff.map((staffMember) => {
        const newIndex = updatedStaff.findIndex((f) => f.id === staffMember.id);
        return { ...staffMember, order: newIndex };
      });
    });

    updatedStaff.forEach((staffMember, index) => {
      updateDoc(doc(db, "staff", staffMember.id), { order: index });
    });
  };

  return (
    <div className="px-4">
      <div className="mb-8">
        <h1 className="md:text-3xl text-2xl font-[SairaSemibold] text-gray-900">
          Staff List
        </h1>
        <p className="text-sm mb-5 text-muted-foreground font-[SairaRegular]">
          Manage, search, and update the staff list with seamless organization
          and real-time database syncing.
        </p>
      </div>

      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Search Staff By Name"
            className="w-full rounded-md border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <Button
          className="gap-2 bg-[#0190de] font-[SairaSemibold] hover:bg-[#0190de] uppercase"
          onClick={() => {
            router.push("/admin/AddStaff");
          }}
        >
          Add Staff
        </Button>
      </div>

      <div className="flex flex-wrap gap-6">
        {filteredAndSortedStaff.length > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="staff" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-wrap gap-6"
                >
                  {filteredAndSortedStaff.map((staffMember, index) => (
                    <Draggable
                      key={staffMember.id}
                      draggableId={staffMember.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] md:w-[calc(33.33%-16px)] lg:w-[calc(25%-18px)]"
                        >
                          <Card
                            key={staffMember.id}
                            className="relative bg-white cursor-pointer h-[50vh]"
                            onClick={() => {
                              router.push(
                                `/admin/AddStaff?staff=${encodeURIComponent(
                                  JSON.stringify(staffMember)
                                )}`
                              );
                            }}
                          >
                            <img
                              src={staffMember.imageUrl}
                              alt={staffMember.nameEN}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute right-3 top-2">
                              <button className="rounded-full bg-white p-2 shadow-lg">
                                <Trash
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(staffMember.id);
                                  }}
                                  className="w-4 h-4 text-gray-800 cursor-pointer"
                                />
                              </button>
                            </div>

                            <div className="h-2/5 w-full p-2 absolute bottom-0 bg-gray-100 opacity-90 z-10">
                              <h1 className="mb-2 text-center text-xl font-[SairaSemibold]">
                                {staffMember.nameEN || staffMember.nameUR}
                              </h1>
                              <p className="text-sm text-center text-gray-600 font-bold font-[SairaSemibold]">
                                {staffMember.roleEN || staffMember.roleUR}
                              </p>
                            </div>
                          </Card>
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
          <div className="w-full text-gray-700">
            <h1 className="text-center font-[SairaMedium]">No Staff Found.</h1>
          </div>
        )}
      </div>
    </div>
  );
}