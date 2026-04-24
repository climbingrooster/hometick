import type { Item, ReservoirItem } from './types';

export const INIT_ACTIVE: Item[] = [
  { id: 1, name: 'Lait entier',    label: '2 bouteilles', cat: 'frais',    checked: false, addedBy: null,  isPermanent: true  },
  { id: 2, name: 'Yaourts nature', label: '1 pack x8',    cat: 'frais',    checked: false, addedBy: null,  isPermanent: false },
  { id: 3, name: 'Pain de mie',    label: '',             cat: 'epicerie', checked: false, addedBy: null,  isPermanent: false },
  { id: 4, name: 'Pâtes',          label: '500g',         cat: 'epicerie', checked: false, addedBy: null,  isPermanent: true  },
  { id: 5, name: 'Café moulu',     label: '250g',         cat: 'boissons', checked: false, addedBy: 'Sam', isPermanent: false },
  { id: 6, name: "Jus d'orange",   label: '1L',           cat: 'boissons', checked: false, addedBy: null,  isPermanent: false },
  { id: 7, name: 'Gel douche',     label: '',             cat: 'hygiene',  checked: false, addedBy: null,  isPermanent: true  },
  { id: 8, name: 'Dentifrice',     label: '',             cat: 'hygiene',  checked: false, addedBy: null,  isPermanent: false },
];

export const INIT_PERM: ReservoirItem[] = [
  { id: 20, name: 'Bière (6)', label: 'pack',  cat: 'boissons' },
  { id: 21, name: 'PQ',        label: '6 rlx', cat: 'hygiene'  },
  { id: 22, name: 'Œufs x12',  label: '',      cat: 'frais'    },
];

export const INIT_RECENT: ReservoirItem[] = [
  { id: 30, name: 'Chips',      label: '',    cat: 'epicerie' },
  { id: 31, name: 'Pommes',     label: '1kg', cat: 'frais'    },
  { id: 32, name: 'Shampooing', label: '',    cat: 'hygiene'  },
];
