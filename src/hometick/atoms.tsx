import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Pencil, Pin, Plus, Trash2, MoreHorizontal } from 'lucide-react';
import { getCatDef, type Category, type CategoryRegistry, type ReservoirItem } from './types';
import { CategoryPicker } from './CategoryPicker';
import { useIsTouch } from './hooks/usePointerKind';
import { useDropdownPortal, DropdownPortal } from './DropdownPortal';

// ── ColorDot ──────────────────────────────────────────────────────────────────
export function ColorDot({
  cat, size = 9, onClick, registry,
}: {
  cat: Category; size?: number; onClick?: (e: React.MouseEvent) => void; registry?: CategoryRegistry;
}) {
  const def = registry ? getCatDef(registry, cat) : null;
  const style: React.CSSProperties = { width: size, height: size };
  if (def) style.background = def.color;
  return (
    <span
      onClick={onClick}
      className={`inline-block rounded-full shrink-0 ${onClick ? 'cursor-pointer transition-transform hover-hover:hover:scale-150' : ''}`}
      style={style}
    />
  );
}

// ── GroupHeader ───────────────────────────────────────────────────────────────
export function GroupHeader({
  cat, info, label, onRename, registry,
}: {
  cat: Category; info?: string; label?: string;
  onRename?: (newLabel: string) => void; registry?: CategoryRegistry;
}) {
  const def = registry ? getCatDef(registry, cat) : null;
  const display = label ?? def?.label ?? cat;
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [v, setV] = useState(display);

  useEffect(() => { if (editing) { inputRef.current?.focus(); inputRef.current?.select(); } }, [editing]);

  const commit = () => {
    const trimmed = v.trim();
    if (trimmed && trimmed !== display) onRename?.(trimmed);
    setEditing(false);
  };

  const headerStyle: React.CSSProperties = def ? { background: def.bg, color: def.color } : {};
  const dotStyle: React.CSSProperties = def ? { background: def.color } : {};

  return (
    <div className="flex items-center gap-2 px-3.5 pt-2 pb-1.5" style={headerStyle}>
      <span className="w-2 h-2 rounded-full shrink-0" style={dotStyle} />
      {editing && onRename ? (
        <input
          ref={inputRef} value={v} onChange={(e) => setV(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setV(display); setEditing(false); } }}
          className="bg-transparent border-0 border-b-[1.5px] border-current outline-none text-[10px] font-bold uppercase tracking-[0.05em] font-poppins px-0 py-0 min-w-0 flex-1"
          style={{ color: 'inherit' }}
        />
      ) : (
        <span
          onClick={() => { if (onRename) { setV(display); setEditing(true); } }}
          className={`text-[10px] font-bold uppercase tracking-[0.05em] ${onRename ? 'cursor-pointer' : ''}`}
        >
          {display}
        </span>
      )}
      {info && <span className="text-[10px] ml-auto opacity-60">{info}</span>}
    </div>
  );
}

// ── InlineEdit ────────────────────────────────────────────────────────────────
export function InlineEdit({
  value, onSave, placeholder, small,
}: { value: string; onSave: (v: string) => void; placeholder?: string; small?: boolean }) {
  const [v, setV] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  const save = () => onSave(v);
  return (
    <input
      ref={ref} value={v} onChange={(e) => setV(e.target.value)}
      placeholder={placeholder} onBlur={save}
      onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onSave(value); }}
      onClick={(e) => e.stopPropagation()}
      className={`w-full bg-transparent border-0 border-b-[1.5px] border-accent-violet outline-none text-foreground font-poppins py-[1px] ${small ? 'text-[11px] font-normal' : 'text-sm font-medium'}`}
    />
  );
}

// ── Suggestion type ───────────────────────────────────────────────────────────
export type Suggestion = { name: string; label?: string; cat: Category };

// ── AddBar ────────────────────────────────────────────────────────────────────
export function AddBar({
  placeholder = 'Ajouter un article…', onAdd, suggestions = [], registry,
}: {
  placeholder?: string; onAdd?: (name: string, suggestion?: Suggestion) => void;
  suggestions?: Suggestion[]; registry?: CategoryRegistry;
}) {
  const [v, setV] = useState('');
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = v.trim().toLowerCase();
    if (!q) return [];
    return suggestions.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 5);
  }, [v, suggestions]);

  useEffect(() => {
    if (!focused) return;
    const onDoc = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, [focused]);

  const submit = (suggestion?: Suggestion) => {
    const name = (suggestion?.name ?? v).trim();
    if (!name) return;
    onAdd?.(name, suggestion);
    setV('');
    setFocused(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className="flex items-center gap-2 bg-accent-violet-light border-[1.5px] border-accent-violet/60 rounded-xl px-3.5 py-[11px] transition-shadow focus-within:border-accent-violet"
        style={{ boxShadow: '0 4px 16px hsl(var(--accent-violet) / 0.18)' }}
      >
        <input
          value={v} onChange={(e) => setV(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (filtered.length > 0) submit(filtered[0]); else submit();
            }
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-0 outline-none text-[13px] text-foreground font-poppins font-medium placeholder:text-accent-violet-text placeholder:font-semibold min-w-0"
        />
        {v && (
          <button
            onClick={() => submit()}
            className="bg-accent-violet text-white border-0 rounded-lg px-[11px] py-1 text-[11px] font-semibold cursor-pointer font-poppins shrink-0"
          >
            Ajouter
          </button>
        )}
      </div>
      {focused && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border-soft rounded-xl overflow-hidden z-40 shadow-lg">
          {filtered.map((s, idx) => (
            <button
              key={`${s.name}-${idx}`}
              onPointerDown={(e) => { e.preventDefault(); submit(s); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-[9px] border-b border-border-soft last:border-b-0 cursor-pointer hover-hover:hover:bg-[#F7F7F5] bg-transparent border-x-0 border-t-0 text-left"
            >
              <ColorDot cat={s.cat} size={8} registry={registry} />
              <span className="flex-1 text-[13px] text-foreground font-medium truncate">{s.name}</span>
              {s.label && <span className="text-[10px] text-text-secondary shrink-0">{s.label}</span>}
              <span className="text-[10px] text-accent-violet-text font-semibold shrink-0">+ Ajouter</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ReservoirRow ──────────────────────────────────────────────────────────────
function ReservoirRow({
  item, registry, onAddOne, onUpdate, onDelete, onCreateCategory,
}: {
  item: ReservoirItem;
  registry: CategoryRegistry;
  onAddOne: (item: ReservoirItem) => void;
  onUpdate: (item: ReservoirItem) => void;
  onDelete: (id: string) => void;
  onCreateCategory: (def: { label: string; color: string }) => Promise<string | null>;
}) {
  const [editName, setEditName] = useState(false);
  const [editLabel, setEditLabel] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const isTouch = useIsTouch();
  const menu = useDropdownPortal();

  const editing = editName || editLabel;
  const iconBtnSize = isTouch ? 'w-10 h-10' : 'w-8 h-8';

  const handleRowClick = () => {
    if (editing || menu.isOpen || pickerOpen) return;
    onAddOne(item);
  };

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({ ...item, isPermanent: !item.isPermanent });
  };

  const pickCat = (newCat: Category) => {
    if (newCat !== item.cat) onUpdate({ ...item, cat: newCat });
  };

  const handleCreateCategory = async (def: { label: string; color: string }) => {
    const newId = await onCreateCategory(def);
    if (newId) onUpdate({ ...item, cat: newId });
    setPickerOpen(false);
  };

  return (
    <div className="relative">
      <div
        onClick={handleRowClick}
        className="flex items-start gap-2.5 px-3.5 py-[9px] border-b border-border-soft cursor-pointer hover-hover:hover:bg-[#F7F7F5] last:border-b-0"
      >
        {/* Color dot */}
        <div className="relative shrink-0 mt-[3px]">
          <button
            onClick={(e) => { e.stopPropagation(); setPickerOpen((o) => !o); }}
            aria-label="Changer la catégorie"
            className="bg-transparent border-0 p-2 -m-2 cursor-pointer leading-none"
          >
            <ColorDot cat={item.cat} size={9} registry={registry} />
          </button>
          {pickerOpen && (
            <CategoryPicker
              registry={registry}
              current={item.cat}
              onPick={pickCat}
              onCreate={handleCreateCategory}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editName ? (
            <InlineEdit
              value={item.name}
              onSave={(v) => { onUpdate({ ...item, name: v }); setEditName(false); setEditLabel(true); }}
            />
          ) : (
            <div className="text-[13px] text-foreground font-medium flex items-start gap-1.5">
              <span className="break-words">{item.name}</span>
              <button
                onClick={togglePin}
                title={item.isPermanent ? 'Retirer des permanents' : 'Marquer permanent'}
                className="bg-transparent border-0 p-0 cursor-pointer flex items-center justify-center shrink-0 mt-[2px]"
                aria-label="pin"
              >
                <Pin
                  size={12}
                  className={item.isPermanent ? 'text-[#6B6B7A]' : 'text-[#C0C0CC]'}
                  fill={item.isPermanent ? 'currentColor' : 'none'}
                  strokeWidth={1.6}
                />
              </button>
            </div>
          )}
          {!editName && (editLabel ? (
            <InlineEdit
              value={item.label}
              placeholder="Label ou quantité…"
              small
              onSave={(v) => { onUpdate({ ...item, label: v }); setEditLabel(false); }}
            />
          ) : (
            item.label && <div className="text-[10px] text-text-secondary mt-0.5">{item.label}</div>
          ))}
        </div>

        {/* Action icons */}
        {!editing && (
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setEditName(true); }}
              title="Modifier" aria-label="Modifier"
              className={`${iconBtnSize} flex items-center justify-center cursor-pointer rounded-lg bg-transparent border-0 hover-hover:hover:bg-[#F2F2EF]`}
            >
              <Pencil size={isTouch ? 15 : 13} className="text-[#888]" strokeWidth={1.6} />
            </button>
            <button
              ref={menu.btnRef}
              onClick={(e) => { e.stopPropagation(); menu.isOpen ? menu.close() : menu.openAt(); }}
              title="Plus" aria-label="Plus"
              className={`${iconBtnSize} flex items-center justify-center cursor-pointer rounded-lg border-0 ${menu.isOpen ? 'bg-accent-violet-light' : 'bg-transparent hover-hover:hover:bg-[#F2F2EF]'}`}
            >
              <MoreHorizontal size={isTouch ? 17 : 15} className={menu.isOpen ? 'text-accent-violet' : 'text-text-tertiary'} />
            </button>
          </div>
        )}
      </div>

      {menu.isOpen && menu.pos && (
        <DropdownPortal pos={menu.pos} onClose={menu.close}>
          <button
            onClick={() => { menu.close(); onDelete(item.id); }}
            className="w-full flex items-center gap-2 px-3 py-2 cursor-pointer bg-transparent border-0 text-left hover-hover:hover:bg-[#FEF0F3] font-poppins"
          >
            <Trash2 size={14} className="text-[#F07090]" strokeWidth={1.6} />
            <span className="text-[13px] text-foreground">Supprimer</span>
          </button>
        </DropdownPortal>
      )}
    </div>
  );
}

// ── ReservoirSection ──────────────────────────────────────────────────────────
export function ReservoirSection({
  title, items, onAddOne, onAddAll, showAddAll, registry, onUpdate, onDelete, onCreateCategory,
}: {
  title: string;
  items: ReservoirItem[];
  onAddOne: (item: ReservoirItem) => void;
  onAddAll?: () => void;
  showAddAll?: boolean;
  registry: CategoryRegistry;
  onUpdate: (item: ReservoirItem) => void;
  onDelete: (id: string) => void;
  onCreateCategory: (def: { label: string; color: string }) => Promise<string | null>;
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
          <div className="text-[11px] text-text-secondary mt-px">{items.length} article{items.length > 1 ? 's' : ''}</div>
        </div>
        {showAddAll && open && (
          <button
            onClick={(e) => { e.stopPropagation(); onAddAll?.(); }}
            className="text-[11px] font-semibold text-accent-violet-text bg-accent-violet-light border-0 rounded-3xl px-[11px] py-1 cursor-pointer mr-2 font-poppins"
          >
            Tout ajouter
          </button>
        )}
        <ChevronDown size={14} className={`text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && items.map((item) => (
        <ReservoirRow
          key={item.id}
          item={item}
          registry={registry}
          onAddOne={onAddOne}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onCreateCategory={onCreateCategory}
        />
      ))}
    </div>
  );
}

// ── ActionButton (mode toggle) ────────────────────────────────────────────────
export function ActionButton({ mode, onToggle }: { mode: 'normal' | 'action'; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`px-3 py-[6px] rounded-xl text-[11px] font-semibold border-0 cursor-pointer transition-all shrink-0 ${
        mode === 'normal'
          ? 'bg-accent-violet text-white'
          : 'bg-[#F0F0F0] text-text-secondary'
      }`}
    >
      {mode === 'normal' ? 'Mode Action →' : '← Retour'}
    </button>
  );
}

// ── ListMenuButton ────────────────────────────────────────────────────────────
export function ListMenuButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="w-full flex items-center gap-2.5 px-3.5 py-[10px] cursor-pointer bg-transparent border-0 text-left hover-hover:hover:bg-[#F7F7F5] font-poppins">
      {children}
    </button>
  );
}
