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
  Loader2,
  FileCheck,
  LogOut,
} from "lucide-react";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/utils/firebaseConfig";
import { useAppContext } from "@/app/context/useContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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

  const router = useRouter();
  const [stats, setStats] = useState({
    pendingNeedy: 0,
    pendingKYC: 0,
  });
  const [loading, setLoading] = useState(true);

  const [totalDonations, setTotalDonations] = useState(0);


  const excellentReviews = reviews.filter((item) => item.label === "Excellent");
  const poorReviews = reviews.filter((item) => item.label === "Poor");
  const goodReviews = reviews.filter((item) => item.label === "Good");
  const veryGoodReviews = reviews.filter((item) => item.label === "Very Good");
  const fineReviews = reviews.filter((item) => item.label === "Fine");

  useEffect(() => {


// ==================== FOR TOTAL DONATIONS  =====================

  const fetchDonations = async () => {
    let total = 0;
    const querySnapshot = await getDocs(collection(db, "donations"));
    querySnapshot.forEach((doc) => {
      total += doc.data().amount || 0;
    });
    setTotalDonations(total);
  };

  fetchDonations();


// ==================== FOR TOTAL DONATIONS =====================


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

  const fetchStats = async () => {
    try {
      // Fetch pending needy users count
      const needyQuery = query(
        collection(db, "needyUsers"),
        where("status", "==", "pending")
      );
      const needySnapshot = await getDocs(needyQuery);
      
      // Fetch pending KYC requests count
      const kycQuery = query(
        collection(db, "kycRequests"),
        where("status", "==", "pending")
      );
      const kycSnapshot = await getDocs(kycQuery);

      setStats({
        pendingNeedy: needySnapshot.size,
        pendingKYC: kycSnapshot.size,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminId");
    router.push("/auth/Login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-gray-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Image
                src="/logo-donation.png"
                alt="Logo"
                width={40}
                height={40}
                className="mr-3"
              />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Needy Approval Card */}
          <Link href="/admin/NeedyApproval">
            <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending Needy Approvals
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {stats.pendingNeedy}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-blue-700 hover:text-blue-900">
                    View all pending approvals →

                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* KYC Approval Card */}
          <Link href="/admin/KYCApproval">
            <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <FileCheck className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending KYC Verifications
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {stats.pendingKYC}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-green-700 hover:text-green-900">
                    View all KYC requests →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/NeedyApproval">
              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium text-gray-900">Review Needy Applications</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Approve or reject pending needy user applications
                </p>
              </div>
            </Link>
            <Link href="/admin/KYCApproval">
              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium text-gray-900">Process KYC Requests</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Verify and approve pending KYC documentation
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
