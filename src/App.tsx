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

import DashboardLayout from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";

import { AuthProvider } from "./context/AuthContext";

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

            {/* Property Types */}
            <Route
              path="/property-types"
              element={
                <DashboardLayout>
                  <PropertyTypes />
                </DashboardLayout>
              }
            />

            {/* Properties */}
            <Route
              path="/properties"
              element={
                <DashboardLayout>
                  <Properties />
                </DashboardLayout>
              }
            />

            {/* Enquiries */}
            <Route
              path="/enquiries"
              element={
                <DashboardLayout>
                  <Enquiries />
                </DashboardLayout>
              }
            />

            {/* Amenities */}
            <Route
              path="/amenities"
              element={
                <DashboardLayout>
                  <Amenities />
                </DashboardLayout>
              }
            />

            {/* Amenities Type */}
            <Route
              path="/amenitiestype"
              element={
                <DashboardLayout>
                  <AmenitiesType />
                </DashboardLayout>
              }
            />

            {/* Users */}
            <Route
              path="/users"
              element={
                <DashboardLayout>
                  <Users />
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