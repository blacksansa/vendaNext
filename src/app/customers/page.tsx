'use client';

import { useEffect, useState } from 'react';
import { getCustomers } from '@/lib/api.client';
import { Customer } from '@/lib/types';
import { CustomersView } from './customers-view';
import { SidebarInset } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import Loading from './loading';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const fetchedCustomers = await getCustomers();
        setCustomers(fetchedCustomers);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch customers');
      }
      setLoading(false);
    };

    fetchCustomers();
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
        {loading && <Loading />}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && <CustomersView initialCustomers={customers} />}
      </div>
    </SidebarInset>
  );
}
