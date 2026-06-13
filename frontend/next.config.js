/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://skillrise-academy-production.up.railway.app',
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_live_eb2af552514f29bf33169bfc9432666c26d26bd1',
  },
  // Bake the API URL into the build
  publicRuntimeConfig: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://skillrise-academy-production.up.railway.app',
  }
}
module.exports = nextConfig
