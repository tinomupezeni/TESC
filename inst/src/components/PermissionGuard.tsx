import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

export const PermissionGuard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const hasNotified = useRef(false);

  const userPermissions = user?.department?.permissions || [];
  const userLevel = user?.level;

  // 1. Level 1 (Institution Admin) bypasses all checks within their institution
  const isSuperAdmin = userLevel === "1";

  // 2. Public / Semi-Public Routes within the dashboard
  const isPublicPage = [
    "/dashboard",
    "/dashboard/settings",
    "/profile",
  ].includes(location.pathname);

  const hasAccess = userPermissions.some((p: string) => {
    // Exact match
    if (location.pathname === p) return true;
    // Sub-route match
    if (location.pathname.startsWith(p + "/")) return true;
    return false;
  });

  useEffect(() => {
    hasNotified.current = false;
  }, [location.pathname]);

  useEffect(() => {
    if (!isSuperAdmin && !isPublicPage && !hasAccess && !hasNotified.current) {
      toast.error(
        "Access Denied: You do not have permission to view this page."
      );
      hasNotified.current = true;
    }
  }, [isSuperAdmin, isPublicPage, hasAccess]);

  if (isSuperAdmin || isPublicPage || hasAccess) {
    return <>{children}</>;
  }

  // Redirect unauthorized users to Dashboard
  return <Navigate to="/dashboard" replace />;
};
