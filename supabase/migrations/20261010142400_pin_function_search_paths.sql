-- Both functions use only pg_catalog builtins and NEW; exclude writable schemas.
ALTER FUNCTION public.creator_deals_touch_updated_at() SET search_path = pg_catalog;
ALTER FUNCTION public.macwall_classify_category(text, text[], text) SET search_path = pg_catalog;
