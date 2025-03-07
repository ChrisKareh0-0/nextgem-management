# NextGem Management as a Progressive Web App (PWA)

This directory contains instructions for converting your Next.js application into a Progressive Web App (PWA) that can be installed on macOS.

## Why PWA?

Progressive Web Apps offer several advantages:
- No need for separate desktop app development
- Updates automatically when you update your web app
- Works across all platforms (macOS, Windows, Linux, iOS, Android)
- Can be installed directly from the browser

## Adding PWA Support to Your Next.js App

1. Install the required packages:
```bash
npm install next-pwa
```

2. Create or update your `next.config.mjs` file:
```javascript
import withPWA from 'next-pwa';

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})({
  // Your existing Next.js config
  images: {
    domains: ["localhost"],
    // ... other image config
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  // ... other config options
});

export default nextConfig;
```

3. Create a `public/manifest.json` file:
```json
{
  "name": "NextGem Management",
  "short_name": "NextGem",
  "description": "NextGem Management Application",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4f46e5",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

4. Add the following to your `src/app/layout.tsx` file:
```jsx
export const metadata = {
  // ... existing metadata
  manifest: '/manifest.json',
  themeColor: '#4f46e5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NextGem Management',
  },
};
```

5. Create the necessary icons in the `public/icons` directory:
   - icon-192x192.png (192x192 pixels)
   - icon-512x512.png (512x512 pixels)

## Installing the PWA on macOS

1. Deploy your Next.js app to Render
2. Open the deployed app in Safari on macOS
3. From the Safari menu, select "File" > "Share" > "Add to Dock"
4. The app will now appear in your Dock like a native application

## More Information

For more details, see the [next-pwa documentation](https://github.com/shadowwalker/next-pwa). 