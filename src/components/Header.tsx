import React from 'react';
import { User, UserRole } from '../types/contract';
import { 
  Shield, 
  BarChart3, 
  FileText, 
  GitCompare, 
  BookOpen, 
  Users, 
  Upload, 
  LogOut,
  Code2,
  LayoutDashboard
} from 'lucide-react';

export type AppNavTab = 'dashboard' | 'auditor' | 'smart_contract' | 'diff' | 'analytics' | 'playbooks' | 'users';

interface HeaderProps {
  activeTab: AppNavTab;
  setActiveTab: (tab: AppNavTab) => void;
  currentUser: User;
  onOpenUpload: () => void;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenUpload,
  onSwitchRole,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 gap-4">
          {/* Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer shrink-0" 
            onClick={() => setActiveTab('auditor')}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-cyan-300">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base tracking-tight text-white font-heading">
                  ContractShield
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  / Enterprise
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items (Clean typographic links with subtle active indicator) */}
          <nav className="hidden lg:flex items-center space-x-1 text-xs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('auditor')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'auditor'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Annotated Auditor</span>
            </button>

            <button
              onClick={() => setActiveTab('smart_contract')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'smart_contract'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Smart Contract Auditor</span>
            </button>

            <button
              onClick={() => setActiveTab('diff')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'diff'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 text-slate-400" />
              <span>Version Diff</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
              <span>Portfolio Analytics</span>
            </button>

            {currentUser.role === 'Admin' && (
              <button
                onClick={() => setActiveTab('playbooks')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'playbooks'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Playbook Rules</span>
              </button>
            )}

            {currentUser.role === 'Admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Users & Access</span>
              </button>
            )}
          </nav>

          {/* Right Action & User Profile Section */}
          <div className="flex items-center space-x-3">
            {currentUser.role !== 'Viewer' && (
              <button
                onClick={onOpenUpload}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ingest Contract</span>
              </button>
            )}

            {/* Quiet, unboxed user information */}
            <div className="flex items-center space-x-2 text-xs border-l border-slate-800 pl-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-medium text-slate-200 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500">
                  {currentUser.organization || 'Workspace'}
                </div>
              </div>

              {/* Minimal role selector */}
              <select
                value={currentUser.role}
                onChange={(e) => onSwitchRole(e.target.value as UserRole)}
                className="bg-slate-900 text-slate-300 text-[11px] px-2 py-1 rounded border border-slate-800 focus:outline-none focus:border-slate-700 cursor-pointer"
                title="Switch active role"
              >
                <option value="Admin">Admin</option>
                <option value="Analyst">Analyst</option>
                <option value="Viewer">Viewer</option>
              </select>

              <button
                onClick={onLogout}
                className="p-1 rounded text-slate-500 hover:text-slate-300 transition"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-800/80 space-x-1 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 rounded-md shrink-0 font-medium ${activeTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('auditor')}
            className={`px-3 py-1 rounded-md shrink-0 font-medium ${activeTab === 'auditor' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
          >
            Auditor
          </button>
          <button
            onClick={() => setActiveTab('smart_contract')}
            className={`px-3 py-1 rounded-md shrink-0 font-medium ${activeTab === 'smart_contract' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
          >
            Smart Contracts
          </button>
          <button
            onClick={() => setActiveTab('diff')}
            className={`px-3 py-1 rounded-md shrink-0 font-medium ${activeTab === 'diff' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
          >
            Version Diff
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1 rounded-md shrink-0 font-medium ${activeTab === 'analytics' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
          >
            Portfolio
          </button>
          {currentUser.role === 'Admin' && (
            <>
              <button
                onClick={() => setActiveTab('playbooks')}
                className={`px-3 py-1 rounded-md shrink-0 font-medium ${activeTab === 'playbooks' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
              >
                Playbooks
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1 rounded-md shrink-0 font-medium ${activeTab === 'users' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
              >
                Users
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
