"use client";
import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../utils/firebaseConfig";
import { User, Lock, Eye, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doc, setDoc } from "firebase/firestore";
import Image from "next/image";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignUpPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      toast.error("All fields are required");
      return;
    }
    setIsLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (response) => {
        const uid = response.user.uid;
        const userData = { name, email };
        await setDoc(doc(db, "adminUsers", uid), userData);
        router.push("/admin/Dashboard");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
        // ..
      });
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      <div className="w-full md:flex md:w-2/4 hidden relative justify-center items-center">
        <Image src="/login.jpg" fill alt="login page" />
      </div>

      <div className="w-full md:w-2/4 flex flex-col justify-center h-full items-center">
        <div className="w-32 h-20 md:w-48 md:h-28 relative mb-5">
          <Image src="/mmt-logo.png" fill alt="Logo" />
        </div>

        <div className="w-full md:w-2/3 flex flex-col justify-center md:bg-white rounded md:shadow-md p-6">
          <h2 className="text-xl md:text-2xl font-[SairaSemibold] text-center mb-6">
            Sign Up
          </h2>

          <div className="relative mb-4">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Name"
              className="w-full pl-10 py-2 border rounded text-sm font-[SairaRegular] focus:border-gray-500 focus:outline-none focus:ring focus:ring-gray-200"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="relative mb-4">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Email"
              className="w-full pl-10 py-2 border rounded text-sm font-[SairaRegular] focus:border-gray-500 focus:outline-none focus:ring focus:ring-gray-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative mb-4">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 py-2 border rounded text-sm font-[SairaRegular] focus:border-gray-500 focus:outline-none focus:ring focus:ring-gray-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Eye
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={togglePasswordVisibility}
            />
          </div>

          <button
            className="w-full py-2 bg-[#0190de] text-white font-semibold rounded text-sm hover:bg-black transition"
            onClick={handleSignUp}
            disabled={isLoading}
          >
            <span className="flex items-center justify-center font-[SairaSemibold]">{isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Sign Up →"}</span>
          </button>

          <p className="text-center mt-4 text-gray-500 text-xs font-[SairaMedium] md:text-sm cursor-pointer hover:underline">
            Already have an account? <Link href="/auth/Login" className="text-black">Login</Link>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignUpPage;
