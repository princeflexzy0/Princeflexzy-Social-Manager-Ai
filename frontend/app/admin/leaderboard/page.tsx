"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import type { LeaderboardResponse } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const data = await apiFetch<LeaderboardResponse>("/leaderboard")
      setLeaderboard(data)
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />
      default:
        return <span className="text-lg font-bold text-gray-600">#{position}</span>
    }
  }

  const getBadgeColor = (badge: string) => {
    switch (badge.toLowerCase()) {
      case "gold":
        return "bg-yellow-500"
      case "silver":
        return "bg-gray-400"
      case "bronze":
        return "bg-orange-600"
      default:
        return "bg-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-600 mt-1">Top performers and their reward points</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : leaderboard && leaderboard.leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.leaderboard.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    entry.position <= 3 ? "bg-gradient-to-r from-blue-50 to-white" : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12">{getPositionIcon(entry.position)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{entry.user.name}</h3>
                      <p className="text-sm text-gray-600">{entry.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {entry.user.badge && entry.user.badge !== "none" && (
                      <Badge className={getBadgeColor(entry.user.badge)}>{entry.user.badge}</Badge>
                    )}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{entry.points}</p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No leaderboard data available</p>
          )}
        </CardContent>
      </Card>

      {leaderboard && leaderboard.leaderboard.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Competition Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-gray-600">Week Start</p>
                <p className="font-semibold">{new Date(leaderboard.leaderboard[0].week_start).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Week End</p>
                <p className="font-semibold">{new Date(leaderboard.leaderboard[0].week_end).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
