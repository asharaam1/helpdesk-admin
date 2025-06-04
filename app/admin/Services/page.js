"use client";
import { useAppContext } from "@/app/context/useContext";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const page = () => {
  const { toast } = useToast();
  const { services, setServices } = useAppContext();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAndSortedService, setFilteredAndSortedService] = useState([]);

  useEffect(() => {
    const filteredServices = services.filter((service) => {
      const serviceTitle = service.titleEN || service.titleUR;
      return serviceTitle.toLowerCase().includes(searchQuery.toLowerCase());
    });
    const sortedFilteredServices = filteredServices.sort(
      (a, b) => (a?.order || 0) - (b?.order || 0)
    );
    setFilteredAndSortedService(sortedFilteredServices);
  }, [services, searchQuery]);

  return (
    <div className="px-4">
      <div className="mb-8">
        <h1 className="md:text-3xl text-2xl font-[SairaSemibold] text-gray-900">
          Manage Services
        </h1>

        <p className="text-sm mb-5 text-muted-foreground font-[SairaRegular]">
          Manage, organize, and update services seamlessly with search,
          drag-and-drop, and real-time database syncing.
        </p>
      </div>
      <div className="mb-8 flex gap-3 justify-between items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Search service name"
            className="w-full rounded-md border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-[#0190de]-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <Button
            className="gap-2 bg-[#0190de] font-[SairaSemibold] hover:bg-[#0190de] uppercase"
            onClick={() => {
              router.push("/admin/AddService");
            }}
          >
            Add Service
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-5">

      </div>
    </div>
  );
};

export default page;
