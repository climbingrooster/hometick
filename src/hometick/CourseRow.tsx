import { useEffect, useRef, useState } from 'react';
import { Check, MoreHorizontal, Pin, Trash2 } from 'lucide-react';
import type { CategoryRegistry, Item } from './types';
import { ColorDot, InlineEdit } from './atoms';
import { useIsTouch } from './hooks/usePointerKind';
import { getCatDef } from './types';

type Props = {
  item: Item;
  registry: CategoryRegistry;
  onToggle: (item: Item) => void;
  onUpdate: (item: Item) => void;
  onDelete: (id: string) => void;
};

export function CourseRow({ item, registry, onToggle, onUpdate, onDelete }: Props) {
  const [editName, setEditName] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();
  const def = getCatDef(registry, item.cat);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', h);
    return () => document.removeEventListener('pointerdown', h);
  }, [menuOpen]);

  const handleRowClick = () => {
    if (editName || menuOpen) return;
    onToggle(item);
  };

  const rowBg = item.checked ? 'bg-[#F5F5F3]' : 'bg-surface';
  const iconBtnSize = isTouch ? 'w-10 h-10' : 'w-8 h-8';

  return (
    <div className="relative">
      <div
        onClick={handleRowClick}
        className={`flex items-center gap-3 px-3.5 py-[13px] border-b border-border-soft cursor-pointer min-h-[56px] transition-colors ${rowBg} hover-hover:hover:brightness-[0.98]`}
      >
        <ColorDot cat={item.cat} size={10} registry={registry} />
        <div className="flex-1 min-w-0">
          {editName ? (
            <InlineEdit
              value={item.name}
              onSave={(v) => { onUpdate({ ...item, name: v }); setEditName(false); }}
            />
          ) : (
            <div
              className={`text-base truncate flex items-center gap-1.5 transition-all ${
                item.checked ? 'font-normal text-text-tertiary line-through' : 'font-medium text-foreground'
              }`}
            >
              <span className="min-w-0 truncate">{item.name}</span>
              {item.isPermanent && !item.checked && (
                <Pin size={11} style={{ color: def.color }} fill="currentColor" strokeWidth={1.6} />
              )}
            </div>
          )}
          {!editName && !item.checked && item.label && (
            <div className="text-xs text-text-secondary mt-0.5 truncate">{item.label}</div>
          )}
        </div>

        {item.checked ? (
          <div className="w-7 h-7 rounded-lg bg-success flex items-center justify-center shrink-0">
            <Check size={15} className="text-white" strokeWidth={3} />
          </div>
        ) : (
          <div ref={menuRef} className="relative shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
              aria-label="Plus"
              className={`${iconBtnSize} flex items-center justify-center cursor-pointer rounded-lg border-0 ${
                menuOpen ? 'bg-accent-violet-light' : 'bg-transparent hover-hover:hover:bg-[#F2F2EF]'
              }`}
            >
              <MoreHorizontal size={isTouch ? 18 : 16} className={menuOpen ? 'text-accent-violet' : 'text-text-tertiary'} />
            </button>
            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1 bg-surface border border-border-soft rounded-xl py-1 min-w-[180px] z-30 shadow-lg"
              >
                <button
                  onClick={() => { setMenuOpen(false); setEditName(true); }}
                  className="w-full px-3 py-2 cursor-pointer bg-transparent border-0 text-left hover-hover:hover:bg-[#F7F7F5] text-[13px] text-foreground font-poppins"
                >
                  Renommer
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onUpdate({ ...item, isPermanent: !item.isPermanent }); }}
                  className="w-full px-3 py-2 cursor-pointer bg-transparent border-0 text-left hover-hover:hover:bg-[#F7F7F5] text-[13px] text-foreground font-poppins"
                >
                  {item.isPermanent ? 'Retirer des permanents' : 'Marquer permanent'}
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(item.id); }}
                  className="w-full flex items-center gap-2 px-3 py-2 cursor-pointer bg-transparent border-0 text-left hover-hover:hover:bg-[#FEF0F3] font-poppins"
                >
                  <Trash2 size={14} className="text-[#F07090]" strokeWidth={1.6} />
                  <span className="text-[13px] text-foreground">Supprimer</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
