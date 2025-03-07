"use client";

import { standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { getClientPaymentData } from "@/services/charts.services";
import { useEffect, useState } from "react";
import { ClientPaymentsChart } from "./chart";

type PropsType = {
  className?: string;
};

// Changed from export function to const for proper dynamic import
const ClientPayments = ({ className }: PropsType) => {
  const [data, setData] = useState<{
    chartData: { x: string; y: number }[];
    totalDue: number;
    totalClients: number;
    clientsWithPaymentsDue: number;
    averagePayment: number;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const paymentData = await getClientPaymentData();
        setData(paymentData);
      } catch (error) {
        console.error("Error fetching client payment data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div
        className={cn(
          "flex min-h-[350px] items-center justify-center rounded-[10px] bg-white px-7.5 py-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
          className,
        )}
      >
        <p className="text-gray-500 dark:text-gray-400">Loading payment data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className={cn(
          "flex min-h-[350px] items-center justify-center rounded-[10px] bg-white px-7.5 py-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
          className,
        )}
      >
        <p className="text-gray-500 dark:text-gray-400">No payment data available</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4 rounded-[10px] bg-white px-7.5 py-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Client Payments Distribution
        </h2>
      </div>

      <ClientPaymentsChart data={data.chartData} />

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-dark-2">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Due
          </dt>
          <dd className="mt-1 text-xl font-bold text-primary">
            ${standardFormat(data.totalDue)}
          </dd>
        </div>
        
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-dark-2">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Clients
          </dt>
          <dd className="mt-1 text-xl font-bold text-primary">
            {data.totalClients}
          </dd>
        </div>
        
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-dark-2">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
            With Due Payments
          </dt>
          <dd className="mt-1 text-xl font-bold text-primary">
            {data.clientsWithPaymentsDue}
          </dd>
        </div>
        
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-dark-2">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Avg. Payment
          </dt>
          <dd className="mt-1 text-xl font-bold text-primary">
            ${standardFormat(data.averagePayment)}
          </dd>
        </div>
      </dl>
    </div>
  );
};

// Export the component
export { ClientPayments }; 