'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Engagement } from '@/types';
import { DataTable } from '@/components/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDateSafe } from '@/lib/utils';

export default function EngagementsPage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEngagements();
  }, []);

  const fetchEngagements = async () => {
    try {
      const raw = await apiFetch<unknown>('/admin/engagements');

      // Normalize: endpoint may return { engagements: [...] } or an array or an object map
      let data: Engagement[] = [];
      if (Array.isArray(raw)) {
        data = raw as Engagement[];
      } else if (raw && typeof raw === 'object' && 'engagements' in (raw as Record<string, unknown>)) {
        const maybe = (raw as Record<string, unknown>)['engagements'];
        if (Array.isArray(maybe)) data = maybe as Engagement[];
      } else if (raw && typeof raw === 'object') {
        data = Object.values(raw as Record<string, Engagement>);
      }

      setEngagements(data);
      
    } catch (error) {
      toast.error('Failed to fetch engagements');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Platform', accessor: 'platform' as keyof Engagement },
    { header: 'Likes', accessor: 'likes' as keyof Engagement },
    { header: 'Shares', accessor: 'shares' as keyof Engagement },
    { header: 'Comments', accessor: 'comments' as keyof Engagement },
    { header: 'Views', accessor: 'views' as keyof Engagement },
    {
      header: 'Reward Triggered',
      accessor: (row: Engagement) => (
        <Badge variant={row.reward_triggered ? 'default' : 'secondary'}>
          {row.reward_triggered ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      header: 'Created',
    accessor: (row: Engagement) => formatDateSafe(row.created_at, 'MMM d, yyyy HH:mm', 'Invalid date'),
    },
  ];

  // defensive: ensure engagements is an array at runtime (api may return object/null)
  const engagementsArray: Engagement[] = Array.isArray(engagements)
    ? engagements
    : engagements && typeof engagements === 'object'
    ? (Object.values(engagements) as Engagement[])
    : [];

  const totalEngagement = engagementsArray.reduce(
    (
      acc: { likes: number; shares: number; comments: number; views: number },
      eng: Engagement
    ) => ({
      likes: acc.likes + (eng?.likes || 0),
      shares: acc.shares + (eng?.shares || 0),
      comments: acc.comments + (eng?.comments || 0),
      views: acc.views + (eng?.views || 0),
    }),
    { likes: 0, shares: 0, comments: 0, views: 0 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Engagements</h1>
        <p className="text-gray-600 mt-1">Track post engagement metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Likes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEngagement.likes.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Shares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEngagement.shares.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEngagement.comments.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEngagement.views.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
          <CardHeader>
          <CardTitle>All Engagements ({engagementsArray.length})</CardTitle>
        </CardHeader>
        <CardContent>
            {loading ? (
            <div className="text-center py-8">Loading engagements...</div>
          ) : (
            <DataTable data={engagementsArray} columns={columns} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
