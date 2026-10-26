import { useState, useEffect } from 'react';
import { LayoutDashboard, ArrowLeftRight, BarChart3, Settings, Wallet, Menu, X, Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export type Page = 'dashboard' | 'transactions' | 'analytics' | 'settings';

interface SidebarProps {
  page: Page;
  onNavigate: (p: Page) => void;
  onAddTransaction: () => void;
  onSignOut: () => void;
}

const NAV_ITEMS: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ page, onNavigate, onAddTransaction, onSignOut }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile } = useAuth();

  const handleNav = (p: Page) => {
    onNavigate(p);
    setMobileOpen(false);
  };

  // Close on resize to desktop
  useEffect(() => {
    const onResize = () => window.innerWidth >= 1024 && setMobileOpen(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-prussian-900/90 backdrop-blur-md border-b border-prussian-700/50 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-prussian-100 hover:bg-prussian-700/50"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-400 to-prussian-500 flex items-center justify-center shadow-glow">
              <Wallet size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">Finly</span>
          </div>
        </div>
        <button onClick={onAddTransaction} className="btn-white px-3 py-2 text-sm">
          <Plus size={16} />
          Add
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-prussian-950/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute left-0 top-0 bottom-0 w-72 bg-prussian-900 border-r border-prussian-700/50 p-5 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-prussian-500 flex items-center justify-center shadow-glow">
                  <Wallet size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold text-white">Finly</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg text-prussian-200 hover:bg-prussian-700/50">
                <X size={20} />
              </button>
            </div>
            <NavList page={page} onNavigate={handleNav} />
            <SignOutButton onSignOut={onSignOut} name={profile?.full_name} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-prussian-900/80 backdrop-blur-md border-r border-prussian-700/50 p-5 z-30">
        <div className="flex items-center gap-2.5 mb-10 px-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-prussian-500 flex items-center justify-center shadow-glow">
            <Wallet size={20} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white block leading-none">Finly</span>
            <span className="text-xs text-prussian-300">Student Finance</span>
          </div>
        </div>

        <NavList page={page} onNavigate={handleNav} />

        <div className="mt-auto space-y-3">
          <button onClick={onAddTransaction} className="btn-white w-full">
            <Plus size={18} />
            Add Transaction
          </button>
          <SignOutButton onSignOut={onSignOut} name={profile?.full_name} />
        </div>
      </aside>
    </>
  );
}

function NavList({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  return (
    <nav className="space-y-1.5">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = page === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium transition-all duration-150 ${
              active
                ? 'bg-prussian-700/60 text-white shadow-card'
                : 'text-prussian-200 hover:bg-prussian-800/60 hover:text-white'
            }`}
          >
            <Icon size={20} className={active ? 'text-sky-400' : ''} />
            {item.label}
            {active && <span className="ml-auto h-2 w-2 rounded-full bg-sky-400" />}
          </button>
        );
      })}
    </nav>
  );
}

function SignOutButton({ onSignOut, name }: { onSignOut: () => void; name?: string }) {
  return (
    <div className="px-3 py-3 rounded-xl bg-prussian-800/60 border border-prussian-700/40">
      {name && (
        <p className="text-xs font-medium text-white truncate mb-2">{name}</p>
      )}
      <button
        onClick={onSignOut}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-prussian-200 hover:text-rose-300 hover:bg-rose-400/10 transition-colors"
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
}
