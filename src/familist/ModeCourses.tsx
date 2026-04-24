import { useState } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { INIT_ACTIVE, INIT_PERM } from './data';
import type { Item } from './types';
import { AddBar, ColorDot, GroupHeader, ModeToggle } from './atoms';
import { CourseRow } from './CourseRow';

export function ModeCourses({ mobile = false, onSwitch }: { mobile?: boolean; onSwitch: () => void }) {
  const [items, setItems] = useState<Item[]>(INIT_ACTIVE);
  const [permRes] = useState(INIT_PERM);
  const [showPerm, setShowPerm] = useState(false);
  const [alert, setAlert] = useState(true);

  const toggleItem = (item: Item) =>
    setItems((p) => p.map((i) => (i.id === item.id ? { ...i, checked: !i.checked } : i)));
  const updateItem = (u: Item) => setItems((p) => p.map((i) => (i.id === u.id ? u : i)));
  const deleteItem = (id: number) => setItems((p) => p.filter((i) => i.id !== id));

  const checked = items.filter((i) => i.checked).length;
  const total = items.length;
  const allDone = total > 0 && checked === total;
  const cats = [...new Set(items.map((i) => i.cat))];

  return (
    <>
      <header className="bg-surface px-[18px] pt-2.5 pb-3.5 border-b border-border-soft shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-[10px] text-text-secondary font-medium uppercase tracking-[0.05em]">En cours</div>
            <h1 className="text-xl font-bold text-foreground mt-px">Liste de courses</h1>
          </div>
          <ModeToggle mode="courses" onToggle={onSwitch} />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex-1 h-[5px] bg-border-soft rounded-md overflow-hidden">
            <div
              className={`h-full rounded-md transition-all duration-300 ${allDone ? 'bg-success' : 'bg-accent-violet'}`}
              style={{ width: `${total ? (checked / total) * 100 : 0}%` }}
            />
          </div>
          <span
            className={`text-[13px] font-bold whitespace-nowrap transition-colors ${
              allDone ? 'text-success' : 'text-foreground'
            }`}
          >
            {checked} / {total}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto flex flex-col">
        {alert && (
          <div className="mx-3.5 mt-2.5 bg-[#FFF7ED] border border-[#FED7AA] rounded-xl px-3.5 py-2.5 flex items-center gap-2 shrink-0">
            <div className="w-[7px] h-[7px] rounded-full bg-[#FB923C] shrink-0" />
            <span className="text-xs text-[#92400E] font-medium flex-1">
              Sam a ajouté <b>Café moulu</b> · il y a 2 min
            </span>
            <button
              onClick={() => setAlert(false)}
              className="cursor-pointer p-[3px] flex shrink-0 rounded-md hover:bg-[#FED7AA] border-0 bg-transparent"
              aria-label="Fermer"
            >
              <X size={12} className="text-[#FB923C]" strokeWidth={2.5} />
            </button>
          </div>
        )}

        <div className="mx-3.5 mt-2.5 rounded-2xl overflow-hidden border border-border-soft bg-surface shrink-0">
          {cats.map((cat) => {
            const catItems = items.filter((i) => i.cat === cat);
            const doneCnt = catItems.filter((i) => i.checked).length;
            return (
              <div key={cat}>
                <GroupHeader cat={cat} info={`${doneCnt}/${catItems.length}`} />
                {catItems.map((item) => (
                  <CourseRow
                    key={item.id}
                    item={item}
                    onToggle={toggleItem}
                    onUpdate={updateItem}
                    onDelete={deleteItem}
                    mobile={mobile}
                  />
                ))}
              </div>
            );
          })}
        </div>

        {/* Permanents compact */}
        <div className="mx-3.5 mt-2.5 shrink-0">
          <div
            onClick={() => setShowPerm((o) => !o)}
            className={`bg-surface border border-border-soft px-3.5 py-[11px] flex items-center gap-2 cursor-pointer ${
              showPerm ? 'rounded-t-xl' : 'rounded-xl'
            }`}
          >
            <span className="text-xs font-semibold text-text-secondary flex-1">
              Permanents non ajoutés ({permRes.length})
            </span>
            <ChevronDown
              size={14}
              className={`text-text-secondary transition-transform ${showPerm ? 'rotate-180' : ''}`}
            />
          </div>
          {showPerm && (
            <div className="bg-surface border border-border-soft border-t-0 rounded-b-xl">
              {permRes.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 px-3.5 py-[9px] border-t border-border-soft cursor-pointer hover:bg-[#F7F7F5]"
                >
                  <ColorDot cat={item.cat} size={8} />
                  <span className="flex-1 text-[13px] text-foreground">{item.name}</span>
                  <div className="w-[22px] h-[22px] rounded-md bg-accent-violet-light flex items-center justify-center">
                    <Plus size={11} className="text-accent-violet-text" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-3.5 py-2.5 shrink-0">
          <AddBar placeholder="Ajouter un article vite fait…" />
        </div>

        <div className="px-3.5 pt-1 pb-7 shrink-0">
          <button
            onClick={allDone ? onSwitch : undefined}
            disabled={!allDone}
            className={`w-full py-3.5 rounded-2xl border-0 text-[15px] font-bold font-poppins transition-all duration-300 ${
              allDone
                ? 'bg-success text-white cursor-pointer'
                : 'bg-[#EEEDF0] text-text-tertiary cursor-default'
            }`}
            style={allDone ? { boxShadow: '0 4px 20px hsl(var(--success) / 0.27)' } : undefined}
          >
            {allDone
              ? 'Terminer les courses ✓'
              : `Encore ${total - checked} article${total - checked > 1 ? 's' : ''} à cocher`}
          </button>
        </div>
      </main>
    </>
  );
}
