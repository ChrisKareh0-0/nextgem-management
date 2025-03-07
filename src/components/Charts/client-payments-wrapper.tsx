"use client";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the client component to ensure proper hydration
const ClientPaymentsDynamic = dynamic(
  () => import('./client-payments').then((mod) => mod.ClientPayments),
  { ssr: false, loading: () => <ClientPaymentsLoading /> }
);

function ClientPaymentsLoading() {
  return (
    <div className="grid gap-4 rounded-[10px] bg-white px-7.5 py-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="h-8 w-1/3 animate-pulse rounded-md bg-gray-200 dark:bg-dark-3"></div>
      <div className="h-[300px] animate-pulse rounded-md bg-gray-200 dark:bg-dark-3"></div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="rounded-lg bg-gray-100 p-4 dark:bg-dark-2">
            <div className="h-5 w-1/2 animate-pulse rounded-md bg-gray-200 dark:bg-dark-3"></div>
            <div className="mt-3 h-8 animate-pulse rounded-md bg-gray-200 dark:bg-dark-3"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClientPaymentsWrapper({ className }: { className?: string }) {
  return (
    <Suspense fallback={<ClientPaymentsLoading />}>
      <ClientPaymentsDynamic className={className} />
    </Suspense>
  );
} 