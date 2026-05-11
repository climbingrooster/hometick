import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, GripVertical, Check } from 'lucide-react';
import { PALETTE, tintHex, type CategoryDef, type CategoryRegistry } from './types';

type Props = {
  registry: CategoryRegistry;
  onRename: (catId: string, newLabel: string) => void;
  onRecolor: (catId: string, color: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onClose: () => void;
};

export function CategoryManager({ registry, onRename, onRecolor, onReorder, onClose }: Props) {
  const cats = Object.values(registry).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const [order, setOrder] = useState<string[]>(cats.map((c) => c.id));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [colorPickerId, setColorPickerId] = useState<string | null>(null);
  const editRef = useRef<HTMLInputElement>(null);

  // keep order in sync if registry changes (e.g. new cat added)
  useEffect(() => {
    const regIds = Object.keys(registry);
    setOrder((prev) => {
      const kept = prev.filter((id) => regIds.includes(id));
      const added = regIds.filter((id) => !prev.includes(id));
      return [...kept, ...added];
    });
  }, [registry]);

  useEffect(() => {
    if (editingId) editRef.current?.focus();
  }, [editingId]);

  const startEdit = (cat: CategoryDef) => {
    setEditValue(cat.label);
    setEditingId(cat.id);
    setColorPickerId(null);
  };

  const commitEdit = (catId: string) => {
    const trimmed = editValue.trim();
    if (trimmed) onRename(catId, trimmed);
    setEditingId(null);
  };

  // ── drag-to-reorder ──────────────────────────────────────────────────────
  const dragIdx = useRef<number | null>(null);
  const dragOverIdx = useRef<number | null>(null);

  const handleDragStart = (idx: number) => { dragIdx.current = idx; };
  const handleDragEnter = (idx: number) => { dragOverIdx.current = idx; };
  const handleDragEnd = () => {
    if (dragIdx.current === null || dragOverIdx.current === null) return;
    if (dragIdx.current === dragOverIdx.current) { dragIdx.current = null; dragOverIdx.current = null; return; }
    const next = [...order];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(dragOverIdx.current, 0, moved);
    setOrder(next);
    onReorder(next);
    dragIdx.current = null;
    dragOverIdx.current = null;
  };

  const orderedCats = order.map((id) => registry[id]).filter(Boolean);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header
        className="bg-surface px-[18px] pt-2.5 pb-3.5 border-b border-border-soft shrink-0 sticky top-0 z-10"
        style={{ paddingTop: 'max(10px, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-transparent border-0 cursor-pointer hover-hover:hover:bg-[#F2F2EF]"
            aria-label="Retour"
          >
            <ArrowLeft size={18} className="text-foreground" strokeWidth={2} />
          </button>
          <div>
            <div className="text-[10px] text-text-secondary font-medium uppercase tracking-[0.05em]">Gérer</div>
            <h1 className="text-xl font-bold text-foreground mt-px">Catégories</h1>
          </div>
        </div>
        <p className="text-[11px] text-text-secondary mt-2">
          Touche un nom pour le modifier · Touche la pastille pour changer la couleur · Glisse pour réordonner
        </p>
      </header>

      {/* List */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-3.5 mt-3 rounded-2xl overflow-hidden border border-border-soft bg-surface">
          {orderedCats.map((cat, idx) => (
            <div
              key={cat.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragEnter={() => handleDragEnter(idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="flex items-center gap-3 px-3.5 py-[11px] border-b border-border-soft last:border-b-0 bg-surface"
            >
              {/* Drag handle */}
              <GripVertical size={16} className="text-[#C8C8D0] shrink-0 cursor-grab" strokeWidth={1.8} />

              {/* Color dot — tap to open color picker */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setColorPickerId(colorPickerId === cat.id ? null : cat.id)}
                  className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center cursor-pointer"
                  style={{ background: cat.color, boxShadow: '0 0 0 1.5px ' + cat.color + '60' }}
                  aria-label="Changer la couleur"
                />
                {colorPickerId === cat.id && (
                  <ColorPickerPopover
                    current={cat.color}
                    onPick={(color) => { onRecolor(cat.id, color); setColorPickerId(null); }}
                    onClose={() => setColorPickerId(null)}
                  />
                )}
              </div>

              {/* Name — tap to edit */}
              <div className="flex-1 min-w-0">
                {editingId === cat.id ? (
                  <input
                    ref={editRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => commitEdit(cat.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit(cat.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="w-full bg-transparent border-0 border-b-[1.5px] outline-none text-sm font-semibold font-poppins py-[1px]"
                    style={{ color: cat.color, borderColor: cat.color }}
                  />
                ) : (
                  <span
                    onClick={() => startEdit(cat)}
                    className="text-sm font-semibold cursor-pointer font-poppins"
                    style={{ color: cat.color }}
                  >
                    {cat.label}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="h-10" />
      </main>
    </div>
  );
}

// ── ColorPickerPopover ────────────────────────────────────────────────────────
function ColorPickerPopover({
  current, onPick, onClose,
}: { current: string; onPick: (color: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    document.addEventListener('pointerdown', h);
    return () => document.removeEventListener('pointerdown', h);
  }, [onClose]);

  return (
    <div
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      className="absolute left-0 top-full mt-2 bg-surface border border-border-soft rounded-xl p-2.5 z-50 shadow-lg"
      style={{ width: 168 }}
    >
      <div className="grid grid-cols-5 gap-1.5">
        {PALETTE.map((p) => {
          const active = p.color === current;
          return (
            <button
              key={p.color}
              onClick={() => onPick(p.color)}
              title={p.name}
              aria-label={p.name}
              className={`w-7 h-7 rounded-full cursor-pointer flex items-center justify-center border-2 ${active ? 'border-foreground' : 'border-transparent'}`}
              style={{ background: p.color }}
            >
              {active && <Check size={12} className="text-white" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
