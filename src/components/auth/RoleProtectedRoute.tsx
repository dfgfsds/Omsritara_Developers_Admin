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
  redirectPath = "/dashboard",
}: RoleProtectedRouteProps) => {
  const { role } = useAuth();
  const hasAccess = allowedRoles.includes(role);

  useEffect(() => {
    if (!hasAccess) {
      toast({
        title: "Access Restricted",
        description: `This section is only accessible to ${allowedRoles.join(" / ")}. Redirected to your dashboard.`,
        variant: "destructive",
      });
    }
  }, [hasAccess, allowedRoles]);

  if (!hasAccess) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
