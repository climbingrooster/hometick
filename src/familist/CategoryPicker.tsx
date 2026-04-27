import { useEffect, useRef, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { PALETTE, getCatDef, type Category, type CategoryDef, type CategoryRegistry } from './types';

type Props = {
  registry: CategoryRegistry;
  current: Category;
  onPick: (cat: Category) => void;
  onCreate: (def: CategoryDef) => void;
  onClose: () => void;
};

export function CategoryPicker({ registry, current, onPick, onCreate, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [colorIdx, setColorIdx] = useState(5); // default violet
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  const cats = Object.values(registry);

  const submitCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const c = PALETTE[colorIdx];
    const def: CategoryDef = {
      id: `c-${Date.now()}`,
      label: trimmed,
      hsl: c.hsl,
      hslBg: c.hslBg,
    };
    onCreate(def);
    setCreating(false);
    setName('');
  };

  return (
    <div
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      className="absolute left-0 top-full mt-1 bg-surface border border-border-soft rounded-xl py-1 min-w-[210px] z-40 shadow-lg"
    >
      {!creating ? (
        <>
          <div className="px-3 pt-1.5 pb-1 text-[9px] font-bold uppercase tracking-[0.06em] text-text-tertiary">
            Catégorie
          </div>
          {cats.map((c) => {
            const active = c.id === current;
            return (
              <button
                key={c.id}
                onClick={() => { onPick(c.id); onClose(); }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 cursor-pointer bg-transparent border-0 text-left hover:bg-[#F7F7F5]"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: `hsl(${c.hsl})` }}
                />
                <span className="flex-1 text-[13px] text-foreground font-poppins truncate">{c.label}</span>
                {active && <Check size={13} className="text-accent-violet shrink-0" strokeWidth={2.5} />}
              </button>
            );
          })}
          <div className="my-1 h-px bg-border-soft" />
          <button
            onClick={() => setCreating(true)}
            className="w-full flex items-center gap-2 px-3 py-1.5 cursor-pointer bg-transparent border-0 text-left hover:bg-accent-violet-light"
          >
            <Plus size={13} className="text-accent-violet" strokeWidth={2.5} />
            <span className="text-[13px] text-accent-violet-text font-semibold font-poppins">Nouvelle catégorie</span>
          </button>
        </>
      ) : (
        <div className="px-3 py-2 w-[230px]">
          <div className="text-[9px] font-bold uppercase tracking-[0.06em] text-text-tertiary mb-1.5">
            Nouvelle catégorie
          </div>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitCreate();
              if (e.key === 'Escape') { setCreating(false); setName(''); }
            }}
            placeholder="Nom de la catégorie"
            className="w-full bg-transparent border-0 border-b-[1.5px] border-accent-violet outline-none text-[13px] text-foreground font-poppins py-1 placeholder:text-text-tertiary"
          />
          <div className="text-[9px] font-bold uppercase tracking-[0.06em] text-text-tertiary mt-2.5 mb-1.5">
            Couleur
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {PALETTE.map((c, i) => {
              const active = i === colorIdx;
              return (
                <button
                  key={i}
                  onClick={() => setColorIdx(i)}
                  title={c.name}
                  aria-label={c.name}
                  className={`w-7 h-7 rounded-full cursor-pointer flex items-center justify-center border-2 ${
                    active ? 'border-foreground' : 'border-transparent'
                  }`}
                  style={{ background: `hsl(${c.hsl})` }}
                >
                  {active && <Check size={12} className="text-white" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <button
              onClick={() => { setCreating(false); setName(''); }}
              className="flex-1 text-[12px] text-text-secondary py-1.5 rounded-lg cursor-pointer bg-transparent border-0 font-poppins hover:bg-[#F2F2EF]"
            >
              Annuler
            </button>
            <button
              onClick={submitCreate}
              disabled={!name.trim()}
              className="flex-1 text-[12px] text-white py-1.5 rounded-lg cursor-pointer border-0 font-semibold font-poppins disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: `hsl(${PALETTE[colorIdx].hsl})` }}
            >
              Créer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export helper for caller convenience
export { getCatDef };
