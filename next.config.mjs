/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/request.js');

// Configuration pour next-intl avec l'App Router.
// Le fichier './src/request.js' gère la configuration des locales et des messages.
const nextConfig = {
  // Toute autre configuration Next.js va ici
};

export default withNextIntl(nextConfig);
