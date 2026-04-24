import { useState } from 'react';
import { Check, MoreVertical, Pin } from 'lucide-react';
import { CAT_META, CAT_ORDER, type Item } from './types';
import { ColorDot, InlineEdit } from './atoms';
import { ActionOverlay } from './ActionOverlay';

type Props = {
  item: Item;
  onToggle: (item: Item) => void;
  onUpdate: (item: Item) => void;
  onDelete: (id: number) => void;
  mobile?: boolean;
};

export function CourseRow({ item, onToggle, onUpdate, onDelete, mobile = false }: Props) {
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
          if (!item.checked && !editName && !editLabel) setShowActions(true);
        },
        onMouseLeave: () => setShowActions(false),
      };

  const handleRowClick = () => {
    if (editName || editLabel) return;
    if (mobile && showActions) {
      setShowActions(false);
      return;
    }
    onToggle(item);
  };

  const rowBg = item.checked ? 'bg-[#F5F5F3]' : showActions && !mobile ? 'bg-background' : 'bg-surface';

  return (
    <div className="relative" {...hoverProps}>
      <div
        onClick={handleRowClick}
        className={`flex items-center gap-3 px-3.5 py-[13px] border-b border-border-soft cursor-pointer min-h-[56px] transition-colors ${rowBg}`}
      >
        {/* Color dot */}
        <div onClick={item.checked ? undefined : cycleCategory} className="shrink-0 leading-none p-1 -m-1">
          <ColorDot cat={item.cat} size={10} onClick={item.checked ? undefined : cycleCategory} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
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
            <div
              className={`text-base truncate flex items-center gap-1.5 transition-all ${
                item.checked
                  ? 'font-normal text-text-tertiary line-through'
                  : 'font-medium text-foreground'
              }`}
            >
              <span className="min-w-0 truncate">{item.name}</span>
              {item.isPermanent && !item.checked && (
                <Pin size={11} className={meta.textClass} fill="currentColor" strokeWidth={1.6} />
              )}
              {item.addedBy && !item.checked && (
                <span className="text-[11px] text-text-secondary bg-accent-violet-light rounded-3xl px-2 py-px font-medium shrink-0">
                  {item.addedBy}
                </span>
              )}
            </div>
          )}
          {!editName &&
            !item.checked &&
            (editLabel ? (
              <InlineEdit
                value={item.label}
                placeholder="Label…"
                small
                onSave={(v) => {
                  onUpdate({ ...item, label: v });
                  setEditLabel(false);
                  setShowActions(false);
                }}
              />
            ) : (
              item.label && <div className="text-xs text-text-secondary mt-0.5 truncate">{item.label}</div>
            ))}
        </div>

        {item.checked && (
          <div className="w-6 h-6 rounded-lg bg-success flex items-center justify-center shrink-0">
            <Check size={14} className="text-white" strokeWidth={3} />
          </div>
        )}

        {mobile && !item.checked && (
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

      {showActions && !item.checked && !editName && !editLabel && (
        <ActionOverlay
          item={item}
          onTogglePerm={() => onUpdate({ ...item, isPermanent: !item.isPermanent })}
          onEditName={() => setEditName(true)}
          onEditLabel={() => setEditLabel(true)}
          onDelete={() => onDelete(item.id)}
          bgColor={mobile ? '#FFFFFF' : '#FAFAF8'}
        />
      )}
    </div>
  );
}
