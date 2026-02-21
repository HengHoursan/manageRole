import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUserPhone } from "@/api/authAction";
import { toast } from "sonner";
import { Phone, Check, X } from "lucide-react";
// import { Separator } from "@/components/ui/separator";

const Home = () => {
  const [user, setUser] = useState({
    username: "",
    role: "",
    token: "",
    phone_number: "",
  });

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const token = localStorage.getItem("token");

    if (userData && token) {
      setUser({
        username: userData.username,
        role: userData.role,
        token,
        phone_number: userData.phone_number,
      });
      setNewPhone(userData.phone_number || "");
    }
  }, []);

  const handlePhoneUpdate = async () => {
    try {
      if (!newPhone) {
        toast.error("Please enter a phone number");
        return;
      }

      setIsUpdating(true);
      // Format: replace international 855 with 0
      const formattedPhone = newPhone.replace(/^\+?855/, "0");

      const response = await updateUserPhone(user.token, formattedPhone);

      if (response.phone_number) {
        // Update local state
        setUser((prev) => ({ ...prev, phone_number: response.phone_number }));

        // Update localStorage
        const userData = JSON.parse(localStorage.getItem("userData"));
        localStorage.setItem(
          "userData",
          JSON.stringify({
            ...userData,
            phone_number: response.phone_number,
          }),
        );

        toast.success("Phone number updated!");
        setIsEditingPhone(false);
      }
    } catch (error) {
      toast.error("Failed to update phone number");
    } finally {
      setIsUpdating(false);
    }
  };

  const shortToken = user.token
    ? `${user.token.slice(0, 10)}...${user.token.slice(-10)}`
    : "No token";

  const roleColor =
    {
      Admin: "bg-red-500 text-white",
      Editor: "bg-yellow-500 text-white",
      Viewer: "bg-blue-500 text-white",
    }[user.role] || "bg-gray-300 text-black";

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🔧 MERN Stack Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your role-based management system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>👤 User Information</CardTitle>
          <CardDescription>
            Details pulled from your authentication token.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <p>
              <span className="font-semibold">Username:</span>{" "}
              {user.username || "Guest"}
            </p>
            <Badge className={roleColor}>{user.role || "Not assigned"}</Badge>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">Phone:</span>{" "}
                {isEditingPhone ? (
                  <Input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="h-8 w-40 text-xs"
                    disabled={isUpdating}
                  />
                ) : (
                  <span className="text-sm">
                    {user.phone_number || "Not Shared"}
                  </span>
                )}
              </div>

              {isEditingPhone ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingPhone(false)}
                    disabled={isUpdating}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handlePhoneUpdate}
                    disabled={isUpdating}
                    className="h-8 w-8 p-0"
                  >
                    {isUpdating ? "..." : <Check className="w-4 h-4" />}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingPhone(true)}
                  className="h-8"
                >
                  {user.phone_number ? "Change" : "Add Phone"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔐 Auth Token Preview</CardTitle>
          <CardDescription>
            A shortened version of your JWT token.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm break-all text-muted-foreground">
            {shortToken}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🛡️ Role Permissions</CardTitle>
          <CardDescription>Access based on your assigned role.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-5 text-sm space-y-1">
            {user.role === "Admin" ? (
              <>
                <li>Manage users</li>
                <li>View & update products</li>
                <li>Access full dashboard</li>
              </>
            ) : user.role === "Editor" ? (
              <>
                <li>View and update products</li>
                <li>Limited dashboard access</li>
              </>
            ) : user.role === "Viewer" ? (
              <>
                <li>Read-only access to products</li>
              </>
            ) : (
              <li>No permissions available</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
