/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Turbopack temporarily due to compatibility issues
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
