import { MetadataRoute } from 'next';
import { STORE_NAME, STORE_TAGLINE } from '@/lib/constants';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: STORE_NAME,
    short_name: 'KOH Jewellery',
    description: `${STORE_NAME} — ${STORE_TAGLINE}. Fine 18K, 22K and 24K gold jewellery in Gorakhpur.`,
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF8F5',
    theme_color: '#4A0E1C',
    icons: [
      {
        src: '/assets/khushi-logo.webp',
        sizes: '192x192',
        type: 'image/webp',
      },
      {
        src: '/assets/khushi-logo.webp',
        sizes: '512x512',
        type: 'image/webp',
      },
    ],
  };
}
