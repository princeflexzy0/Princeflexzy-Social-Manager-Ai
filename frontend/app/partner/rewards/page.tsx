"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import type { Reward } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function PartnerRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRewards()
  }, [])

  const fetchRewards = async () => {
    try {
      const raw = await apiFetch<unknown>("/admin/rewards/all")

      const normalize = (v: unknown) => {
        if (!v) return { rewards: [], totalPoints: 0 }
        if (Array.isArray(v)) return { rewards: v as Reward[], totalPoints: 0 }
        if (typeof v === 'object') {
          const r = (v as any).rewards || (v as any).data || Object.values(v as Record<string, any>)
          const t = (v as any).totalPoints || (v as any).total_points || 0
          return { rewards: Array.isArray(r) ? r : [], totalPoints: typeof t === 'number' ? t : 0 }
        }
        return { rewards: [], totalPoints: 0 }
      }

      const data = normalize(raw)
      setRewards(data.rewards)
      setTotalPoints(data.totalPoints)
    } catch (error) {
      // Avoid logging large HTML error responses; show concise message
      console.error("Failed to fetch rewards:", error instanceof Error ? error.message : error)
    } finally {
      setLoading(false)
    }
  }

  const getRewardColor = (type: string) => {
    switch (type) {
      case "gold":
        return "bg-yellow-500"
      case "silver":
        return "bg-gray-400"
      case "viral":
        return "bg-purple-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Rewards</h1>
        <p className="text-gray-600 mt-1">Track your earned reward points</p>
      </div>

      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Total Reward Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-12 w-32 bg-white/20" />
          ) : (
            <p className="text-5xl font-bold">{totalPoints.toLocaleString()}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reward History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : rewards.length > 0 ? (
            <div className="space-y-3">
              {rewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Gift className="h-5 w-5 text-blue-600" />
                    <div>
                      <Badge className={getRewardColor(reward.reward_type)}>{reward.reward_type}</Badge>
                      <p className="text-sm text-gray-600 mt-1">{new Date(reward.issued_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">+{reward.amount}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No rewards earned yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
