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

import DashboardLayout from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import Blogs from "./pages/Blog";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";

const queryClient = new QueryClient();

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

            {/* Default */}
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              }
            />

            {/* Property Types (Admin only) */}
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

            {/* Properties (Admin & Agent) */}
            <Route
              path="/properties"
              element={
                <DashboardLayout>
                  <Properties />
                </DashboardLayout>
              }
            />

            {/* Agents Management (Admin only) */}
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

            {/* Enquiries (Admin & Agent) */}
            <Route
              path="/enquiries"
              element={
                <DashboardLayout>
                  <Enquiries />
                </DashboardLayout>
              }
            />

            {/* Amenities (Admin only) */}
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
              path="/blogs"
              element={
                <DashboardLayout>
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <Blogs />
                  </RoleProtectedRoute>
                </DashboardLayout>
              }
            />

            {/* Amenities Type (Admin only) */}
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

            {/* Users (Admin only) */}
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

            {/* Catch-all */}
            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;