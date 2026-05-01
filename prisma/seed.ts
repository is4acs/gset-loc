/**
 * Seeds equipment categories, equipments and units.
 *
 * Idempotent: re-running upserts categories/equipments by slug and ensures
 * each equipment has a few units (creates missing ones, never duplicates).
 *
 * Usage: pnpm db:seed
 */
import 'dotenv/config';
import { PrismaClient, type Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? process.env.DIRECT_URL,
});
const db = new PrismaClient({ adapter });

const CATEGORIES: Prisma.EquipmentCategoryCreateInput[] = [
  {
    slug: 'engins',
    name: 'Engins',
    description: 'Engins de chantier avec opérateur GSET inclus dans le tarif.',
    icon: 'truck',
    order: 1,
  },
  {
    slug: 'demolition',
    name: 'Démolition',
    description: 'Marteaux piqueurs et matériel de cassage.',
    icon: 'hammer',
    order: 2,
  },
  {
    slug: 'decoupe',
    name: 'Découpe',
    description: 'Scies, meuleuses et outils de coupe.',
    icon: 'scissors',
    order: 3,
  },
  {
    slug: 'compactage',
    name: 'Compactage',
    description: 'Plaques vibrantes et dameuses pour préparer vos sols.',
    icon: 'layers',
    order: 4,
  },
  {
    slug: 'percage',
    name: 'Perçage',
    description: 'Perforateurs et carotteuses.',
    icon: 'drill',
    order: 5,
  },
  {
    slug: 'energie',
    name: 'Énergie',
    description: 'Compresseurs et groupes électrogènes pour alimenter votre chantier.',
    icon: 'plug',
    order: 6,
  },
];

interface EquipmentSeed {
  slug: string;
  name: string;
  shortDesc: string;
  description: string;
  categorySlug: string;
  requiresOperator: boolean;
  requiresCaces?: string | null;
  hourlyRate: number; // cents
  halfDayRate: number;
  dayRate: number;
  baseDeposit: number;
  specs: Record<string, string>;
  unitCount: number;
}

// Prices from CLAUDE.md, in cents.
const EQUIPMENTS: EquipmentSeed[] = [
  {
    slug: 'mini-pelle-1-8t',
    name: 'Mini-pelle 1.8T',
    categorySlug: 'engins',
    shortDesc: 'Mini-pelle 1.8 tonnes pour terrassement, fouilles et accès étroits.',
    description:
      'Mini-pelle compacte idéale pour les petits chantiers, fouilles, terrassements et travaux d’accès difficile. Livrée avec opérateur GSET certifié CACES R482-A.',
    requiresOperator: true,
    requiresCaces: 'R482-A',
    hourlyRate: 11000,
    halfDayRate: 40000,
    dayRate: 65000,
    baseDeposit: 0,
    specs: {
      Poids: '1 800 kg',
      Puissance: '15 ch',
      'Largeur de godet': '300 mm',
      'Profondeur de fouille': '2,30 m',
      Carburant: 'Diesel',
    },
    unitCount: 2,
  },
  {
    slug: 'mini-pelle-3-5t',
    name: 'Mini-pelle 3.5T',
    categorySlug: 'engins',
    shortDesc: 'Mini-pelle 3.5 tonnes pour terrassements moyens.',
    description:
      'Mini-pelle 3.5T pour terrassements, fondations et démolitions de moyenne envergure. Livrée avec opérateur GSET (CACES R482-A).',
    requiresOperator: true,
    requiresCaces: 'R482-A',
    hourlyRate: 13000,
    halfDayRate: 47000,
    dayRate: 78000,
    baseDeposit: 0,
    specs: {
      Poids: '3 500 kg',
      Puissance: '25 ch',
      'Largeur de godet': '450 mm',
      'Profondeur de fouille': '3,20 m',
      Carburant: 'Diesel',
    },
    unitCount: 2,
  },
  {
    slug: 'camion-nacelle',
    name: 'Camion nacelle',
    categorySlug: 'engins',
    shortDesc: 'Camion nacelle 12 m, idéal pour travaux en hauteur.',
    description:
      'Camion nacelle d’une portée de 12 m permettant l’accès aux travaux en hauteur en toute sécurité. Conducteur GSET (CACES R486-B) inclus.',
    requiresOperator: true,
    requiresCaces: 'R486-B',
    hourlyRate: 13000,
    halfDayRate: 45000,
    dayRate: 75000,
    baseDeposit: 0,
    specs: {
      'Hauteur de travail': '12 m',
      'Charge utile nacelle': '230 kg',
      PTAC: '3,5 t',
      Carburant: 'Diesel',
    },
    unitCount: 1,
  },
  {
    slug: 'compresseur-tracte-op',
    name: 'Compresseur tracté avec opérateur',
    categorySlug: 'engins',
    shortDesc: 'Compresseur tracté avec opérateur (formation pneumatique).',
    description:
      'Compresseur tracté livré avec un opérateur GSET formé à la conduite des outils pneumatiques.',
    requiresOperator: true,
    hourlyRate: 8500,
    halfDayRate: 30000,
    dayRate: 50000,
    baseDeposit: 0,
    specs: {
      Débit: '5 m³/min',
      Pression: '7 bar',
      Carburant: 'Diesel',
    },
    unitCount: 1,
  },
  {
    slug: 'marteau-piqueur-elec',
    name: 'Marteau piqueur électrique',
    categorySlug: 'demolition',
    shortDesc: 'Marteau piqueur électrique 11 kg, démolition légère.',
    description:
      'Marteau piqueur électrique 11 kg pour la démolition de chapes, dalles fines et travaux intérieurs. Filaire 230 V.',
    requiresOperator: false,
    hourlyRate: 1200,
    halfDayRate: 3500,
    dayRate: 6000,
    baseDeposit: 30000,
    specs: {
      Poids: '11 kg',
      Énergie: 'Frappe 25 J',
      Alimentation: '230 V',
      Emmanchement: 'SDS-Max',
    },
    unitCount: 4,
  },
  {
    slug: 'marteau-piqueur-therm',
    name: 'Marteau piqueur thermique',
    categorySlug: 'demolition',
    shortDesc: 'Marteau piqueur thermique 25 kg, autonomie totale.',
    description:
      'Marteau piqueur thermique 25 kg, autonome (sans cordon) pour démolitions extérieures et zones sans alimentation.',
    requiresOperator: false,
    hourlyRate: 1800,
    halfDayRate: 5000,
    dayRate: 8500,
    baseDeposit: 50000,
    specs: {
      Poids: '25 kg',
      Énergie: 'Frappe 60 J',
      Carburant: 'Essence',
    },
    unitCount: 2,
  },
  {
    slug: 'scie-a-sol',
    name: 'Scie à sol thermique',
    categorySlug: 'decoupe',
    shortDesc: 'Scie à sol thermique pour découpe d’enrobé et béton.',
    description:
      'Scie à sol thermique pour la découpe précise d’enrobé, dalles béton et chapes jusqu’à 15 cm de profondeur.',
    requiresOperator: false,
    hourlyRate: 2500,
    halfDayRate: 7000,
    dayRate: 12000,
    baseDeposit: 80000,
    specs: {
      'Profondeur de coupe': '15 cm',
      'Diamètre disque': '450 mm',
      Carburant: 'Essence',
    },
    unitCount: 2,
  },
  {
    slug: 'plaque-vibrante',
    name: 'Plaque vibrante',
    categorySlug: 'compactage',
    shortDesc: 'Plaque vibrante pour compactage d’enrobé et de remblais.',
    description:
      'Plaque vibrante pour compactage en aller simple. Idéale pour finition d’enrobé et remblais.',
    requiresOperator: false,
    hourlyRate: 1500,
    halfDayRate: 4500,
    dayRate: 7500,
    baseDeposit: 40000,
    specs: {
      Poids: '90 kg',
      'Force centrifuge': '14 kN',
      'Largeur de plaque': '50 cm',
    },
    unitCount: 3,
  },
  {
    slug: 'dameuse',
    name: 'Dameuse à percussion',
    categorySlug: 'compactage',
    shortDesc: 'Dameuse à percussion pour fonds de fouilles.',
    description:
      'Dameuse à percussion (pilonneuse) pour compactage en fond de fouilles et tranchées étroites.',
    requiresOperator: false,
    hourlyRate: 2000,
    halfDayRate: 5500,
    dayRate: 9500,
    baseDeposit: 60000,
    specs: {
      Poids: '70 kg',
      'Force d’impact': '14 kN',
      Carburant: 'Essence',
    },
    unitCount: 2,
  },
  {
    slug: 'meuleuse-230',
    name: 'Meuleuse 230 mm',
    categorySlug: 'decoupe',
    shortDesc: 'Meuleuse 230 mm pour découpe métal et maçonnerie.',
    description: 'Meuleuse électrique 230 mm pour découpe légère, métal et petite maçonnerie.',
    requiresOperator: false,
    hourlyRate: 800,
    halfDayRate: 2200,
    dayRate: 3800,
    baseDeposit: 15000,
    specs: {
      'Diamètre disque': '230 mm',
      Puissance: '2 200 W',
      Alimentation: '230 V',
    },
    unitCount: 4,
  },
  {
    slug: 'perforateur-sds-max',
    name: 'Perforateur SDS-Max',
    categorySlug: 'percage',
    shortDesc: 'Perforateur SDS-Max pour perçage et burinage.',
    description: 'Perforateur burineur SDS-Max pour perçage de béton armé et burinage léger.',
    requiresOperator: false,
    hourlyRate: 1000,
    halfDayRate: 2800,
    dayRate: 4800,
    baseDeposit: 25000,
    specs: {
      Énergie: 'Frappe 9 J',
      'Diamètre max': '40 mm',
      Emmanchement: 'SDS-Max',
    },
    unitCount: 3,
  },
  {
    slug: 'groupe-electrogene-5kva',
    name: 'Groupe électrogène 5 kVA',
    categorySlug: 'energie',
    shortDesc: 'Groupe électrogène 5 kVA insonorisé.',
    description:
      'Groupe électrogène 5 kVA insonorisé pour alimentation de chantier en l’absence de réseau.',
    requiresOperator: false,
    hourlyRate: 1200,
    halfDayRate: 3500,
    dayRate: 6000,
    baseDeposit: 50000,
    specs: {
      Puissance: '5 kVA',
      Carburant: 'Essence',
      Autonomie: '8 h',
      'Niveau sonore': '67 dB',
    },
    unitCount: 2,
  },
  {
    slug: 'compresseur-tracte',
    name: 'Compresseur tracté',
    categorySlug: 'energie',
    shortDesc: 'Compresseur tracté pour outils pneumatiques.',
    description:
      'Compresseur tracté pour alimentation d’outils pneumatiques en libre-location (sans opérateur).',
    requiresOperator: false,
    hourlyRate: 2000,
    halfDayRate: 5500,
    dayRate: 9500,
    baseDeposit: 120000,
    specs: {
      Débit: '5 m³/min',
      Pression: '7 bar',
      Carburant: 'Diesel',
    },
    unitCount: 1,
  },
];

function imageUrl(slug: string): string {
  return `https://picsum.photos/seed/${slug}/1200/800`;
}

async function main() {
  console.log('=== Seeding categories ===');
  for (const c of CATEGORIES) {
    await db.equipmentCategory.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        description: c.description,
        icon: c.icon,
        order: c.order,
      },
      create: c,
    });
    console.log('  ✓', c.slug);
  }

  console.log('\n=== Seeding equipments + units ===');
  for (const e of EQUIPMENTS) {
    const category = await db.equipmentCategory.findUniqueOrThrow({
      where: { slug: e.categorySlug },
    });

    const equipment = await db.equipment.upsert({
      where: { slug: e.slug },
      update: {
        name: e.name,
        shortDesc: e.shortDesc,
        description: e.description,
        categoryId: category.id,
        requiresOperator: e.requiresOperator,
        requiresCaces: e.requiresCaces ?? null,
        hourlyRate: e.hourlyRate,
        halfDayRate: e.halfDayRate,
        dayRate: e.dayRate,
        baseDeposit: e.baseDeposit,
        specs: e.specs,
        images: [imageUrl(e.slug)],
        isActive: true,
      },
      create: {
        slug: e.slug,
        name: e.name,
        shortDesc: e.shortDesc,
        description: e.description,
        categoryId: category.id,
        requiresOperator: e.requiresOperator,
        requiresCaces: e.requiresCaces ?? null,
        hourlyRate: e.hourlyRate,
        halfDayRate: e.halfDayRate,
        dayRate: e.dayRate,
        baseDeposit: e.baseDeposit,
        specs: e.specs,
        images: [imageUrl(e.slug)],
        isActive: true,
      },
    });

    const existingUnits = await db.equipmentUnit.count({
      where: { equipmentId: equipment.id },
    });
    const toCreate = Math.max(0, e.unitCount - existingUnits);
    const codePrefix = equipmentCode(e.slug);
    for (let i = 0; i < toCreate; i++) {
      const idx = existingUnits + i + 1;
      const internalCode = `${codePrefix}-${String(idx).padStart(3, '0')}`;
      const serialNumber = `${codePrefix}-SN-${String(Date.now()).slice(-6)}-${idx}`;
      await db.equipmentUnit.create({
        data: {
          equipmentId: equipment.id,
          internalCode,
          serialNumber,
        },
      });
    }
    console.log(`  ✓ ${e.slug}  (${existingUnits + toCreate} units total, +${toCreate} new)`);
  }

  console.log('\nSeeding done.');
}

function equipmentCode(slug: string): string {
  return slug
    .split('-')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 4)
    .padEnd(2, 'X');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
