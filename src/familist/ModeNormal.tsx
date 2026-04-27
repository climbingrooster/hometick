import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { INIT_ACTIVE, INIT_PERM, INIT_RECENT } from './data';
import {
  BUILTIN_DEFS,
  CAT_ORDER,
  type Category,
  type CategoryDef,
  type CategoryRegistry,
  type Item,
  type ReservoirItem,
} from './types';
import { AddBar, GroupHeader, ModeToggle, ReservoirSection, type Suggestion } from './atoms';
import { ArticleRow } from './ArticleRow';

type HistoryEntry = { name: string; label: string; cat: Category };

export function ModeNormal({ mobile = false, onSwitch }: { mobile?: boolean; onSwitch: () => void }) {
  const [items, setItems] = useState<Item[]>(INIT_ACTIVE);
  const [perm, setPerm] = useState<ReservoirItem[]>(INIT_PERM);
  const [recent, setRecent] = useState<ReservoirItem[]>(INIT_RECENT);
  // history: name(lowercased) -> last known props (used to remember category on re-add)
  const [history, setHistory] = useState<Record<string, HistoryEntry>>(() => {
    const map: Record<string, HistoryEntry> = {};
    [...INIT_ACTIVE, ...INIT_PERM, ...INIT_RECENT].forEach((i) => {
      map[i.name.toLowerCase()] = { name: i.name, label: ('label' in i ? i.label : '') || '', cat: i.cat };
    });
    return map;
  });
  // Category registry (built-ins + any custom categories the user creates)
  const [registry, setRegistry] = useState<CategoryRegistry>(() => ({ ...BUILTIN_DEFS }));

  const renameCategory = (cat: Category, newLabel: string) =>
    setRegistry((r) => ({ ...r, [cat]: { ...(r[cat] ?? BUILTIN_DEFS[cat]), label: newLabel } }));

  const addCategory = (def: CategoryDef) =>
    setRegistry((r) => ({ ...r, [def.id]: def }));

  const rememberInHistory = (entry: HistoryEntry) =>
    setHistory((h) => ({ ...h, [entry.name.toLowerCase()]: entry }));

  const updateItem = (u: Item) => {
    setItems((p) => p.map((i) => (i.id === u.id ? u : i)));
    rememberInHistory({ name: u.name, label: u.label, cat: u.cat });
  };
  const deleteItem = (id: number) => setItems((p) => p.filter((i) => i.id !== id));
  const tapItem = (item: Item) => {
    setItems((p) => p.filter((i) => i.id !== item.id));
    const r: ReservoirItem = { id: item.id, name: item.name, label: item.label || '', cat: item.cat };
    rememberInHistory({ name: item.name, label: item.label || '', cat: item.cat });
    if (item.isPermanent) setPerm((p) => [r, ...p]);
    else setRecent((p) => [r, ...p]);
  };
  const addItem = (item: ReservoirItem, fromPerm: boolean) => {
    if (fromPerm) setPerm((p) => p.filter((i) => i.id !== item.id));
    else setRecent((p) => p.filter((i) => i.id !== item.id));
    setItems((p) => [...p, { ...item, checked: false, addedBy: null, isPermanent: !!fromPerm }]);
  };

  const handleAdd = (rawName: string, suggestion?: Suggestion) => {
    const name = rawName.trim();
    if (!name) return;
    const key = name.toLowerCase();

    // If exists in active, ignore (already in list)
    if (items.some((i) => i.name.toLowerCase() === key)) return;

    // If exists in reservoirs, move it to active (preserve cat/label/permanent)
    const inPerm = perm.find((p) => p.name.toLowerCase() === key);
    if (inPerm) {
      addItem(inPerm, true);
      return;
    }
    const inRecent = recent.find((r) => r.name.toLowerCase() === key);
    if (inRecent) {
      addItem(inRecent, false);
      return;
    }

    // Look up category from history (so re-typed item keeps its prior category)
    const past = history[key];
    const cat = suggestion?.cat ?? past?.cat ?? 'autre';
    const label = suggestion?.label ?? past?.label ?? '';
    const newItem: Item = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      name,
      label,
      cat,
      checked: false,
      addedBy: null,
      isPermanent: false,
    };
    setItems((p) => [...p, newItem]);
    rememberInHistory({ name, label, cat });
  };

  // Build autocomplete suggestions from perm + recent + history (dedup by name)
  const suggestions: Suggestion[] = useMemo(() => {
    const seen = new Set<string>();
    const out: Suggestion[] = [];
    const activeKeys = new Set(items.map((i) => i.name.toLowerCase()));
    const push = (s: Suggestion) => {
      const k = s.name.toLowerCase();
      if (seen.has(k) || activeKeys.has(k)) return;
      seen.add(k);
      out.push(s);
    };
    perm.forEach((p) => push({ name: p.name, label: p.label, cat: p.cat }));
    recent.forEach((r) => push({ name: r.name, label: r.label, cat: r.cat }));
    Object.values(history).forEach((h) => push({ name: h.name, label: h.label, cat: h.cat }));
    return out;
  }, [items, perm, recent, history]);

  const cats = [...new Set(items.map((i) => i.cat))];
  const remaining = items.length;

  return (
    <>
      {/* Header */}
      <header className="bg-surface px-[18px] pt-2.5 pb-3.5 border-b border-border-soft shrink-0">
        <div className="flex items-start justify-between mb-2.5">
          <div>
            <div className="text-[10px] text-text-secondary font-medium uppercase tracking-[0.05em]">
              Semaine du 21 avril
            </div>
            <h1 className="text-xl font-bold text-foreground mt-px">Liste de courses</h1>
          </div>
          <ModeToggle mode="normal" onToggle={onSwitch} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-accent-violet text-white text-[10px] font-bold flex items-center justify-center">
            A
          </div>
          <div className="w-6 h-6 rounded-full bg-cat-frais text-white text-[10px] font-bold flex items-center justify-center">
            S
          </div>
          <span className="text-[11px] text-text-secondary ml-0.5">Alex + Sam</span>
          <span className="ml-auto text-[11px] text-text-secondary">
            {remaining} article{remaining !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <div className="mx-3.5 mt-3 rounded-2xl overflow-hidden border border-border-soft bg-surface shrink-0">
          {cats.length === 0 ? (
            <div className="px-5 py-7 text-center text-text-secondary text-xs">
              <div className="text-2xl mb-2">🛒</div>
              <div className="font-semibold text-foreground mb-1">Liste vide</div>
              <div>Pioche dans les réservoirs ci-dessous</div>
            </div>
          ) : (
            cats.map((cat) => (
              <div key={cat}>
                <GroupHeader
                  cat={cat}
                  registry={registry}
                  onRename={(newLabel) => renameCategory(cat, newLabel)}
                  info={`${items.filter((i) => i.cat === cat).length}`}
                />
                {items
                  .filter((i) => i.cat === cat)
                  .map((item) => (
                    <ArticleRow
                      key={item.id}
                      item={item}
                      onTap={tapItem}
                      onUpdate={updateItem}
                      onDelete={deleteItem}
                      registry={registry}
                      onCreateCategory={addCategory}
                      mobile={mobile}
                    />
                  ))}
              </div>
            ))
          )}
        </div>

        <div className="px-3.5 py-2.5 shrink-0">
          <AddBar onAdd={handleAdd} suggestions={suggestions} registry={registry} />
        </div>

        <div className="px-3.5 flex flex-col gap-2 shrink-0">
          <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.06em] mb-0.5">
            Ajouter rapidement
          </div>
          <ReservoirSection
            title="Articles permanents"
            items={perm}
            showAddAll
            registry={registry}
            onAddOne={(item) => addItem(item, true)}
            onAddAll={() => {
              setItems((p) => [
                ...p,
                ...perm.map((i) => ({ ...i, checked: false, addedBy: null, isPermanent: true })),
              ]);
              setPerm([]);
            }}
          />
          <ReservoirSection title="Articles récents" items={recent} registry={registry} onAddOne={(item) => addItem(item, false)} />
          <div className="h-20" />
        </div>
      </main>

    </>
  );
}
