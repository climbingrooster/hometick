import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CategoryDef, CategoryRegistry, Item, ReservoirItem } from '../types';
import { tintHex } from '../types';

type DbCategory = {
  id: string;
  user_id: string;
  key: string;
  label: string;
  color: string;
  is_builtin: boolean;
  sort_order: number;
};
type DbItem = {
  id: string;
  user_id: string;
  name: string;
  label: string;
  category_id: string | null;
  is_active: boolean;
  is_permanent: boolean;
  checked: boolean;
  last_used_at: string;
  sort_order: number;
};
type DbHistory = {
  id: string;
  user_id: string;
  name_lower: string;
  name: string;
  label: string;
  category_id: string | null;
};

function dbCatToDef(c: DbCategory): CategoryDef {
  return {
    id: c.id,
    key: c.key,
    label: c.label,
    color: c.color,
    bg: c.color.startsWith('#') ? tintHex(c.color, 0.14) : c.color,
  };
}

function dbItemToItem(i: DbItem, fallbackCat: string): Item {
  return {
    id: i.id,
    name: i.name,
    label: i.label || '',
    cat: i.category_id ?? fallbackCat,
    checked: i.checked,
    addedBy: null,
    isPermanent: i.is_permanent,
  };
}
function dbItemToReservoir(i: DbItem, fallbackCat: string): ReservoirItem {
  return {
    id: i.id,
    name: i.name,
    label: i.label || '',
    cat: i.category_id ?? fallbackCat,
  };
}

export type HistoryEntry = { name: string; label: string; cat: string };

export function useFamilist(userId: string | null) {
  const [registry, setRegistry] = useState<CategoryRegistry>({});
  const [activeRaw, setActiveRaw] = useState<DbItem[]>([]);
  const [reservoirRaw, setReservoirRaw] = useState<DbItem[]>([]);
  const [history, setHistory] = useState<Record<string, HistoryEntry & { dbId: string; categoryId: string | null }>>({});
  const [loading, setLoading] = useState(true);

  const fallbackCatId = useMemo(() => {
    const list = Object.values(registry);
    const autre = list.find((c) => c.key === 'autre');
    return autre?.id ?? list[0]?.id ?? '';
  }, [registry]);

  // Initial fetch
  useEffect(() => {
    if (!userId) return;
    let active = true;
    setLoading(true);
    (async () => {
      const [cats, items, hist] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('items').select('*').order('created_at'),
        supabase.from('item_history').select('*'),
      ]);
      if (!active) return;
      const reg: CategoryRegistry = {};
      (cats.data as DbCategory[] | null)?.forEach((c) => (reg[c.id] = dbCatToDef(c)));
      setRegistry(reg);
      const allItems = (items.data as DbItem[] | null) ?? [];
      setActiveRaw(allItems.filter((i) => i.is_active));
      setReservoirRaw(allItems.filter((i) => !i.is_active));
      const histMap: typeof history = {};
      (hist.data as DbHistory[] | null)?.forEach((h) => {
        histMap[h.name_lower] = { name: h.name, label: h.label, cat: h.category_id ?? '', dbId: h.id, categoryId: h.category_id };
      });
      setHistory(histMap);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  // Realtime
  useEffect(() => {
    if (!userId) return;
    const ch = supabase
      .channel('familist-' + userId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: `user_id=eq.${userId}` }, (payload) => {
        const newRow = payload.new as DbItem | undefined;
        const oldRow = payload.old as DbItem | undefined;
        if (payload.eventType === 'DELETE' && oldRow) {
          setActiveRaw((p) => p.filter((i) => i.id !== oldRow.id));
          setReservoirRaw((p) => p.filter((i) => i.id !== oldRow.id));
          return;
        }
        if (!newRow) return;
        if (newRow.is_active) {
          setReservoirRaw((p) => p.filter((i) => i.id !== newRow.id));
          setActiveRaw((p) => {
            const without = p.filter((i) => i.id !== newRow.id);
            return [...without, newRow];
          });
        } else {
          setActiveRaw((p) => p.filter((i) => i.id !== newRow.id));
          setReservoirRaw((p) => {
            const without = p.filter((i) => i.id !== newRow.id);
            return [newRow, ...without];
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${userId}` }, (payload) => {
        const newRow = payload.new as DbCategory | undefined;
        const oldRow = payload.old as DbCategory | undefined;
        if (payload.eventType === 'DELETE' && oldRow) {
          setRegistry((r) => {
            const c = { ...r };
            delete c[oldRow.id];
            return c;
          });
          return;
        }
        if (!newRow) return;
        setRegistry((r) => ({ ...r, [newRow.id]: dbCatToDef(newRow) }));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [userId]);

  // Derived
  const items: Item[] = useMemo(
    () => activeRaw.sort((a, b) => a.created_at.localeCompare(b.created_at)).map((i) => dbItemToItem(i, fallbackCatId)),
    [activeRaw, fallbackCatId]
  );
  const perm: ReservoirItem[] = useMemo(
    () => reservoirRaw.filter((i) => i.is_permanent).map((i) => dbItemToReservoir(i, fallbackCatId)),
    [reservoirRaw, fallbackCatId]
  );
  const recent: ReservoirItem[] = useMemo(
    () => reservoirRaw.filter((i) => !i.is_permanent).map((i) => dbItemToReservoir(i, fallbackCatId)),
    [reservoirRaw, fallbackCatId]
  );

  // Mutations — optimistic + DB write
  const updateItem = useCallback(
    async (it: Item) => {
      setActiveRaw((p) => p.map((r) => (r.id === it.id ? { ...r, name: it.name, label: it.label, category_id: it.cat, is_permanent: it.isPermanent, checked: it.checked } : r)));
      await supabase
        .from('items')
        .update({ name: it.name, label: it.label, category_id: it.cat, is_permanent: it.isPermanent, checked: it.checked })
        .eq('id', it.id);
      // also remember in history
      await upsertHistory(userId!, it.name, it.label, it.cat);
    },
    [userId]
  );

  const deleteItem = useCallback(async (id: string) => {
    setActiveRaw((p) => p.filter((i) => i.id !== id));
    setReservoirRaw((p) => p.filter((i) => i.id !== id));
    await supabase.from('items').delete().eq('id', id);
  }, []);

  const tapItem = useCallback(async (it: Item) => {
    // Move from active → reservoir (perm or recent based on flag)
    setActiveRaw((p) => p.filter((i) => i.id !== it.id));
    await supabase
      .from('items')
      .update({ is_active: false, checked: false, last_used_at: new Date().toISOString() })
      .eq('id', it.id);
  }, []);

  const moveToActive = useCallback(async (id: string) => {
    setReservoirRaw((p) => p.filter((i) => i.id !== id));
    await supabase
      .from('items')
      .update({ is_active: true, checked: false })
      .eq('id', id);
  }, []);

  const moveAllPermToActive = useCallback(async () => {
    const ids = reservoirRaw.filter((i) => i.is_permanent).map((i) => i.id);
    if (!ids.length) return;
    setReservoirRaw((p) => p.filter((i) => !ids.includes(i.id)));
    await supabase.from('items').update({ is_active: true, checked: false }).in('id', ids);
  }, [reservoirRaw]);

  async function upsertHistory(uid: string, name: string, label: string, categoryId: string) {
    const key = name.toLowerCase();
    await supabase
      .from('item_history')
      .upsert(
        { user_id: uid, name_lower: key, name, label, category_id: categoryId, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,name_lower' }
      );
    setHistory((h) => ({ ...h, [key]: { name, label, cat: categoryId, dbId: h[key]?.dbId ?? '', categoryId } }));
  }

  const addItemByName = useCallback(
    async (rawName: string, suggestion?: { name: string; label?: string; cat: string }) => {
      const name = rawName.trim();
      if (!name || !userId) return;
      const key = name.toLowerCase();

      // Already in active? do nothing
      if (activeRaw.some((i) => i.name.toLowerCase() === key)) return;

      // In reservoir → reactivate
      const inRes = reservoirRaw.find((i) => i.name.toLowerCase() === key);
      if (inRes) {
        await moveToActive(inRes.id);
        return;
      }

      // Pick category: suggestion → history → fallback
      const past = history[key];
      const categoryId = suggestion?.cat ?? past?.categoryId ?? fallbackCatId;
      const label = suggestion?.label ?? past?.label ?? '';

      const { data, error } = await supabase
        .from('items')
        .insert({ user_id: userId, name, label, category_id: categoryId, is_active: true })
        .select('*')
        .single();
      if (error || !data) return;
      setActiveRaw((p) => [...p, data as DbItem]);
      await upsertHistory(userId, name, label, categoryId);
    },
    [userId, activeRaw, reservoirRaw, history, fallbackCatId, moveToActive]
  );

  const addCategory = useCallback(
    async (def: { label: string; color: string }): Promise<string | null> => {
      if (!userId) return null;
      const key = 'c-' + Date.now();
      const sort = Math.max(0, ...Object.values(registry).map((c) => 50)) + 1;
      const { data, error } = await supabase
        .from('categories')
        .insert({ user_id: userId, key, label: def.label, color: def.color, sort_order: sort })
        .select('*')
        .single();
      if (error || !data) return null;
      setRegistry((r) => ({ ...r, [data.id]: dbCatToDef(data as DbCategory) }));
      return data.id;
    },
    [userId, registry]
  );

  const renameCategory = useCallback(
    async (catId: string, newLabel: string) => {
      setRegistry((r) => (r[catId] ? { ...r, [catId]: { ...r[catId], label: newLabel } } : r));
      await supabase.from('categories').update({ label: newLabel }).eq('id', catId);
    },
    []
  );

  // Toggle checked (used in mode courses)
  const toggleChecked = useCallback(async (it: Item) => {
    const next = !it.checked;
    setActiveRaw((p) => p.map((r) => (r.id === it.id ? { ...r, checked: next } : r)));
    await supabase.from('items').update({ checked: next }).eq('id', it.id);
  }, []);

  const suggestions = useMemo(() => {
    const seen = new Set<string>();
    const out: { name: string; label: string; cat: string }[] = [];
    const activeKeys = new Set(activeRaw.map((i) => i.name.toLowerCase()));
    const push = (s: { name: string; label: string; cat: string }) => {
      const k = s.name.toLowerCase();
      if (seen.has(k) || activeKeys.has(k)) return;
      seen.add(k);
      out.push(s);
    };
    reservoirRaw.forEach((i) => push({ name: i.name, label: i.label || '', cat: i.category_id ?? fallbackCatId }));
    Object.values(history).forEach((h) =>
      push({ name: h.name, label: h.label, cat: h.categoryId ?? fallbackCatId })
    );
    return out;
  }, [activeRaw, reservoirRaw, history, fallbackCatId]);

  return {
    loading,
    registry,
    items,
    perm,
    recent,
    suggestions,
    addItemByName,
    updateItem,
    deleteItem,
    tapItem,
    moveToActive,
    moveAllPermToActive,
    addCategory,
    renameCategory,
    toggleChecked,
  };
}
