"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  FileText,
  TrendingUp,
  MessageSquare,
  Bell,
  Gift,
  FileCode,
  Settings,
  Bot,
  BarChart3,
  Shield,
  UserCog,
  Trophy,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Posts", href: "/admin/posts", icon: FileText },
  { name: "Engagements", href: "/admin/engagements", icon: TrendingUp },
  { name: "Blogs", href: "/admin/blogs", icon: MessageSquare },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Rewards", href: "/admin/rewards", icon: Gift },
  { name: "Logs", href: "/admin/logs", icon: FileCode },
  { name: "Traps", href: "/admin/traps", icon: Shield },
  { name: "Bots", href: "/admin/bots", icon: Bot },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Leaderboard", href: "/admin/leaderboard", icon: Trophy },
  { name: "Roles", href: "/admin/roles", icon: UserCog },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-700">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
