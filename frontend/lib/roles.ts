import type { UserRole } from "@/types"

export function getUserRole(): UserRole | null {
  if (typeof window === "undefined") return null
  const role = localStorage.getItem("userRole")
  return role as UserRole | null
}

export function setUserRole(role: UserRole) {
  if (typeof window !== "undefined") {
    localStorage.setItem("userRole", role)
  }
}

export function clearUserRole() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("userRole")
  }
}

export function isAdmin(): boolean {
  return getUserRole() === "admin"
}

export function isPartner(): boolean {
  return getUserRole() === "partner"
}

export function isVisitor(): boolean {
  return getUserRole() === "visitor"
}

export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin"
    case "partner":
      return "/partner/dashboard"
    case "visitor":
      return "/visitor/rewards"
    default:
      return "/login"
  }
}
