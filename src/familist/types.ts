// Category id is a string. Built-in ids are listed below; custom categories
// use ids like `c-<timestamp>`.
export type Category = string;

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

export const BUILTIN_CATS = ['frais', 'epicerie', 'hygiene', 'boissons', 'autre'] as const;
export const CAT_ORDER: Category[] = [...BUILTIN_CATS];

export type CategoryDef = {
  id: Category;
  label: string;
  /** HSL string like "156 47% 57%" */
  hsl: string;
  /** Background HSL string like "156 65% 94%" */
  hslBg: string;
};

// Built-in categories — must match CSS variables in index.css for backward compat
export const BUILTIN_DEFS: Record<string, CategoryDef> = {
  frais:    { id: 'frais',    label: 'Frais',    hsl: '156 47% 57%', hslBg: '156 65% 94%' },
  epicerie: { id: 'epicerie', label: 'Épicerie', hsl: '46 89% 62%',  hslBg: '48 87% 95%' },
  hygiene:  { id: 'hygiene',  label: 'Hygiène',  hsl: '213 87% 69%', hslBg: '215 89% 96%' },
  boissons: { id: 'boissons', label: 'Boissons', hsl: '252 95% 76%', hslBg: '252 100% 96%' },
  autre:    { id: 'autre',    label: 'Autre',    hsl: '348 84% 78%', hslBg: '348 86% 97%' },
};

// Legacy mapping kept for components that still use Tailwind classes for built-in cats.
export const CAT_META: Record<string, { dotClass: string; bgClass: string; textClass: string; label: string }> = {
  frais:    { dotClass: 'bg-cat-frais',    bgClass: 'bg-cat-frais-bg',    textClass: 'text-cat-frais',    label: 'Frais' },
  epicerie: { dotClass: 'bg-cat-epicerie', bgClass: 'bg-cat-epicerie-bg', textClass: 'text-cat-epicerie', label: 'Épicerie' },
  hygiene:  { dotClass: 'bg-cat-hygiene',  bgClass: 'bg-cat-hygiene-bg',  textClass: 'text-cat-hygiene',  label: 'Hygiène' },
  boissons: { dotClass: 'bg-cat-boissons', bgClass: 'bg-cat-boissons-bg', textClass: 'text-cat-boissons', label: 'Boissons' },
  autre:    { dotClass: 'bg-cat-autre',    bgClass: 'bg-cat-autre-bg',    textClass: 'text-cat-autre',    label: 'Autre' },
};

// 10 pastel-ish colors respecting the design palette (charte).
// Each is { hsl (mid), hslBg (very light), name }
export const PALETTE: { name: string; hsl: string; hslBg: string }[] = [
  { name: 'Vert',    hsl: '156 47% 57%', hslBg: '156 65% 94%' }, // frais
  { name: 'Jaune',   hsl: '46 89% 62%',  hslBg: '48 87% 95%'  }, // epicerie
  { name: 'Bleu',    hsl: '213 87% 69%', hslBg: '215 89% 96%' }, // hygiene
  { name: 'Lavande', hsl: '252 95% 76%', hslBg: '252 100% 96%' },// boissons
  { name: 'Rose',    hsl: '348 84% 78%', hslBg: '348 86% 97%' }, // autre
  { name: 'Violet',  hsl: '258 90% 66%', hslBg: '252 100% 97%' },// accent
  { name: 'Menthe',  hsl: '174 60% 60%', hslBg: '174 60% 94%'  },
  { name: 'Pêche',   hsl: '22 90% 70%',  hslBg: '22 90% 95%'   },
  { name: 'Terre',   hsl: '30 35% 60%',  hslBg: '30 35% 94%'   },
  { name: 'Ardoise', hsl: '220 12% 60%', hslBg: '220 14% 94%'  },
];

export type CategoryRegistry = Record<Category, CategoryDef>;

export function getCatDef(reg: CategoryRegistry, id: Category): CategoryDef {
  return reg[id] ?? BUILTIN_DEFS[id] ?? BUILTIN_DEFS.autre;
}
