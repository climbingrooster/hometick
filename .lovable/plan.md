# Plan : Familist en app réelle partagée (étape 1)

Objectif : passer du prototype mémoire à une vraie app installable, avec données qui survivent au refresh, compte perso (pas encore de foyer partagé), responsive mobile/desktop, et comportements distincts tactile vs souris.

## 1. Backend Lovable Cloud

**Auth** : email/mot de passe + Google (via `lovable.auth.signInWithOAuth`). Page `/auth` avec onglets login/signup. Garde de session sur `/`. Pas de table `profiles` (pas besoin pour l'instant).

**Tables** (toutes avec RLS `user_id = auth.uid()`) :
- `categories` — id (uuid), user_id, key (slug), label, color (hex), is_builtin (bool), sort_order, created_at
- `items` — id (uuid), user_id, name, label, category_id (fk), is_permanent (bool), is_active (bool, true = dans la liste, false = réservoir), checked, last_used_at, created_at
- `item_history` — id, user_id, name_lower (unique par user), name, label, category_id, updated_at (pour autocomplete + mémoire de catégorie)

Au premier login : seed des catégories built-in (frais, boisson, etc.) + items de démo (optionnel — on peut commencer vide).

**Realtime** activé sur `items` et `categories` (utile plus tard pour le partage, et déjà pratique entre deux onglets).

## 2. Refacto data layer

- Créer `src/familist/hooks/useFamilist.ts` qui remplace les `useState` de `ModeNormal` : fetch initial + souscription realtime + mutations (`addItem`, `updateItem`, `deleteItem`, `tapItem`, `addCategory`, `renameCategory`).
- Toute la logique métier de `ModeNormal` reste identique côté UI ; seule la source de données change.

## 3. Responsive — sortir du PhoneFrame

- `Index.tsx` : `PhoneFrame` uniquement si `min-width: 768px` (preview desktop). Sur mobile réel → plein écran, safe-areas iOS (`env(safe-area-inset-*)`).
- `FamilistApp` : largeur fluide `max-w-[480px] mx-auto` sur desktop hors frame, plein écran sur mobile.
- Header `sticky top-0` déjà OK ; ajouter `padding-top: env(safe-area-inset-top)` sur mobile standalone.

## 4. Tactile vs souris (point clé)

Création d'un hook `usePointerKind()` → `'touch' | 'mouse'` (détection via `matchMedia('(hover: hover) and (pointer: fine)')`).

Comportements :

| Action | Souris (hover) | Tactile |
|---|---|---|
| Icônes ✏️ et `…` sur une ligne | apparaissent au hover, cachées sinon | toujours visibles (taille un peu plus grande, cible 40px min) |
| Hover background sur ligne | `hover:bg-[#F2F2EF]` actif | désactivé (pas de "stuck hover") → utiliser `@media (hover: hover)` |
| Tap article = passer en réservoir | clic | tap (zone augmentée hors icônes) |
| Menu `…` | clic ouvre dropdown | tap ouvre dropdown (+ tap-outside ferme via `pointerdown` au lieu de `mousedown`) |
| Pin | clic | tap, cible 40px |
| Picker catégorie | clic sur pastille | tap sur pastille (cible élargie) |
| Edit nom / label | clic sur ✏️ | tap sur ✏️ |

Concrètement :
- Remplacer tous les `mousedown` listeners par `pointerdown` (couvre les deux).
- Remplacer les classes `hover:*` qui ne doivent PAS coller en tactile par une variante Tailwind custom `@media (hover:hover)` → on ajoute `hover-hover:` dans `tailwind.config.ts`.
- En tactile : icônes ligne toujours visibles, taille `w-10 h-10` ; en souris : `w-8 h-8` + `opacity-0 group-hover:opacity-100`.
- `AddBar` : sur tactile, on garde le focus visible (placeholder reste lisible) ; pas de hover sur le bouton "Ajouter".

## 5. PWA (manifest-only, pas de service worker)

Conformément aux contraintes Lovable (les SW cassent l'aperçu iframe), on fait du **manifest-only installable** — suffisant pour "Ajouter à l'écran d'accueil" sur iOS/Android.

- `public/manifest.webmanifest` : name "Familist", short_name "Familist", `display: "standalone"`, `theme_color: "#8B5CF6"`, `background_color: "#FAFAF8"`, icônes 192/512.
- `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png` (générés).
- `index.html` : `<link rel="manifest">`, `<meta name="theme-color">`, `<meta name="apple-mobile-web-app-capable" content="yes">`, `<link rel="apple-touch-icon">`, `viewport-fit=cover`.
- Pas de `vite-plugin-pwa`, pas de `sw.js`. Pas de support offline → si tu veux du vrai offline plus tard, on ajoutera un SW avec les garde-fous.

## 6. Ordre d'exécution

1. Migration DB + RLS + seed function
2. Page `/auth` (email + Google) + ProtectedRoute
3. Hook `useFamilist` + branchement `ModeNormal` / `ModeCourses` sur Cloud
4. Hook `usePointerKind` + refacto interactions tactile/souris
5. Layout responsive (PhoneFrame conditionnel + safe areas)
6. PWA manifest + icônes

Je commence dès que tu valides.
