import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export interface CatalogFilters {
  categorySlug?: string;
  requiresOperator?: boolean;
}

export async function listCategories() {
  return db.equipmentCategory.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { equipments: { where: { isActive: true } } } } },
  });
}

export async function listEquipments(filters: CatalogFilters = {}) {
  const where: Prisma.EquipmentWhereInput = { isActive: true };
  if (filters.categorySlug) where.category = { slug: filters.categorySlug };
  if (filters.requiresOperator !== undefined) where.requiresOperator = filters.requiresOperator;

  return db.equipment.findMany({
    where,
    include: { category: true },
    orderBy: [{ requiresOperator: 'desc' }, { name: 'asc' }],
  });
}

export async function getEquipmentBySlug(slug: string) {
  return db.equipment.findUnique({
    where: { slug },
    include: {
      category: true,
      _count: { select: { units: { where: { status: 'AVAILABLE' } } } },
    },
  });
}

export async function getAllEquipmentSlugs() {
  const items = await db.equipment.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });
  return items;
}

export async function getAllCategorySlugs() {
  const items = await db.equipmentCategory.findMany({ select: { slug: true } });
  return items;
}
