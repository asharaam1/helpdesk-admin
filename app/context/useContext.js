"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../utils/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [appointmentTitles, setAppointmentTitles] = useState([]);
  const [events, setEvents] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [appointments, setAppointments] = useState([]);
  // const [donations, setDonations] = useState([]);
  const [inqueries, setInqueries] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [patients, setPatients] = useState([]);
  
  const [allUsers, setAllUsers] = useState(null);
  const [donations, setDonations] = useState([]);
  const [funds, setFunds] = useState([]);
  const [kycRequests, setKycRequests] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const storedUser = localStorage.getItem("user");
      if (currentUser || storedUser) {

        if (!currentUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(currentUser);
          localStorage.setItem("user", JSON.stringify(currentUser));
        }

        const currentPath = window.location.pathname;
        if (currentPath === "/auth/Login" || currentPath === "/auth/SignUp") {
          router.push("/admin/Dashboard");
        }

      } else {
        localStorage.removeItem("user");
        setUser(null);
        if (window.location.pathname !== "/auth/Login") {
          router.push("/auth/Login");
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchDoctors = async () => {
    try {
      const doctorsSnapshot = await getDocs(collection(db, "doctors"));
      const doctor = doctorsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDoctors(doctor);
      localStorage.setItem("doctors", JSON.stringify(doctor));
    } catch (error) {
      console.error("Error fetching order list:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const servicesSnapshot = await getDocs(collection(db, "services"));
      const service = servicesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(service);
      localStorage.setItem("services", JSON.stringify(service));
    } catch (error) {
      console.error("Error fetching order list:", error);
    }
  };

  const fetchAppointTitle = async () => {
    try {
      const appointTitleSnapshot = await getDocs(collection(db, "appointTitle"));
      const appointTitle = appointTitleSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointmentTitles(appointTitle);
      localStorage.setItem("appointTitles", JSON.stringify(appointTitle));
    } catch (error) {
      console.error("Error fetching order list:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const eventsSnapshot = await getDocs(collection(db, "events"));
      const event = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(event);
      localStorage.setItem("events", JSON.stringify(event));
    } catch (error) {
      console.error("Error fetching order list:", error);
    }
  };

  const fetchFacilities = async () => {
    try {
      const facilitiesSnapshot = await getDocs(collection(db, "facilities"));
      const facility = facilitiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFacilities(facility);
      localStorage.setItem("facilities", JSON.stringify(facility));
    } catch (error) {
      console.error("Error fetching order list:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      const patientsSnapshot = await getDocs(collection(db, "patients"));
      const patient = patientsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPatients(patient);
      localStorage.setItem("patients", JSON.stringify(patient));
    } catch (error) {
      console.error("Error fetching order list:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const appointmentsSnapshot = await getDocs(collection(db, "Appointments"));
      const appointment = appointmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(appointment);
      localStorage.setItem("appointments", JSON.stringify(appointment));
    } catch (error) {
      console.error("Error fetching order list:", error);
    }
  };

  // const fetchDonations = async () => {
  //   try {
  //     const donationsSnapshot = await getDocs(collection(db, "donations"));
  //     const donation = donationsSnapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
  //     setDonations(donation);
  //     localStorage.setItem("donations", JSON.stringify(donation));
  //   } catch (error) {
  //     console.error("Error fetching order list:", error);
  //   }
  // };

  const fetchReviews = async () => {
    try {
      const reviewsSnapshot = await getDocs(collection(db, "reviews"));
      const review = reviewsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(review);
      localStorage.setItem("reviews", JSON.stringify(review));
    } catch (error) {
      console.error("Error fetching order list:", error);
    }
  };

  const fetchContactInqueries = async () => {
    try {
      const inqueriesSnapshot = await getDocs(collection(db, "contactInqueries"));
      const inquerie = inqueriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInqueries(inquerie);
      localStorage.setItem("inqueries", JSON.stringify(inquerie));
    } catch (error) {
      console.error("Error fetching order list:", error);
    }
  };

  const fetchStaff = async () => {
    try {
      const staffSnapshot = await getDocs(collection(db, "staff"));
      const staffs = staffSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStaff(staffs);
      localStorage.setItem("staff", JSON.stringify(staffs));
    } catch (error) {
      console.error("Error fetching order list:", error);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const subscriberSnapshot = await getDocs(collection(db, "subscribers"));
      const subscriber = subscriberSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubscribers(subscriber);
      localStorage.setItem("subscribers", JSON.stringify(subscriber));
    } catch (error) {
      console.error("Error fetching order list:", error);
    }
  };




  const fetchAllUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllUsers(users);
      localStorage.setItem("users", JSON.stringify(users));
    } catch (error) {
      console.error("Error fetching order list:", error);
    }
  };
  const fetchDonations = async () => {
    try {
      const donationsSnapshot = await getDocs(collection(db, "donations"));
      const donation = donationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDonations(donation);
      localStorage.setItem("donations", JSON.stringify(donation));
    } catch (error) {
      console.error("Error fetching order list:", error);
    }
  };
  const fetchFunds = async () => {
    try {
      const fundsSnapshot = await getDocs(collection(db, "fundRequests"));
      const funds = fundsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFunds(funds);
      localStorage.setItem("funds", JSON.stringify(funds));
    } catch (error) {
      console.error("Error fetching funds list:", error);
    }
  };
  const fetchKYCRequests = async () => {
    try {
      const KYCRequestsSnapshot = await getDocs(collection(db, "kycRequests"));
      const kyc = KYCRequestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setKycRequests(kyc);
      localStorage.setItem("KYCRequests", JSON.stringify(kyc));
    } catch (error) {
      console.error("Error fetching kyc list:", error);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchAllUsers(),
        fetchDonations(),
        fetchFunds(),
        fetchKYCRequests(),

        fetchStaff(),
        fetchEvents(),
        fetchDoctors(),
        fetchReviews(),
        fetchPatients(),
        fetchServices(),
        // fetchDonations(),
        fetchFacilities(),
        fetchSubscribers(),
        fetchAppointments(),
        fetchAppointTitle(),
        fetchContactInqueries(),
      ]);
    };
    fetchData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        allUsers,
        donations,
        funds,
        kycRequests,
        setAllUsers,
        setDonations,
        setFunds,
        setKycRequests,

        user,
        staff,
        events,
        reviews,
        doctors,
        patients,
        services,
        // donations,
        inqueries,
        facilities,
        subscribers,
        appointments,
        appointmentTitles,
        setStaff,
        setEvents,
        setDoctors,
        setPatients,
        setServices,
        // setDonations,
        setInqueries,
        setFacilities,
        setSubscribers,
        setAppointments,
        setAppointmentTitles,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};