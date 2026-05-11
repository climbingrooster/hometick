import { ChevronDown, Plus } from 'lucide-react';
import { useState } from 'react';
import { AddBar, ColorDot, GroupHeader, ModeToggle } from './atoms';
import { CourseRow } from './CourseRow';
import type { useHometick } from './hooks/useHometick';

export function ModeCourses({ f, onSwitch }: { f: ReturnType<typeof useHometick>; onSwitch: () => void }) {
  const [showPerm, setShowPerm] = useState(false);

  const checked = f.items.filter((i) => i.checked).length;
  const total = f.items.length;
  const allDone = total > 0 && checked === total;
  const cats = [...new Set(f.items.map((i) => i.cat))];

  return (
    <>
      <header
        className="bg-surface px-[18px] pt-2.5 pb-3.5 border-b border-border-soft shrink-0 sticky top-0 z-10"
        style={{ paddingTop: 'max(10px, env(safe-area-inset-top))' }}
      >
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
          <span className={`text-[13px] font-bold whitespace-nowrap transition-colors ${allDone ? 'text-success' : 'text-foreground'}`}>
            {checked} / {total}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto flex flex-col">
        <div className="mx-3.5 mt-2.5 rounded-2xl overflow-hidden border border-border-soft bg-surface shrink-0">
          {cats.map((cat) => {
            const catItems = f.items.filter((i) => i.cat === cat);
            const doneCnt = catItems.filter((i) => i.checked).length;
            return (
              <div key={cat}>
                <GroupHeader cat={cat} registry={f.registry} info={`${doneCnt}/${catItems.length}`} />
                {catItems.map((item) => (
                  <CourseRow
                    key={item.id}
                    item={item}
                    registry={f.registry}
                    onToggle={f.toggleChecked}
                    onUpdate={f.updateItem}
                    onDelete={f.deleteItem}
                  />
                ))}
              </div>
            );
          })}
        </div>

        {f.perm.length > 0 && (
          <div className="mx-3.5 mt-2.5 shrink-0">
            <div
              onClick={() => setShowPerm((o) => !o)}
              className={`bg-surface border border-border-soft px-3.5 py-[11px] flex items-center gap-2 cursor-pointer ${showPerm ? 'rounded-t-xl' : 'rounded-xl'}`}
            >
              <span className="text-xs font-semibold text-text-secondary flex-1">
                Permanents non ajoutés ({f.perm.length})
              </span>
              <ChevronDown size={14} className={`text-text-secondary transition-transform ${showPerm ? 'rotate-180' : ''}`} />
            </div>
            {showPerm && (
              <div className="bg-surface border border-border-soft border-t-0 rounded-b-xl">
                {f.perm.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => f.moveToActive(item.id)}
                    className="flex items-center gap-2.5 px-3.5 py-[9px] border-t border-border-soft cursor-pointer hover-hover:hover:bg-[#F7F7F5]"
                  >
                    <ColorDot cat={item.cat} size={8} registry={f.registry} />
                    <span className="flex-1 text-[13px] text-foreground">{item.name}</span>
                    <div className="w-[26px] h-[26px] rounded-md bg-accent-violet-light flex items-center justify-center">
                      <Plus size={12} className="text-accent-violet-text" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="px-3.5 py-2.5 shrink-0">
          <AddBar
            placeholder="Ajouter un article vite fait…"
            onAdd={f.addItemByName}
            suggestions={f.suggestions}
            registry={f.registry}
          />
        </div>

        <div className="px-3.5 pt-1 pb-7 shrink-0" style={{ paddingBottom: 'max(28px, env(safe-area-inset-bottom))' }}>
          <button
            onClick={allDone ? onSwitch : undefined}
            disabled={!allDone}
            className={`w-full py-3.5 rounded-2xl border-0 text-[15px] font-bold font-poppins transition-all duration-300 ${
              allDone ? 'bg-success text-white cursor-pointer' : 'bg-[#EEEDF0] text-text-tertiary cursor-default'
            }`}
            style={allDone ? { boxShadow: '0 4px 20px hsl(var(--success) / 0.27)' } : undefined}
          >
            {allDone
              ? 'Terminer les courses ✓'
              : total === 0
                ? 'Aucun article à cocher'
                : `Encore ${total - checked} article${total - checked > 1 ? 's' : ''} à cocher`}
          </button>
        </div>
      </main>
    </>
  );
}
