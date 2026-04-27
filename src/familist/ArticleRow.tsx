import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, Pencil, Pin, Trash2 } from 'lucide-react';
import type { Item, CategoryRegistry, CategoryDef, Category } from './types';
import { ColorDot, InlineEdit } from './atoms';
import { CategoryPicker } from './CategoryPicker';

type Props = {
  item: Item;
  onTap: (item: Item) => void;
  onUpdate: (item: Item) => void;
  onDelete: (id: number) => void;
  registry: CategoryRegistry;
  onCreateCategory: (def: CategoryDef) => void;
  mobile?: boolean;
};

export function ArticleRow({ item, onTap, onUpdate, onDelete, registry, onCreateCategory }: Props) {
  const [editName, setEditName] = useState(false);
  const [editLabel, setEditLabel] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const editing = editName || editLabel;

  const handleRowClick = () => {
    if (editing || menuOpen || pickerOpen) return;
    onTap(item);
  };

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({ ...item, isPermanent: !item.isPermanent });
  };

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(true);
  };

  const openPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPickerOpen((o) => !o);
  };

  const pickCat = (newCat: Category) => {
    if (newCat !== item.cat) onUpdate({ ...item, cat: newCat });
  };

  const handleCreateCategory = (def: CategoryDef) => {
    onCreateCategory(def);
    onUpdate({ ...item, cat: def.id });
    setPickerOpen(false);
  };

  return (
    <div className="relative">
      <div
        onClick={handleRowClick}
        className="flex items-center gap-2.5 px-3.5 py-[11px] border-b border-border-soft min-h-[52px] cursor-pointer bg-transparent"
      >
        {/* Color dot — tap opens category picker */}
        <div className="relative shrink-0">
          <button
            onClick={openPicker}
            aria-label="Changer la catégorie"
            title="Changer la catégorie"
            className="bg-transparent border-0 p-1 -m-1 cursor-pointer leading-none"
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
        <div className="flex-1 min-w-0 overflow-hidden">
          {editName ? (
            <InlineEdit
              value={item.name}
              onSave={(v) => {
                onUpdate({ ...item, name: v });
                setEditName(false);
                setEditLabel(true);
              }}
            />
          ) : (
            <div className="text-sm font-medium text-foreground truncate flex items-center gap-1.5">
              <span className="min-w-0 truncate">{item.name}</span>
              <button
                onClick={togglePin}
                title={item.isPermanent ? 'Retirer des permanents' : 'Marquer comme permanent'}
                className="bg-transparent border-0 p-0 cursor-pointer flex items-center justify-center shrink-0"
                aria-label="pin"
              >
                <Pin
                  size={14}
                  className={item.isPermanent ? 'text-[#4B4B5A]' : 'text-[#9A9AA8]'}
                  fill={item.isPermanent ? 'currentColor' : 'none'}
                  strokeWidth={1.6}
                />
              </button>
              {item.addedBy && <span className="text-[10px] text-text-tertiary shrink-0">· {item.addedBy}</span>}
            </div>
          )}
          {!editName &&
            (editLabel ? (
              <InlineEdit
                value={item.label}
                placeholder="Label ou quantité…"
                small
                onSave={(v) => {
                  onUpdate({ ...item, label: v });
                  setEditLabel(false);
                }}
              />
            ) : (
              item.label && <div className="text-[11px] text-text-secondary truncate">{item.label}</div>
            ))}
        </div>

        {/* Inline action icons */}
        {!editing && (
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={startEdit}
              title="Modifier"
              aria-label="Modifier"
              className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-lg bg-transparent border-0 hover:bg-[#F2F2EF]"
            >
              <Pencil size={14} className="text-[#666]" strokeWidth={1.6} />
            </button>
            <div ref={menuRef} className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
                title="Plus"
                aria-label="Plus"
                className={`w-8 h-8 flex items-center justify-center cursor-pointer rounded-lg border-0 ${
                  menuOpen ? 'bg-accent-violet-light' : 'bg-transparent hover:bg-[#F2F2EF]'
                }`}
              >
                <MoreHorizontal size={16} className={menuOpen ? 'text-accent-violet' : 'text-text-tertiary'} />
              </button>
              {menuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1 bg-surface border border-border-soft rounded-xl py-1 min-w-[180px] z-30 shadow-lg"
                >
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(item.id); }}
                    className="w-full flex items-center gap-2 px-3 py-2 cursor-pointer bg-transparent border-0 text-left hover:bg-[#FEF0F3] font-poppins"
                  >
                    <Trash2 size={14} className="text-[#F07090]" strokeWidth={1.6} />
                    <span className="text-[13px] text-foreground">Retirer de la liste</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
