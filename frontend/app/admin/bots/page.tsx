'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { BotStatus, BotStatusMap } from '@/types';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Pause } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { formatDateSafe } from '@/lib/utils';

export default function BotsPage() {
  const [bots, setBots] = useState<BotStatus[] | BotStatusMap>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      const data = await apiFetch<BotStatus[] | BotStatusMap>('/admin/bots/status');
      setBots(data);
    } catch (error) {
      toast.error('Failed to fetch bot status');
    } finally {
      setLoading(false);
    }
  };

  const handleRestartAll = async () => {
    if (!confirm('Restart all bots?')) return;
    try {
      await apiFetch('/admin/cron/restart', { method: 'POST' });
      toast.success('All bots restarted');
      fetchBots();
    } catch (error) {
      toast.error('Failed to restart bots');
    }
  };

  // botKey is the platform key when API returns a map (e.g., 'twitter')
  const handlePauseBot = async (botKey: string) => {
    try {
      await apiFetch(`/admin/cron/${botKey}/pause`, { method: 'POST' });
      toast.success(`Bot ${botKey} paused`);
      fetchBots();
    } catch (error) {
      toast.error('Failed to pause bot');
    }
  };

  const columns = [
    { header: 'Bot Name', accessor: (row: any) => row.bot_name },
    {
      header: 'Status',
      accessor: (row: any) => (
        <Badge variant={row.status === 'idle' ? 'secondary' : 'default'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Last Run',
      accessor: (row: any) =>
        row.last_run ? formatDateSafe(row.last_run, 'MMM d, yyyy HH:mm', 'Never') : 'Never',
    },
    {
      header: 'Last Error',
      accessor: (row: any) => <div className="max-w-md truncate">{row.last_error || 'None'}</div>,
    },
  ];

  // Normalize bots into an array of BotStatus rows. If the API returns a map keyed by platform,
  // convert entries into rows with bot_name set to the platform key and normalized fields.
  const botsArray: BotStatus[] = Array.isArray(bots)
    ? bots
    : bots && typeof bots === 'object'
    ? Object.entries(bots).map(([key, val], idx) => ({
        id: key || String(idx),
        bot_name: key,
        status: (val as any).status,
        last_run: (val as any).lastRun ?? (val as any).last_run ?? null,
        last_error: (val as any).lastError ?? (val as any).last_error ?? null,
        updated_at: (val as any).updatedAt ?? (val as any).updated_at ?? undefined,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bots</h1>
          <p className="text-gray-600 mt-1">Manage automation bots</p>
        </div>
        <Button onClick={handleRestartAll}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Restart All
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bot Status ({botsArray.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading bots...</div>
          ) : (
            <DataTable
              data={botsArray}
              columns={columns}
              actions={(row) => (
                <Button variant="outline" size="sm" onClick={() => handlePauseBot(row.id || '')}>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              )}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
