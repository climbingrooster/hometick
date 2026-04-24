import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { CAT_META, type Category } from './types';

export function ColorDot({ cat, size = 9, onClick }: { cat: Category; size?: number; onClick?: (e: React.MouseEvent) => void }) {
  const meta = CAT_META[cat];
  return (
    <span
      onClick={onClick}
      title={onClick ? 'Toucher pour changer la catégorie' : undefined}
      className={`inline-block rounded-full shrink-0 ${meta.dotClass} ${onClick ? 'cursor-pointer transition-transform hover:scale-150' : ''}`}
      style={{ width: size, height: size }}
    />
  );
}

export function ModeToggle({ mode, onToggle }: { mode: 'normal' | 'courses'; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      className="flex items-center rounded-3xl bg-[#F0F0F0] p-[3px] cursor-pointer select-none shrink-0"
    >
      {(['normal', 'courses'] as const).map((m) => (
        <div
          key={m}
          className={`px-3 py-[5px] rounded-[20px] text-[10px] font-semibold tracking-wide whitespace-nowrap transition-all ${
            mode === m ? 'bg-accent-violet text-white' : 'bg-transparent text-text-secondary'
          }`}
        >
          {m === 'normal' ? 'Normal' : '🛒 Courses'}
        </div>
      ))}
    </div>
  );
}

export function GroupHeader({ cat, info }: { cat: Category; info?: string }) {
  const meta = CAT_META[cat];
  return (
    <div className={`flex items-center gap-2 px-3.5 pt-2 pb-1.5 ${meta.bgClass}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dotClass}`} />
      <span className={`text-[10px] font-bold uppercase tracking-[0.05em] ${meta.textClass}`}>{meta.label}</span>
      {info && <span className={`text-[10px] ml-auto opacity-60 ${meta.textClass}`}>{info}</span>}
    </div>
  );
}

export function InlineEdit({
  value,
  onSave,
  placeholder,
  small,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  small?: boolean;
}) {
  const [v, setV] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);
  const save = () => onSave(v);
  return (
    <input
      ref={ref}
      value={v}
      onChange={(e) => setV(e.target.value)}
      placeholder={placeholder}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') onSave(value);
      }}
      onClick={(e) => e.stopPropagation()}
      className={`w-full bg-transparent border-0 border-b-[1.5px] border-accent-violet outline-none text-foreground font-poppins py-[1px] ${
        small ? 'text-[11px] font-normal' : 'text-sm font-medium'
      }`}
    />
  );
}

export function AddBar({ placeholder = 'Ajouter un article…' }: { placeholder?: string }) {
  const [v, setV] = useState('');
  return (
    <div className="flex items-center gap-2 bg-surface border-[1.5px] border-border-soft rounded-xl px-3.5 py-[9px]">
      <Plus size={14} className="text-text-tertiary shrink-0" />
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-0 outline-none text-[13px] text-foreground font-poppins placeholder:text-text-tertiary"
      />
      {v && (
        <button
          onClick={() => setV('')}
          className="bg-accent-violet text-white border-0 rounded-lg px-[11px] py-1 text-[11px] font-semibold cursor-pointer font-poppins"
        >
          Ajouter
        </button>
      )}
    </div>
  );
}

export function ReservoirSection({
  title,
  items,
  onAddOne,
  onAddAll,
  showAddAll,
}: {
  title: string;
  items: { id: number; name: string; label: string; cat: Category }[];
  onAddOne: (item: { id: number; name: string; label: string; cat: Category }) => void;
  onAddAll?: () => void;
  showAddAll?: boolean;
}) {
  const [open, setOpen] = useState(true);
  if (!items.length) return null;
  return (
    <div className="bg-surface rounded-2xl overflow-hidden border border-border-soft">
      <div
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center px-3.5 py-[11px] cursor-pointer ${open ? 'border-b border-border-soft' : ''}`}
      >
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-foreground">{title}</div>
          <div className="text-[11px] text-text-secondary mt-px">
            {items.length} article{items.length > 1 ? 's' : ''}
          </div>
        </div>
        {showAddAll && open && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddAll?.();
            }}
            className="text-[11px] font-semibold text-accent-violet-text bg-accent-violet-light border-0 rounded-3xl px-[11px] py-1 cursor-pointer mr-2 font-poppins"
          >
            Tout ajouter
          </button>
        )}
        <ChevronDown size={14} className={`text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {open &&
        items.map((item) => (
          <div
            key={item.id}
            onClick={() => onAddOne(item)}
            className="flex items-center gap-2.5 px-3.5 py-[9px] border-b border-border-soft cursor-pointer hover:bg-[#F7F7F5] last:border-b-0"
          >
            <ColorDot cat={item.cat} size={8} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-foreground font-medium truncate">{item.name}</div>
              {item.label && <div className="text-[10px] text-text-secondary">{item.label}</div>}
            </div>
            <div className="w-6 h-6 rounded-[7px] bg-accent-violet-light flex items-center justify-center shrink-0">
              <Plus size={11} className="text-accent-violet-text" />
            </div>
          </div>
        ))}
    </div>
  );
}
