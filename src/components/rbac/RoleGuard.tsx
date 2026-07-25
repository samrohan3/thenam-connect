import React from "react";
import { useAuthStore } from "@/store/authStore";
import { hasPermission, normalizeRole, Resource, Action, Role } from "@/lib/permissions";

interface RoleGuardProps {
  children: React.ReactNode;
  resource?: Resource;
  action?: Action;
  roles?: Role[];
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  resource,
  action = "read",
  roles,
  fallback = null,
}: RoleGuardProps) {
  const { user } = useAuthStore();
  const currentRole = normalizeRole(user?.role);

  // If specific allowed roles list is provided
  if (roles && roles.length > 0) {
    if (!roles.includes(currentRole)) {
      return <>{fallback}</>;
    }
  }

  // If resource-based permission check is provided
  if (resource) {
    const permitted = hasPermission(currentRole, resource, action);
    if (!permitted) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

export const PermissionGate = RoleGuard;
