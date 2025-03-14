// Purpose: Configure the Next.js API to accept larger payloads and add PWA support

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Properly format serverActions as an object if needed
    serverActions: {
      bodySizeLimit: '10mb',  // Increase this limit as needed
    },
    // You can add other experimental features here
  },
  
  images: {
    domains: ['lh3.googleusercontent.com'], // For Google OAuth profile pictures
  },
}

module.exports = withPWA(nextConfig);