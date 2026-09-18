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
import DashboardLayout from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext"; // 👈 import here
import Users from "./pages/Users";
import Blogs from "./pages/Blog";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* 👇 Wrap everything inside AuthProvider */}
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              }
            />
            <Route
              path="/property-types"
              element={
                <DashboardLayout>
                  <PropertyTypes />
                </DashboardLayout>
              }
            />
            <Route
              path="/properties"
              element={
                <DashboardLayout>
                  <Properties />
                </DashboardLayout>
              }
            />
            <Route
              path="/enquiries"
              element={
                <DashboardLayout>
                  <Enquiries />
                </DashboardLayout>
              }
            />
            <Route
              path="/amenities"
              element={
                <DashboardLayout>
                  <Amenities />
                </DashboardLayout>
              }
            />
            <Route
               path="/blogs"
               element={
                   <DashboardLayout>
                      <Blogs />
                  </DashboardLayout>
                }
            />
            <Route
              path="/users"
              element={
                <DashboardLayout>
                  <Users />
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
