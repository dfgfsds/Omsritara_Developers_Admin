// src/context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axiosInstance";

type AuthContextType = {
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    userData: any;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("token")
    );
    const [userData, setUserData] = useState<any>(localStorage.getItem("user"));
    const navigate = useNavigate();

    const login = async (email: string, password: string) => {
        try {
            const res = await axiosInstance.post("/signin/", {
                email,
                password,
            });

            const userToken = res.data?.result?.tokens?.accessToken; // adjust according to API response
            const userDetails = res.data?.result?.user;
            if (!userToken) throw new Error("No token returned");
            if (!userDetails) throw new Error("No token returned");

            setToken(userToken);
            setUserData(userDetails);
            localStorage.setItem("user", JSON.stringify(userDetails));
            localStorage.setItem("token", userToken);

            navigate("/dashboard");
        } catch (err: any) {
            throw new Error(err.response?.data?.msg || "Invalid credentials");
        }
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, userData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
