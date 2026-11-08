CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  primary_use text[] NOT NULL DEFAULT '{}',
  lifestyle text,
  style_prefs text[] NOT NULL DEFAULT '{}',
  preferred_colors text[] NOT NULL DEFAULT '{}',
  avoid_colors text[] NOT NULL DEFAULT '{}',
  climate text,
  comfort_notes text,
  modesty_notes text,
  pronouns text,
  clothing_categories text[] NOT NULL DEFAULT '{}',
  undertone text,
  fit_prefs text,
  hairstyle text,
  reminders_enabled boolean NOT NULL DEFAULT false,
  learned_prefs jsonb NOT NULL DEFAULT '{}'::jsonb,
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name') ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.wardrobe_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'garment',
  category text NOT NULL,
  subcategory text,
  colors text[] NOT NULL DEFAULT '{}',
  pattern text,
  fabric text,
  fit text,
  formality int NOT NULL DEFAULT 3,
  seasons text[] NOT NULL DEFAULT '{}',
  occasions text[] NOT NULL DEFAULT '{}',
  style_tags text[] NOT NULL DEFAULT '{}',
  notes text,
  brand text,
  availability text NOT NULL DEFAULT 'clean',
  favorite boolean NOT NULL DEFAULT false,
  is_demo boolean NOT NULL DEFAULT false,
  image_path text,
  wear_count int NOT NULL DEFAULT 0,
  last_worn_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.wardrobe_items(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wardrobe_items TO authenticated;
GRANT ALL ON public.wardrobe_items TO service_role;
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own items" ON public.wardrobe_items FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.outfits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  occasion text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'ai',
  saved boolean NOT NULL DEFAULT true,
  favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.outfits(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.outfits TO authenticated;
GRANT ALL ON public.outfits TO service_role;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own outfits" ON public.outfits FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.outfit_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  outfit_id uuid NOT NULL REFERENCES public.outfits(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  slot text NOT NULL
);
CREATE INDEX ON public.outfit_items(outfit_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.outfit_items TO authenticated;
GRANT ALL ON public.outfit_items TO service_role;
ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own outfit items" ON public.outfit_items FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.outfits o WHERE o.id = outfit_id AND o.user_id = auth.uid()) AND EXISTS (SELECT 1 FROM public.wardrobe_items w WHERE w.id = item_id AND w.user_id = auth.uid()));

CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  outfit_name text,
  outfit_id uuid REFERENCES public.outfits(id) ON DELETE SET NULL,
  useful boolean NOT NULL,
  reasons text[] NOT NULL DEFAULT '{}',
  item_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own feedback" ON public.feedback FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.planner_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  event_date date NOT NULL,
  title text NOT NULL,
  occasion text,
  outfit_id uuid REFERENCES public.outfits(id) ON DELETE SET NULL,
  worn boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planner_events TO authenticated;
GRANT ALL ON public.planner_events TO service_role;
ALTER TABLE public.planner_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own events" ON public.planner_events FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  destination text NOT NULL,
  days int NOT NULL DEFAULT 3,
  climate text,
  activities text[] NOT NULL DEFAULT '{}',
  item_ids uuid[] NOT NULL DEFAULT '{}',
  outfit_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trips TO authenticated;
GRANT ALL ON public.trips TO service_role;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own trips" ON public.trips FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own messages" ON public.chat_messages FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "own wardrobe images read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'wardrobe' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own wardrobe images insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'wardrobe' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own wardrobe images update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'wardrobe' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own wardrobe images delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'wardrobe' AND (storage.foldername(name))[1] = auth.uid()::text);