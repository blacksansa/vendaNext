'use client';

import { useEffect, useState } from 'react';
import { getTeams } from '@/lib/api.client';
import { Team } from '@/lib/types';
import { TeamsView } from './teams-view';
import { SidebarInset } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import Loading from './loading';

const TEAMS_CACHE_KEY = 'teamsCache';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      // Try to load from cache first
      try {
        const cachedTeams = localStorage.getItem(TEAMS_CACHE_KEY);
        if (cachedTeams) {
          setTeams(JSON.parse(cachedTeams));
        }
      } catch (e) {
        console.error("Failed to load teams from cache", e);
      }

      try {
        const fetchedTeams = await getTeams();
        setTeams(fetchedTeams);
        // Save to cache
        try {
          localStorage.setItem(TEAMS_CACHE_KEY, JSON.stringify(fetchedTeams));
        } catch (e) {
          console.error("Failed to save teams to cache", e);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch teams');
      }
      setLoading(false);
    };

    fetchTeams();
  }, []);

  return (
    <SidebarInset>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold">Team Management</h1>
        </div>
      </header>

      <div className="p-6">
        {loading && teams.length === 0 && <Loading />}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && <TeamsView initialTeams={teams} />}
      </div>
    </SidebarInset>
  );
}
