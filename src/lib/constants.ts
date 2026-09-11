export const STORE_NAME = 'Khushi Ornament House';
export const STORE_TAGLINE = '25+ Years of Trust';
export const STORE_OWNER = 'Dilip Kumar Verma';
export const GSTIN = '09AJBPV9683Q1ZW';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Warn at build/startup time when the production site URL is not configured.
// This fires only in non-development, non-test environments so local `npm run dev`
// is completely unaffected.
if (
  !process.env.NEXT_PUBLIC_SITE_URL &&
  process.env.NODE_ENV !== 'development' &&
  process.env.NODE_ENV !== 'test'
) {
  console.warn(
    '[KOH] NEXT_PUBLIC_SITE_URL is not set. ' +
    'WhatsApp product enquiry links, canonical URLs, sitemap, and Open Graph ' +
    'URLs will incorrectly use http://localhost:3000 in production. ' +
    'Set NEXT_PUBLIC_SITE_URL=https://your-domain.com in your Vercel environment variables.'
  );
}


export const CONTACT_CONFIG = {
  primaryPhone: '+91 8853665166',
  primaryPhoneRaw: '918853665166',
  secondaryPhone: '+91 9415386668',
  secondaryPhoneRaw: '919415386668',
  whatsappNumber: '+91 8853665166',
  whatsappNumberRaw: '918853665166',
  email: '100dilipsarraf@gmail.com',
  address:
    'Urdu Bazar Rd, near Water Tank, Urdu Bazar, Bade Kajipur, Gorakhpur, Uttar Pradesh 273005',
  city: 'Gorakhpur',
  state: 'Uttar Pradesh',
  pincode: '273005',
  country: 'India',
  hours: '11:00 AM – 8:00 PM',
  mapUrl: 'https://maps.app.goo.gl/VwGs1tiZNae65soSA?g_st=iw',
};

export const EXACT_WEIGHT_DISCLAIMER =
  'Approximate weight shown. Actual weight may vary depending on size and design.';

export const APPROVED_SERVICES = [
  'Custom gold jewellery manufacturing',
  'Gold buying and selling',
  'Old-gold exchange',
  'Retail and wholesale',
  'Wedding jewellery',
  'Gold/silver coins and in-store silver articles',
] as const;

export {
  CATEGORY_REGISTRY,
  CATEGORIES,
  CATEGORY_CODES,
  getAvailableCategories,
  getAvailableCategoryDefinitions,
  type ProductCategory,
  type CategoryDefinition,
  type ProductAvailabilityCandidate,
} from './categoryRegistry';



export const GENDERS = ['Women', 'Men'] as const;

export const PURITIES = ['18K', '22K', '24K'] as const;

export const AVAILABILITIES = ['Available', 'Made on Order'] as const;

export const OCCASIONS = [
  'Wedding',
  'Daily Wear',
  'Festive',
  'Traditional',
  'Engagement',
] as const;

export const WEIGHT_RANGES = [
  { label: 'All Weights', min: 0, max: Infinity },
  { label: 'Under 10g', min: 0, max: 10 },
  { label: '10g – 25g', min: 10, max: 25 },
  { label: '25g – 50g', min: 25, max: 50 },
  { label: '50g and above', min: 50, max: Infinity },
] as const;

// Active navigation links pointing to functional working routes
export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Catalogue', href: '/catalogue' },
  { label: 'Wedding Collection', href: '/catalogue?occasion=Wedding' },
  { label: 'Custom Jewellery', href: '/custom-jewellery' },
  { label: 'Old-Gold Exchange', href: '/old-gold-exchange' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const FOOTER_QUICK_LINKS = [
  { label: 'All Jewellery', href: '/catalogue' },
  { label: 'Wedding Collection', href: '/catalogue?occasion=Wedding' },
  { label: 'Custom Jewellery', href: '/custom-jewellery' },
  { label: 'Old-Gold Exchange', href: '/old-gold-exchange' },
  { label: 'Offers & Updates', href: '/offers' },
  { label: 'FAQs', href: '/faq' },
];

export const FOOTER_LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];
