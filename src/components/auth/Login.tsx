import { useState, FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/components/auth/AuthLayout';

interface LoginProps {
  onNavigate: (page: 'signup' | 'forgot') => void;
}

export function Login({ onNavigate }: LoginProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    // Auth state change listener will re-render to the app
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to manage your finances">
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

        <div>
          <label className="block text-sm font-medium text-prussian-100 mb-2">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-prussian-300" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="input-field pl-11 pr-11"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-prussian-300 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onNavigate('forgot')}
            className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {error && (
          <p className="text-sm text-rose-300 bg-rose-400/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-white w-full disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
        </button>
      </form>

      <p className="text-sm text-prussian-200 text-center mt-6">
        Don't have an account?{' '}
        <button onClick={() => onNavigate('signup')} className="text-sky-400 hover:text-sky-300 font-medium transition-colors">
          Sign up
        </button>
      </p>
    </AuthLayout>
  );
}
