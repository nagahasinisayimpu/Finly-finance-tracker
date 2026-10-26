import { useState, FormEvent, useEffect, useRef } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, Check, CheckCircle, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/components/auth/AuthLayout';

interface SignUpProps {
  onNavigate: (page: 'login') => void;
}

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
];

const COMMON_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com',
  'aol.com', 'proton.me', 'protonmail.com', 'live.com', 'msn.com',
  'zoho.com', 'mail.com', 'yandex.com', 'gmx.com',
];

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', 'temp-mail.org', 'guerrillamail.com',
  '10minutemail.com', 'throwaway.email', 'trashmail.com', 'getnada.com',
  'dispostable.com', 'fakeinbox.com', 'sharklasers.com', 'yopmail.com',
  'maildrop.cc', 'tempinbox.com', 'mintemail.com',
]);

const levenshtein = (a: string, b: string): number => {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
};

const suggestDomain = (domain: string): string | null => {
  const lower = domain.toLowerCase();
  if (COMMON_DOMAINS.includes(lower)) return null;
  let best: string | null = null;
  let bestDist = Infinity;
  for (const d of COMMON_DOMAINS) {
    const dist = levenshtein(lower, d);
    if (dist < bestDist && dist <= 2) {
      bestDist = dist;
      best = d;
    }
  }
  return best;
};

interface EmailValidation {
  error: string;
  suggestion: string | null;
}

const OTP_LENGTH = 6;

export function SignUp({ onNavigate }: SignUpProps) {
  const { signUp, verifyOtp, resendOtp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [emailValid, setEmailValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  // OTP step state
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpResent, setOtpResent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const passedRules = PASSWORD_RULES.filter((r) => r.test(password));

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (needsConfirmation && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [needsConfirmation]);

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setOtpError('');

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = new Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    const lastFilled = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastFilled]?.focus();
  };

  const validateEmail = (value: string): EmailValidation => {
    const trimmed = value.trim();
    if (!trimmed) return { error: 'Please enter your email.', suggestion: null };
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return { error: 'Please enter a valid email address.', suggestion: null };
    }
    const domain = trimmed.split('@')[1].toLowerCase();
    if (DISPOSABLE_DOMAINS.has(domain)) {
      return { error: 'Disposable email addresses are not allowed. Please use a real email.', suggestion: null };
    }
    const suggestion = suggestDomain(domain);
    return { error: '', suggestion };
  };

  const runEmailValidation = (value: string) => {
    const result = validateEmail(value);
    setEmailError(result.error);
    setEmailSuggestion(result.suggestion);
    setEmailValid(!result.error);
  };

  const acceptSuggestion = () => {
    if (!emailSuggestion) return;
    const localPart = email.trim().split('@')[0];
    const corrected = `${localPart}@${emailSuggestion}`;
    setEmail(corrected);
    setEmailSuggestion(null);
    runEmailValidation(corrected);
  };

  const handleEmailBlur = () => {
    runEmailValidation(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    const emailResult = validateEmail(email);
    if (emailResult.error) {
      setEmailError(emailResult.error);
      setEmailSuggestion(null);
      setEmailValid(false);
      return;
    }
    setEmailError('');
    setEmailSuggestion(emailResult.suggestion);
    setEmailValid(true);
    if (passedRules.length < PASSWORD_RULES.length) {
      setError('Password does not meet all requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!accepted) {
      setError('Please accept the Terms and Privacy Policy to continue.');
      return;
    }

    setLoading(true);
    const { error: err, needsConfirmation: needsConfirm } = await signUp(email, password, fullName.trim());
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    if (needsConfirm) {
      setNeedsConfirmation(true);
      setResendCooldown(60);
      return;
    }

    // Auth state change listener will re-render to the app
  };

  const handleOtpSubmit = async () => {
    setOtpError('');
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setOtpError('Please enter the full 6-digit code.');
      return;
    }
    setOtpLoading(true);
    const { error: err } = await verifyOtp(email, code);
    setOtpLoading(false);
    if (err) {
      setOtpError(err);
      return;
    }
    // Auth state change listener will re-render to the app
  };

  const handleResendOtp = async () => {
    setLoading(true);
    const { error: err } = await resendOtp(email);
    setLoading(false);
    if (err) {
      setOtpError(err);
      return;
    }
    setOtpResent(true);
    setResendCooldown(60);
    setOtp(new Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    setTimeout(() => setOtpResent(false), 5000);
  };

  if (needsConfirmation) {
    return (
      <AuthLayout title="Verify Your Email" subtitle={`Enter the 6-digit code sent to ${email}`}>
        <div className="space-y-5">
          <div className="flex justify-center">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-sky-400/15 items-center justify-center">
              <KeyRound size={28} className="text-sky-400" />
            </div>
          </div>

          <p className="text-sm text-prussian-200 text-center leading-relaxed">
            We sent a verification code to your email. It may take a moment to arrive —
            check your spam folder if you don't see it.
          </p>

          <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="w-11 h-14 text-center text-xl font-bold text-white bg-prussian-900/50 border-2 border-prussian-700/40 rounded-xl focus:border-sky-400/50 focus:outline-none transition-colors"
              />
            ))}
          </div>

          {otpError && (
            <p className="text-sm text-rose-300 bg-rose-400/10 rounded-lg px-3 py-2 text-center">{otpError}</p>
          )}

          {otpResent && (
            <p className="text-sm text-emerald-300 bg-emerald-400/10 rounded-lg px-3 py-2 text-center">
              A new code has been sent to your email.
            </p>
          )}

          <button
            onClick={handleOtpSubmit}
            disabled={otpLoading}
            className="btn-white w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {otpLoading ? <Loader2 size={18} className="animate-spin" /> : <>Verify Email <ArrowRight size={18} /></>}
          </button>

          <div className="text-center">
            {resendCooldown > 0 ? (
              <p className="text-xs text-prussian-300">Resend code in {resendCooldown}s</p>
            ) : (
              <button
                onClick={handleResendOtp}
                disabled={loading}
                className="text-sm text-sky-400 hover:text-sky-300 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </div>

          <button
            onClick={() => onNavigate('login')}
            className="text-sm text-prussian-200 hover:text-white transition-colors w-full text-center"
          >
            Back to Sign In
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create Your Account" subtitle="Start tracking your finances today">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-prussian-100 mb-2">Full Name</label>
          <div className="relative">
            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-prussian-300" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jordan Doe"
              className="input-field pl-11"
              autoComplete="name"
              autoFocus
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-prussian-100 mb-2">Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-prussian-300" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
                if (emailSuggestion) setEmailSuggestion(null);
                if (emailValid) setEmailValid(false);
              }}
              onBlur={handleEmailBlur}
              placeholder="you@university.edu"
              className={`input-field pl-11 ${emailError ? 'border-rose-400/60' : emailValid ? 'border-emerald-400/50' : ''}`}
              autoComplete="email"
              required
            />
          </div>
          <p className="text-xs text-prussian-300 mt-1.5">
            A 6-digit verification code will be sent after you create your account.
          </p>
          {emailError && (
            <p className="text-xs text-rose-300 mt-1.5 flex items-center gap-1.5">
              <span className="inline-block w-1 h-1 rounded-full bg-rose-400" />
              {emailError}
            </p>
          )}
          {!emailError && emailSuggestion && (
            <p className="text-xs text-amber-300 mt-1.5 flex items-center gap-1.5">
              <span className="inline-block w-1 h-1 rounded-full bg-amber-400" />
              Did you mean
              <button
                type="button"
                onClick={acceptSuggestion}
                className="text-sky-400 hover:text-sky-300 underline underline-offset-2 font-medium"
              >
                {email.split('@')[0]}@{emailSuggestion}
              </button>
              ?
            </p>
          )}
          {!emailError && !emailSuggestion && emailValid && (
            <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1.5">
              <CheckCircle size={12} />
              Email looks good
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-prussian-100 mb-2">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-prussian-300" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="input-field pl-11 pr-11"
              autoComplete="new-password"
              required
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
                    <Check size={12} className={passed ? 'opacity-100' : 'opacity-30'} />
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="input-field pl-11"
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-prussian-600 bg-prussian-900 text-sky-400 focus:ring-sky-400/40"
          />
          <span className="text-xs text-prussian-200 leading-relaxed">
            I agree to the <span className="text-sky-400">Terms of Service</span> and{' '}
            <span className="text-sky-400">Privacy Policy</span>.
          </span>
        </label>

        {error && (
          <p className="text-sm text-rose-300 bg-rose-400/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-white w-full disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
        </button>
      </form>

      <p className="text-sm text-prussian-200 text-center mt-6">
        Already have an account?{' '}
        <button onClick={() => onNavigate('login')} className="text-sky-400 hover:text-sky-300 font-medium transition-colors">
          Sign in
        </button>
      </p>
    </AuthLayout>
  );
}
