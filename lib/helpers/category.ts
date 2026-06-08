export function normalizeCategoryName(value: string) {
  return String(value || "")
    .replace(/_/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function formatCategoryDisplayName(value: string) {
  return normalizeCategoryName(value.replace(/_/g, " "));
}

export function createCategorySlug(value: string) {
  return normalizeCategoryName(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidCategoryName(value: string) {
  return /^[A-Za-z0-9\s/&().+-]+$/.test(value);
}
