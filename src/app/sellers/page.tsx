'use client';

import { useEffect, useState } from 'react';
import { getSellers } from '@/lib/api.client';
import { Seller } from '@/lib/types';
import { SellersView } from './sellers-view';
import { SidebarInset } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import Loading from './loading';

const SELLERS_CACHE_KEY = 'sellersCache';

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellers = async () => {
      // Try to load from cache first
      try {
        const cachedSellers = localStorage.getItem(SELLERS_CACHE_KEY);
        if (cachedSellers) {
          setSellers(JSON.parse(cachedSellers));
        }
      } catch (e) {
        console.error("Failed to load sellers from cache", e);
      }

      try {
        const fetchedSellers = await getSellers();
        setSellers(fetchedSellers);
        // Save to cache
        try {
          localStorage.setItem(SELLERS_CACHE_KEY, JSON.stringify(fetchedSellers));
        } catch (e) {
          console.error("Failed to save sellers to cache", e);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch sellers');
      }
      setLoading(false);
    };

    fetchSellers();
  }, []);

  return (
    <SidebarInset>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold">Seller Management</h1>
        </div>
      </header>

      <div className="p-6">
        {loading && sellers.length === 0 && <Loading />}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && <SellersView initialSellers={sellers} />}
      </div>
    </SidebarInset>
  );
}
