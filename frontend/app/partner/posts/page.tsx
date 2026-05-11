"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import type { PostQueue } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function PartnerPostsPage() {
  const [posts, setPosts] = useState<PostQueue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const data = await apiFetch<unknown>("/admin/queue")
      const normalizeArray = <T,>(v: unknown): T[] => {
        if (Array.isArray(v)) return v as T[]
        if (v && typeof v === 'object') {
          if ('posts' in (v as Record<string, unknown>) && Array.isArray((v as any).posts)) {
            return (v as any).posts as T[]
          }
          if ('data' in (v as Record<string, unknown>) && Array.isArray((v as any).data)) {
            return (v as any).data as T[]
          }
          return Object.values(v as Record<string, T>)
        }
        return []
      }

      const postsArr = normalizeArray<PostQueue>(data)
      setPosts(postsArr)
    } catch (error) {
      console.error("Failed to fetch posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "posted":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Scheduled Posts</h1>
        <p className="text-gray-600 mt-1">View and manage your scheduled content</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (posts || []).length > 0 ? (
          (posts || []).map((post) => (
            <Card key={post.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{post.platform}</CardTitle>
                </div>
                <Badge className={getStatusColor(post.status)}>{post.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {post.caption && <p className="text-sm text-gray-700 line-clamp-2">{post.caption}</p>}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : "Not scheduled"}</span>
                  </div>
                  <span className="text-gray-500">Priority: {post.priority}</span>
                </div>
                {post.media_url && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">Media attached</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No scheduled posts found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
