/*
# Force email verification on signup

## Overview
Supabase auto-confirm is enabled on this project, which means `auth.users.email_confirmed_at`
is set the moment a user signs up — no OTP email is ever sent, and fake/non-existent email
addresses can sign up and immediately sign in. This migration fixes that by clearing
`email_confirmed_at` inside the existing `handle_new_user` trigger so that every new user
MUST verify their email with a real OTP code before they can log in.

## Changes
1. `public.handle_new_user()` — after inserting the profile row, sets
   `auth.users.email_confirmed_at = NULL` for the new user. Because the function is
   `SECURITY DEFINER` it runs with elevated privileges and can update `auth.users`.
   The trigger remains `AFTER INSERT … FOR EACH ROW` on `auth.users`, so this UPDATE
   does not recurse (it is an UPDATE, not an INSERT).

## Security
- No new tables or columns.
- No RLS policy changes.
- The trigger function remains `SECURITY DEFINER` with a fixed `search_path = public`
  (already established by the prior security-advisor migration). EXECUTE is still
  revoked from `anon` and `authenticated`.

## Important notes
1. After this change, `supabase.auth.signUp()` will still return a session (because
   auto-confirm is on), but the frontend already signs that session out immediately and
   forces the user through the OTP screen. The trigger then ensures the email is
   un-confirmed, so `signInWithPassword()` will reject unverified users with
   "Email not confirmed".
2. The frontend `signUp` function additionally calls `supabase.auth.resend({ type: 'signup', email })`
   after sign-up to trigger the actual OTP email delivery.
3. `verifyOtp({ email, token, type: 'signup' })` confirms the email and creates a session.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  -- Force email verification: clear auto-confirmation so the user must verify via OTP
  UPDATE auth.users SET email_confirmed_at = NULL WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- Keep EXECUTE revoked from anon and authenticated (trigger-only function)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;