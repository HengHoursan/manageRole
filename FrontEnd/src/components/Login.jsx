import { useState, useEffect, useRef } from "react";
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
  initTelegramDeepLinkAuth,
  checkTelegramDeepLinkStatus,
  telegramWebAppLogin,
} from "../api/authAction";
import { toast } from "sonner";
import Loader from "./Loader";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState(""); // "", "waiting", "polling"
  const pollingRef = useRef(null);

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
  }, [navigate]);

  // Auto-login when running inside Telegram Mini App
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.initData) {
      console.log("Running inside Telegram Mini App, auto-logging in...");
      tg.ready();
      tg.expand();

      setIsLoading(true);
      telegramWebAppLogin(tg.initData)
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
            toast.success("Welcome from Telegram!");
            navigate("/layout");
          }
        })
        .catch((error) => {
          console.error("Mini App auto-login failed:", error);
          toast.error("Auto-login failed. Please use the button below.");
        })
        .finally(() => setIsLoading(false));
    }
  }, [navigate]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Handle Telegram deep link login
  const handleTelegramDeepLink = async () => {
    try {
      setIsLoading(true);
      setTelegramStatus("waiting");

      // 1. Get a deep link from the backend
      const { token, deepLink } = await initTelegramDeepLinkAuth();

      // 2. Open Telegram deep link in a new tab
      window.open(deepLink, "_blank");

      // 3. Start polling for auth completion
      setTelegramStatus("polling");
      setIsLoading(false);

      pollingRef.current = setInterval(async () => {
        try {
          const result = await checkTelegramDeepLinkStatus(token);

          if (result.completed) {
            // Stop polling
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            setTelegramStatus("");

            // Store auth data
            localStorage.setItem("token", result.user.token);
            localStorage.setItem(
              "userData",
              JSON.stringify({
                username: result.user.username,
                role: result.user.role,
                photo_url: result.user.photo_url,
              }),
            );

            toast.success("Telegram login successful!");
            navigate("/layout");
          }
        } catch (error) {
          // 404 means session expired
          if (error?.response?.status === 404) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            setTelegramStatus("");
            toast.error("Login session expired. Please try again.");
          }
        }
      }, 2000); // Poll every 2 seconds

      // Auto-stop polling after 5 minutes
      setTimeout(
        () => {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            setTelegramStatus("");
            toast.error("Login timed out. Please try again.");
          }
        },
        5 * 60 * 1000,
      );
    } catch (error) {
      console.error("Telegram deep link error:", error);
      toast.error("Failed to start Telegram login. Please try again.");
      setIsLoading(false);
      setTelegramStatus("");
    }
  };

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
            Enter your email below to login to your account
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

          {/* Telegram Deep Link Login Button */}
          <div className="flex flex-col items-center w-full gap-2">
            <Button
              type="button"
              className="w-full text-white bg-[#2AABEE] hover:bg-[#229ED9] flex items-center justify-center gap-2"
              onClick={handleTelegramDeepLink}
              disabled={telegramStatus === "polling"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              {telegramStatus === "polling"
                ? "Waiting for confirmation..."
                : "Log in with Telegram"}
            </Button>
            {telegramStatus === "polling" && (
              <p className="text-xs text-neutral-500 text-center">
                Open Telegram and press <strong>Start</strong> on the bot, then
                come back here
              </p>
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
