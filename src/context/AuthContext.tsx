import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  full_name: string;
  university: string | null;
  major: string | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  resendVerification: () => Promise<{ error: string | null }>;
  resendOtp: (email: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, university, major')
      .eq('id', uid)
      .maybeSingle();

    if (error) return;
    if (data) setProfile(data as Profile);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadProfile(s.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      (async () => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          await loadProfile(s.user.id);
        } else {
          setProfile(null);
        }
      })();
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      return { error: getAuthErrorMessage(error), needsConfirmation: false };
    }

    // If Supabase auto-confirmed the email and returned a session, sign out
    // immediately and force the user through the OTP verification flow.
    // This ensures only real email owners can access the app.
    if (data.session) {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
    }

    // Request a real one-time email code. This works even when the project has
    // automatic email confirmation enabled.
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (otpError) {
      return { error: getAuthErrorMessage(otpError), needsConfirmation: false };
    }

    return { error: null, needsConfirmation: true };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: getAuthErrorMessage(error) };

    // Auto-confirm is on, so a password match can return a session even when the
    // email is unverified (the trigger clears email_confirmed_at). Block login
    // until the user verifies via OTP.
    if (data.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      return { error: 'Please verify your email with the 6-digit code before signing in.' };
    }

    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/reset-password`,
    });
    if (error) return { error: getAuthErrorMessage(error) };
    return { error: null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: getAuthErrorMessage(error) };
    return { error: null };
  }, []);

  const resendVerification = useCallback(async () => {
    if (!user?.email) return { error: 'No email on file.' };
    const { error } = await supabase.auth.resend({ type: 'signup', email: user.email });
    if (error) return { error: getAuthErrorMessage(error) };
    return { error: null };
  }, [user]);

  const resendOtp = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (error) return { error: getAuthErrorMessage(error) };
    return { error: null };
  }, []);

  const verifyOtp = useCallback(async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error) return { error: getAuthErrorMessage(error) };
    // verifyOtp returns a session on success — update local state
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
      await loadProfile(data.session.user.id);
    }
    return { error: null };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        resendVerification,
        resendOtp,
        verifyOtp,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function getAuthErrorMessage(error: { message: string; status?: number }): string {
  const msg = error.message.toLowerCase();
  if (msg.includes('invalid login credentials')) return 'Invalid email or password.';
  if (msg.includes('user already registered')) return 'An account with this email already exists.';
  if (msg.includes('password should be at least')) return 'Password must be at least 8 characters.';
  if (msg.includes('email rate limit')) return 'Too many requests. Please wait a moment and try again.';
  if (msg.includes('for security purposes')) return 'For security, please wait a moment before trying again.';
  if (msg.includes('email not confirmed')) return 'Please verify your email with the code before signing in.';
  if (msg.includes('invalid or expired') || msg.includes('token is invalid') || msg.includes('otp')) return 'Invalid or expired verification code. Please try again.';
  return 'Something went wrong. Please try again.';
}
