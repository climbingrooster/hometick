export type Category = 'frais' | 'epicerie' | 'hygiene' | 'boissons' | 'autre';

export type Item = {
  id: number;
  name: string;
  label: string;
  cat: Category;
  checked: boolean;
  addedBy: string | null;
  isPermanent: boolean;
};

export type ReservoirItem = {
  id: number;
  name: string;
  label: string;
  cat: Category;
};

export const CAT_ORDER: Category[] = ['frais', 'epicerie', 'hygiene', 'boissons', 'autre'];

export const CAT_META: Record<Category, { dotClass: string; bgClass: string; textClass: string; label: string }> = {
  frais:    { dotClass: 'bg-cat-frais',    bgClass: 'bg-cat-frais-bg',    textClass: 'text-cat-frais',    label: 'Frais' },
  epicerie: { dotClass: 'bg-cat-epicerie', bgClass: 'bg-cat-epicerie-bg', textClass: 'text-cat-epicerie', label: 'Épicerie' },
  hygiene:  { dotClass: 'bg-cat-hygiene',  bgClass: 'bg-cat-hygiene-bg',  textClass: 'text-cat-hygiene',  label: 'Hygiène' },
  boissons: { dotClass: 'bg-cat-boissons', bgClass: 'bg-cat-boissons-bg', textClass: 'text-cat-boissons', label: 'Boissons' },
  autre:    { dotClass: 'bg-cat-autre',    bgClass: 'bg-cat-autre-bg',    textClass: 'text-cat-autre',    label: 'Autre' },
};

// CSS variable names per category for inline gradient backgrounds (overlay)
export const CAT_CSS_VAR: Record<Category, string> = {
  frais: '--cat-frais',
  epicerie: '--cat-epicerie',
  hygiene: '--cat-hygiene',
  boissons: '--cat-boissons',
  autre: '--cat-autre',
};
