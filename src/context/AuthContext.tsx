// src/context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axiosInstance";
import { Agent } from "@/data/mockAgentsData";

export type UserRole = "admin" | "agent" | "user";

export interface LoginResult {
    role: UserRole;
    name: string;
}

type AuthContextType = {
    token: string | null;
    login: (email: string, password: string) => Promise<LoginResult>;
    logout: () => void;
    userData: any;
    role: UserRole;
    isAdmin: boolean;
    isAgent: boolean;
    currentAgent: Agent | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();

    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem("token");
    });

    const [userData, setUserData] = useState<any>(() => {
        const raw = localStorage.getItem("user");
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return raw;
        }
    });

    const [storedRole, setStoredRole] = useState<UserRole>(() => {
        const r = localStorage.getItem("ost_user_role");
        if (r === "agent" || r === "user" || r === "admin") return r;
        return "admin";
    });

    const [currentAgentId, setCurrentAgentId] = useState<string | null>(() => {
        return localStorage.getItem("ost_agent_id");
    });

    // Determine effective role
    const role: UserRole = useMemo(() => {
        if (storedRole) return storedRole;
        if (!userData) return "admin";

        const rawRole = typeof userData === "object"
            ? (typeof userData.role === "object" ? userData.role?.name : userData.role)
            : "";

        const normalized = String(rawRole || "").trim().toLowerCase();
        if (normalized.includes("agent")) return "agent";
        if (normalized.includes("user")) return "user";
        return "admin";
    }, [storedRole, userData]);

    const isAdmin = role === "admin";
    const isAgent = role === "agent";

    // Current agent details if logged in as agent
    const currentAgent: Agent | null = useMemo(() => {
        if (!isAgent) return null;
        if (userData) {
            return {
                _id: userData._id || currentAgentId || "agent_user",
                name: userData.name || "Agent",
                email: userData.email || "",
                mobile: userData.mobile || "",
                city: userData.city || "Chennai",
                status: "active",
                role: {
                    _id: typeof userData.role === "object" ? userData.role?._id || "role_agent" : "role_agent",
                    name: "agent",
                },
                propertiesCount: userData.propertiesCount || 0,
                enquiriesCount: userData.enquiriesCount || 0,
                createdAt: userData.createdAt || new Date().toISOString(),
            };
        }
        return null;
    }, [isAgent, currentAgentId, userData]);

    const login = async (email: string, password: string): Promise<LoginResult> => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanPass = password.trim();

        // Authenticate via backend /signin
        try {
            const res = await axiosInstance.post("/signin", {
                email: cleanEmail,
                password: cleanPass,
            });

            const userTokens = res.data?.result?.tokens;
            const accessToken = userTokens?.accessToken;
            const refreshToken = userTokens?.refreshToken;
            const userDetails = res.data?.result?.user;

            if (!accessToken) throw new Error("No access token returned from server");
            if (!userDetails) throw new Error("No user details returned from server");

            // Extract roleType: "ADMIN" | "AGENT"
            const rawRoleType = String(
                userDetails.roleType ||
                (typeof userDetails.role === "object" ? userDetails.role?.name : userDetails.role) ||
                ""
            ).toUpperCase();

            const detectedRole: UserRole = rawRoleType.includes("AGENT") ? "agent" : "admin";

            setToken(accessToken);
            setUserData(userDetails);
            setStoredRole(detectedRole);
            setCurrentAgentId(detectedRole === "agent" ? userDetails._id : null);

            localStorage.setItem("token", accessToken);
            localStorage.setItem("accessToken", accessToken);
            if (refreshToken) {
                localStorage.setItem("refreshToken", refreshToken);
            }
            localStorage.setItem("user", JSON.stringify(userDetails));
            localStorage.setItem("ost_user_role", detectedRole);
            localStorage.setItem("roleType", detectedRole === "agent" ? "AGENT" : "ADMIN");
            if (detectedRole === "agent") {
                localStorage.setItem("ost_agent_id", userDetails._id);
            } else {
                localStorage.removeItem("ost_agent_id");
            }
            localStorage.removeItem("ost_simulated_role");

            // Redirect based on role
            if (detectedRole === "agent") {
                navigate("/agent/dashboard");
            } else {
                navigate("/dashboard");
            }

            return { role: detectedRole, name: userDetails.name || (detectedRole === "agent" ? "Agent" : "Administrator") };
        } catch (err: any) {
            const errorMsg =
                err.response?.data?.msg ||
                err.response?.data?.message ||
                err.message ||
                "Login failed. Please check your credentials.";
            throw new Error(errorMsg);
        }
    };

    const logout = () => {
        setToken(null);
        setUserData(null);
        setStoredRole("admin");
        setCurrentAgentId(null);

        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("ost_user_role");
        localStorage.removeItem("roleType");
        localStorage.removeItem("ost_agent_id");
        localStorage.removeItem("ost_simulated_role");
        localStorage.removeItem("ost_selected_agent_id");

        navigate("/login");
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                login,
                logout,
                userData,
                role,
                isAdmin,
                isAgent,
                currentAgent,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};

