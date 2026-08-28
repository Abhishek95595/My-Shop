export const STORE_NAME = 'Khushi Ornament House';
export const STORE_TAGLINE = '25+ Years of Trust & Quality Craftsmanship';

export const CONTACT_CONFIG = {
  primaryPhone: '+91 8853665166',
  primaryPhoneRaw: '918853665166',
  secondaryPhone: '+91 9415386668',
  whatsappNumber: '+91 8853665166',
  whatsappNumberRaw: '918853665166',
  addressLine1: 'Main Market, Gorakhpur',
  city: 'Gorakhpur',
  state: 'Uttar Pradesh',
  country: 'India',
  hours: 'Mon – Sun: 11:00 AM – 8:00 PM',
  googleMapsUrl: 'https://maps.google.com/?q=Khushi+Ornament+House+Gorakhpur',
};

export const EXACT_WEIGHT_DISCLAIMER =
  'Approximate weight shown. Actual weight may vary depending on size and design.';

export const APPROVED_SERVICES = [
  'Custom jewellery manufacturing',
  'Gold buying and selling',
  'Old-gold exchange',
  'Retail and wholesale service',
  'Wedding jewellery',
  'Gold/silver coins in-store offering',
];

export const CATEGORIES = [
  'Rings',
  'Necklaces/Sets',
  'Chains',
  'Mangalsutra',
  'Bangles/Kada',
] as const;

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

// Active navigation links pointing to functional routes
export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Catalogue', href: '/catalogue' },
  { label: 'Wedding Collection', href: '/catalogue?occasion=Wedding' },
  { label: 'Custom Jewellery', href: '/#custom-jewellery' },
  { label: 'Visit Store', href: '/#store-info' },
];
