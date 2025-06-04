"use client";
import { db } from "@/app/utils/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { collection, getDocs } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const NotificationPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user) => user.expoPushToken); // Only get users with push tokens
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  const handleSendNotification = async () => {
    if (!selectedUser || !title || !body) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const selectedUserData = users.find((user) => user.id === selectedUser);
      
      if (!selectedUserData?.expoPushToken) {
        throw new Error("Selected user has no push token");
      }

      const message = {
        to: selectedUserData.expoPushToken,
        sound: "default",
        title: title,
        body: body,
        data: { someData: "goes here" },
      };

      await axios.post("https://exp.host/--/api/v2/push/send", message);

      toast({
        title: "Success",
        description: "Notification sent successfully",
      });

      // Clear form
      setSelectedUser("");
      setTitle("");
      setBody("");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4">
      <div className="mb-8">
        <h1 className="md:text-3xl text-2xl font-[SairaSemibold] text-gray-900">
          Send Notifications
        </h1>
        <p className="text-sm mb-5 text-muted-foreground font-[SairaRegular]">
          Send push notifications to users with Expo mobile app
        </p>
      </div>

      <div className="w-full bg-white rounded-xl border p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select User</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Notification Title</label>
            <Input
              placeholder="Enter notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Notification Message</label>
            <Textarea
              placeholder="Enter notification message"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
            />
          </div>

          <Button
            onClick={handleSendNotification}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Notification"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
