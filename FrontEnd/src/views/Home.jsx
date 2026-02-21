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
// import { Separator } from "@/components/ui/separator";

const Home = () => {
  const [user, setUser] = useState({
    username: "",
    role: "",
    token: "",
    phone_number: "",
  });

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
    }
  }, []);

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
        <CardContent className="space-y-3">
          <p>
            <span className="font-semibold">Username:</span>{" "}
            {user.username || "Guest"}
          </p>
          <p>
            <span className="font-semibold">Phone:</span>{" "}
            {user.phone_number || "Not Shared"}
          </p>
          <p>
            <span className="font-semibold">Role:</span>{" "}
            <Badge className={roleColor}>{user.role || "Not assigned"}</Badge>
          </p>

          <Button
            variant="destructive"
            className="w-full mt-4"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Log Out
          </Button>
        </CardContent>
      </Card>

      {/* Debug Section - Hidden in production normally, but visible for now */}
      <div className="p-4 bg-gray-100 rounded-md text-xs font-mono break-all overflow-auto">
        <p className="font-bold mb-1 underline">
          Raw Debug Info (localStorage):
        </p>
        {JSON.stringify(
          JSON.parse(localStorage.getItem("userData") || "{}"),
          null,
          2,
        )}
      </div>

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
