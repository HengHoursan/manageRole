import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  telegramLoginUser,
  telegramWebAppLogin,
} from "../api/authAction";
import { toast } from "sonner";
import Loader from "./Loader";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isWebApp, setIsWebApp] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/layout");
    }

    // Detect if running in Telegram Mini App
    if (window.Telegram?.WebApp?.initData) {
      setIsWebApp(true);
      console.log("[Mini App] telegram-webapp-sdk detected");
      window.Telegram.WebApp.expand();
    }
  }, [navigate]);

  // Handle Native Mini App Login with Phone Sharing
  const handleWebAppLogin = async () => {
    try {
      setIsLoading(true);
      const tg = window.Telegram?.WebApp;
      const initData = tg?.initData;

      if (!initData) {
        toast.error("Telegram data not found. Please open in Telegram.");
        return;
      }

      console.log("[Mini App] Requesting contact...");

      // Request contact (phone number) from Telegram native client
      tg.requestContact((callbackData) => {
        if (callbackData?.status === "sent") {
          const contactData = callbackData.response?.contact;
          const phone_number = contactData?.phone_number;

          console.log("[Mini App] Contact shared, logging in...");

          // Proceed with login using initData and phone_number
          telegramWebAppLogin(initData, phone_number)
            .then((res) => {
              if (res?.user) {
                localStorage.setItem("token", res.user.token);
                localStorage.setItem(
                  "userData",
                  JSON.stringify({
                    username: res.user.username,
                    role: res.user.role,
                    photo_url: res.user.photo_url,
                  }),
                );
                toast.success("Welcome back!");
                navigate("/layout");
              }
            })
            .catch((err) => {
              console.error("[Mini App] Login request failed:", err);
              toast.error("Login failed. Please try again.");
            })
            .finally(() => setIsLoading(false));
        } else {
          console.warn("[Mini App] Contact sharing was denied or failed.");
          toast.error("Phone number is required to log in.");
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error("[Mini App] Login flow failed:", error);
      toast.error("Something went wrong.");
      setIsLoading(false);
    }
  };

  // Telegram Widget auth handler (for Browser/Desktop)
  const handleWidgetAuth = async (userData) => {
    console.log("[Widget] Auth data received from Telegram:", userData);
    try {
      setIsLoading(true);
      const res = await telegramLoginUser(userData);
      if (res?.user) {
        localStorage.setItem("token", res.user.token);
        localStorage.setItem(
          "userData",
          JSON.stringify({
            username: res.user.username,
            role: res.user.role,
            photo_url: res.user.photo_url,
          }),
        );
        toast.success("Telegram login successful!");
        navigate("/layout");
      }
    } catch (error) {
      console.error("[Widget] Auth error:", error);
      toast.error(error?.response?.data?.message || "Telegram login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load Telegram Login Widget (callback mode - ONLY for Browser)
  useEffect(() => {
    if (isWebApp) return;

    window.onTelegramAuth = (user) => {
      console.log("[Widget] onTelegramAuth callback fired:", user);
      handleWidgetAuth(user);
    };

    const widgetContainer = document.getElementById("telegram-login-widget");
    if (widgetContainer) {
      widgetContainer.innerHTML = "";
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.async = true;
      script.setAttribute(
        "data-telegram-login",
        import.meta.env.VITE_TELEGRAM_BOT_NAME,
      );
      script.setAttribute("data-size", "large");
      script.setAttribute("data-onauth", "onTelegramAuth(user)");
      script.setAttribute("data-radius", "8");
      script.onload = () => console.log("[Widget] Script loaded successfully");
      script.onerror = (e) =>
        console.error("[Widget] Script failed to load:", e);
      widgetContainer.appendChild(script);
    }

    return () => {
      delete window.onTelegramAuth;
    };
  }, [isWebApp]);

  // Standard email/password login
  const onLoginSubmit = async (formData) => {
    try {
      setIsLoading(true);
      const response = await loginUser(formData);
      const userData = response.user;

      if (userData) {
        localStorage.setItem("token", userData.token);
        localStorage.setItem(
          "userData",
          JSON.stringify({
            username: userData.username,
            role: userData.role,
          }),
        );

        toast.success("Login successful!");
        navigate("/layout");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm bg-white text-black">
        <CardHeader>
          <CardTitle className="text-[20px] text-center">
            Login to your account
          </CardTitle>
          <CardDescription className="text-center">
            {isWebApp
              ? "Continue with Telegram inside the app"
              : "Enter your email below to login to your account"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onLoginSubmit)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="showPassword"
                  checked={showPassword}
                  onCheckedChange={(checked) =>
                    setShowPassword(Boolean(checked))
                  }
                />
                <Label htmlFor="showPassword">Show Password</Label>
              </div>

              <Button className="w-full text-white bg-black" type="submit">
                Login
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col">
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <span
              className="underline cursor-pointer font-medium"
              onClick={() => navigate("/register")}
            >
              Register now
            </span>
          </div>

          <div className="w-full my-6 flex items-center before:flex-1 before:border-t before:border-neutral-300 after:flex-1 after:border-t after:border-neutral-300">
            <p className="mx-4 text-center font-semibold text-neutral-500">
              OR
            </p>
          </div>

          {/* Telegram Login Section */}
          <div className="flex justify-center items-center w-full min-h-[50px]">
            {isWebApp ? (
              <Button
                onClick={handleWebAppLogin}
                className="w-full bg-[#0088cc] hover:bg-[#0077b5] text-white font-medium flex items-center justify-center gap-2"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.19 15.51 15.96C15.37 16.71 15.09 16.96 14.82 16.99C14.23 17.04 13.78 16.6 13.21 16.23C12.31 15.64 11.81 15.28 10.93 14.71C9.92 14.04 10.58 13.68 11.16 13.08C11.3 12.92 13.9 10.55 13.95 10.33C13.96 10.3 13.96 10.21 13.91 10.16C13.85 10.11 13.77 10.13 13.71 10.14C13.62 10.16 12.22 11.08 9.51 12.92C9.11 13.19 8.75 13.32 8.43 13.31C8.07 13.3 7.39 13.11 6.88 12.94C6.26 12.74 5.76 12.63 5.8 12.29C5.82 12.11 6.07 11.93 6.54 11.75C9.37 10.52 11.23 9.71 12.11 9.35C14.63 8.3 15.15 8.12 15.49 8.12C15.56 8.12 15.73 8.14 15.85 8.24C15.95 8.32 15.98 8.44 15.99 8.52C16 8.58 16.01 8.71 16 8.8L16.64 8.8Z"
                    fill="currentColor"
                  />
                </svg>
                Log in as Telegram User
              </Button>
            ) : (
              <div id="telegram-login-widget" />
            )}
          </div>
        </CardFooter>
      </Card>

      {isLoading && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default Login;
