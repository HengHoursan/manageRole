import { useEffect } from "react";
import { Navigate } from "react-router-dom";

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

const Protected = ({ children }) => {
  const token = localStorage.getItem("token");
  const expired = isTokenExpired(token);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isTokenExpired(localStorage.getItem("token"))) {
        window.location.reload(); // Forces re-render and redirect
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (token && !expired) {
    return children;
  }

  localStorage.removeItem("token");
  return <Navigate to="/" replace />;
};

export default Protected;
