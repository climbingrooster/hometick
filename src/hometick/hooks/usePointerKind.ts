import { useEffect, useState } from 'react';

/**
 * Detect whether the primary input is a mouse (hover: hover + pointer: fine)
 * or a touch device. Used to swap interaction patterns:
 *  - mouse: hover-revealed icons, hover backgrounds
 *  - touch: always-visible larger tap targets, no hover backgrounds
 */
export function usePointerKind(): 'mouse' | 'touch' {
  const get = () => {
    if (typeof window === 'undefined') return 'mouse';
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches
      ? 'mouse'
      : 'touch';
  };
  const [kind, setKind] = useState<'mouse' | 'touch'>(get);
  useEffect(() => {
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
    const onChange = () => setKind(mql.matches ? 'mouse' : 'touch');
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);
  return kind;
}

export const useIsTouch = () => usePointerKind() === 'touch';
