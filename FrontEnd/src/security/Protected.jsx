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

  if (token && !expired) {
    return children;
  }

  // Clear token just in case it was expired but still in storage
  if (token) {
    localStorage.removeItem("token");
  }

  return <Navigate to="/" replace />;
};

export default Protected;
