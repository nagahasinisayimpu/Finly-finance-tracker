import { useState, FormEvent } from 'react';
import { User, GraduationCap, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { AuthLayout } from '@/components/auth/AuthLayout';

export function CompleteProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [university, setUniversity] = useState(profile?.university || '');
  const [major, setMajor] = useState(profile?.major || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!university.trim()) {
      setError('Please enter your university.');
      return;
    }
    if (!major.trim()) {
      setError('Please enter your major.');
      return;
    }

    setLoading(true);
    const { error: err } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        university: university.trim(),
        major: major.trim(),
      })
      .eq('id', user!.id);

    setLoading(false);

    if (err) {
      setError('Failed to save profile. Please try again.');
      return;
    }

    await refreshProfile();
  };

  return (
    <AuthLayout title="Complete Your Profile" subtitle="Tell us a bit about yourself to get started">
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
              autoFocus
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-prussian-100 mb-2">University</label>
          <div className="relative">
            <GraduationCap size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-prussian-300" />
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="State University"
              className="input-field pl-11"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-prussian-100 mb-2">Major</label>
          <div className="relative">
            <GraduationCap size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-prussian-300" />
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="Computer Science"
              className="input-field pl-11"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-300 bg-rose-400/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-white w-full disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Get Started</>}
        </button>
      </form>
    </AuthLayout>
  );
}
