import React from 'react';
import { User } from '../types/contract';
import { 
  Shield, 
  LayoutDashboard, 
  FileText, 
  Code2, 
  GitCompare, 
  BarChart3, 
  BookOpen, 
  Users, 
  Upload, 
  LogOut, 
  Bot, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building2,
  Lock
} from 'lucide-react';

export type AppNavTab = 'dashboard' | 'auditor' | 'smart_contract' | 'diff' | 'analytics' | 'playbooks' | 'users';

interface SidebarNavProps {
  activeTab: AppNavTab;
  setActiveTab: (tab: AppNavTab) => void;
  currentUser: User;
  onOpenUpload: () => void;
  onOpenChat: () => void;
  onLogout: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenUpload,
  onOpenChat,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const primarySections = [
    {
      id: 'dashboard' as AppNavTab,
      label: 'Executive Overview',
      description: 'Operations, audit health & recent ledger',
      icon: LayoutDashboard,
    },
    {
      id: 'auditor' as AppNavTab,
      label: 'Legal Contract Auditor',
      description: 'Document extraction, risk & redlines',
      icon: FileText,
    },
    {
      id: 'smart_contract' as AppNavTab,
      label: 'Smart Contract Studio',
      description: 'Solidity invariants & exploit simulator',
      icon: Code2,
    },
    {
      id: 'diff' as AppNavTab,
      label: 'Version Redline Diff',
      description: 'Side-by-side clause revision tracking',
      icon: GitCompare,
    },
  ];

  const governanceSections = [
    {
      id: 'analytics' as AppNavTab,
      label: 'Portfolio Risk Analytics',
      description: 'Cross-agreement exposures & liability',
      icon: BarChart3,
    },
    {
      id: 'playbooks' as AppNavTab,
      label: 'Playbook Governance',
      description: 'Institutional heuristics & rule weights',
      icon: BookOpen,
    },
    {
      id: 'users' as AppNavTab,
      label: 'Access & RBAC Security',
      description: 'Tenant isolation & multi-role governance',
      icon: Users,
    },
  ];

  const handleSelectTab = (tab: AppNavTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-72 flex flex-col justify-between
        bg-[#ede9df] text-stone-900 border-r border-[#dfd9cd] shadow-xs
        transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{ fontFamily: "'Times New Roman', Times, 'Newsreader', Georgia, serif" }}
    >
      {/* Top Header & Brand Zone */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="p-6 border-b border-[#dfd9cd]">
          <div 
            onClick={() => handleSelectTab('dashboard')} 
            className="cursor-pointer group block"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded bg-stone-900 text-[#f6f4ef] shadow-xs">
                <Shield className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition">
                Contract Shield
              </h1>
            </div>
            <p className="text-[12px] text-stone-600 leading-snug pl-11">
              Institutional Security & Legal Agreement Auditor
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-5 space-y-2">
            <button
              onClick={onOpenUpload}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded bg-stone-900 hover:bg-stone-800 text-[#f6f4ef] text-xs font-bold transition shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Ingest New Agreement</span>
            </button>
            <button
              onClick={onOpenChat}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded bg-[#e3ded2] hover:bg-[#dbd5c8] text-stone-900 text-xs font-bold transition border border-[#d2cbbe]"
            >
              <Bot className="w-3.5 h-3.5 text-stone-700" />
              <span>AI Legal Advisor</span>
            </button>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-4 space-y-6">
          {/* Group 1: Core Operations */}
          <div>
            <div className="px-3 mb-2">
              <span className="text-[11px] font-bold tracking-wider text-stone-500 uppercase">
                Core Operations
              </span>
            </div>
            <nav className="space-y-1">
              {primarySections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => handleSelectTab(sec.id)}
                    className={`
                      w-full text-left px-3 py-2.5 rounded transition flex items-start space-x-3 text-xs
                      ${
                        isActive
                          ? 'bg-[#fcfbfa] text-stone-900 shadow-xs border border-[#d6d0c2] font-bold'
                          : 'text-stone-700 hover:bg-[#e4dfd4] hover:text-stone-900'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-stone-900' : 'text-stone-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={isActive ? 'font-bold' : 'font-medium'}>{sec.label}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {sec.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Group 2: Governance & Analytics */}
          <div>
            <div className="px-3 mb-2">
              <span className="text-[11px] font-bold tracking-wider text-stone-500 uppercase">
                Governance & Controls
              </span>
            </div>
            <nav className="space-y-1">
              {governanceSections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => handleSelectTab(sec.id)}
                    className={`
                      w-full text-left px-3 py-2.5 rounded transition flex items-start space-x-3 text-xs
                      ${
                        isActive
                          ? 'bg-[#fcfbfa] text-stone-900 shadow-xs border border-[#d6d0c2] font-bold'
                          : 'text-stone-700 hover:bg-[#e4dfd4] hover:text-stone-900'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-stone-900' : 'text-stone-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={isActive ? 'font-bold' : 'font-medium'}>{sec.label}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {sec.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom User Profile & Workspace Isolation Card */}
      <div className="p-4 border-t border-[#dfd9cd] bg-[#e6e2d7]">
        <div className="p-3 bg-[#fbfaf7] rounded border border-[#d8d2c4] shadow-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded bg-stone-900 text-[#f6f4ef] flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-stone-900 truncate">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-stone-500 flex items-center space-x-1 truncate">
                  <Building2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">{currentUser.organization}</span>
                </div>
              </div>
            </div>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-900 border border-amber-300">
              {currentUser.role}
            </span>
          </div>

          <div className="mt-2.5 pt-2 border-t border-[#ede8dd] flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-1 text-stone-500 italic">
              <Lock className="w-3 h-3 text-stone-400" />
              <span>Workspace Isolated</span>
            </div>
            <button
              onClick={onLogout}
              className="text-stone-600 hover:text-stone-900 font-bold flex items-center space-x-1 transition"
              title="Sign Out"
            >
              <span>Exit</span>
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
