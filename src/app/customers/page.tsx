'use client';

import { useEffect, useState } from 'react';
import { getCustomers } from '@/lib/api.client';
import { Customer } from '@/lib/types';
import { CustomersView } from './customers-view';
import { SidebarInset } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import Loading from './loading';

const CUSTOMERS_CACHE_KEY = 'customersCache';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      // Try to load from cache first
      try {
        const cachedCustomers = localStorage.getItem(CUSTOMERS_CACHE_KEY);
        if (cachedCustomers) {
          setCustomers(JSON.parse(cachedCustomers));
        }
      } catch (e) {
        console.error("Failed to load customers from cache", e);
      }

      try {
        const fetchedCustomers = await getCustomers();
        setCustomers(fetchedCustomers);
        // Save to cache
        try {
          localStorage.setItem(CUSTOMERS_CACHE_KEY, JSON.stringify(fetchedCustomers));
        } catch (e) {
          console.error("Failed to save customers to cache", e);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch customers');
      }
      setLoading(false);
    };

    fetchCustomers();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCustomers();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <SidebarInset>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold">Customer Management</h1>
        </div>
      </header>

      <div className="p-6">
        {loading && customers.length === 0 && <Loading />}
        {error && <p className="text-red-500">{error}</p>}
        {customers.length > 0 && <CustomersView initialCustomers={customers} />}
      </div>
    </SidebarInset>
  );
}