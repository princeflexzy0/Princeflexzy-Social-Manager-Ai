'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Notification } from '@/types';
import { DataTable } from '@/components/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { formatDateSafe } from '@/lib/utils';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch<Notification[]>('/admin/notifications/all');
      setNotifications(data);
    } catch (error) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Type',
      accessor: (row: Notification) => (
        <Badge variant="outline">{row.type}</Badge>
      ),
    },
    { header: 'Title', accessor: 'title' as keyof Notification },
    {
      header: 'Message',
      accessor: (row: Notification) => (
        <div className="max-w-md truncate">{row.message}</div>
      ),
    },
    {
      header: 'Read',
      accessor: (row: Notification) => (
        <Badge variant={row.read ? 'default' : 'secondary'}>
          {row.read ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      header: 'Delivered',
      accessor: (row: Notification) => (
        <Badge variant={row.delivered ? 'default' : 'secondary'}>
          {row.delivered ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      header: 'Created',
      accessor: (row: Notification) =>
  formatDateSafe(row.created_at, 'MMM d, yyyy HH:mm', 'Invalid date'),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-1">Manage system notifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notifications ({notifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading notifications...</div>
          ) : (
            <DataTable data={notifications} columns={columns} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
