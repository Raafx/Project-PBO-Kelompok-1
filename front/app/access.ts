export type AccessArea = "admin" | "pos" | "ceo-chat";

export type SessionUser = {
  employee_code: string;
  full_name: string;
  role_name: string | null;
  permissions: string[];
  expires_at?: string | null;
};

export function defaultPathForPermissions(permissions: string[]): string {
  if (permissions.includes("admin.overview")) return "/admin";
  if (permissions.includes("pos.access")) return "/pos";
  return "/login?access=denied";
}

export function canAccessArea(
  permissions: string[],
  area: AccessArea,
): boolean {
  if (area === "pos") return permissions.includes("pos.access");
  if (area === "ceo-chat") return permissions.includes("admin.ceo_chat");
  return permissions.includes("admin.overview");
}

export function canAccessPath(
  permissions: string[],
  requestedPath: string,
): boolean {
  const path = requestedPath.split("?", 1)[0];
  if (path === "/pos" || path.startsWith("/pos/"))
    return canAccessArea(permissions, "pos");
  if (path === "/ceo-chat" || path.startsWith("/ceo-chat/"))
    return canAccessArea(permissions, "ceo-chat");
  if (path === "/admin" || path.startsWith("/admin/"))
    return canAccessArea(permissions, "admin");
  return false;
}

export function resolvePostLoginPath(
  permissions: string[],
  requestedPath?: string | null,
): string {
  if (
    requestedPath?.startsWith("/") &&
    !requestedPath.startsWith("//") &&
    canAccessPath(permissions, requestedPath)
  ) {
    return requestedPath;
  }
  return defaultPathForPermissions(permissions);
}

export function readSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("mymarket_user");
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as Partial<SessionUser>;
    if (
      typeof user.employee_code !== "string" ||
      typeof user.full_name !== "string" ||
      !Array.isArray(user.permissions)
    ) {
      return null;
    }
    return {
      employee_code: user.employee_code,
      full_name: user.full_name,
      role_name: typeof user.role_name === "string" ? user.role_name : null,
      permissions: user.permissions.filter(
        (permission): permission is string => typeof permission === "string",
      ),
      expires_at: user.expires_at,
    };
  } catch {
    return null;
  }
}
