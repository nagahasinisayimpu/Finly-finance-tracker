import { useState, FormEvent } from 'react';
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/components/auth/AuthLayout';

interface ResetPasswordProps {
  onNavigate: (page: 'login') => void;
}

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
];

export function ResetPassword({ onNavigate }: ResetPasswordProps) {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const passedRules = PASSWORD_RULES.filter((r) => r.test(password));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (passedRules.length < PASSWORD_RULES.length) {
      setError('Password does not meet all requirements.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: err } = await updatePassword(password);
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    setDone(true);
  };

  if (done) {
    return (
      <AuthLayout title="Password Updated" subtitle="Your password has been changed">
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-emerald-400/15 items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <p className="text-sm text-prussian-200 leading-relaxed">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
          <button onClick={() => onNavigate('login')} className="btn-white w-full">
            Continue to Sign In
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set New Password" subtitle="Create a new password for your account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-prussian-100 mb-2">New Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-prussian-300" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="input-field pl-11 pr-11"
              autoComplete="new-password"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-prussian-300 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {password && (
            <div className="mt-2 space-y-1">
              {PASSWORD_RULES.map((r, i) => {
                const passed = r.test(password);
                return (
                  <div key={i} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-emerald-400' : 'text-prussian-300'}`}>
                    <CheckCircle size={12} className={passed ? 'opacity-100' : 'opacity-30'} />
                    {r.label}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-prussian-100 mb-2">Confirm Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-prussian-300" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter your password"
              className="input-field pl-11"
              autoComplete="new-password"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-300 bg-rose-400/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-white w-full disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
        </button>
      </form>
    </AuthLayout>
  );
}
