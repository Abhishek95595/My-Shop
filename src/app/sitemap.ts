import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { db, isFirebaseConfigured } from '@/lib/firebase/client';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    '',
    '/catalogue',
    '/about',
    '/services',
    '/custom-jewellery',
    '/old-gold-exchange',
    '/contact',
    '/faq',
    '/offers',
    '/rates',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const products: any[] = [];
  
  if (isFirebaseConfigured && db) {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('status', '==', 'published'));
      const snapshot = await getDocs(q);
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        if (data && data.slug) {
          products.push({
            url: `${SITE_URL}/catalogue/${data.slug}`,
            lastModified: new Date(data.updatedAt || data.createdAt || Date.now()),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          });
        }
      });
    } catch (err) {
      console.warn('Sitemap generator failed to fetch products from Firestore:', err);
      // Omit dynamic product details entirely if database is unreachable during build
    }
  }

  return [...routes, ...products];
}
