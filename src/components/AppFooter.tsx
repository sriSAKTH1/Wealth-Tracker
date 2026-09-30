import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { ShieldCheck } from 'lucide-react';

export const AppFooter: React.FC = () => {
  const { isLight } = useFinance();

  return (
    <footer
      id="app-global-footer"
      className={`w-full mt-12 pt-6 pb-20 sm:pb-8 border-t transition-colors ${
        isLight
          ? 'border-slate-200/80 bg-slate-50/40 text-slate-600'
          : 'border-zinc-800/80 bg-zinc-950/30 text-zinc-400'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left px-1">
        {/* Main Requested Brand Text - styled like second component */}
        <div className="flex items-center gap-2 text-xs opacity-75">
          <span className="select-all hover:opacity-100 transition-opacity">
            𝗙𝗜𝗫ᵂᵉᵃˡᵗʰ ᵀʳᵃᶜᵏᵉʳ by niceTRY
          </span>
        </div>

        {/* Secondary Info */}
        <div className="flex items-center gap-3 text-xs opacity-75">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure & Private Wealth Management</span>
          </span>
          <span>•</span>
          <span className="font-mono text-[11px]">v2.4</span>
        </div>
      </div>
    </footer>
  );
};
