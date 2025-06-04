"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { PatientStats } from "../../components/Patients-Stats";
import { AppointmentList } from "../../components/Appointment-List";
import {
  ArrowUpDown,
  ClipboardList,
  Download,
  FileText,
  HandHeart,
  HeartPulse,
  Newspaper,
  Users,
} from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/app/utils/firebaseConfig";
import { useAppContext } from "@/app/context/useContext";

export default function DashboardPage() {
  const {
    appointments,
    donations,
    subscribers,
    inqueries,
    doctors,
    staff,
    reviews,
  } = useAppContext();
  const [appoints, setAppoints] = useState([]);

  const excellentReviews = reviews.filter((item) => item.label === "Excellent");
  const poorReviews = reviews.filter((item) => item.label === "Poor");
  const goodReviews = reviews.filter((item) => item.label === "Good");
  const veryGoodReviews = reviews.filter((item) => item.label === "Very Good");
  const fineReviews = reviews.filter((item) => item.label === "Fine");

  useEffect(() => {
    const appointCollection = collection(db, "Appointments");

    const unsubscribe = onSnapshot(appointCollection, (snapshot) => {
      const appointData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setAppoints(appointData);
    });

    return () => unsubscribe();
  }, []);

  return (
    // <div className="p-2 min-h-screen bg-[#0190de]">
    <div className="mx-auto px-4 space-y-4">
      <div className="mb-8">
        <h1 className="md:text-3xl text-2xl font-[SairaSemibold] text-gray-900">
          DASHBOARD 👋
        </h1>
        <p className="text-sm mb-5 text-muted-foreground font-[SairaRegular]">
          Keep track of patient updates for the last 7 days. Have a nice day!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-[#0190de]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="md:text-sm font-[SairaMedium] text-muted-foreground mb-1">
                  Appointments
                </p>
                <div className="flex items-center gap-2">
                  <h3 className="md:text-2xl font-[SairaSemibold]">
                    0{appointments?.length}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full font-[SairaRegular] bg-[#0190de] text-white">
                    +2.5%
                  </span>
                </div>
              </div>
              <FileText />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#0190de]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-[SairaMedium] text-muted-foreground mb-1">
                  Donations
                </p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-[SairaSemibold]">
                    0{donations?.length}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#0190de] text-white">
                    +5.4%
                  </span>
                </div>
              </div>
              <HandHeart />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#0190de]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-[SairaMedium] text-muted-foreground mb-1">
                  Total Doctors
                </p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-[SairaSemibold]">
                    0{doctors?.length}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#0190de] text-white">
                    +4.1%
                  </span>
                </div>
              </div>
              <HeartPulse />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#0190de]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-[SairaMedium] text-muted-foreground mb-1">
                  Total Staff
                </p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-[SairaSemibold]">
                    0{staff?.length}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#0190de] text-white">
                    +3.5%
                  </span>
                </div>
              </div>
              <Users />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="py-6">
            <PatientStats />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-[SairaSemibold] text-xl mb-4">
              Patients Satisfactions
            </h3>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-[SairaSemibold]">
                  0{reviews?.length}
                </h2>
                <div className="flex items-center gap-2 text-green-600">
                  <span className="text-lg font-semibold">+3.3%</span>
                  <span className="text-sm text-gray-500">
                    Generated by clients
                  </span>
                </div>
              </div>
              <div className="w-full h-4 rounded-full overflow-hidden mt-2 flex">
                <div
                  className="bg-green-500"
                  style={{
                    width: reviews?.length
                      ? `${(excellentReviews?.length * 100) / reviews?.length}%`
                      : "0%",
                  }}
                ></div>
                <div
                  className="bg-blue-400"
                  style={{
                    width: reviews?.length
                      ? `${(veryGoodReviews?.length * 100) / reviews?.length}%`
                      : "0%",
                  }}
                ></div>
                <div
                  className="bg-orange-400"
                  style={{
                    width: reviews?.length
                      ? `${(goodReviews?.length * 100) / reviews?.length}%`
                      : "0%",
                  }}
                ></div>
                <div
                  className="bg-yellow-400"
                  style={{
                    width: reviews?.length
                      ? `${(fineReviews?.length * 100) / reviews?.length}%`
                      : "0%",
                  }}
                ></div>
                <div
                  className="bg-gray-500"
                  style={{
                    width: reviews?.length
                      ? `${(poorReviews?.length * 100) / reviews?.length}%`
                      : "0%",
                  }}
                ></div>
              </div>
            </div>
            <ul className="space-y-2 font-[SairaMedium]">
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="font-[SairaMedium]">Excellent</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">
                    0{excellentReviews?.length}
                  </span>
                  <span className="text-gray-500">
                    {(excellentReviews?.length * 100) / reviews?.length}%
                  </span>
                </div>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                  <span className="font-[SairaMedium]">Very Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">
                    0{veryGoodReviews?.length}
                  </span>
                  <span className="text-gray-500">
                    {(veryGoodReviews?.length * 100) / reviews?.length}%
                  </span>
                </div>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-orange-400 rounded-full"></span>
                  <span className="font-[SairaMedium]">Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">0{goodReviews?.length}</span>
                  <span className="text-gray-500">
                    {(goodReviews?.length * 100) / reviews?.length}%
                  </span>
                </div>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                  <span className="font-[SairaMedium]">Fair</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">0{fineReviews?.length}</span>
                  <span className="text-gray-500">
                    {(fineReviews?.length * 100) / reviews?.length}%
                  </span>
                </div>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                  <span className="font-[SairaMedium]">Poor</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">0{poorReviews?.length}</span>
                  <span className="text-gray-500">
                    {(poorReviews?.length * 100) / reviews?.length}%
                  </span>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <AppointmentList appointments={appoints} />
        </CardContent>
      </Card>
    </div>
  );
}
