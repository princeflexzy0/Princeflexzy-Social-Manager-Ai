import type React from "react"
import { Topbar } from "@/components/Topbar"

export default function VisitorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Topbar />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
