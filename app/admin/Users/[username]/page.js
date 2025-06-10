"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/utils/firebaseConfig";
import { useRouter } from "next/navigation";
import { use } from "react";

const UserDetailsPage = ({ params }) => {
    const router = useRouter();
    const username = use(params).username;
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const usersRef = collection(db, "users");
                const querySnapshot = await getDocs(usersRef);
                const users = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                const foundUser = users.find(u => u.name.toLowerCase() === username.toLowerCase());
                
                if (foundUser) {
                    setUser(foundUser);
                    setEditedUser(foundUser);
                } else {
                    setMessage({ type: 'error', text: 'User not found' });
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                setMessage({ type: 'error', text: 'Error loading user details' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserDetails();
    }, [username]);

    const handleUpdate = async () => {
        try {
            if (!user || !editedUser) return;

            const updateData = {
                name: editedUser.name || user.name,
                email: editedUser.email || user.email,
                category: editedUser.category || user.category,
                role: editedUser.role || user.role || 'user',
                status: editedUser.status || user.status || 'Active'
            };

            // Only update if there are actual changes
            if (JSON.stringify(updateData) !== JSON.stringify({
                name: user.name,
                email: user.email,
                category: user.category,
                role: user.role || 'user',
                status: user.status || 'Active'
            })) {
                await updateDoc(doc(db, "users", user.id), updateData);
                setUser(updateData);
                setIsEditing(false);
                setMessage({ type: 'success', text: 'User updated successfully' });
            } else {
                setMessage({ type: 'info', text: 'No changes to update' });
            }
        } catch (error) {
            console.error("Error updating user:", error);
            setMessage({ type: 'error', text: 'Error updating user' });
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
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#343434] via-black to-[#343434] flex items-center justify-center">
                <div className="text-white text-xl">User not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#343434] via-black to-[#343434] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-[#343434]/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-[#ff5528]/20">
                    <div className="bg-gradient-to-r from-[#ff5528] via-[#ff7d5a] to-[#ff5528] px-6 py-8">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold text-white">User Details</h1>
                            <button
                                onClick={() => router.back()}
                                className="text-white hover:text-gray-200 transition-colors duration-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`p-4 ${message.type === 'success' ? 'bg-green-500/10' : message.type === 'info' ? 'bg-yellow-500/10' : 'bg-red-500/10'}`}>
                            <p className={`text-sm ${message.type === 'success' ? 'text-green-500' : message.type === 'info' ? 'text-yellow-500' : 'text-red-500'}`}>
                                {message.text}
                            </p>
                        </div>
                    )}

                    <div className="p-6">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={editedUser.name}
                                        onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editedUser.email}
                                        onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                                        className="w-full px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={editedUser.category}
                                        onChange={(e) => setEditedUser({ ...editedUser, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                                    <select
                                        value={editedUser.role || 'user'}
                                        onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
                                        className="w-full px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg text-white"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                                    <select
                                        value={editedUser.status}
                                        onChange={(e) => setEditedUser({ ...editedUser, status: e.target.value })}
                                        className="w-full px-3 py-2 bg-black/50 border border-[#ff5528]/20 rounded-lg text-white"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 border border-[#ff5528]/20 rounded-lg text-[#ff5528] hover:bg-[#ff5528]/10"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdate}
                                        className="px-4 py-2 bg-gradient-to-r from-[#ff5528] to-[#ff7d5a] text-white rounded-lg"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400">Name</h3>
                                        <p className="mt-1 text-lg text-white">{user.name}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400">Email</h3>
                                        <p className="mt-1 text-lg text-white">{user.email}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400">Category</h3>
                                        <p className="mt-1 text-lg text-white">{user.category}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400">Role</h3>
                                        <p className="mt-1 text-lg text-white capitalize">{user.role || 'user'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400">Status</h3>
                                        <p className="mt-1 text-lg text-white">{user.status}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400">Created At</h3>
                                        <p className="mt-1 text-lg text-white">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-gradient-to-r from-[#ff5528] to-[#ff7d5a] text-white rounded-lg"
                                    >
                                        Edit User
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

export default UserDetailsPage; 