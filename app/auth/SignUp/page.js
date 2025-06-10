"use client";
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../utils/firebaseConfig";
import { User, Lock, Eye, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addDoc, doc, setDoc } from "firebase/firestore";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  // const AddUserToFirestore = async(){

  //     addDoc
           

  // }

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      toast.error("All fields are required");
      return;
    }
    setIsLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = response.user.uid;
      await setDoc(doc(db, "adminUsers", uid), { name, email });
      router.push("/admin/Dashboard");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-white">
      {/* Left Side Image */}
      <div className="hidden md:flex w-1/2 h-full relative overflow-hidden rounded-r-3xl">
        <Image
          src="/donate.png"
          fill
          alt="Login Background"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00000088] to-transparent" />
      </div>

      {/* Sign Up Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6">
        <div className="mb-6 text-center w-32 h-20 md:w-40 md:h-24 relative">
          <Image
            src="/logo-donation.png" 
            alt="Logo"
            fill
            className="object-contain"
          />
        </div>

        <div className="w-full md:w-[70%] bg-white rounded-xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-center text-[#343434]">
            Create your account
          </h2>

          {/* Name Input */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5528] transition-all"
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5528] transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5528] transition-all"
            />
            <Eye
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              onClick={togglePasswordVisibility}
            />
          </div>

          {/* Sign Up Button */}
          <button
            onClick={handleSignUp}
            disabled={isLoading}
            className="w-full py-2 bg-gradient-to-r from-[#ff5528] to-[#ff784e] text-white font-semibold rounded-md hover:opacity-90 transition flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "Sign Up →"
            )}
          </button>

          {/* Redirect Link */}
          <p className="text-center text-sm text-[#343434]">
            Already have an account?{" "}
            <Link href="/auth/Login" className="text-[#ff5528] hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignUpPage;
