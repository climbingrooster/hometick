import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, Pencil, CheckSquare, Layers } from 'lucide-react';
import { AddBar, GroupHeader, ReservoirSection, InlineEdit } from './atoms';
import { ArticleRow } from './ArticleRow';
import { DropdownPortal, useDropdownPortal } from './DropdownPortal';
import type { useHometick } from './hooks/useHometick';

type Props = {
  f: ReturnType<typeof useHometick>;
  onSwitchToAction: () => void;
  onOpenCategories: () => void;
  onSignOut: () => void;
};

export function ModeNormal({ f, onSwitchToAction, onOpenCategories, onSignOut }: Props) {
  const menu = useDropdownPortal();
  const [editingTitle, setEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);

  // Sort categories by sortOrder from registry
  const cats = [...new Set(f.items.map((i) => i.cat))].sort(
    (a, b) => (f.registry[a]?.sortOrder ?? 999) - (f.registry[b]?.sortOrder ?? 999)
  );
  const remaining = f.items.length;

  return (
    <>
      <header
        className="bg-surface px-[18px] pt-2.5 pb-3.5 border-b border-border-soft shrink-0 sticky top-0 z-10"
        style={{ paddingTop: 'max(10px, env(safe-area-inset-top))' }}
      >
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex-1 min-w-0 mr-2">
            <div className="text-[10px] text-text-secondary font-medium uppercase tracking-[0.05em]">Ma liste</div>
            {editingTitle ? (
              <InlineEdit
                value={f.listTitle}
                onSave={(v) => { f.setListTitle(v || 'Liste de courses'); setEditingTitle(false); }}
              />
            ) : (
              <h1 className="text-xl font-bold text-foreground mt-px truncate">{f.listTitle}</h1>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* "..." config menu */}
            <button
              ref={menu.btnRef}
              onClick={(e) => { e.stopPropagation(); menu.isOpen ? menu.close() : menu.openAt(); }}
              aria-label="Options de la liste"
              className={`w-8 h-8 flex items-center justify-center rounded-lg border-0 cursor-pointer ${menu.isOpen ? 'bg-accent-violet-light' : 'bg-transparent hover-hover:hover:bg-[#F2F2EF]'}`}
            >
              <MoreHorizontal size={18} className={menu.isOpen ? 'text-accent-violet' : 'text-text-tertiary'} />
            </button>
            {/* Mode Action button */}
            <button
              onClick={onSwitchToAction}
              className="px-3 py-[6px] rounded-xl text-[11px] font-semibold border-0 cursor-pointer bg-accent-violet text-white shrink-0"
            >
              Mode Action →
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-text-secondary">
            {remaining} article{remaining !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onSignOut}
            className="ml-auto text-[11px] text-text-secondary cursor-pointer bg-transparent border-0 hover-hover:hover:text-foreground"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Item list — no overflow-hidden so dropdown portals display correctly */}
        <div className="mx-3.5 mt-3 rounded-2xl border border-border-soft bg-surface shrink-0">
          {f.loading ? (
            <div className="px-5 py-7 text-center text-text-secondary text-xs">Chargement…</div>
          ) : cats.length === 0 ? (
            <div className="px-5 py-7 text-center text-text-secondary text-xs">
              <div className="text-2xl mb-2">🛒</div>
              <div className="font-semibold text-foreground mb-1">Liste vide</div>
              <div>Tape un article ci-dessous pour commencer</div>
            </div>
          ) : (
            cats.map((cat) => (
              <div key={cat}>
                <GroupHeader
                  cat={cat}
                  registry={f.registry}
                  onRename={(newLabel) => f.renameCategory(cat, newLabel)}
                  info={`${f.items.filter((i) => i.cat === cat).length}`}
                />
                {f.items
                  .filter((i) => i.cat === cat)
                  .map((item) => (
                    <ArticleRow
                      key={item.id}
                      item={item}
                      onTap={f.tapItem}
                      onUpdate={f.updateItem}
                      onDelete={f.deleteItem}
                      registry={f.registry}
                      onCreateCategory={f.addCategory}
                    />
                  ))}
              </div>
            ))
          )}
        </div>

        <div className="px-3.5 py-2.5 shrink-0">
          <AddBar onAdd={f.addItemByName} suggestions={f.suggestions} registry={f.registry} />
        </div>

        <div className="px-3.5 flex flex-col gap-2 shrink-0">
          <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.06em] mb-0.5">
            Ajouter rapidement
          </div>
          <ReservoirSection
            title="Articles permanents"
            items={f.perm}
            showAddAll
            registry={f.registry}
            onAddOne={(item) => f.moveToActive(item.id)}
            onAddAll={f.moveAllPermToActive}
            onUpdate={f.updateReservoirItem}
            onDelete={f.deleteItem}
            onCreateCategory={f.addCategory}
          />
          <ReservoirSection
            title="Articles récents"
            items={f.recent}
            registry={f.registry}
            onAddOne={(item) => f.moveToActive(item.id)}
            onUpdate={f.updateReservoirItem}
            onDelete={f.deleteItem}
            onCreateCategory={f.addCategory}
          />
          <div className="h-20" />
        </div>
      </main>

      {/* Config dropdown */}
      {menu.isOpen && menu.pos && (
        <DropdownPortal pos={menu.pos} onClose={menu.close}>
          <button
            onClick={() => { menu.close(); setEditingTitle(true); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-[10px] cursor-pointer bg-transparent border-0 text-left hover-hover:hover:bg-[#F7F7F5] font-poppins"
          >
            <Pencil size={14} className="text-text-secondary shrink-0" strokeWidth={1.6} />
            <span className="text-[13px] text-foreground">Renommer la liste</span>
          </button>
          <button
            onClick={() => { menu.close(); onOpenCategories(); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-[10px] cursor-pointer bg-transparent border-0 text-left hover-hover:hover:bg-[#F7F7F5] font-poppins"
          >
            <Layers size={14} className="text-text-secondary shrink-0" strokeWidth={1.6} />
            <span className="text-[13px] text-foreground">Gérer les catégories</span>
          </button>
          <div className="h-px bg-border-soft mx-2" />
          <button
            onClick={() => { menu.close(); f.tapAllActive(); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-[10px] cursor-pointer bg-transparent border-0 text-left hover-hover:hover:bg-[#F7F7F5] font-poppins"
          >
            <CheckSquare size={14} className="text-text-secondary shrink-0" strokeWidth={1.6} />
            <span className="text-[13px] text-foreground">Tout cocher (vider la liste)</span>
          </button>
        </DropdownPortal>
      )}
    </>
  );
}
