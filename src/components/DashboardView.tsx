import React from 'react';
import { 
  FileText, 
  ShieldAlert, 
  ShieldCheck, 
  GitCompare, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  Code2, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Layers,
  History,
  Activity,
  UserCheck
} from 'lucide-react';
import { ContractDoc, PlaybookRule, RemediationAction, User } from '../types/contract';

interface DashboardViewProps {
  contracts: ContractDoc[];
  remediations: RemediationAction[];
  activeRules: PlaybookRule[];
  currentUser: User;
  onSelectContract: (contract: ContractDoc) => void;
  onOpenUpload: () => void;
  onNavigateToTab: (tab: 'auditor' | 'smart_contract' | 'diff' | 'analytics' | 'playbooks') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  contracts,
  remediations,
  activeRules,
  currentUser,
  onSelectContract,
  onOpenUpload,
  onNavigateToTab,
}) => {
  // Pending Audits: Contracts that have high/medium risk or status is IN_REVIEW
  const pendingAudits = contracts.filter(c => c.status === 'IN_REVIEW' || c.risk_score >= 40);

  // Remediated or Compliant Contracts
  const remediatedContracts = contracts.filter(c => c.status === 'REMEDIATED' || c.risk_score < 40);

  // High risk flags count across all contracts
  const totalHighFlags = contracts.reduce((acc, c) => {
    return acc + c.risk_flags.filter(f => f.severity === 'HIGH').length;
  }, 0);

  // Average Portfolio Risk
  const avgRisk = contracts.length > 0
    ? Math.round(contracts.reduce((sum, c) => sum + c.risk_score, 0) / contracts.length)
    : 0;

  // Recently Modified Contracts (sorted by uploaded_at or most recent)
  const recentlyModified = [...contracts].sort((a, b) => {
    return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
  }).slice(0, 6);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-rose-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive Operations Header */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="font-medium text-slate-300">{currentUser.organization}</span>
              <span aria-hidden="true">·</span>
              <span>Workspace Isolation Active</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-cyan-400">{currentUser.name} ({currentUser.role})</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white font-heading">
              Contract Compliance & Audit Operations
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Real-time monitoring of commercial agreements, pending legal audits, automated clause remediations, and Web3 smart contract invariants.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={() => onNavigateToTab('smart_contract')}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition"
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Smart Contract Auditor</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition shadow-md shadow-cyan-500/20"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Ingest New Contract</span>
            </button>
          </div>
        </div>

        {/* Status Highlights (Clean unboxed metadata) */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-slate-300 font-medium">{pendingAudits.length} pending audit{pendingAudits.length !== 1 ? 's' : ''}</span>
            <span>requiring attention</span>
          </div>
          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">·</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-medium">{remediatedContracts.length} contract{remediatedContracts.length !== 1 ? 's' : ''}</span>
            <span>mitigated & compliant</span>
          </div>
          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">·</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-slate-300 font-medium">{totalHighFlags} critical flag{totalHighFlags !== 1 ? 's' : ''}</span>
            <span>unresolved</span>
          </div>
          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">·</span>
          <div className="flex items-center space-x-1.5">
            <span>Portfolio Risk Index:</span>
            <span className={`font-mono font-bold ${getScoreColor(avgRisk)}`}>{avgRisk}/100</span>
          </div>
        </div>
      </div>

      {/* 2. Primary Layout: 2 Columns (Pending Audits & Quick-Access Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Pending Audits Queue & Quick-Access Cards */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section A: Pending Audits Queue */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-white font-heading">
                  Pending Audits Queue
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  ({pendingAudits.length})
                </span>
              </div>
              <button
                onClick={() => onNavigateToTab('auditor')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition"
              >
                <span>View All in Auditor</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {pendingAudits.length === 0 ? (
              <div className="p-6 text-center text-slate-400 space-y-1 bg-slate-950/40 rounded-lg border border-slate-800/60">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                <p className="text-xs font-medium text-white">All Contracts Up to Date</p>
                <p className="text-[11px] text-slate-500">There are no pending high-risk audits requiring compliance sign-off.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingAudits.map((contract) => {
                  const highFlags = contract.risk_flags.filter(f => f.severity === 'HIGH').length;
                  const medFlags = contract.risk_flags.filter(f => f.severity === 'MEDIUM').length;

                  return (
                    <div
                      key={contract.id}
                      className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xs font-semibold text-white truncate max-w-sm">
                            {contract.title}
                          </h3>
                          <span className="text-[10px] text-slate-500 font-mono">
                            v{contract.version}
                          </span>
                        </div>

                        {/* Unboxed Metadata */}
                        <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-400">
                          <span>{contract.contract_type}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{contract.clauses.length} clauses</span>
                          <span aria-hidden="true">·</span>
                          <span>Uploaded by {contract.uploaded_by}</span>
                          <span aria-hidden="true">·</span>
                          <span>{new Date(contract.uploaded_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Risk Indicators & Action Button */}
                      <div className="flex items-center space-x-3 shrink-0">
                        <div className="text-right">
                          <div className={`font-mono text-xs font-bold ${getScoreColor(contract.risk_score)}`}>
                            {contract.risk_score}/100 Risk
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {highFlags > 0 && <span className="text-rose-400">{highFlags} High </span>}
                            {medFlags > 0 && <span className="text-amber-400">{medFlags} Med</span>}
                          </div>
                        </div>

                        <button
                          onClick={() => onSelectContract(contract)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-xs font-medium text-slate-200 transition"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section B: Quick-Access Cards for Recently Modified Contracts */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-white font-heading">
                  Quick-Access Modified Contracts
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {contracts.length} Total
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentlyModified.map((contract) => {
                const highFlags = contract.risk_flags.filter(f => f.severity === 'HIGH').length;
                const isRemediated = contract.status === 'REMEDIATED' || contract.risk_score < 40;

                return (
                  <div
                    key={contract.id}
                    onClick={() => onSelectContract(contract)}
                    className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/40 transition cursor-pointer space-y-2.5 group"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition truncate">
                          {contract.title}
                        </h4>
                        <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                          <span>{contract.contract_type}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">v{contract.version}</span>
                          <span aria-hidden="true">·</span>
                          <span>{contract.file_size}</span>
                        </div>
                      </div>

                      {/* Status dot */}
                      <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                        isRemediated ? 'bg-emerald-400' : 'bg-rose-400'
                      }`} />
                    </div>

                    {/* Risk Bar Gauge */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400">Compliance Index:</span>
                        <span className={getScoreColor(contract.risk_score)}>
                          {contract.risk_score}/100 {isRemediated ? '(Compliant)' : `(${highFlags} Critical)`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            contract.risk_score >= 70 ? 'bg-rose-500' :
                            contract.risk_score >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.max(5, contract.risk_score)}%` }}
                        />
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="text-[10px] text-slate-500">
                        {contract.clauses.length} clauses audited
                      </span>
                      <span className="text-cyan-400 group-hover:translate-x-0.5 transition flex items-center space-x-1 text-[11px] font-medium">
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Recent Remediation Actions & Web3 Card */}
        <div className="lg:col-span-4 space-y-6">

          {/* Section C: Recent Remediation Actions Feed */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white font-heading">
                  Recent Remediation Actions
                </h2>
              </div>
              <button
                onClick={() => onNavigateToTab('diff')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition"
              >
                <span>Version Diff</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {remediations.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs">
                  <p>No recent remediations logged yet.</p>
                </div>
              ) : (
                remediations.slice(0, 5).map((action) => (
                  <div
                    key={action.id}
                    className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-emerald-300 truncate max-w-[180px]">
                        Section {action.clauseNumber} ({action.category})
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        {action.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 line-clamp-2 font-serif">
                      "{action.remediatedSnippet}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/60 text-slate-400">
                      <span className="truncate max-w-[140px]">
                        {action.contractTitle}
                      </span>
                      <span className="text-emerald-400 font-mono font-medium">
                        -{action.riskReduction} Risk Pts
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section D: Smart Contract Security Banner */}
          <div className="rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-slate-950 border border-cyan-800/40 p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white font-heading">
                Smart Contract Auditor
              </h3>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Static vulnerability analyzer specializing in <strong>SWC-107 Reentrancy</strong>, <strong>SWC-101 Integer Overflows</strong>, and DeFi flash loan oracle manipulation.
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400 font-mono">
                Solidity · Vyper · Rust
              </span>
              <button
                onClick={() => onNavigateToTab('smart_contract')}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white text-xs font-medium transition shadow-xs"
              >
                <span>Launch Scanner</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Section E: Active Playbook Enforcement Summary */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-white font-heading">
                  Compliance Guardrails
                </h3>
              </div>
              <button
                onClick={() => onNavigateToTab('playbooks')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                Manage
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              {activeRules.filter(r => r.is_active).length} of {activeRules.length} corporate risk rules actively auditing agreements.
            </p>
            <div className="space-y-1.5 pt-1 text-[11px]">
              {activeRules.slice(0, 3).map((rule) => (
                <div key={rule.id} className="flex items-center justify-between text-slate-300">
                  <span className="truncate max-w-[200px]">{rule.name}</span>
                  <span className={`font-mono text-[10px] ${rule.severity === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {rule.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
