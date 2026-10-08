import React from 'react';
import { User } from '../types/contract';
import { 
  Menu, 
  Upload, 
  Bot, 
  ShieldCheck, 
  Building2, 
  Layers,
  Sparkles,
  Lock
} from 'lucide-react';
import { AppNavTab } from './SidebarNav';

interface TopBarProps {
  activeTab: AppNavTab;
  currentUser: User;
  onOpenUpload: () => void;
  onOpenChat: () => void;
  onToggleMobileNav: () => void;
  contractCount?: number;
}

export const Header: React.FC<TopBarProps> = ({
  activeTab,
  currentUser,
  onOpenUpload,
  onOpenChat,
  onToggleMobileNav,
  contractCount = 0,
}) => {
  const tabTitles: Record<AppNavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Executive Operations & Overview',
      subtitle: 'Portfolio health, vulnerability distribution & audit ledger'
    },
    auditor: {
      title: 'Legal Contract Auditor & Redline Studio',
      subtitle: 'Clause-level risk extraction, plain-English translations & remediations'
    },
    smart_contract: {
      title: 'Smart Contract & DeFi Security Studio',
      subtitle: 'Solidity invariants, AST vulnerability checks & interactive exploit simulator'
    },
    diff: {
      title: 'Version Redline & Clause Diff Comparison',
      subtitle: 'Side-by-side contract diffing and cumulative risk reduction analytics'
    },
    analytics: {
      title: 'Institutional Portfolio Risk & Exposure Analytics',
      subtitle: 'Cross-agreement metrics, liability concentration & compliance trends'
    },
    playbooks: {
      title: 'Compliance Playbook Rules & Heuristics',
      subtitle: 'Institutional risk thresholds, regex rule patterns & severity weighting'
    },
    users: {
      title: 'Access Management & Multi-Tenant RBAC',
      subtitle: 'Tenant workspace isolation, role permissions & user administration'
    },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.dashboard;

  return (
    <header className="sticky top-0 z-30 border-b border-[#dfd9cd] bg-[#f6f4ef]/95 backdrop-blur-md px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Active Section Indicator */}
        <div className="flex items-center space-x-3.5 min-w-0">
          <button
            onClick={onToggleMobileNav}
            className="lg:hidden p-2 rounded bg-[#ebe6db] text-stone-800 hover:bg-[#ded7c8] transition border border-[#d6cfbf]"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 truncate">
              {currentTabInfo.title}
            </h2>
            <p className="text-xs text-stone-600 truncate mt-0.5 hidden sm:block">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Tenant Status & Quick Actions */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded bg-[#eee9df] border border-[#dcd6c7] text-xs">
            <Building2 className="w-3.5 h-3.5 text-stone-600" />
            <span className="text-stone-600">Workspace:</span>
            <strong className="text-stone-900">{currentUser.organization}</strong>
            <span className="text-stone-400">·</span>
            <span className="italic text-stone-500">{contractCount} Agreements</span>
          </div>

          <button
            onClick={onOpenChat}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#eae4d7] hover:bg-[#ded7c8] text-stone-900 text-xs font-bold transition border border-[#d6cfbf]"
            title="Ask AI Legal Advisor"
          >
            <Bot className="w-3.5 h-3.5 text-stone-700" />
            <span className="hidden sm:inline">Legal Advisor</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded bg-stone-900 hover:bg-stone-800 text-[#f6f4ef] text-xs font-bold transition shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Ingest</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export type { AppNavTab };
