import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PropertyTypes from "./pages/PropertyTypes";
import Properties from "./pages/Properties";
import Enquiries from "./pages/Enquiries";
import Amenities from "./pages/Amenities";
import AmenitiesType from "./pages/Amenitiestype";
import Users from "./pages/Users";
import Agents from "./pages/Agents";

import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentProperties from "./pages/agent/AgentProperties";
import AgentPropertyAdd from "./pages/agent/AgentPropertyAdd";
import AgentEnquiries from "./pages/agent/AgentEnquiries";
import AgentProfile from "./pages/agent/AgentProfile";

import DashboardLayout from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Blogs from "./pages/Blog";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";

const queryClient = new QueryClient();

// Purge legacy mock data from browser localStorage to enforce 100% dynamic API data
if (typeof window !== "undefined") {
  const legacyKeys = [
    "ost_mock_agents_v1",
    "ost_mock_agent_properties_v1",
    "ost_mock_agent_enquiries_v1",
    "mock_agent_token_agent_001",
    "mock_agent_token_agent_002",
    "mock_agent_token_agent_003",
  ];
  legacyKeys.forEach((k) => localStorage.removeItem(k));

  const savedAgentId = localStorage.getItem("ost_agent_id");
  if (savedAgentId && savedAgentId.startsWith("agent_00")) {
    localStorage.removeItem("ost_agent_id");
  }
}

const RootRedirect = () => {
  const { role, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role === "agent") return <Navigate to="/agent/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Login */}
            <Route path="/login" element={<Login />} />

            {/* Default root with role routing */}
            <Route path="/" element={<RootRedirect />} />

            {/* ===================== ADMIN ROUTES ===================== */}
            <Route
              path="/dashboard"
              element={
                <DashboardLayout>
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <Dashboard />
                  </RoleProtectedRoute>
                </DashboardLayout>
              }
            />

            <Route
              path="/properties"
              element={
                <DashboardLayout>
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <Properties />
                  </RoleProtectedRoute>
                </DashboardLayout>
              }
            />

            <Route
              path="/property-types"
              element={
                <DashboardLayout>
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <PropertyTypes />
                  </RoleProtectedRoute>
                </DashboardLayout>
              }
            />

            <Route
              path="/agents"
              element={
                <DashboardLayout>
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <Agents />
                  </RoleProtectedRoute>
                </DashboardLayout>
              }
            />

            {/* Alias for agent-management */}
            <Route
              path="/agent-management"
              element={<Navigate to="/agents" replace />}
            />

            <Route
              path="/enquiries"
              element={
                <DashboardLayout>
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <Enquiries />
                  </RoleProtectedRoute>
                </DashboardLayout>
              }
            />

            <Route
              path="/amenities"
              element={
                <DashboardLayout>
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <Amenities />
                  </RoleProtectedRoute>
                </DashboardLayout>
              }
            />

            <Route
              path="/amenitiestype"
              element={
                <DashboardLayout>
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <AmenitiesType />
                  </RoleProtectedRoute>
                </DashboardLayout>
              }
            />

            <Route
              path="/blogs"
              element={
                <DashboardLayout>
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <Blogs />
                  </RoleProtectedRoute>
                </DashboardLayout>
              }
            />

            <Route
              path="/users"
              element={
                <DashboardLayout>
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <Users />
                  </RoleProtectedRoute>
                </DashboardLayout>
              }
            />

            {/* Alias for /roles */}
            <Route
              path="/roles"
              element={
                <DashboardLayout>
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <Users />
                  </RoleProtectedRoute>
                </DashboardLayout>
              }
            />

            {/* ===================== AGENT ROUTES ===================== */}
            <Route
              path="/agent/dashboard"
              element={
                <DashboardLayout>
                  <RoleProtectedRoute allowedRoles={["agent", "admin"]}>
                    <AgentDashboard />
                  </RoleProtectedRoute>
                </DashboardLayout>
              }
            />

            <Route
              path="/agent/properties"
              element={
                <DashboardLayout>
                  <RoleProtectedRoute allowedRoles={["agent", "admin"]}>
                    <AgentProperties />
                  </RoleProtectedRoute>
                </DashboardLayout>
              }
            />

            <Route
              path="/agent/properties/add"
              element={
                <DashboardLayout>
                  <RoleProtectedRoute allowedRoles={["agent", "admin"]}>
                    <AgentPropertyAdd />
                  </RoleProtectedRoute>
                </DashboardLayout>
              }
            />

            <Route
              path="/agent/enquiries"
              element={
                <DashboardLayout>
                  <RoleProtectedRoute allowedRoles={["agent", "admin"]}>
                    <AgentEnquiries />
                  </RoleProtectedRoute>
                </DashboardLayout>
              }
            />

            <Route
              path="/agent/profile"
              element={
                <DashboardLayout>
                  <RoleProtectedRoute allowedRoles={["agent", "admin"]}>
                    <AgentProfile />
                  </RoleProtectedRoute>
                </DashboardLayout>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;