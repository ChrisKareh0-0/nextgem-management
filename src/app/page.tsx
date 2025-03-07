// Add this line at the top of the file to disable static generation
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import DashboardContent from './(home)/page';

// This approach enables us to reuse the dashboard contents directly
// while still providing the ability to redirect to sign-in if needed
export default function RootPage() {
  // Here you would check if the user is authenticated
  // For now, we'll simulate this by always showing the dashboard
  const isAuthenticated = true;

  if (!isAuthenticated) {
    redirect('/auth/sign-in');
  }

  // If authenticated, show the dashboard contents
  // Create a Promise that resolves to an empty object to match the expected type
  const searchParamsPromise = Promise.resolve({});
  
  return <DashboardContent searchParams={searchParamsPromise} />;
} 