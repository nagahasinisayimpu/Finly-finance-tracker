import { useState, useEffect } from 'react';
import { User, Coins, Palette, Moon, Sun, Check, Mail, Shield, Lock, LogOut, Loader2, GraduationCap } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { CURRENCIES } from '@/types';
import { supabase } from '@/lib/supabase';

export function Settings() {
  const { currencyCode, setCurrency, theme, setTheme } = useSettings();
  const { user, profile, signOut, updatePassword, resendVerification, refreshProfile } = useAuth();
  const [savedProfile, setSavedProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Security section state
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [sendingVerification, setSendingVerification] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setUniversity(profile.university || '');
      setMajor(profile.major || '');
    }
  }, [profile]);

  const initials = (profile?.full_name || user?.email || '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const emailVerified = !!user?.email_confirmed_at;

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), university: university.trim() || null, major: major.trim() || null })
      .eq('id', user!.id);

    setSavingProfile(false);
    if (error) return;
    await refreshProfile();
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2500);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setChangingPassword(true);
    const { error } = await updatePassword(newPassword);
    setChangingPassword(false);
    if (error) {
      setPasswordError(error);
      return;
    }
    setPasswordSuccess('Password updated successfully.');
    setNewPassword('');
    setConfirmNewPassword('');
    setTimeout(() => setPasswordSuccess(''), 3000);
  };

  const handleResendVerification = async () => {
    setSendingVerification(true);
    setVerificationError('');
    const { error } = await resendVerification();
    setSendingVerification(false);
    if (error) {
      setVerificationError(error);
      return;
    }
    setVerificationSent(true);
    setTimeout(() => setVerificationSent(false), 5000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-prussian-200 text-sm mt-1">Manage your profile and preferences.</p>
      </div>

      {/* Profile */}
      <section className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="h-9 w-9 rounded-xl bg-sky-400/15 flex items-center justify-center">
            <User size={18} className="text-sky-400" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-white">Profile</h2>
            <p className="text-xs text-prussian-200">Your account information</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-sky-400 to-prussian-500 flex items-center justify-center text-2xl font-bold text-white shadow-glow">
            {initials}
          </div>
          <div>
            <p className="text-lg font-bold text-white">{profile?.full_name || 'Your Name'}</p>
            <p className="text-sm text-prussian-200 flex items-center gap-1.5">
              <Mail size={14} /> {user?.email}
            </p>
            {profile?.major && (
              <p className="text-xs text-prussian-300 flex items-center gap-1.5 mt-1">
                <GraduationCap size={14} /> {profile.major}
                {profile?.university ? ` · ${profile.university}` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-prussian-100 mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-prussian-100 mb-2">Email</label>
            <input type="email" value={user?.email || ''} disabled className="input-field opacity-60 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-prussian-100 mb-2">University</label>
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="State University"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-prussian-100 mb-2">Major</label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="Computer Science"
              className="input-field"
            />
          </div>
        </div>

        <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-white mt-5 disabled:opacity-60">
          {savingProfile ? <Loader2 size={18} className="animate-spin" /> : savedProfile ? <><Check size={18} /> Saved!</> : 'Save Profile'}
        </button>
      </section>

      {/* Security */}
      <section className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="h-9 w-9 rounded-xl bg-emerald-400/15 flex items-center justify-center">
            <Shield size={18} className="text-emerald-400" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-white">Security</h2>
            <p className="text-xs text-prussian-200">Manage your account security</p>
          </div>
        </div>

        {/* Email verification status */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-prussian-900/40 border border-prussian-700/40 mb-4">
          <div className="flex items-center gap-3">
            <span className={`h-8 w-8 rounded-lg flex items-center justify-center ${emailVerified ? 'bg-emerald-400/15' : 'bg-amber-400/15'}`}>
              {emailVerified ? <Check size={16} className="text-emerald-400" /> : <Mail size={16} className="text-amber-400" />}
            </span>
            <div>
              <p className="text-sm font-medium text-white">Email Verification</p>
              <p className="text-xs text-prussian-200">
                {emailVerified ? 'Your email is verified' : 'Your email is not verified yet'}
              </p>
            </div>
          </div>
          {!emailVerified && (
            <button
              onClick={handleResendVerification}
              disabled={sendingVerification || verificationSent}
              className="text-sm text-sky-400 hover:text-sky-300 disabled:opacity-50 transition-colors"
            >
              {sendingVerification ? 'Sending...' : verificationSent ? 'Sent!' : 'Resend'}
            </button>
          )}
        </div>

        {verificationError && (
          <p className="text-sm text-rose-300 bg-rose-400/10 rounded-lg px-3 py-2 mb-4">{verificationError}</p>
        )}

        {/* Change password */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-prussian-200" />
            <p className="text-sm font-medium text-white">Change Password</p>
          </div>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="input-field pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-prussian-300 hover:text-white"
            >
              {showNewPassword ? <span className="text-xs">Hide</span> : <span className="text-xs">Show</span>}
            </button>
          </div>
          <input
            type={showNewPassword ? 'text' : 'password'}
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="Confirm new password"
            className="input-field"
            autoComplete="new-password"
          />
          {passwordError && (
            <p className="text-sm text-rose-300 bg-rose-400/10 rounded-lg px-3 py-2">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-sm text-emerald-300 bg-emerald-400/10 rounded-lg px-3 py-2">{passwordSuccess}</p>
          )}
          <button
            onClick={handleChangePassword}
            disabled={changingPassword || !newPassword}
            className="btn-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {changingPassword ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
          </button>
        </div>

        {/* Sign out */}
        <div className="mt-5 pt-5 border-t border-prussian-700/40">
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-300 bg-rose-400/10 hover:bg-rose-400/20 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </section>

      {/* Currency */}
      <section className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="h-9 w-9 rounded-xl bg-amber-400/15 flex items-center justify-center">
            <Coins size={18} className="text-amber-400" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-white">Currency</h2>
            <p className="text-xs text-prussian-200">Choose your preferred currency</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => setCurrency(c.code)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 ${
                currencyCode === c.code
                  ? 'bg-sky-400/15 text-white border-2 border-sky-400/50'
                  : 'bg-prussian-900/40 text-prussian-200 border-2 border-prussian-700/40 hover:border-prussian-600'
              }`}
            >
              <span className="text-xl font-bold">{c.symbol}</span>
              <div className="text-left">
                <p className="text-sm font-semibold">{c.code}</p>
                <p className="text-xs text-prussian-300">{c.label}</p>
              </div>
              {currencyCode === c.code && (
                <Check size={16} className="text-sky-400 ml-auto" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Theme */}
      <section className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="h-9 w-9 rounded-xl bg-prussian-500/30 flex items-center justify-center">
            <Palette size={18} className="text-prussian-100" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-white">Theme</h2>
            <p className="text-xs text-prussian-200">Customize the appearance</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center gap-3 p-5 rounded-xl transition-all duration-150 ${
              theme === 'dark'
                ? 'bg-prussian-700/40 border-2 border-sky-400/50'
                : 'bg-prussian-900/40 border-2 border-prussian-700/40 hover:border-prussian-600'
            }`}
          >
            <div className="h-16 w-full rounded-xl bg-prussian-950 border border-prussian-700 flex items-center justify-center relative overflow-hidden">
              <Moon size={24} className="text-sky-400" />
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-prussian-800/60 to-transparent" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Dark</span>
              {theme === 'dark' && <Check size={16} className="text-sky-400" />}
            </div>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center gap-3 p-5 rounded-xl transition-all duration-150 ${
              theme === 'light'
                ? 'bg-prussian-700/40 border-2 border-sky-400/50'
                : 'bg-prussian-900/40 border-2 border-prussian-700/40 hover:border-prussian-600'
            }`}
          >
            <div className="h-16 w-full rounded-xl bg-prussian-50 border border-prussian-200 flex items-center justify-center">
              <Sun size={24} className="text-amber-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Light</span>
              {theme === 'light' && <Check size={16} className="text-sky-400" />}
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
