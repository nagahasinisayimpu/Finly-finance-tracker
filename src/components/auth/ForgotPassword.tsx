import { useState, FormEvent } from 'react';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/components/auth/AuthLayout';

interface ForgotPasswordProps {
  onNavigate: (page: 'login') => void;
}

export function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await resetPassword(email);
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <AuthLayout title="Check Your Email" subtitle="Password reset link sent">
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-emerald-400/15 items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <p className="text-sm text-prussian-200 leading-relaxed">
            If an account exists for <span className="text-white font-medium">{email}</span>,
            you'll receive an email with a link to reset your password. The link will expire in 1 hour.
          </p>
          <button onClick={() => onNavigate('login')} className="btn-ghost w-full">
            <ArrowLeft size={18} /> Back to Sign In
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot Password" subtitle="We'll send you a reset link">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-prussian-100 mb-2">Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-prussian-300" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              className="input-field pl-11"
              autoComplete="email"
              autoFocus
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-300 bg-rose-400/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-white w-full disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
        </button>
      </form>

      <button
        onClick={() => onNavigate('login')}
        className="flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 mt-6 mx-auto transition-colors"
      >
        <ArrowLeft size={16} /> Back to Sign In
      </button>
    </AuthLayout>
  );
}
