import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingWhatsApp } from '@/components/layout/FloatingWhatsApp';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { SavedItemsProvider } from '@/context/SavedItemsContext';
import { GoogleLoginModal } from '@/components/auth/GoogleLoginModal';
import {
  STORE_NAME,
  STORE_TAGLINE,
  CONTACT_CONFIG,
  GSTIN,
  SITE_URL,
} from '@/lib/constants';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${STORE_NAME} | 25+ Years of Trust | Gorakhpur Gold Jewellery`,
    template: `%s | ${STORE_NAME}`,
  },
  description:
    'Explore 18K, 22K and 24K bridal gold jewellery, necklaces, bangles, and custom designs at Khushi Ornament House in Gorakhpur. 25+ Years of Trust.',
  openGraph: {
    title: `${STORE_NAME} | Gorakhpur Gold Jewellery`,
    description:
      '25+ Years of Trust in Gorakhpur. Discover 18K, 22K and 24K gold bridal sets, rings, chains, mangalsutras, and custom jewellery.',
    siteName: STORE_NAME,
    locale: 'en_IN',
    type: 'website',
  },
  icons: {
    icon: '/assets/khushi-logo.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'JewelryStore',
  name: STORE_NAME,
  description: `${STORE_TAGLINE}. Fine 18K, 22K and 24K gold jewellery in Gorakhpur.`,
  telephone: CONTACT_CONFIG.primaryPhone,
  email: CONTACT_CONFIG.email,
  taxID: GSTIN,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Urdu Bazar Rd, near Water Tank, Urdu Bazar, Bade Kajipur',
    addressLocality: 'Gorakhpur',
    addressRegion: 'Uttar Pradesh',
    postalCode: '273005',
    addressCountry: 'IN',
  },
  url: SITE_URL,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${plusJakarta.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 font-sans selection:bg-maroon-700 selection:text-cream-50">
        <ToastProvider>
          <AuthProvider>
            <AdminAuthProvider>
              <SavedItemsProvider>
                <Header />
                <main className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">{children}</main>
                <Footer />
                <FloatingWhatsApp />
                <MobileBottomNav />
                <GoogleLoginModal />
              </SavedItemsProvider>
            </AdminAuthProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
