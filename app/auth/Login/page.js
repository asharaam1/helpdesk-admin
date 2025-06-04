"use client";
import React, { useEffect, useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from '@/app/utils/firebaseConfig'
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";

const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const router = useRouter();

  const getUser = async () => {
    const user = await localStorage.getItem("userId");
    if (user !== null) router.push("/admin/Dashboard");
    setTimeout(() => {
      setIsCheckingUser(false);
    }, 1000);
  }

  useEffect(() => {
    setIsCheckingUser(true);
    getUser();
  }, []);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields!");
      return;
    }
    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((response) => {
        router.push("/admin/Dashboard");
        localStorage.setItem('userId', response.user.uid)
        setIsLoading(false);
      })
      .catch((er) => {
        toast.error(er.message);
        setIsLoading(false);
      })
  };

  if (isCheckingUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-5 w-5 text-Black" />
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row-reverse w-full bg-white h-screen p-1 justify-center">
      <div className="md:w-2/4 md:h-full h-3/4 flex justify-center items-center p-8">
        <div className="w-full bg-white rounded-xl p-8 md:max-w-md space-y-6 md:shadow-none shadow">
          <div className="flex justify-center space-x-4 ">
            <Image
              src="/mmt-logo.png"
              alt="Logo"
              width={50}
              height={50}
              className="object-contain"
            />
            <h2 className="text-2xl font-semibold text-gray-800">
              Help Desk
            </h2>
          </div>
          <p className="text-center text-sm text-gray-500 mb-4">
            Please log in to access your dashboard.
          </p>

          <div className="relative">
            <label htmlFor="email" className="text-gray-600 font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0190de] transition duration-300"
            />
          </div>

          <div className="relative mb-6">
            <label htmlFor="password" className="text-gray-600 font-medium">Password</label>
            <div className="relative flex items-center">
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0190de] transition duration-300"
              />
              <Eye
                className="absolute right-3 top-[20px] text-gray-500 cursor-pointer"
                onClick={togglePasswordVisibility}
              />
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            create an account <Link href="/auth/SignUp">here</Link>
          </p>

          <button
            className="w-full py-3 bg-[#0190de] text-white font-semibold rounded-lg hover:bg-[#0190de] transition duration-300 flex items-center justify-center"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5 text-white" />
            ) : (
              "Login"
            )}
          </button>

        </div>
      </div>

      <ToastContainer />
      <div className="w-full md:flex md:w-3/4 h-full relative justify-center hidden items-center">
        <Image
          src="/mmtrust.jpg"
          className="w-full h-auto rounded-r-3xl object-cover"
          alt="login page image"
          fill
        />
      </div>
    </div>
  );
};

export default LoginPage;
