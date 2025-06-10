"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/utils/firebaseConfig";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";

const UserProfilePage = () => {
    const params = useParams();
    const username = use(params).username;
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState(null);
    const [userActivity, setUserActivity] = useState(null);
    const [editMessage, setEditMessage] = useState("");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        fetchUserDetails();
        setIsClient(true);
    }, [username]);

    useEffect(() => {
        if (isClient) {
            const activityInterval = setInterval(updateActivity, 60000);
            return () => clearInterval(activityInterval);
        }
    }, [isClient, user]);

    const fetchUserDetails = async () => {
        try {
            const usersCollectionRef = collection(db, "users");
            const q = query(usersCollectionRef, where("name", "==", username));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0];
                const userDoc = { id: userData.id, ...userData.data() };
                setUser(userDoc);
                setEditedUser({
                    id: userDoc.id,
                    name: userDoc.name || '',
                    email: userDoc.email || '',
                    category: userDoc.category || '',
                    status: userDoc.status || 'Active',
                    role: userDoc.role || 'user'
                });
                updateActivity();
            } else {
                router.push('/admin/Users');
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateActivity = () => {
        setUserActivity({
            lastActive: new Date().toISOString(),
            status: Math.random() > 0.3 ? "active" : "idle"
        });
    };

    const handleUpdate = async () => {
        try {
            const userRef = doc(db, "users", user.id);
            const updateData = {};

            if (editedUser.name && editedUser.name.trim() !== '') {
                updateData.name = editedUser.name.trim();
            }
            if (editedUser.email && editedUser.email.trim() !== '') {
                updateData.email = editedUser.email.trim();
            }
            if (editedUser.category && editedUser.category.trim() !== '') {
                updateData.category = editedUser.category.trim();
            }
            updateData.status = editedUser.status && editedUser.status.trim() !== '' ? editedUser.status.trim() : 'Active';
            updateData.role = editedUser.role && editedUser.role.trim() !== '' ? editedUser.role.trim() : 'user';

            if (Object.keys(updateData).length > 0) {
                await updateDoc(userRef, updateData);
                setUser(prev => ({ ...prev, ...updateData }));
                setIsEditing(false);
                setEditMessage("User updated successfully!");
                setTimeout(() => setEditMessage(""), 3000);
            } else {
                setEditMessage("No changes to update.");
                setTimeout(() => setEditMessage(""), 3000);
            }
        } catch (error) {
            console.error("Error updating user:", error);
            setEditMessage("Error updating user. Please try again.");
            setTimeout(() => setEditMessage(""), 3000);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#343434] via-black to-[#343434] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff5528]"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#343434] via-black to-[#343434] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link 
                    href="/admin/Users"
                    className="inline-flex items-center gap-2 text-[#ff5528] hover:text-[#ff7d5a] transition-colors duration-200 mb-6"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Users
                </Link>

                {/* User Profile Card */}
                <div className="bg-[#343434]/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-[#ff5528]/20">
                    <div className="bg-gradient-to-r from-[#ff5528] via-[#ff7d5a] to-[#ff5528] px-6 py-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
                        <div className="relative flex items-center gap-6">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-r from-[#ff5528] to-[#ff7d5a] flex items-center justify-center shadow-lg shadow-[#ff5528]/20">
                                <span className="text-white font-medium text-3xl">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                                <p className="text-white/80 mt-1">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {editMessage && (
                            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                                editMessage.includes("successfully") ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                            }`}>
                                {editMessage}
                            </div>
                        )}
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={editedUser.name}
                                        onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                                        className="w-full px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg focus:ring-2 focus:ring-[#ff5528] focus:border-[#ff5528] text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editedUser.email}
                                        onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                                        className="w-full px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg focus:ring-2 focus:ring-[#ff5528] focus:border-[#ff5528] text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={editedUser.category}
                                        onChange={(e) => setEditedUser({...editedUser, category: e.target.value})}
                                        className="w-full px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg focus:ring-2 focus:ring-[#ff5528] focus:border-[#ff5528] text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                                    <select
                                        value={editedUser.status}
                                        onChange={(e) => setEditedUser({...editedUser, status: e.target.value})}
                                        className="w-full px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg focus:ring-2 focus:ring-[#ff5528] focus:border-[#ff5528] text-white"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                                    <select
                                        value={editedUser.role || 'user'}
                                        onChange={(e) => setEditedUser({...editedUser, role: e.target.value})}
                                        className="w-full px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg focus:ring-2 focus:ring-[#ff5528] focus:border-[#ff5528] text-white"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="user">User</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 border border-[#ff5528]/20 rounded-lg text-[#ff5528] hover:bg-[#ff5528]/10 transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdate}
                                        className="px-4 py-2 bg-gradient-to-r from-[#ff5528] to-[#ff7d5a] text-white rounded-lg hover:from-[#ff7d5a] hover:to-[#ff5528] transition-all duration-200"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400">Category</h3>
                                        <p className="mt-1 text-white">{user.category || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400">Status</h3>
                                        <span className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                            user.status === 'Active' 
                                                ? 'bg-green-500/10 text-green-500' 
                                                : 'bg-red-500/10 text-red-500'
                                        }`}>
                                            {user.status || 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400">Role</h3>
                                        <span className="mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-500">
                                            {user.role || 'user'}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400">Last Active</h3>
                                        <p className="mt-1 text-white">
                                            {isClient ? (
                                                userActivity?.lastActive 
                                                    ? new Date(userActivity.lastActive).toLocaleString() 
                                                    : user.lastActive ? new Date(user.lastActive).toLocaleString() : 'N/A'
                                            ) : 'Loading...'}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400">Current Status</h3>
                                        <span className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                            userActivity?.status === 'active'
                                                ? 'bg-green-500/10 text-green-500'
                                                : 'bg-yellow-500/10 text-yellow-500'
                                        }`}>
                                            {isClient ? (userActivity?.status || 'Unknown') : 'Loading...'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400">Member Since</h3>
                                        <p className="mt-1 text-white">
                                            {isClient ? (user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A') : 'Loading...'}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-span-1 md:col-span-2 flex justify-end">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-gradient-to-r from-[#ff5528] to-[#ff7d5a] text-white rounded-lg hover:from-[#ff7d5a] hover:to-[#ff5528] transition-all duration-200"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage; 