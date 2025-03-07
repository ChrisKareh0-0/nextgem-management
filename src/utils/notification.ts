import { Client } from '@/types/client';

export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
}

export function checkForOverduePayments(clients: Client[]) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1; // JavaScript months are 0-based

  clients.forEach(client => {
    // Skip clients with ended subscriptions
    if (!client.paymentDueDate || client.subscriptionStatus !== 'active') return;
    
    const { paymentDueDate, companyName, quotationAmount } = client;
    
    // Get the current month if not specified in paymentDueDate
    const dueMonth = paymentDueDate.month || currentMonth;
    
    if (
      paymentDueDate && 
      ((dueMonth < currentMonth) || 
       (dueMonth === currentMonth && paymentDueDate.day < currentDay))
    ) {
      // Format the amount as currency
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(quotationAmount || 0);
      
      // Create a unique ID for the notification to prevent duplicates
      const notificationId = `overdue-${client._id}`;
      
      // Check if we've already shown this notification in this session
      const hasShown = sessionStorage.getItem(notificationId);
      if (!hasShown) {
        showNotification(`Payment Overdue: ${companyName}`, {
          body: `Payment of ${formattedAmount} for ${companyName} is overdue. Please check the client details.`,
          icon: '/icons/notification.png',
          tag: notificationId,
        });
        
        // Mark this notification as shown in this session
        sessionStorage.setItem(notificationId, 'true');
      }
    }
  });
} 