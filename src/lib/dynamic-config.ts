// This file can be imported by any page to make it dynamic
// Usage: import { dynamic } from '@/lib/dynamic-config';

// Force dynamic rendering for all pages that import this
export const dynamic = 'force-dynamic';

// Force no caching
export const revalidate = 0;

// Disable static generation
export const generateStaticParams = () => {
  return [];
}; 