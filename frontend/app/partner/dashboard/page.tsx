"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import type { PartnerStats } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, FileText, Gift, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function PartnerDashboardPage() {
  const [stats, setStats] = useState<PartnerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await apiFetch<PartnerStats>("/partner/stats")
      setStats(data)
    } catch (error) {
      // If the partner stats endpoint is not available, log succinctly and continue with null stats
      console.error("Failed to fetch partner stats:", error instanceof Error ? error.message : error)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Traps",
      value: stats?.totalTraps ?? 0,
      icon: Shield,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Users Captured",
      value: stats?.usersCaptured ?? 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Scheduled Posts",
      value: stats?.scheduledPosts ?? 0,
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Reward Points",
      value: stats?.rewardPoints ?? 0,
      icon: Gift,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Partner Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your performance and rewards</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Post Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : stats && stats.postPerformance.length > 0 ? (
            <div className="space-y-3">
              {stats.postPerformance.map((post) => (
                <div key={post.post_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{post.platform}</p>
                    <p className="text-sm text-gray-600">Post ID: {post.post_id.slice(0, 8)}...</p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">{post.likes}</p>
                      <p className="text-gray-500">Likes</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-green-600">{post.shares}</p>
                      <p className="text-gray-500">Shares</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-orange-600">{post.views}</p>
                      <p className="text-gray-500">Views</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No post performance data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
