/*
# Fix security advisor warnings

1. handle_updated_at: add fixed search_path
2. handle_new_user: revoke EXECUTE from anon and authenticated (trigger-only function)
*/

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;