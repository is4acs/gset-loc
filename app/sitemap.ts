import type { MetadataRoute } from 'next';
import { getAllCategorySlugs, getAllEquipmentSlugs } from '@/lib/catalog/queries';

// On-demand so the build never depends on a database round-trip.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/catalogue`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/mentions-legales`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/cgv`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/confidentialite`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  // Best-effort dynamic URLs: if the DB is unreachable (e.g., during a CI
  // build with placeholder credentials), fall back to the static section.
  let categoryUrls: MetadataRoute.Sitemap = [];
  let equipmentUrls: MetadataRoute.Sitemap = [];
  try {
    const [categories, equipments] = await Promise.all([
      getAllCategorySlugs(),
      getAllEquipmentSlugs(),
    ]);
    categoryUrls = categories.map((c) => ({
      url: `${baseUrl}/catalogue?categorie=${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
    equipmentUrls = equipments.map((e) => ({
      url: `${baseUrl}/outil/${e.slug}`,
      lastModified: e.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    // ignore — return static URLs only
  }

  return [...staticUrls, ...categoryUrls, ...equipmentUrls];
}
