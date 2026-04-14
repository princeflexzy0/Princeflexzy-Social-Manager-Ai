'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Reward } from '@/types';
import { DataTable } from '@/components/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { formatDateSafe } from '@/lib/utils';

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const raw = await apiFetch<unknown>('/admin/rewards/all');
      let data: Reward[] = [];
      if (Array.isArray(raw)) data = raw as Reward[];
      else if (raw && typeof raw === 'object' && 'rewards' in (raw as Record<string, unknown>)) {
        const maybe = (raw as Record<string, unknown>)['rewards'];
        if (Array.isArray(maybe)) data = maybe as Reward[];
      } else if (raw && typeof raw === 'object') data = Object.values(raw as Record<string, Reward>);
      setRewards(data);
    } catch (error) {
      toast.error('Failed to fetch rewards');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Type',
      accessor: (row: Reward) => (
        <Badge
          variant={
            row.reward_type === 'viral'
              ? 'default'
              : row.reward_type === 'gold'
              ? 'secondary'
              : 'outline'
          }
        >
          {row.reward_type}
        </Badge>
      ),
    },
    { header: 'Amount', accessor: 'amount' as keyof Reward },
    {
      header: 'Notified',
      accessor: (row: Reward) => (
        <Badge variant={row.notified ? 'default' : 'secondary'}>
          {row.notified ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      header: 'Issued',
      accessor: (row: Reward) => formatDateSafe(row.issued_at, 'MMM d, yyyy HH:mm', 'Invalid date'),
    },
  ];

  const rewardsArray = Array.isArray(rewards) ? rewards : [];
  const totalRewards = rewardsArray.reduce(
    (acc, reward) => acc + (typeof reward.amount === 'number' ? reward.amount : 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rewards</h1>
        <p className="text-gray-600 mt-1">Track issued rewards</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Rewards Issued</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalRewards.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Rewards ({rewards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading rewards...</div>
          ) : (
            <DataTable data={rewardsArray} columns={columns} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
