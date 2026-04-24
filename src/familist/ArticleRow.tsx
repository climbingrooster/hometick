import { useState } from 'react';
import { MoreVertical, Pin } from 'lucide-react';
import { CAT_META, CAT_ORDER, type Item } from './types';
import { ColorDot, InlineEdit } from './atoms';
import { ActionOverlay } from './ActionOverlay';

type Props = {
  item: Item;
  onTap: (item: Item) => void;
  onUpdate: (item: Item) => void;
  onDelete: (id: number) => void;
  mobile?: boolean;
};

export function ArticleRow({ item, onTap, onUpdate, onDelete, mobile = false }: Props) {
  const [showActions, setShowActions] = useState(false);
  const [editName, setEditName] = useState(false);
  const [editLabel, setEditLabel] = useState(false);
  const meta = CAT_META[item.cat];

  const cycleCategory = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = CAT_ORDER[(CAT_ORDER.indexOf(item.cat) + 1) % CAT_ORDER.length];
    onUpdate({ ...item, cat: next });
  };

  const hoverProps = mobile
    ? {}
    : {
        onMouseEnter: () => {
          if (!editName && !editLabel) setShowActions(true);
        },
        onMouseLeave: () => setShowActions(false),
      };

  const handleRowClick = () => {
    if (editName || editLabel) return;
    if (mobile && showActions) {
      setShowActions(false);
      return;
    }
    onTap(item);
  };

  return (
    <div className="relative" {...hoverProps}>
      <div
        onClick={handleRowClick}
        className={`flex items-center gap-2.5 px-3.5 py-[11px] border-b border-border-soft min-h-[52px] cursor-pointer ${
          showActions && !mobile ? 'bg-[#F7F7F5]' : 'bg-transparent'
        }`}
      >
        {/* Color dot */}
        <div onClick={cycleCategory} className="shrink-0 leading-none p-1 -m-1">
          <ColorDot cat={item.cat} size={9} onClick={cycleCategory} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {editName ? (
            <InlineEdit
              value={item.name}
              onSave={(v) => {
                onUpdate({ ...item, name: v });
                setEditName(false);
                setShowActions(false);
              }}
            />
          ) : (
            <div className="text-sm font-medium text-foreground truncate flex items-center gap-1.5">
              <span className="min-w-0 truncate">{item.name}</span>
              {item.isPermanent && <Pin size={11} className={meta.textClass} fill="currentColor" strokeWidth={1.6} />}
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
                  setShowActions(false);
                }}
              />
            ) : (
              item.label && <div className="text-[11px] text-text-secondary truncate">{item.label}</div>
            ))}
        </div>

        {/* Mobile dots */}
        {mobile && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowActions((o) => !o);
            }}
            className={`w-8 h-8 flex items-center justify-center cursor-pointer shrink-0 rounded-lg transition-colors ${
              showActions ? 'bg-accent-violet-light' : 'bg-transparent'
            }`}
          >
            <MoreVertical size={18} className={showActions ? 'text-accent-violet' : 'text-text-tertiary'} />
          </div>
        )}
      </div>

      {showActions && !editName && !editLabel && (
        <ActionOverlay
          item={item}
          onTogglePerm={() => onUpdate({ ...item, isPermanent: !item.isPermanent })}
          onEditName={() => setEditName(true)}
          onEditLabel={() => setEditLabel(true)}
          onDelete={() => onDelete(item.id)}
          bgColor={mobile ? '#FFFFFF' : '#F7F7F5'}
        />
      )}
    </div>
  );
}
