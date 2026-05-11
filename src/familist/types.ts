// Category id = uuid from DB
export type Category = string;

export type Item = {
  id: string;
  name: string;
  label: string;
  cat: Category;
  checked: boolean;
  addedBy: string | null;
  isPermanent: boolean;
};

export type ReservoirItem = {
  id: string;
  name: string;
  label: string;
  cat: Category;
};

export type CategoryDef = {
  id: Category;
  key?: string;
  label: string;
  /** Any CSS color string (hex like #10B981 or hsl(...)) */
  color: string;
  /** Light tinted background — any CSS color string */
  bg: string;
};

export type CategoryRegistry = Record<Category, CategoryDef>;

const FALLBACK: CategoryDef = {
  id: '__fallback',
  label: 'Autre',
  color: '#8A8A9A',
  bg: '#8A8A9A1F',
};

export function getCatDef(reg: CategoryRegistry, id: Category): CategoryDef {
  return reg[id] ?? FALLBACK;
}

// Tint a hex color to a soft background (12% alpha).
export function tintHex(hex: string, alpha = 0.12): string {
  if (!hex.startsWith('#')) return hex;
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
  // expand short form
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return `#${h}${a}`;
}

// 10 palette colors aligned with charte. Used when creating a new category.
export const PALETTE: { name: string; color: string; bg: string }[] = [
  { name: 'Vert',    color: '#10B981', bg: tintHex('#10B981') },
  { name: 'Jaune',   color: '#F59E0B', bg: tintHex('#F59E0B') },
  { name: 'Bleu',    color: '#3B82F6', bg: tintHex('#3B82F6') },
  { name: 'Lavande', color: '#A78BFA', bg: tintHex('#A78BFA') },
  { name: 'Rose',    color: '#EC4899', bg: tintHex('#EC4899') },
  { name: 'Violet',  color: '#8B5CF6', bg: tintHex('#8B5CF6') },
  { name: 'Menthe',  color: '#14B8A6', bg: tintHex('#14B8A6') },
  { name: 'Pêche',   color: '#FB923C', bg: tintHex('#FB923C') },
  { name: 'Terre',   color: '#A78060', bg: tintHex('#A78060') },
  { name: 'Ardoise', color: '#94A3B8', bg: tintHex('#94A3B8') },
];
