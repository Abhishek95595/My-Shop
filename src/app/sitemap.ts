import { MetadataRoute } from 'next';
import { getAllPublishedProducts } from '@/services/mockProducts';
import { SITE_URL } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
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

  const products = getAllPublishedProducts().map((product) => ({
    url: `${SITE_URL}/catalogue/${product.slug}`,
    lastModified: new Date(product.updatedAt || product.createdAt || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...routes, ...products];
}
