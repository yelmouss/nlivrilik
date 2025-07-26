import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeRegistry from './ThemeRegistry';
import { Providers } from './providers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

import ClientOnlyWhatsapp from "../components/ClientOnlyWhatsapp";
import InfoDrawer from "../components/InfoDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// metadata remains here as this is a Server Component
export const metadata = {
  metadataBase: new URL('https://nlivrilik.ma'),
  title: {
    default: 'NLIVRILIK - Votre Service de Livraison Rapide et Fiable au Maroc',
    template: '%s | NLIVRILIK',
  },
  description: "NLIVRILIK est votre partenaire de confiance pour la livraison rapide et efficace de colis, repas, courses, et médicaments au Maroc. Service disponible dans les grandes villes.",
  keywords: ['livraison Maroc', 'NLIVRILIK', 'service de livraison', 'livraison rapide', 'livraison repas', 'livraison courses', 'livraison médicaments', 'Maroc', 'Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Agadir', 'Fès', 'Meknès', 'Oujda'],
  authors: [{ name: 'NLIVRILIK Team', url: 'https://nlivrilik.ma' }],
  creator: 'NLIVRILIK Team',
  publisher: 'NLIVRILIK',
  alternates: {
    canonical: '/',
    languages: {
      'fr-MA': '/fr',
      'en-MA': '/en',
      'ar-MA': '/ar',
    },
  },
  openGraph: {
    title: 'NLIVRILIK - Livraison Express au Maroc',
    description: 'Découvrez NLIVRILIK, le service de livraison tout-en-un pour vos colis, repas, courses et médicaments à travers le Maroc.',
    url: 'https://nlivrilik.ma',
    siteName: 'NLIVRILIK',
    images: [
      {
        url: '/logo.png', // Path to your logo in the public folder
        width: 512, // Adjust to your logo's dimensions
        height: 512, // Adjust to your logo's dimensions
        alt: 'NLIVRILIK Logo',
      },
    ],
    locale: 'fr_MA', // Default locale
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NLIVRILIK - Votre Partenaire de Livraison au Maroc',
    description: 'NLIVRILIK facilite vos livraisons au Maroc. Rapide, fiable et pour tous vos besoins : colis, repas, courses, médicaments.',
    // siteId: 'YourTwitterSiteID', // If you have one
    creator: '@NLIVRILIK', // Replace with your actual Twitter handle
    // creatorId: 'YourTwitterCreatorID', // If you have one
    images: ['/logo.png'], // Path to your logo
  },
  robots: {
    index: true,
    follow: true,
    nocache: false, // Or true if content changes very frequently
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false, // Allow image indexing
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.gif', // Default favicon
    shortcut: '/logo.png', // Example for shortcut icon
    apple: '/logo.png', // Example for Apple touch icon
    // other: [
    //   {
    //     rel: 'apple-touch-icon-precomposed',
    //     url: '/apple-touch-icon-precomposed.png', // Create this image
    //   },
    // ],
  },
  manifest: '/manifest.json',
  // verification: { // Add verification codes if you have them
  //   google: 'your-google-site-verification-code',
  //   yandex: 'your-yandex-verification-code',
  //   other: {
  //     me: ['your-email@example.com', 'your-link-to-profile'],
  //   },
  // },
  appleWebApp: {
    title: 'NLIVRILIK',
    statusBarStyle: 'black-translucent',
    startupImage: [
      // Define startup images if needed
      // '/assets/startup/apple-touch-startup-image-768x1004.png',
    ],
  },
  // formatDetection: { // Useful for mobile numbers, etc.
  //   telephone: false,
  // },
  // itunes: { // If you have an iOS app
  //   appId: 'myAppStoreID',
  //   appArgument: 'myAppArgument',
  // },
  // assets: ['https://nlivrilik.ma/assets'], // If you have a dedicated assets domain
  // category: 'business', // Or a more specific category
};

export default async function RootLayout({ children, params }) {
  const locale = await getLocale();
  const messages = await getMessages();

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NLIVRILIK',
    url: 'https://nlivrilik.ma',
    logo: 'https://nlivrilik.ma/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+212-612-865681', // Ajoutez votre numéro de téléphone
      contactType: 'Customer Service',
      areaServed: 'MA', // Maroc
      availableLanguage: ['French', 'English', 'Arabic'],
    },
    sameAs: [
      // Ajoutez les liens vers vos réseaux sociaux s'ils existent
      // 'https://www.facebook.com/NLIVRILIK',
      // 'https://www.twitter.com/NLIVRILIK',
      // 'https://www.instagram.com/NLIVRILIK',
      // 'https://www.linkedin.com/company/NLIVRILIK',
    ],
  };

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeRegistry>
            <Providers>{/* This now wraps Navbar and Footer as well */}
              {children}
              <ClientOnlyWhatsapp />
              <InfoDrawer />
            </Providers>
          </ThemeRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
