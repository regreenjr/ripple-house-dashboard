/**
 * Utility functions for converting brand names to URL slugs and vice versa
 */

export const brandToSlug = (brand: string): string => {
  return brand
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Formats brand name for display in the frontend
 * Maps technical database names to user-friendly display names
 */
export const formatBrandName = (brand: string | null | undefined): string => {
  if (!brand) return 'Unknown';

  const brandDisplayNames: Record<string, string> = {
    // Add mappings here only when the DB name is very technical and
    // there is no separate human-friendly brand with the same label.
    // Leaving this empty avoids duplicated labels in the UI.
  };

  return brandDisplayNames[brand] || brand;
};

export const slugToBrand = (slug: string, availableBrands: string[]): string | null => {
  const normalizedSlug = slug.toLowerCase();

  // Find the brand that matches the slug
  const matchedBrand = availableBrands.find(
    brand => brandToSlug(brand) === normalizedSlug
  );

  return matchedBrand || null;
};
