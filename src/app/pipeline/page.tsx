'use client';

import { useEffect, useState } from 'react';
import { getPipelineStages, getDeals } from '@/lib/api.client';
import { Stage, Opportunity } from '@/lib/types';
import { PipelineView } from './pipeline-view';
import { SidebarInset } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import Loading from './loading';

const STAGES_CACHE_KEY = 'stagesCache';
const DEALS_CACHE_KEY = 'dealsCache';

export default function PipelinePage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [deals, setDeals] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPipelineData = async () => {
      // Try to load from cache first
      try {
        const cachedStages = localStorage.getItem(STAGES_CACHE_KEY);
        if (cachedStages) {
          setStages(JSON.parse(cachedStages));
        }
        const cachedDeals = localStorage.getItem(DEALS_CACHE_KEY);
        if (cachedDeals) {
          setDeals(JSON.parse(cachedDeals));
        }
      } catch (e) {
        console.error("Failed to load pipeline data from cache", e);
      }

      try {
        const [fetchedStages, fetchedDeals] = await Promise.all([
          getPipelineStages(),
          getDeals(),
        ]);
        setStages(fetchedStages);
        setDeals(fetchedDeals);
        // Save to cache
        try {
          localStorage.setItem(STAGES_CACHE_KEY, JSON.stringify(fetchedStages));
          localStorage.setItem(DEALS_CACHE_KEY, JSON.stringify(fetchedDeals));
        } catch (e) {
          console.error("Failed to save pipeline data to cache", e);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch pipeline data');
      }
      setLoading(false);
    };

    fetchPipelineData();
  }, []);

  return (
    <SidebarInset>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold">Sales Pipeline</h1>
        </div>
      </header>

      <div className="p-6">
        {loading && stages.length === 0 && deals.length === 0 && <Loading />}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && <PipelineView initialStages={stages} initialDeals={deals} />}
      </div>
    </SidebarInset>
  );
}