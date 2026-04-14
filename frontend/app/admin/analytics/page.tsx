'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { PlatformEngagementStats, RewardStatsByType, TopEngagedUser } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/DataTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  const [engagementStats, setEngagementStats] = useState<PlatformEngagementStats[]>([]);
  const [rewardStats, setRewardStats] = useState<RewardStatsByType[]>([]);
  const [topUsers, setTopUsers] = useState<TopEngagedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [engagement, rewards, users] = await Promise.all([
        apiFetch<PlatformEngagementStats[]>('/admin/engagement-stats'),
        apiFetch<RewardStatsByType[]>('/admin/reward-stats'),
        apiFetch<TopEngagedUser[]>('/admin/top-users'),
      ]);
      const normalizeArray = <T,>(v: unknown): T[] => {
        if (Array.isArray(v)) return v as T[]
        if (v && typeof v === 'object') {
          // common API shapes: { data: [...] } or an object map
          if ('data' in (v as Record<string, unknown>) && Array.isArray((v as any).data)) {
            return (v as any).data as T[]
          }
          return Object.values(v as Record<string, T>)
        }
        return []
      }

      const engagementArr = normalizeArray<PlatformEngagementStats>(engagement)
      const rewardsArr = normalizeArray<RewardStatsByType>(rewards)
      const usersArr = normalizeArray<TopEngagedUser>(users)

      setEngagementStats(engagementArr)
      setRewardStats(rewardsArr)
      setTopUsers(usersArr.map((u, i) => ({ ...u, id: (u as any).user_id || `user-${i}` })))
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const topUsersColumns = [
    {
      header: 'User ID',
      accessor: (row: TopEngagedUser) => (
        <div className="font-mono text-xs truncate max-w-[200px]">{row.user_id}</div>
      ),
    },
    { header: 'Likes', accessor: 'total_likes' as keyof TopEngagedUser },
    { header: 'Shares', accessor: 'total_shares' as keyof TopEngagedUser },
    { header: 'Comments', accessor: 'total_comments' as keyof TopEngagedUser },
    { header: 'Views', accessor: 'total_views' as keyof TopEngagedUser },
    { header: 'Total Engagement', accessor: 'total_engagement' as keyof TopEngagedUser },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">View platform insights and metrics</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading analytics...</div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Platform Engagement Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_likes" fill="#0088FE" name="Likes" />
                  <Bar dataKey="total_shares" fill="#00C49F" name="Shares" />
                  <Bar dataKey="total_comments" fill="#FFBB28" name="Comments" />
                  <Bar dataKey="total_views" fill="#FF8042" name="Views" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Rewards Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={rewardStats as any}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ reward_type, total_rewards }) =>
                        `${reward_type}: ${total_rewards}`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total_rewards"
                      nameKey="reward_type"
                    >
                      {rewardStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rewards by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rewardStats.map((stat, index) => (
                    <div key={stat.reward_type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="capitalize font-medium">{stat.reward_type}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{stat.total_rewards}</div>
                        <div className="text-sm text-gray-600">
                          Amount: {stat.total_amount}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Engaged Users</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable data={topUsers} columns={topUsersColumns} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
