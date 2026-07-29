/** Fixed category taxonomy for listings (M3/M4). */
export const CATEGORIES = [
  "furniture",
  "textbooks",
  "electronics",
  "clothing",
  "appliances",
  "outdoors",
  "music",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function categoryLabel(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
