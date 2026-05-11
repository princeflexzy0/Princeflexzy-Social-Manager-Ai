'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { DashboardStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, TrendingUp, Gift } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiFetch<DashboardStats>('/admin/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Bots',
      value: stats?.activeBots ?? 0,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Trap Triggers',
      value: stats?.trapTriggers ?? 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Cron Jobs',
      value: stats?.cronJobs ?? 0,
      icon: Gift,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to Default Automation Admin Panel</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="text-sm font-medium text-green-600">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Bot Status</span>
                <span className="text-sm font-medium text-green-600">Running</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a
                href="/admin/posts"
                className="block w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors"
              >
                Schedule New Post
              </a>
              <a
                href="/admin/users"
                className="block w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors"
              >
                Manage Users
              </a>
              <a
                href="/admin/analytics"
                className="block w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors"
              >
                View Analytics
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
