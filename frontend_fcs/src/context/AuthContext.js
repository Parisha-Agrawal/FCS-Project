import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (userData) => {
        localStorage.setItem("user", JSON.stringify(userData)); 
        setUser(userData); 
    
        await refreshUser();
    };
    

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
    };

    // refresh user data from backend
    const refreshUser = async () => {
        const token = localStorage.getItem("access");
        if (!token) return;

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/profile/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser(response.data);
            localStorage.setItem("user", JSON.stringify(response.data));
        } catch (error) {
            console.error("Failed to refresh user:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, refreshUser, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
