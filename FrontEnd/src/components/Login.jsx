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
  telegramLoginUser,
  telegramWebAppLogin,
} from "../api/authAction";
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

  // Telegram Widget auth handler
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

  // Load Telegram Login Widget (callback mode)
  useEffect(() => {
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

          {/* Telegram Login Widget */}
          <div className="flex justify-center items-center w-full min-h-[50px]">
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
