'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { User } from '@/types';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { formatDateSafe } from '@/lib/utils';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const [creatingUser, setCreatingUser] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await apiFetch<User[]>('/admin/users');
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInactive = async () => {
    if (!confirm('Are you sure you want to delete all inactive users?')) return;

    try {
      const result = await apiFetch<{ deleted: number }>('/auth/delete-inactive', {
        method: 'DELETE',
      });
      toast.success(`${result.deleted} inactive users deleted`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete inactive users');
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: (row: User) => row.name || 'N/A',
    },
    {
      header: 'Email',
      accessor: (row: User) => row.email || 'N/A',
    },
    {
      header: 'Phone',
      accessor: (row: User) => row.phone || 'N/A',
    },
    {
      header: 'Active',
      accessor: (row: User) => (
        <span className="flex items-center gap-1">
          {row.active ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </span>
      ),
    },
    {
      header: 'Created',
      accessor: (row: User) =>
  row.created_at ? formatDateSafe(row.created_at, 'MMM d, yyyy', 'N/A') : 'N/A',
    },
    {
      header: 'Last Active',
      accessor: (row: User) =>
  row.last_active ? formatDateSafe(row.last_active, 'MMM d, yyyy', 'Never') : 'Never',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage platform users</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Create User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create User</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget as HTMLFormElement;
                  const fd = new FormData(form);
                  const payload = {
                    name: String(fd.get('name') || ''),
                    email: String(fd.get('email') || ''),
                    password: String(fd.get('password') || ''),
                    phone: String(fd.get('phone') || ''),
                  };
                  try {
                    setCreatingUser(true);
                    await apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(payload) });
                    toast.success('User created');
                    fetchUsers();
                  } catch (err) {
                    toast.error('Failed to create user');
                  } finally {
                    setCreatingUser(false);
                  }
                }}
                className="space-y-3"
              >
                <div>
                  <Label>Name</Label>
                  <Input name="name" required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input name="email" type="email" required />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input name="password" type="password" required />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input name="phone" />
                </div>
                <div className="flex gap-2 justify-end">
                  <DialogClose asChild>
                    <button className="btn-outline" type="button">Cancel</button>
                  </DialogClose>
                  <Button type="submit" disabled={creatingUser}>{creatingUser ? 'Creating...' : 'Create'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        <Button
  onClick={handleDeleteInactive}
  className="bg-red-600 hover:bg-red-700 text-white"
>
  <Trash2 className="h-4 w-4 mr-2" />
  Delete Inactive
</Button>

        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <DataTable data={users} columns={columns} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
