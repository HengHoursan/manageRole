import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { telegramLoginUser } from "../api/authAction";
import { toast } from "sonner";
import Loader from "./Loader";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/layout");
    }
  }, [navigate]);

  // Load Telegram widget script and handle auth
  useEffect(() => {
    const handleTelegramAuth = async (userData) => {
      try {
        setIsLoading(true);
        const response = await telegramLoginUser(userData);
        const user = response.user;

        if (user) {
          localStorage.setItem("token", user.token);
          localStorage.setItem(
            "userData",
            JSON.stringify({
              username: user.username,
              role: user.role,
              photo_url: user.photo_url,
            })
          );

          toast.success("Telegram login successful!");
          navigate("/layout");
        }
      } catch (error) {
        console.error("Telegram auth error:", error);
        toast.error(error.response?.data?.message || "Telegram login failed.");
      } finally {
        setIsLoading(false);
      }
    };

    window.onTelegramAuth = handleTelegramAuth;

    const widgetContainer = document.getElementById("telegram-login-widget");
    if (!widgetContainer) return;

    if (document.getElementById("telegram-login-script")) return;

    const script = document.createElement("script");
    script.id = "telegram-login-script";
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", "asdfasdfsres_bot"); // Correct bot name
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");

    widgetContainer.innerHTML = "";
    widgetContainer.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
      const scriptEl = document.getElementById("telegram-login-script");
      if (scriptEl) {
        scriptEl.remove();
      }
      if (widgetContainer) {
        widgetContainer.innerHTML = "";
      }
    };
  }, [navigate]);

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 font-poppins">
        <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Blue Header */}
          <div className="bg-blue-600 py-10 text-white text-center rounded-b-3xl">
            <div className="flex justify-center mb-3">
              <div className="bg-white text-blue-600 font-bold text-xl px-3 py-1 rounded-md">
                DG
              </div>
            </div>
            <h2 className="text-lg font-semibold">DG Business Card</h2>

            <div className="mt-6 flex justify-center">
              {/* Placeholder for missing asset */}
              <div className="w-56 h-32 flex items-center justify-center bg-white/20 rounded-lg">
                <span className="text-white/50">
                  Business Network Illustration
                </span>
              </div>
            </div>
          </div>

          {/* White Body */}
          <div className="p-6 text-center">
            <h3 className="text-xl font-bold mb-1 text-gray-800">
              Good to see you!
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Quick and safe login, always.
            </p>

            <div className="text-xs text-gray-600 mb-6 px-4">
              I agree to these{" "}
              <Link to="/about" className="text-blue-600 underline">
                Terms & Conditions
              </Link>
              . If you don't agree, please do not use our service.
            </div>

            <div className="flex justify-center">
              <div id="telegram-login-widget"></div>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader />
        </div>
      )}
    </>
  );
};

export default Login;
