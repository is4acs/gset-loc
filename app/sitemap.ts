import type { MetadataRoute } from 'next';
import { getAllCategorySlugs, getAllEquipmentSlugs } from '@/lib/catalog/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const [categories, equipments] = await Promise.all([
    getAllCategorySlugs(),
    getAllEquipmentSlugs(),
  ]);

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/catalogue`, changeFrequency: 'daily', priority: 0.9 },
  ];

  const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/catalogue?categorie=${c.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const equipmentUrls: MetadataRoute.Sitemap = equipments.map((e) => ({
    url: `${baseUrl}/outil/${e.slug}`,
    lastModified: e.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticUrls, ...categoryUrls, ...equipmentUrls];
}
