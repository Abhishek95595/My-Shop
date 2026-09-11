import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

interface ProductSitemapEntry {
  slug: string;
  updatedAt?: string;
  createdAt?: string;
}

async function getPublishedProductSlugsServer(): Promise<ProductSitemapEntry[]> {
  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'khushi-ornament-house';
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'products' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'status' },
              op: 'EQUAL',
              value: { stringValue: 'published' },
            },
          },
        },
      }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`[Sitemap] Firestore REST query returned status ${res.status}`);
      return [];
    }

    const data = await res.json();
    const items: ProductSitemapEntry[] = [];

    if (Array.isArray(data)) {
      for (const item of data) {
        if (!item.document?.fields) continue;
        const fields = item.document.fields;
        const slug = fields.slug?.stringValue;
        if (slug && typeof slug === 'string' && slug.trim().length > 0) {
          items.push({
            slug: slug.trim(),
            updatedAt:
              fields.updatedAt?.stringValue || fields.updatedAt?.timestampValue,
            createdAt:
              fields.createdAt?.stringValue || fields.createdAt?.timestampValue,
          });
        }
      }
    }

    return items;
  } catch (err) {
    console.warn(
      '[Sitemap] Failed to fetch published product slugs for sitemap:',
      err
    );
    return [];
  }
}

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

  const productItems = await getPublishedProductSlugsServer();
  const seenSlugs = new Set<string>();
  const productEntries: MetadataRoute.Sitemap = [];

  for (const item of productItems) {
    if (seenSlugs.has(item.slug)) continue;
    seenSlugs.add(item.slug);

    let lastMod = new Date();
    if (item.updatedAt) {
      const parsed = new Date(item.updatedAt);
      if (!isNaN(parsed.getTime())) lastMod = parsed;
    } else if (item.createdAt) {
      const parsed = new Date(item.createdAt);
      if (!isNaN(parsed.getTime())) lastMod = parsed;
    }

    productEntries.push({
      url: `${SITE_URL}/catalogue/${item.slug}`,
      lastModified: lastMod,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    });
  }

  return [...routes, ...productEntries];
}

