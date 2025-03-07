"use client";

import { useEffect, useState } from "react";
import { Client } from "@/types/client";
import { cn } from "@/lib/utils";

type UpcomingPaymentsProps = {
  className?: string;
};

export function UpcomingPayments({ className }: UpcomingPaymentsProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/clients');
        const result = await response.json();
        
        if (result.success) {
          setClients(result.data);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Filter and sort clients with upcoming payments
  const upcomingPayments = clients
    // Only include active clients with payment due dates
    .filter(client => client.paymentDueDate && client.subscriptionStatus === 'active')
    .sort((a, b) => {
      const today = new Date();
      const currentDay = today.getDate();
      
      const aDueDay = a.paymentDueDate?.day || 0;
      const bDueDay = b.paymentDueDate?.day || 0;
      
      // For days that haven't passed yet this month
      if (aDueDay >= currentDay && bDueDay >= currentDay) {
        return aDueDay - bDueDay;
      }
      
      // For days that have already passed this month (due next month)
      if (aDueDay < currentDay && bDueDay < currentDay) {
        return aDueDay - bDueDay;
      }
      
      // Days that haven't passed yet come before days that have passed
      return aDueDay >= currentDay ? -1 : 1;
    })
    .slice(0, 6); // Limit to 6 items

  // Format the payment due date
  const formatDueDate = (dueDate: { day: number; month?: number }) => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Calculate the next due date
    let dueMonth = currentMonth; // 0-indexed
    let dueYear = currentYear;
    
    // If the due day has already passed this month, it's due next month
    if (dueDate.day < currentDay) {
      dueMonth = currentMonth + 1;
      if (dueMonth > 11) { // 0-indexed months
        dueMonth = 0;
        dueYear = currentYear + 1;
      }
    }
    
    // Format date manually
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${dueDate.day} ${monthNames[dueMonth]}`;
  };

  if (loading) {
    return (
      <div
        className={cn(
          "rounded-[10px] bg-white px-4 py-6 shadow-1 dark:bg-gray-dark dark:shadow-card sm:px-7.5",
          className,
        )}
      >
        <h3 className="mb-4 text-xl font-semibold text-dark dark:text-white">
          Upcoming Payments
        </h3>
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[10px] bg-white px-4 py-6 shadow-1 dark:bg-gray-dark dark:shadow-card sm:px-7.5",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-dark dark:text-white">
          Upcoming Payments
        </h3>
        {upcomingPayments.length > 0 && (
          <a
            href="/calendar"
            className="text-sm font-medium text-primary hover:underline"
          >
            View All
          </a>
        )}
      </div>

      {upcomingPayments.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-dark-3">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 dark:bg-dark-2">
                <th className="px-4 py-2 text-left text-sm font-medium text-dark dark:text-white">
                  Client
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-dark dark:text-white">
                  Due Date
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-dark dark:text-white">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {upcomingPayments.map((client) => (
                <tr key={client._id} className="border-t border-gray-200 dark:border-dark-3">
                  <td className="px-4 py-3 text-sm font-medium text-dark dark:text-white">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-dark dark:text-white">
                        {client.companyName}
                      </span>
                    </div>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-dark-3">
                    <p className="text-sm font-medium text-dark dark:text-white">
                      {formatDueDate(client.paymentDueDate)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-success">
                    ${(client.quotationAmount || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500">No upcoming payments found</p>
        </div>
      )}
    </div>
  );
} 