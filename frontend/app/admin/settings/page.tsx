'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Setting } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await apiFetch<Setting[]>('/admin/settings');
      // Some APIs may return an object map instead of array; normalize to array
      if (Array.isArray(data)) {
        setSettings(data);
      } else if (data && typeof data === 'object') {
        const arr = Object.keys(data).map((k) => ({
          key: k,
          value: typeof (data as any)[k] === 'object' && (data as any)[k] !== null ? (data as any)[k] : { value: (data as any)[k] },
          // provide a fallback updated_at so it conforms to Setting type
          updated_at: new Date().toISOString(),
        }));
        setSettings(arr as any);
      } else {
        setSettings([]);
      }
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const settingsObject = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>);

      await apiFetch('/admin/settings', {
        method: 'POST',
        body: JSON.stringify(settingsObject),
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure system settings</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading settings...</div>
          ) : settings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No settings configured</div>
          ) : (
            <div className="space-y-4">
              {settings.map((setting) => (
                <div key={setting.key} className="space-y-2">
                  <Label htmlFor={setting.key} className="capitalize">
                    {setting.key.replace(/_/g, ' ')}
                  </Label>
                  <Input
                    id={setting.key}
                    value={typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value)}
                    onChange={(e) => {
                      const raw = e.target.value;
                      // Try to parse JSON, but fall back to raw string if invalid
                      let parsed: any = raw;
                      try {
                        parsed = JSON.parse(raw);
                      } catch {
                        parsed = raw;
                      }
                      const newSettings = settings.map((s) =>
                        s.key === setting.key ? { ...s, value: parsed } : s
                      );
                      setSettings(newSettings);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
