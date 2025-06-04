"use client";

import { Edit2, Search, Trash } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useAppContext } from "../../context/useContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/app/utils/firebaseConfig";

const Page = () => {
  const { patients } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);

  const handleSearch = () => {
    const filtered = patients.filter((patient) =>
      patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPatients(filtered);
  };

  const handleDelete = async (patientId) => {
    try {
      await deleteDoc(doc(db, "patients", patientId));
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete patient",
      });
    }
  };

  const handleRowClick = (patientId) => {
    router.push(`/admin/Patients/${patientId}`);
  };

  return (
    <div className="px-4">
      <div className="mb-8">
        <h1 className="md:text-3xl text-2xl font-[SairaSemibold] text-gray-900">
          Patients History
        </h1>
        <p className="text-sm mb-5 text-muted-foreground font-[SairaRegular]">
          Manage, search, and organize the patient history with easy updates and
          real-time database syncing.
        </p>
      </div>

      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="Search Patient By ID"
            className="w-full rounded-md border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-[#0190de]-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="gap-2 bg-[#0190de] font-[SairaSemibold] hover:bg-[#0190de] uppercase"
            onClick={handleSearch}
          >
            Search
          </Button>
          <Button
            className="gap-2 bg-[#0190de] font-[SairaSemibold] hover:bg-[#0190de] uppercase"
            onClick={() => router.push("/admin/AddPatient")}
          >
            ADD NEW PATIENT
          </Button>
          <Button
            className="gap-2 bg-[#0190de] font-[SairaSemibold] hover:bg-[#0190de] uppercase"
            onClick={() => router.push("/admin/AddAppointment")}
          >
            ADD APPOINTMENT
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name (EN)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name (UR)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Age
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CNIC
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cell No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <tr
                  key={patient.patientId}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(patient.patientId)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.nameEN}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.nameUR}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.age}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.gender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.CNIC}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.cell}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/EditPatient/${patient.patientId}`);
                        }}
                      >
                        <Edit2 className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(patient.patientId);
                        }}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                >
                  No patients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;