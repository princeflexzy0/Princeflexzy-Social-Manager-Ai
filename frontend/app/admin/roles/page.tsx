"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import type { Role, User } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit } from "lucide-react"
import { toast } from "sonner"

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [newRoleName, setNewRoleName] = useState("")
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [rolesData, usersData] = await Promise.all([
        apiFetch<{ roles: Role[] }>("/verify/roles"),
        apiFetch<{ users: User[] }>("/admin/users"),
      ])
      setRoles(rolesData.roles)
      setUsers(usersData.users)
    } catch (error) {
      toast.error("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const createRole = async () => {
    if (!newRoleName.trim()) {
      toast.error("Role name is required")
      return
    }

    try {
      await apiFetch("/verify/roles", {
        method: "POST",
        body: JSON.stringify({ name: newRoleName }),
      })
      toast.success("Role created successfully")
      setNewRoleName("")
      setIsCreateOpen(false)
      fetchData()
    } catch (error) {
      toast.error("Failed to create role")
    }
  }

  const deleteRole = async (id: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return

    try {
      await apiFetch(`/verify/roles/${id}`, { method: "DELETE" })
      toast.success("Role deleted successfully")
      fetchData()
    } catch (error) {
      toast.error("Failed to delete role")
    }
  }

  const assignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast.error("Please select both user and role")
      return
    }

    try {
      await apiFetch(`/verify/roles/${selectedUser}/${selectedRole}`, { method: "POST" })
      toast.success("Role assigned successfully")
      setSelectedUser("")
      setSelectedRole("")
      setIsAssignOpen(false)
      fetchData()
    } catch (error) {
      toast.error("Failed to assign role")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Assign Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Role to User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select User</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                      <SelectContent>
                        {(users || []).map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.email || user.name || user.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Select Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={assignRole} className="w-full">
                  Assign Role
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">Role Name</Label>
                  <Input
                    id="roleName"
                    placeholder="e.g., moderator, editor"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                  />
                </div>
                <Button onClick={createRole} className="w-full">
                  Create Role
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Roles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">Loading roles...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Badge variant="secondary">{role.name}</Badge>
                    </TableCell>
                    <TableCell>{role.description || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => deleteRole(role.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
