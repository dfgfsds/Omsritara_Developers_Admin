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
        const isSuppEndpoint =
            Boolean((error.config as any)?.skipAuthRedirect) ||
            String(error.config?.url || "").includes("/user");

        if (error.response && error.response.status === 401 && !isSuppEndpoint) {
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
        return Promise.reject(error);
    }
);

export default axiosInstance;