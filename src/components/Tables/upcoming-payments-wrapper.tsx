"use client";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the client component to ensure proper hydration
const UpcomingPaymentsDynamic = dynamic(
  () => import('./upcoming-payments').then((mod) => mod.UpcomingPayments),
  { ssr: false, loading: () => <UpcomingPaymentsLoading /> }
);

function UpcomingPaymentsLoading() {
  return (
    <div className="rounded-[10px] bg-white px-4 py-6 shadow-1 dark:bg-gray-dark dark:shadow-card sm:px-7.5">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-7 w-1/3 animate-pulse rounded-md bg-gray-200 dark:bg-dark-3"></div>
        <div className="h-5 w-20 animate-pulse rounded-md bg-gray-200 dark:bg-dark-3"></div>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-dark-3">
        <div className="h-10 animate-pulse bg-gray-100 dark:bg-dark-2"></div>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-14 animate-pulse border-t border-gray-200 dark:border-dark-3"></div>
        ))}
      </div>
    </div>
  );
}

export function UpcomingPaymentsWrapper({ className }: { className?: string }) {
  return (
    <Suspense fallback={<UpcomingPaymentsLoading />}>
      <UpcomingPaymentsDynamic className={className} />
    </Suspense>
  );
} 