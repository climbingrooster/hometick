import { useState } from 'react';
import { Plus } from 'lucide-react';
import { INIT_ACTIVE, INIT_PERM, INIT_RECENT } from './data';
import type { Item, ReservoirItem } from './types';
import { AddBar, GroupHeader, ModeToggle, ReservoirSection } from './atoms';
import { ArticleRow } from './ArticleRow';

export function ModeNormal({ mobile = false, onSwitch }: { mobile?: boolean; onSwitch: () => void }) {
  const [items, setItems] = useState<Item[]>(INIT_ACTIVE);
  const [perm, setPerm] = useState<ReservoirItem[]>(INIT_PERM);
  const [recent, setRecent] = useState<ReservoirItem[]>(INIT_RECENT);

  const updateItem = (u: Item) => setItems((p) => p.map((i) => (i.id === u.id ? u : i)));
  const deleteItem = (id: number) => setItems((p) => p.filter((i) => i.id !== id));
  const tapItem = (item: Item) => {
    setItems((p) => p.filter((i) => i.id !== item.id));
    const r: ReservoirItem = { id: item.id, name: item.name, label: item.label || '', cat: item.cat };
    if (item.isPermanent) setPerm((p) => [r, ...p]);
    else setRecent((p) => [r, ...p]);
  };
  const addItem = (item: ReservoirItem, fromPerm: boolean) => {
    if (fromPerm) setPerm((p) => p.filter((i) => i.id !== item.id));
    else setRecent((p) => p.filter((i) => i.id !== item.id));
    setItems((p) => [...p, { ...item, checked: false, addedBy: null, isPermanent: !!fromPerm }]);
  };

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
                <GroupHeader cat={cat} info={`${items.filter((i) => i.cat === cat).length}`} />
                {items
                  .filter((i) => i.cat === cat)
                  .map((item) => (
                    <ArticleRow
                      key={item.id}
                      item={item}
                      onTap={tapItem}
                      onUpdate={updateItem}
                      onDelete={deleteItem}
                      mobile={mobile}
                    />
                  ))}
              </div>
            ))
          )}
        </div>

        <div className="px-3.5 py-2.5 shrink-0">
          <AddBar />
        </div>

        <div className="px-3.5 flex flex-col gap-2 shrink-0">
          <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.06em] mb-0.5">
            Ajouter rapidement
          </div>
          <ReservoirSection
            title="Articles permanents"
            items={perm}
            showAddAll
            onAddOne={(item) => addItem(item, true)}
            onAddAll={() => {
              setItems((p) => [
                ...p,
                ...perm.map((i) => ({ ...i, checked: false, addedBy: null, isPermanent: true })),
              ]);
              setPerm([]);
            }}
          />
          <ReservoirSection title="Articles récents" items={recent} onAddOne={(item) => addItem(item, false)} />
          <div className="h-20" />
        </div>
      </main>

      {/* FAB */}
      <button
        aria-label="Ajouter un article"
        className="absolute bottom-6 right-[18px] w-12 h-12 rounded-full bg-accent-violet flex items-center justify-center cursor-pointer z-30 border-0"
        style={{ boxShadow: '0 4px 20px hsl(var(--accent-violet) / 0.4)' }}
      >
        <Plus size={20} className="text-white" strokeWidth={2.5} />
      </button>
    </>
  );
}
