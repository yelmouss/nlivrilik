
// app/sitemap.js
const URL = 'https://nlivrilik.vercel.app';

export default async function sitemap() {
  const locales = ['en', 'fr', 'ar'];
  const pages = ['', '/services', '/a-propos', '/contact', '/login']; // Add other static pages here

  const sitemapEntries = locales.flatMap((locale) =>
    pages.map((page) => ({
      url: `${URL}/${locale}${page}`,
      lastModified: new Date().toISOString(),
      // changeFrequency: 'weekly', // Optional
      // priority: page === '' ? 1 : 0.8, // Optional
      alternates: {
        languages: {
          en: `${URL}/en${page}`,
          fr: `${URL}/fr${page}`,
          ar: `${URL}/ar${page}`,
          'x-default': `${URL}/fr${page}`, // Assuming French is the default
        },
      },
    }))
  );

  // Add entries for the root path without locale if you have one,
  // or redirect it to the default locale.
  // For now, we assume / redirects to /fr or is handled by middleware.
  // If you want a specific root sitemap entry:
  // sitemapEntries.push({
  //   url: URL,
  //   lastModified: new Date().toISOString(),
  //   alternates: {
  //     languages: {
  //       en: `${URL}/en`,
  //       fr: `${URL}/fr`,
  //       ar: `${URL}/ar`,
  //       'x-default': `${URL}/fr`,
  //     },
  //   },
  // });


  return sitemapEntries;
}
