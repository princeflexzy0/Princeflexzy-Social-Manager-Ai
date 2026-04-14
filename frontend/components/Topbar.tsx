'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clearAuthToken } from '@/lib/api';
import { toast } from 'sonner';

export function Topbar() {
  const router = useRouter();

  const handleLogout = () => {
    clearAuthToken();
    document.cookie = 'authToken=; path=/; max-age=0';
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <div className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full"
        />
      </div>
      <Button
        variant="outline"
        onClick={handleLogout}
        className="flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}
