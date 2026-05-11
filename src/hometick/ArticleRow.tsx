import { useState } from 'react';
import { Pencil, Pin, Trash2, MoreHorizontal } from 'lucide-react';
import type { Item, CategoryRegistry, Category } from './types';
import { ColorDot, InlineEdit } from './atoms';
import { CategoryPicker } from './CategoryPicker';
import { useIsTouch } from './hooks/usePointerKind';
import { useDropdownPortal, DropdownPortal } from './DropdownPortal';

type Props = {
  item: Item;
  onTap: (item: Item) => void;
  onUpdate: (item: Item) => void;
  onDelete: (id: string) => void;
  registry: CategoryRegistry;
  onCreateCategory: (def: { label: string; color: string }) => Promise<string | null>;
};

export function ArticleRow({ item, onTap, onUpdate, onDelete, registry, onCreateCategory }: Props) {
  const [editName, setEditName] = useState(false);
  const [editLabel, setEditLabel] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const isTouch = useIsTouch();
  const menu = useDropdownPortal();

  const editing = editName || editLabel;

  const handleRowClick = () => {
    if (editing || menu.isOpen || pickerOpen) return;
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

  const handleCreateCategory = async (def: { label: string; color: string }) => {
    const newId = await onCreateCategory(def);
    if (newId) onUpdate({ ...item, cat: newId });
    setPickerOpen(false);
  };

  const iconBtnSize = isTouch ? 'w-10 h-10' : 'w-8 h-8';

  return (
    <div className="relative">
      <div
        onClick={handleRowClick}
        className="flex items-start gap-2.5 px-3.5 py-[11px] border-b border-border-soft min-h-[52px] cursor-pointer bg-transparent hover-hover:hover:bg-[#FAFAF8]"
      >
        {/* Color dot */}
        <div className="relative shrink-0 mt-[3px]">
          <button
            onClick={openPicker}
            aria-label="Changer la catégorie"
            className="bg-transparent border-0 p-2 -m-2 cursor-pointer leading-none"
          >
            <ColorDot cat={item.cat} size={11} registry={registry} />
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

        {/* Content — wraps naturally, no truncate */}
        <div className="flex-1 min-w-0">
          {editName ? (
            <InlineEdit
              value={item.name}
              onSave={(v) => { onUpdate({ ...item, name: v }); setEditName(false); setEditLabel(true); }}
            />
          ) : (
            <div className="text-sm font-medium text-foreground flex items-start gap-1.5">
              <span className="break-words">{item.name}</span>
              <button
                onClick={togglePin}
                title={item.isPermanent ? 'Retirer des permanents' : 'Marquer comme permanent'}
                className="bg-transparent border-0 p-0 cursor-pointer flex items-center justify-center shrink-0 mt-[2px]"
                aria-label="pin"
              >
                <Pin
                  size={13}
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
            item.label && <div className="text-[11px] text-text-secondary mt-0.5">{item.label}</div>
          ))}
        </div>

        {/* Action icons */}
        {!editing && (
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={startEdit}
              title="Modifier"
              aria-label="Modifier"
              className={`${iconBtnSize} flex items-center justify-center cursor-pointer rounded-lg bg-transparent border-0 hover-hover:hover:bg-[#F2F2EF]`}
            >
              <Pencil size={isTouch ? 16 : 14} className="text-[#888]" strokeWidth={1.6} />
            </button>
            <button
              ref={menu.btnRef}
              onClick={(e) => { e.stopPropagation(); menu.isOpen ? menu.close() : menu.openAt(); }}
              title="Plus"
              aria-label="Plus"
              className={`${iconBtnSize} flex items-center justify-center cursor-pointer rounded-lg border-0 ${menu.isOpen ? 'bg-accent-violet-light' : 'bg-transparent hover-hover:hover:bg-[#F2F2EF]'}`}
            >
              <MoreHorizontal size={isTouch ? 18 : 16} className={menu.isOpen ? 'text-accent-violet' : 'text-text-tertiary'} />
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
            <span className="text-[13px] text-foreground">Retirer de la liste</span>
          </button>
        </DropdownPortal>
      )}
    </div>
  );
}
