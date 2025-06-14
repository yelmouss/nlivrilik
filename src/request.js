import {getRequestConfig} from 'next-intl/server';
import { cookies } from 'next/headers';

const locales = ['en', 'fr', 'ar'];

export default getRequestConfig(async () => {
  // Determine the locale
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'fr'; // Default to 'fr' or your preferred default
 
  // Validate that the determined locale is among the supported locales
  if (!locales.includes(locale)) {
    console.warn(`Unsupported locale: ${locale}. Falling back to default.`);
    return {
      locale: 'fr', // Fallback to default
      messages: (await import(`../messages/fr.json`)).default
    };
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});