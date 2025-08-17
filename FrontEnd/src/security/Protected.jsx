
import { Navigate } from "react-router-dom";
import SidebarLayout from "../layouts/SidebarLayout";

const Protected = () => {
    const token = localStorage.getItem("token");

    if (token) {
        return <SidebarLayout />;
    }

    return <Navigate to="/" replace />;
};

export default Protected;
