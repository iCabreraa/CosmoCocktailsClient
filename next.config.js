/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["qpztyzhosqbmzptazlnx.supabase.co"],
  },
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
