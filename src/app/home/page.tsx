import { redirect } from 'next/navigation';

export default function HomePage() {
  // In Next.js App Router, we can't directly link to route groups with parentheses
  // So we'll redirect users to the root which contains our dashboard content
  redirect('/');
} 