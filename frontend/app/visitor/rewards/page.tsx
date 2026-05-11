"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import type { VisitorRewards, LeaderboardResponse } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Award, Share2, Users, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function VisitorRewardsPage() {
  const [rewards, setRewards] = useState<VisitorRewards | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [rewardsData, leaderboardData] = await Promise.all([
        apiFetch<VisitorRewards>("/admin/rewards/all"),
        apiFetch<LeaderboardResponse>("/leaderboard"),
      ])
      setRewards(rewardsData)
      setLeaderboard(leaderboardData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
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

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (position === 2) return <Award className="h-6 w-6 text-gray-400" />
    if (position === 3) return <Award className="h-6 w-6 text-orange-600" />
    return <span className="text-lg font-bold text-gray-600">#{position}</span>
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Rewards</h1>
        <p className="text-gray-600">Track your points, badges, and leaderboard position</p>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : rewards ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-400 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                <TrendingUp className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{rewards.points.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-600 to-purple-400 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Badge</CardTitle>
                <Award className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <Badge className={`${getBadgeColor(rewards.badge)} text-lg px-3 py-1`}>{rewards.badge}</Badge>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-600 to-green-400 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leaderboard</CardTitle>
                <Trophy className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">#{rewards.position}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-600 to-orange-400 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Referrals</CardTitle>
                <Users className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{rewards.referrals}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Earn More Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Share content</span>
                  <Badge variant="secondary">+10 points</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Refer a friend</span>
                  <Badge variant="secondary">+50 points</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">Engage with posts</span>
                  <Badge variant="secondary">+5 points</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Global Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : leaderboard && leaderboard.leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.leaderboard.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    entry.position <= 3
                      ? "bg-gradient-to-r from-yellow-50 to-white border-2 border-yellow-200"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12">{getPositionIcon(entry.position)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{entry.user.name}</h3>
                      {entry.user.badge && entry.user.badge !== "none" && (
                        <Badge className={`${getBadgeColor(entry.user.badge)} mt-1`}>{entry.user.badge}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{entry.points}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No leaderboard data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
