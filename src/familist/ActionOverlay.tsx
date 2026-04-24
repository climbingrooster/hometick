import { Pin, Pencil, Tag, Trash2 } from 'lucide-react';
import { CAT_META, type Item } from './types';

type Props = {
  item: Item;
  onTogglePerm: () => void;
  onEditName: () => void;
  onEditLabel: () => void;
  onDelete: () => void;
  bgColor?: string;
};

export function ActionOverlay({ item, onTogglePerm, onEditName, onEditLabel, onDelete, bgColor = '#F7F7F5' }: Props) {
  const meta = CAT_META[item.cat];
  const Btn = ({
    children,
    onClick,
    bg,
    title,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    bg?: string;
    title: string;
  }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      className="flex items-center justify-center w-9 h-9 rounded-[10px] border-0 cursor-pointer shrink-0 transition-opacity"
      style={{ background: bg ?? 'rgba(240,240,240,0.95)' }}
    >
      {children}
    </button>
  );

  return (
    <div
      className="absolute inset-y-0 right-0 flex items-center pr-2.5 gap-1 z-20"
      style={{ background: `linear-gradient(to right, transparent 0%, ${bgColor} 32%)` }}
      onClick={(e) => e.stopPropagation()}
    >
      <Btn
        title={item.isPermanent ? 'Retirer des permanents' : 'Marquer comme permanent'}
        onClick={onTogglePerm}
        bg={item.isPermanent ? `hsl(var(${cssVarBgFor(item.cat)}))` : 'rgba(245,243,255,0.95)'}
      >
        <Pin
          size={14}
          className={item.isPermanent ? meta.textClass : 'text-accent-violet-text'}
          fill={item.isPermanent ? 'currentColor' : 'none'}
          strokeWidth={1.6}
        />
      </Btn>
      <Btn title="Modifier le nom" onClick={onEditName}>
        <Pencil size={14} className="text-[#666]" strokeWidth={1.6} />
      </Btn>
      <Btn title="Modifier le label" onClick={onEditLabel}>
        <Tag size={14} className="text-[#666]" strokeWidth={1.6} />
      </Btn>
      <Btn title="Supprimer" onClick={onDelete} bg="rgba(254,240,243,0.95)">
        <Trash2 size={14} className="text-[#F07090]" strokeWidth={1.6} />
      </Btn>
    </div>
  );
}

function cssVarBgFor(cat: Item['cat']) {
  return `--cat-${cat}-bg`;
}
