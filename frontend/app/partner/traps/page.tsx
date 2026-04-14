"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Trap {
  id: string
  name: string
  url: string
  users_captured: number
  created_at: string
  active: boolean
}

export default function PartnerTrapsPage() {
  const [traps, setTraps] = useState<Trap[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTraps()
  }, [])

  const fetchTraps = async () => {
    try {
      const data = await apiFetch<unknown>("/admin/traps")
      const normalizeArray = <T,>(v: unknown): T[] => {
        if (Array.isArray(v)) return v as T[]
        if (v && typeof v === 'object') {
          if ('traps' in (v as Record<string, unknown>) && Array.isArray((v as any).traps)) {
            return (v as any).traps as T[]
          }
          if ('data' in (v as Record<string, unknown>) && Array.isArray((v as any).data)) {
            return (v as any).data as T[]
          }
          return Object.values(v as Record<string, T>)
        }
        return []
      }

      const trapsArr = normalizeArray<Trap>(data)
      setTraps(trapsArr)
    } catch (error) {
      console.error("Failed to fetch traps:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Traps</h1>
        <p className="text-gray-600 mt-1">View your traps and captured users</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (traps || []).length > 0 ? (
          (traps || []).map((trap) => (
            <Card key={trap.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">{trap.name}</CardTitle>
                <Shield className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={trap.active ? "default" : "secondary"}>{trap.active ? "Active" : "Inactive"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Users Captured</span>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">{trap.users_captured}</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 truncate">{trap.url}</p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No traps found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
