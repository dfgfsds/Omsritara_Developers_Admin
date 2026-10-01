import axios from "axios";

const API_BASE_URL = "https://api.omsritaradevelopers.in";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach token to outgoing requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // When sending FormData, delete Content-Type to let browser set boundary automatically
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercept 401 Unauthorized responses to clear expired token and redirect to login
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const url = String(error.config?.url || "").toLowerCase();
        const errData = error.response?.data;
        const errMsg = String(
            errData?.msg || errData?.message || errData?.error || ""
        ).toLowerCase();

        // Check if token is genuinely expired or invalid
        const isTokenExpiredOrInvalid =
            errMsg.includes("jwt expired") ||
            errMsg.includes("token expired") ||
            errMsg.includes("jwt malformed") ||
            errMsg.includes("invalid token") ||
            errMsg.includes("no token");

        // Endpoints or actions that should never trigger hard logout
        const isSuppEndpoint =
            Boolean((error.config as any)?.skipAuthRedirect) ||
            url.includes("/user") ||
            url.includes("/property") ||
            url.includes("/enquiry") ||
            url.includes("/upload");

        // Only redirect to login if not suppressed, and either no token exists or token is explicitly expired/invalid
        if (error.response && error.response.status === 401 && !isSuppEndpoint) {
            const hasToken = Boolean(localStorage.getItem("token"));
            if (!hasToken || isTokenExpiredOrInvalid) {
                localStorage.removeItem("token");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
                localStorage.removeItem("ost_user_role");
                localStorage.removeItem("roleType");
                localStorage.removeItem("ost_agent_id");
                localStorage.removeItem("ost_simulated_role");
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;