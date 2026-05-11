'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function TrapsPage() {
  const [traps, setTraps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTraps();
  }, []);

  const fetchTraps = async () => {
    try {
      const data = await apiFetch<any[]>('/admin/traps');
      setTraps(data);
    } catch (error) {
      toast.error('Failed to fetch trap data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Traps</h1>
        <p className="text-gray-600 mt-1">Monitor trap data and activity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trap Data ({traps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading trap data...</div>
          ) : traps.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No trap data available</div>
          ) : (
            <div className="space-y-2">
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(traps, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
