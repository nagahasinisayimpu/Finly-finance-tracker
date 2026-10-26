import { ReactNode } from 'react';
import { Wallet } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-prussian-950 flex items-center justify-center p-4 sm:p-6">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-sky-400/8 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-prussian-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-sky-400 to-prussian-500 flex items-center justify-center shadow-glow">
            <Wallet size={22} className="text-white" />
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-white block leading-none">Finly</span>
            <span className="text-xs text-prussian-300">Smart Finance for Students</span>
          </div>
        </div>

        {/* Card */}
        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-bold text-white text-center mb-1">{title}</h1>
          <p className="text-sm text-prussian-200 text-center mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
