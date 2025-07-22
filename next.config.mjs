/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/request.js');

const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'false'; // Activé pour la maintenance

const nextConfig = {
  output: 'standalone',
  async redirects() {
    if (!isMaintenanceMode) return [];
    
    return [
      {
        source: '/((?!maintenance|_next|api).*)',
        destination: '/maintenance',
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);