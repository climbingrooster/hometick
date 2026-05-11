import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Pos = { top: number; right: number };

export function useDropdownPortal() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<Pos | null>(null);

  const openAt = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
  };

  const close = () => setPos(null);

  return { btnRef, pos, openAt, close, isOpen: pos !== null };
}

export function DropdownPortal({
  pos,
  onClose,
  children,
}: {
  pos: Pos;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener('pointerdown', h);
    return () => document.removeEventListener('pointerdown', h);
  }, [onClose]);

  return createPortal(
    <div
      ref={containerRef}
      style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white border border-[#E8E8E4] rounded-xl py-1 min-w-[180px] shadow-lg"
    >
      {children}
    </div>,
    document.body
  );
}
