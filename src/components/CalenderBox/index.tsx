"use client";

import { useState, useEffect, useCallback } from 'react';
import { Client } from '@/types/client';

interface CalendarEvent {
  day: number;
  clientName: string;
  amount: number;
}

interface MonthSummary {
  totalDue: number;
  totalClients: number;
}

interface CalendarBoxProps {
  onMonthYearChange?: (month: number, year: number) => void;
}

const CalendarBox = ({ onMonthYearChange }: CalendarBoxProps) => {
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1); // 1-12 format
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [events, setEvents] = useState<{[key: number]: CalendarEvent[]}>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [monthSummary, setMonthSummary] = useState<MonthSummary>({ totalDue: 0, totalClients: 0 });
  const [upcomingPayments, setUpcomingPayments] = useState<CalendarEvent[]>([]);

  // Function to get days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  // Function to get first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  // Process client data into calendar events
  const processClientDueDates = useCallback((clients: Client[]) => {
    const monthEvents: {[key: number]: CalendarEvent[]} = {};
    let totalDue = 0;
    let totalClientsWithDue = 0;
    
    clients.forEach(client => {
      // Only process active clients with payment due dates
      if (client.paymentDueDate && client.subscriptionStatus === 'active') {
        const day = client.paymentDueDate.day;
        const amount = client.quotationAmount || 0;
        
        // Check if the day is valid for the current month
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        
        // Only add if the day is valid for this month
        if (day <= daysInMonth) {
          if (!monthEvents[day]) {
            monthEvents[day] = [];
          }
          
          monthEvents[day].push({
            day,
            clientName: client.companyName,
            amount
          });
          
          totalDue += amount;
          totalClientsWithDue++;
        }
      }
    });
    
    setEvents(monthEvents);
    setMonthSummary({
      totalDue,
      totalClients: totalClientsWithDue
    });
  }, [currentMonth, currentYear, getDaysInMonth]);

  // Find upcoming payments in the next 7 days
  const findUpcomingPayments = useCallback((clients: Client[]) => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1; // 1-12 format
    const currentYear = today.getFullYear();
    
    // Get payments due in the next 7 days
    const upcoming: CalendarEvent[] = [];
    
    clients.forEach(client => {
      // Only process active clients with payment due dates
      if (!client.paymentDueDate || client.subscriptionStatus !== 'active') return;
      
      const dueDay = client.paymentDueDate.day;
      
      // Calculate the next due date
      // If the due day has already passed this month, it's due next month
      let dueMonth = currentMonth;
      let dueYear = currentYear;
      
      if (dueDay < currentDay) {
        // Due date has passed this month, so it's due next month
        dueMonth = currentMonth + 1;
        if (dueMonth > 12) {
          dueMonth = 1;
          dueYear = currentYear + 1;
        }
      }
      
      // Create date objects for comparison
      const dueDate = new Date(dueYear, dueMonth - 1, dueDay);
      
      // Calculate days difference
      const timeDiff = dueDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      // Include payments due within the next 7 days
      if (daysDiff >= 0 && daysDiff <= 7) {
        upcoming.push({
          day: dueDay,
          clientName: client.companyName,
          amount: client.quotationAmount || 0
        });
      }
    });
    
    // Sort by closest due date
    upcoming.sort((a, b) => a.day - b.day);
    
    // Limit to 5 most immediate payments
    setUpcomingPayments(upcoming.slice(0, 5));
  }, []);

  // Notify parent component when month/year changes
  useEffect(() => {
    if (onMonthYearChange) {
      onMonthYearChange(currentMonth, currentYear);
    }
  }, [currentMonth, currentYear, onMonthYearChange]);

  // Fetch client data
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/clients');
        const result = await response.json();
        
        if (result.success) {
          processClientDueDates(result.data);
          findUpcomingPayments(result.data);
        }
      } catch (error) {
        console.error('Error fetching clients for calendar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, currentYear]);

  // Get month name
  const getMonthName = (month: number) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[month - 1];
  };

  // Handle month navigation
  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Render calendar grid
  const renderCalendarDays = () => {
    const totalDays = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    
    const days = [];
    let dayCounter = 1;
    
    // Calendar rows
    for (let row = 0; row < 6; row++) {
      const weekRow = [];
      
      // Calendar columns (days of week)
      for (let col = 0; col < 7; col++) {
        if ((row === 0 && col < firstDay) || dayCounter > totalDays) {
          // Empty cells before the first day or after the last day
          weekRow.push(
            <td key={`empty-${row}-${col}`} className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 dark:border-dark-3 dark:hover:bg-dark-2 md:h-25 md:p-6 xl:h-31">
              <span className="text-gray-400">{row === 0 && col < firstDay ? getDaysInMonth(currentMonth === 1 ? 12 : currentMonth - 1, currentMonth === 1 ? currentYear - 1 : currentYear) - (firstDay - col - 1) : dayCounter - totalDays}</span>
            </td>
          );
        } else {
          // Calendar days
          const dayEvents = events[dayCounter] || [];
          const isToday = dayCounter === new Date().getDate() && 
                          currentMonth === new Date().getMonth() + 1 && 
                          currentYear === new Date().getFullYear();
          
          weekRow.push(
            <td 
              key={`day-${dayCounter}`} 
              className={`ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 dark:border-dark-3 dark:hover:bg-dark-2 md:h-25 md:p-6 xl:h-31 ${isToday ? 'bg-primary bg-opacity-10' : ''}`}
            >
              <span className={`font-medium ${isToday ? 'text-primary' : 'text-dark dark:text-white'}`}>
                {dayCounter}
              </span>
              
              {dayEvents.length > 0 && (
                <div className="group h-16 w-full flex-grow cursor-pointer py-1 md:h-30">
                  <span className="group-hover:text-primary md:hidden">
                    {dayEvents.length} Due
                  </span>
                  <div className="event invisible absolute left-2 z-99 mb-1 flex w-[300%] flex-col rounded-r-[5px] border-l-[3px] border-primary bg-gray-2 px-3 py-1 text-left opacity-0 group-hover:visible group-hover:opacity-100 dark:bg-dark-2 md:visible md:w-[290%] md:opacity-100">
                    {dayEvents.map((event, index) => (
                      <div key={index} className="mb-2">
                        <span className="event-name block font-medium text-dark dark:text-white">
                          {event.clientName}
                        </span>
                        <span className="time text-sm">Amount Due: ${event.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </td>
          );
          
          dayCounter++;
        }
      }
      
      days.push(<tr key={`row-${row}`} className="grid grid-cols-7">{weekRow}</tr>);
      
      // Stop rendering if we've reached the end of the month
      if (dayCounter > totalDays && row > 3) {
        break;
      }
    }
    
    return days;
  };

  return (
    <>
      <div className="w-full max-w-full rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-between px-4 py-6">
          <h2 className="text-xl font-semibold">
            {getMonthName(currentMonth)} {currentYear}
          </h2>
          <div className="flex space-x-2">
            <button 
              onClick={goToPreviousMonth}
              className="rounded bg-primary px-2 py-1 text-white"
            >
              Previous
            </button>
            <button 
              onClick={goToNextMonth}
              className="rounded bg-primary px-2 py-1 text-white"
            >
              Next
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-3">
          {/* Month Payment Summary */}
          <div className="col-span-2 mb-4">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-dark-2">
              <h3 className="mb-2 text-lg font-medium">Payment Summary</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-dark">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Due This Month</p>
                  <p className="text-2xl font-bold text-primary">${monthSummary.totalDue.toFixed(2)}</p>
                </div>
                <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-dark">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Clients with Payments Due</p>
                  <p className="text-2xl font-bold text-primary">{monthSummary.totalClients}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Upcoming Payments */}
          <div className="col-span-1 mb-4">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-dark-2 h-full">
              <h3 className="mb-2 text-lg font-medium">Upcoming Payments</h3>
              {upcomingPayments.length > 0 ? (
                <div className="space-y-2">
                  {upcomingPayments.map((payment, index) => (
                    <div key={index} className="rounded-md bg-white p-2 shadow-sm dark:bg-gray-dark">
                      <p className="font-medium">{payment.clientName}</p>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Day {payment.day}</span>
                        <span className="text-sm font-medium text-primary">${payment.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No upcoming payments in the next 7 days</p>
              )}
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <p>Loading client payment dates...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="grid grid-cols-7 rounded-t-[10px] bg-primary text-white">
                <th className="flex h-15 items-center justify-center rounded-tl-[10px] p-1 text-body-xs font-medium sm:text-base xl:p-5">
                  <span className="hidden lg:block">Sunday</span>
                  <span className="block lg:hidden">Sun</span>
                </th>
                <th className="flex h-15 items-center justify-center p-1 text-body-xs font-medium sm:text-base xl:p-5">
                  <span className="hidden lg:block">Monday</span>
                  <span className="block lg:hidden">Mon</span>
                </th>
                <th className="flex h-15 items-center justify-center p-1 text-body-xs font-medium sm:text-base xl:p-5">
                  <span className="hidden lg:block">Tuesday</span>
                  <span className="block lg:hidden">Tue</span>
                </th>
                <th className="flex h-15 items-center justify-center p-1 text-body-xs font-medium sm:text-base xl:p-5">
                  <span className="hidden lg:block">Wednesday</span>
                  <span className="block lg:hidden">Wed</span>
                </th>
                <th className="flex h-15 items-center justify-center p-1 text-body-xs font-medium sm:text-base xl:p-5">
                  <span className="hidden lg:block">Thursday</span>
                  <span className="block lg:hidden">Thur</span>
                </th>
                <th className="flex h-15 items-center justify-center p-1 text-body-xs font-medium sm:text-base xl:p-5">
                  <span className="hidden lg:block">Friday</span>
                  <span className="block lg:hidden">Fri</span>
                </th>
                <th className="flex h-15 items-center justify-center rounded-tr-[10px] p-1 text-body-xs font-medium sm:text-base xl:p-5">
                  <span className="hidden lg:block">Saturday</span>
                  <span className="block lg:hidden">Sat</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {renderCalendarDays()}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default CalendarBox;
