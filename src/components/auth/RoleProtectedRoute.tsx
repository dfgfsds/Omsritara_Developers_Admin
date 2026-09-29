// src/components/auth/RoleProtectedRoute.tsx
import { ReactNode, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectPath?: string;
}

export const RoleProtectedRoute = ({
  children,
  allowedRoles,
  redirectPath,
}: RoleProtectedRouteProps) => {
  const { role, token } = useAuth();
  const hasAccess = allowedRoles.includes(role);

  // If not logged in, always redirect to /login
  const effectiveRedirect =
    redirectPath ||
    (!token
      ? "/login"
      : role === "agent"
      ? "/agent/dashboard"
      : "/dashboard");

  useEffect(() => {
    if (!token) {
      toast({
        title: "Session Required",
        description: "Please log in to continue.",
        variant: "destructive",
      });
    } else if (!hasAccess) {
      toast({
        title: "Access Denied",
        description: "You do not have administrative privileges to access this section.",
        variant: "destructive",
      });
    }
  }, [hasAccess, token]);

  if (!token || !hasAccess) {
    return <Navigate to={effectiveRedirect} replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
