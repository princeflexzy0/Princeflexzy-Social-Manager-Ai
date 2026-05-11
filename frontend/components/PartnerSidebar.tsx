"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Shield, FileText, Gift } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/partner/dashboard", icon: LayoutDashboard },
  { name: "My Traps", href: "/partner/traps", icon: Shield },
  { name: "My Posts", href: "/partner/posts", icon: FileText },
  { name: "My Rewards", href: "/partner/rewards", icon: Gift },
]

export function PartnerSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-700">
        <h1 className="text-xl font-bold">Partner Portal</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-green-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white",
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
