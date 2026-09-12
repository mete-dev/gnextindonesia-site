export interface CategoryTypeConfig {
  id: string;
  name: string;
  portal: string;
  slugs: string[];
  subCategories: string[];
  placeholder?: string;
}

export const GUMMAH_SUBCATS: string[] = [
  'Kabar Ummah',
  'Islam Global',
  'Kalam & Opini',
  'Ekonomi Syariah',
  'Ziswaf',
  'Halal Lifestyle',
  'Inspirasi Muslim'
];

export const FINANCE_SUBCATS: string[] = [
  'Kabar Fiskal',
  'Perbankan & Fintech',
  'Bursa & Emiten',
  'Aset Alternatif',
  'Dapur Bisnis',
  'Sentra UMKM',
  'Cerdas Finansial'
];

export const CATEGORIES_CONFIG: Record<string, CategoryTypeConfig> = {
  UMMAH: {
    id: 'ummah',
    name: 'Gnext Ummah',
    portal: 'gummah',
    slugs: ['gummah', 'g-ummah', 'ummah'],
    subCategories: GUMMAH_SUBCATS,
    placeholder: '-- Pilih Sub-Kategori Gnext Ummah --'
  },
  FINANCE: {
    id: 'finance',
    name: 'Gnext Finance',
    portal: 'finance',
    slugs: ['finance', 'gnext-finance'],
    subCategories: FINANCE_SUBCATS,
    placeholder: '-- Pilih Sub-Kategori Gnext Finance --'
  },
  GENERAL: {
    id: 'general',
    name: 'Umum & Regional',
    portal: 'gnext',
    slugs: [],
    subCategories: [],
    placeholder: ''
  }
};

/**
 * Determine the category type (UMMAH, FINANCE, or GENERAL)
 * based on category slug, name, or portal.
 */
export function getCategoryType(
  catSlug?: string,
  catName?: string,
  portal?: string
): 'UMMAH' | 'FINANCE' | 'GENERAL' {
  const slugLower = (catSlug || '').toLowerCase();
  const nameLower = (catName || '').toLowerCase();
  const portalLower = (portal || '').toLowerCase();

  if (
    CATEGORIES_CONFIG.UMMAH.slugs.includes(slugLower) ||
    nameLower.includes('ummah') ||
    portalLower === 'gummah'
  ) {
    return 'UMMAH';
  }

  if (
    CATEGORIES_CONFIG.FINANCE.slugs.includes(slugLower) ||
    nameLower.includes('finance') ||
    portalLower === 'finance'
  ) {
    return 'FINANCE';
  }

  return 'GENERAL';
}

/**
 * Get available sub-categories for a given category/portal context.
 */
export function getSubCategoriesForCategory(
  catSlug?: string,
  catName?: string,
  portal?: string
): string[] {
  const type = getCategoryType(catSlug, catName, portal);
  return CATEGORIES_CONFIG[type].subCategories;
}

/**
 * Validate whether a sub-category is valid for a given category/portal context.
 */
export function validateSubCategory(
  subCat: string | undefined,
  catSlug?: string,
  catName?: string,
  portal?: string
): { isValid: boolean; message?: string; cleanedSubCat: string } {
  const type = getCategoryType(catSlug, catName, portal);

  if (type === 'UMMAH') {
    const isValid = !!subCat && GUMMAH_SUBCATS.includes(subCat);
    return {
      isValid,
      message: isValid ? undefined : 'Mohon pilih sub-kategori khusus Gnext Ummah.',
      cleanedSubCat: isValid ? subCat : ''
    };
  }

  if (type === 'FINANCE') {
    const isValid = !!subCat && FINANCE_SUBCATS.includes(subCat);
    return {
      isValid,
      message: isValid ? undefined : 'Mohon pilih sub-kategori khusus Gnext Finance.',
      cleanedSubCat: isValid ? subCat : ''
    };
  }

  // General categories do not use sub-categories
  return {
    isValid: true,
    cleanedSubCat: ''
  };
}
