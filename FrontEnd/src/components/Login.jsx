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
import { loginUser, telegramLoginUser } from "../api/authAction";
import { toast } from "sonner";
import Loader from "./Loader";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // Telegram authentication handler
  const handleTelegramAuth = async (userData) => {
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
        navigate("/layout"); // ✅ correct for react-router
      }
    } catch (error) {
      console.error("Telegram auth error:", error);
      toast.error(error?.response?.data?.message || "Telegram login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Telegram redirect auth (check URL params on mount)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const hash = params.get("hash");

    console.log("Telegram redirect check - URL:", window.location.href);
    console.log("Telegram redirect check - id:", id, "hash:", hash);

    if (id && hash) {
      const telegramData = {
        id: params.get("id"),
        first_name: params.get("first_name"),
        last_name: params.get("last_name"),
        username: params.get("username"),
        photo_url: params.get("photo_url"),
        auth_date: params.get("auth_date"),
        hash: params.get("hash"),
      };

      console.log("Telegram auth data:", telegramData);

      // Clean up URL so params don't persist
      window.history.replaceState({}, "", window.location.pathname);

      handleTelegramAuth(telegramData);
    }
  }, []);

  // Load Telegram widget
  useEffect(() => {
    // Also set up callback as fallback
    window.onTelegramAuth = (user) => {
      console.log("Telegram callback received:", user);
      handleTelegramAuth(user);
    };

    // Remove any existing widget to ensure fresh load
    const existingScript = document.getElementById("telegram-login-script");
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.id = "telegram-login-script";
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute(
      "data-telegram-login",
      import.meta.env.VITE_TELEGRAM_BOT_NAME,
    );
    script.setAttribute("data-size", "large");
    script.setAttribute("data-auth-url", window.location.origin + "/");
    // Note: removed data-request-access="write" to simplify auth flow

    const widgetContainer = document.getElementById("telegram-login-widget");
    if (widgetContainer) {
      widgetContainer.innerHTML = "";
      widgetContainer.appendChild(script);
    }

    return () => {
      delete window.onTelegramAuth;
    };
  }, []);

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

          {/* Telegram Widget */}
          <div className="flex justify-center items-center w-full min-h-[60px] mt-2">
            <div id="telegram-login-widget" />
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
