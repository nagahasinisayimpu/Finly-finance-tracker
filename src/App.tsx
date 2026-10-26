import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { Sidebar, Page } from '@/components/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { Transactions } from '@/pages/Transactions';
import { Analytics } from '@/pages/Analytics';
import { Settings } from '@/pages/Settings';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { Login } from '@/components/auth/Login';
import { SignUp } from '@/components/auth/SignUp';
import { ForgotPassword } from '@/components/auth/ForgotPassword';
import { ResetPassword } from '@/components/auth/ResetPassword';
import { CompleteProfile } from '@/components/auth/CompleteProfile';
import { Wallet, Loader2 } from 'lucide-react';

type AuthPage = 'login' | 'signup' | 'forgot' | 'reset';

function AuthGate() {
  const { user, loading, profile, signOut } = useAuth();
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  const [page, setPage] = useState<Page>('dashboard');
  const [modalOpen, setModalOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setAuthPage('login');
  };

  // Handle hash-based routing for password reset
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#reset-password') {
        setAuthPage('reset');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Clear hash when authenticated
  useEffect(() => {
    if (user && window.location.hash === '#reset-password') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-prussian-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-400 to-prussian-500 flex items-center justify-center shadow-glow">
            <Wallet size={24} className="text-white" />
          </div>
          <Loader2 size={24} className="animate-spin text-sky-400" />
        </div>
      </div>
    );
  }

  if (!user) {
    switch (authPage) {
      case 'signup':
        return <SignUp onNavigate={(p) => setAuthPage(p)} />;
      case 'forgot':
        return <ForgotPassword onNavigate={(p) => setAuthPage(p)} />;
      case 'reset':
        return <ResetPassword onNavigate={(p) => setAuthPage(p)} />;
      default:
        return <Login onNavigate={(p) => setAuthPage(p)} />;
    }
  }

  // Profile completion gate — new users must fill in university + major before entering the app
  if (profile && (!profile.university || !profile.major)) {
    return <CompleteProfile />;
  }

  // Still loading profile after auth
  if (user && !profile) {
    return (
      <div className="min-h-screen bg-prussian-950 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-sky-400" />
      </div>
    );
  }

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-prussian-950">
        <Sidebar
          page={page}
          onNavigate={setPage}
          onAddTransaction={() => setModalOpen(true)}
          onSignOut={handleSignOut}
        />

        <main className="lg:ml-64 pt-16 lg:pt-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {page === 'dashboard' && (
              <Dashboard onNavigate={setPage} />
            )}
            {page === 'transactions' && (
              <Transactions onAddTransaction={() => setModalOpen(true)} />
            )}
            {page === 'analytics' && <Analytics />}
            {page === 'settings' && <Settings />}
          </div>
        </main>

        <AddTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </SettingsProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;
