import { AddBar, GroupHeader, ModeToggle, ReservoirSection } from './atoms';
import { ArticleRow } from './ArticleRow';
import type { useFamilist } from './hooks/useFamilist';

export function ModeNormal({ f, onSwitch, onSignOut }: { f: ReturnType<typeof useFamilist>; onSwitch: () => void; onSignOut: () => void }) {

  const cats = [...new Set(f.items.map((i) => i.cat))];
  const remaining = f.items.length;

  return (
    <>
      <header
        className="bg-surface px-[18px] pt-2.5 pb-3.5 border-b border-border-soft shrink-0 sticky top-0 z-10"
        style={{ paddingTop: 'max(10px, env(safe-area-inset-top))' }}
      >
        <div className="flex items-start justify-between mb-2.5">
          <div>
            <div className="text-[10px] text-text-secondary font-medium uppercase tracking-[0.05em]">
              Ma liste
            </div>
            <h1 className="text-xl font-bold text-foreground mt-px">Liste de courses</h1>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle mode="normal" onToggle={onSwitch} />
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
        <div className="mx-3.5 mt-3 rounded-2xl overflow-hidden border border-border-soft bg-surface shrink-0">
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
          />
          <ReservoirSection
            title="Articles récents"
            items={f.recent}
            registry={f.registry}
            onAddOne={(item) => f.moveToActive(item.id)}
          />
          <div className="h-20" />
        </div>
      </main>
    </>
  );
}
