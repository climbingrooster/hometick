
-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  is_builtin BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, key)
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cat_select_own" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cat_insert_own" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cat_update_own" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cat_delete_own" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- Items
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_permanent BOOLEAN NOT NULL DEFAULT false,
  checked BOOLEAN NOT NULL DEFAULT false,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_items_user_active ON public.items(user_id, is_active);
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items_select_own" ON public.items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "items_insert_own" ON public.items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "items_update_own" ON public.items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "items_delete_own" ON public.items FOR DELETE USING (auth.uid() = user_id);

-- Item history (autocomplete + remembered category)
CREATE TABLE public.item_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name_lower TEXT NOT NULL,
  name TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name_lower)
);
ALTER TABLE public.item_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hist_select_own" ON public.item_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "hist_insert_own" ON public.item_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "hist_update_own" ON public.item_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "hist_delete_own" ON public.item_history FOR DELETE USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER trg_items_updated BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed default categories on signup
CREATE OR REPLACE FUNCTION public.seed_default_categories()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.categories (user_id, key, label, color, is_builtin, sort_order) VALUES
    (NEW.id, 'frais',     'Frais',    '#10B981', true, 1),
    (NEW.id, 'boisson',   'Boisson',  '#3B82F6', true, 2),
    (NEW.id, 'epicerie',  'Épicerie', '#F59E0B', true, 3),
    (NEW.id, 'hygiene',   'Hygiène',  '#EC4899', true, 4),
    (NEW.id, 'maison',    'Maison',   '#8B5CF6', true, 5),
    (NEW.id, 'bebe',      'Bébé',     '#F472B6', true, 6),
    (NEW.id, 'autre',     'Autre',    '#8A8A9A', true, 99);
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created_seed_cats
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.seed_default_categories();

-- Realtime
ALTER TABLE public.items REPLICA IDENTITY FULL;
ALTER TABLE public.categories REPLICA IDENTITY FULL;
ALTER TABLE public.item_history REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.item_history;
