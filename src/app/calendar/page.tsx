"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CalendarBox from "@/components/CalenderBox";
import { Client } from "@/types/client";

const CalendarPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [selectedClients, setSelectedClients] = useState<{[key: string]: boolean}>({});

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

  // Filter clients with payments due in the current month
  const clientsWithPaymentsDue = clients.filter(client => 
    client.paymentDueDate && 
    client.paymentDueDate.month === currentMonth
  );

  // Sort clients by payment due day (ascending)
  const sortedClients = [...clientsWithPaymentsDue].sort((a, b) => 
    (a.paymentDueDate?.day || 0) - (b.paymentDueDate?.day || 0)
  );

  // Sync month/year between calendar and client list
  const handleMonthYearChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  // Toggle client selection for export
  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  // Select all clients
  const selectAllClients = () => {
    const newSelection: {[key: string]: boolean} = {};
    sortedClients.forEach(client => {
      newSelection[client._id] = true;
    });
    setSelectedClients(newSelection);
  };

  // Deselect all clients
  const deselectAllClients = () => {
    setSelectedClients({});
  };

  // Count selected clients
  const selectedCount = Object.values(selectedClients).filter(Boolean).length;

  // Generate export data
  const exportData = () => {
    // Get selected clients
    const clientsToExport = sortedClients.filter(client => selectedClients[client._id]);
    
    // Create CSV content
    const headers = ['Company', 'Contact Name', 'Email', 'Phone', 'Due Date', 'Amount Due'];
    const csvRows = [headers.join(',')];
    
    clientsToExport.forEach(client => {
      const row = [
        `"${client.companyName}"`,
        `"${client.contactName}"`,
        `"${client.email || ''}"`,
        `"${client.phone}"`,
        `"${client.paymentDueDate?.day}/${client.paymentDueDate?.month}/${currentYear}"`,
        `"${(client.quotationAmount || 0).toFixed(2)}"`
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payment_due_${currentMonth}_${currentYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Breadcrumb pageName="Calendar" />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="md:col-span-2">
          <CalendarBox onMonthYearChange={handleMonthYearChange} />
        </div>

        <div className="md:col-span-2">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-4 py-4 dark:border-strokedark sm:px-6 xl:px-7.5">
              <div className="flex flex-wrap items-center justify-between">
                <h3 className="font-medium text-black dark:text-white">
                  Clients with Payments Due in {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })}
                </h3>
                
                <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                  {selectedCount > 0 && (
                    <span className="text-sm mr-2">
                      {selectedCount} selected
                    </span>
                  )}
                  
                  <button 
                    onClick={selectAllClients}
                    className="text-sm px-2 py-1 rounded bg-primary text-white"
                    disabled={sortedClients.length === 0}
                  >
                    Select All
                  </button>
                  
                  {selectedCount > 0 && (
                    <button 
                      onClick={deselectAllClients}
                      className="text-sm px-2 py-1 rounded bg-gray-300 text-gray-800"
                    >
                      Clear
                    </button>
                  )}
                  
                  <button 
                    onClick={exportData}
                    className="text-sm px-2 py-1 rounded bg-success text-white"
                    disabled={selectedCount === 0}
                  >
                    Export Selected
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 xl:p-7.5">
              {loading ? (
                <div className="flex justify-center p-4">
                  <p>Loading clients...</p>
                </div>
              ) : sortedClients.length > 0 ? (
                <div className="max-h-[400px] overflow-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-2 text-left dark:bg-meta-4">
                        <th className="py-4 px-4 font-medium text-black dark:text-white w-[40px]">
                          <span className="sr-only">Select</span>
                        </th>
                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                          Company
                        </th>
                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                          Due Date
                        </th>
                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                          Amount
                        </th>
                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                          Contact
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedClients.map((client) => (
                        <tr key={client._id}>
                          <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                            <input 
                              type="checkbox" 
                              checked={!!selectedClients[client._id]} 
                              onChange={() => toggleClientSelection(client._id)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </td>
                          <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                            <h5 className="font-medium text-black dark:text-white">
                              {client.companyName}
                            </h5>
                          </td>
                          <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                            <p className="text-black dark:text-white">
                              {client.paymentDueDate?.day || "N/A"}
                            </p>
                          </td>
                          <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                            <p className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                              (client.quotationAmount || 0) > 5000 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              ${(client.quotationAmount || 0).toFixed(2)}
                            </p>
                          </td>
                          <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                            <div className="flex flex-col">
                              <p className="text-black dark:text-white">
                                {client.contactName}
                              </p>
                              {client.email && (
                                <p className="text-sm text-black dark:text-white">
                                  {client.email}
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex justify-center p-4">
                  <p>No clients with payments due this month</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarPage;
