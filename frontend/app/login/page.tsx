"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch, setAuthToken } from "@/lib/api"
import { setUserRole, getRoleDashboardPath } from "@/lib/roles"
import type { LoginResponse, UserRole } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      setAuthToken(response.token)
      document.cookie = `authToken=${response.token}; path=/; max-age=86400`

      // Use role returned in the login response's user object when available
      const userRole: UserRole = (response.user && (response.user as any).role) || "visitor"

      setUserRole(userRole)
      document.cookie = `userRole=${userRole}; path=/; max-age=86400`

      toast.success("Login successful")
      router.push(getRoleDashboardPath(userRole))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div suppressHydrationWarning className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-400 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Default Automation</CardTitle>
          <CardDescription className="text-center">Login to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div suppressHydrationWarning className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div suppressHydrationWarning className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
