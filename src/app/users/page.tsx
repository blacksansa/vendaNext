'use client';

import { useEffect, useState } from 'react';
import { getUsers } from '@/lib/api.client';
import { User } from '@/lib/types';
import { UsersView } from './users-view';
import { SidebarInset } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import Loading from './loading';

const USERS_CACHE_KEY = 'usersCache';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      // Try to load from cache first
      try {
        const cachedUsers = localStorage.getItem(USERS_CACHE_KEY);
        if (cachedUsers) {
          setUsers(JSON.parse(cachedUsers));
        }
      } catch (e) {
        console.error("Failed to load users from cache", e);
      }

      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
        // Save to cache
        try {
          localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(fetchedUsers));
        } catch (e) {
          console.error("Failed to save users to cache", e);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users');
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  return (
    <SidebarInset>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold">User Management</h1>
        </div>
      </header>

      <div className="p-6">
        {loading && users.length === 0 && <Loading />}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && <UsersView initialUsers={users} />}
      </div>
    </SidebarInset>
  );
}
