import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// For regular user authentication
export const PrivateRoute = ({ element }) => {
    const { user } = useAuth();
    return user ? element : <Navigate to="/login" replace />;
};

// For admin route protection
export const AdminRoute = ({ element }) => {
    const adminToken = localStorage.getItem("adminToken");
    return adminToken ? element : <Navigate to="/admin/login" replace />;
};
