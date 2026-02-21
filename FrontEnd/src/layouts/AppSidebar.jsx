import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Package, Tags, ChevronUp, LogOut } from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loader from "../components/Loader";
import { toast } from "sonner";

const menuItems = [
  { title: "Home", url: "/layout", icon: Home },
  {
    title: "Products",
    url: "/layout/products",
    icon: Package,
  },
  { title: "Product Categories", url: "/layout/productCategories", icon: Tags },
];
const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState({ username: "", photo_url: "" });

  useEffect(() => {
    const getUserData = JSON.parse(localStorage.getItem("userData"));
    if (getUserData) {
      setUsername({
        username: getUserData.username,
        photo_url: getUserData.photo_url || "",
      });
    }
  }, []);

  const handleLogout = () => {
    try {
      setIsLoading(true);

      // Clear all local storage
      localStorage.clear();

      toast.success("Logged out successfully");

      // Always navigate to home/login
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sidebar className="flex flex-col justify-between h-full">
      {/* Header Section */}
      <SidebarHeader>
        <h2 className="text-xl font-bold px-4 py-2">Admin Dashboard</h2>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive =
                  location.pathname === item.url ||
                  location.pathname.startsWith(item.url + "/");

                return (
                  <SidebarMenuItem key={item.title} data-active={isActive}>
                    <SidebarMenuButton asChild>
                      <button
                        type="button"
                        onClick={() => navigate(item.url)}
                        className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded-md transition-colors ${isActive ? "bg-muted text-primary" : "hover:bg-muted/50"}`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Settings / Logout */}
      <SidebarFooter className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              variant="ghost"
              className="w-full flex justify-between items-center cursor-pointer"
            >
              {/* Left side: avatar + username */}
              <div className=" flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={username.photo_url || "https://github.com/shadcn.png"}
                    alt={username.username}
                  />
                  <AvatarFallback>
                    {username.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {username.username || "Username"}
                </span>
              </div>
              {/* Right side: chevron icon */}
              <ChevronUp className="w-4 h-4 opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="mb-4.5 ">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer"
              variant="destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      {isLoading && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader />
        </div>
      )}
    </Sidebar>
  );
};

export default AppSidebar;
