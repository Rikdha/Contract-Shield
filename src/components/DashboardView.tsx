import React, { useState } from 'react';
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
  ChevronRight,
  TrendingDown,
  Layers,
  History,
  Activity,
  UserCheck,
  Search,
  Filter,
  Building2,
  Lock
} from 'lucide-react';
import { ContractDoc, PlaybookRule, RemediationAction, User } from '../types/contract';
import { FaultIsolationBoundary } from './FaultIsolationBoundary';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'REMEDIATED'>('ALL');

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

  // Filtered contracts
  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.contract_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.uploaded_by.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'PENDING') return c.status === 'IN_REVIEW' || c.risk_score >= 40;
    if (statusFilter === 'REMEDIATED') return c.status === 'REMEDIATED' || c.risk_score < 40;
    return true;
  });

  const getScoreBadgeClass = (score: number) => {
    if (score >= 70) return 'text-rose-900 bg-rose-100 border-rose-300 font-bold';
    if (score >= 40) return 'text-amber-900 bg-amber-100 border-amber-300 font-bold';
    return 'text-emerald-900 bg-emerald-100 border-emerald-300 font-bold';
  };

  return (
    <div className="space-y-8" style={{ fontFamily: "'Times New Roman', Times, 'Newsreader', Georgia, serif" }}>
      {/* SECTION 1: EXECUTIVE OPERATIONS & METRICS */}
      <FaultIsolationBoundary sectionTitle="Executive Overview" sectionCode="SEC-01">
        <section className="bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#ece7dd]">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
                <span className="font-bold text-stone-900">{currentUser.organization}</span>
                <span>·</span>
                <span className="italic">Tenant Isolated Workspace</span>
                <span>·</span>
                <span className="font-semibold text-stone-900">{currentUser.name}</span>
                <span>·</span>
                <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                  {currentUser.role}
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-stone-900">
                Compliance & Security Assurance Ledger
              </h2>
              <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
                Institutional auditor for commercial legal agreements, contract playbooks, and Web3 smart contract invariants.
              </p>
            </div>

            {/* Primary Actions */}
            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => onNavigateToTab('smart_contract')}
                className="flex items-center space-x-2 px-4 py-2.5 rounded bg-[#f3efe6] hover:bg-[#eae4d7] border border-[#d8d1c2] text-xs font-bold text-stone-900 transition"
              >
                <Code2 className="w-4 h-4 text-stone-700" />
                <span>Smart Contract Auditor</span>
              </button>
              <button
                onClick={onOpenUpload}
                className="flex items-center space-x-2 px-4 py-2.5 rounded bg-stone-900 hover:bg-stone-800 text-[#f6f4ef] text-xs font-bold transition shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>Ingest Agreement</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar with Ample Spacing */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded bg-[#f5f2eb] border border-[#e2ddd1]">
              <span className="text-[12px] text-stone-600 block font-medium">Pending Audits</span>
              <span className="font-bold text-2xl text-stone-900 block my-1">
                {pendingAudits.length}
              </span>
              <span className="text-[11px] text-amber-800 font-bold block bg-amber-100/70 px-1.5 py-0.5 rounded w-fit border border-amber-200">
                Action Required
              </span>
            </div>

            <div className="p-4 rounded bg-[#f5f2eb] border border-[#e2ddd1]">
              <span className="text-[12px] text-stone-600 block font-medium">Shielded / Remediated</span>
              <span className="font-bold text-2xl text-stone-900 block my-1">
                {remediatedContracts.length}
              </span>
              <span className="text-[11px] text-emerald-800 font-bold block bg-emerald-100/70 px-1.5 py-0.5 rounded w-fit border border-emerald-200">
                Protected & Compliant
              </span>
            </div>

            <div className="p-4 rounded bg-[#f5f2eb] border border-[#e2ddd1]">
              <span className="text-[12px] text-stone-600 block font-medium">High Risk Flags</span>
              <span className="font-bold text-2xl text-stone-900 block my-1">
                {totalHighFlags}
              </span>
              <span className="text-[11px] text-rose-800 font-bold block bg-rose-100/70 px-1.5 py-0.5 rounded w-fit border border-rose-200">
                Unresolved Clauses
              </span>
            </div>

            <div className="p-4 rounded bg-[#f5f2eb] border border-[#e2ddd1]">
              <span className="text-[12px] text-stone-600 block font-medium">Average Portfolio Risk</span>
              <span className="font-bold text-2xl text-stone-900 block my-1">
                {avgRisk} <span className="text-xs text-stone-500 font-normal">/ 100</span>
              </span>
              <span className="text-[11px] text-stone-600 block italic">
                Tenant Exposure Index
              </span>
            </div>
          </div>
        </section>
      </FaultIsolationBoundary>

      {/* SECTION 2: WORKFLOW SHORTCUT PANELS */}
      <FaultIsolationBoundary sectionTitle="Functional Modules" sectionCode="SEC-02">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div 
            onClick={() => onNavigateToTab('auditor')}
            className="p-5 bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg hover:border-[#b8b09f] hover:shadow-xs transition cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded bg-[#eeebe3] text-stone-900">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-stone-700 transition">
                  Annotated Legal Auditor
                </h3>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-800 transition" />
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Examine flagged clauses with plain-English translations and one-click institutional remediation formulas.
            </p>
          </div>

          <div 
            onClick={() => onNavigateToTab('smart_contract')}
            className="p-5 bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg hover:border-[#b8b09f] hover:shadow-xs transition cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded bg-[#eeebe3] text-stone-900">
                  <Code2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-stone-700 transition">
                  Smart Contract Security Studio
                </h3>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-800 transition" />
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Scan Solidity contracts for reentrancy, access control holes, and run live interactive exploit simulations.
            </p>
          </div>

          <div 
            onClick={() => onNavigateToTab('diff')}
            className="p-5 bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg hover:border-[#b8b09f] hover:shadow-xs transition cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded bg-[#eeebe3] text-stone-900">
                  <GitCompare className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-stone-700 transition">
                  Version Redline & Diffing
                </h3>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-800 transition" />
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Compare base contracts against renegotiated drafts to measure verified clause-by-clause risk reductions.
            </p>
          </div>
        </section>
      </FaultIsolationBoundary>

      {/* SECTION 3 & 4: CONTRACT REGISTRY & AUDIT QUEUE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Contracts Registry with Search & Filters */}
        <div className="lg:col-span-8 space-y-4">
          <FaultIsolationBoundary sectionTitle="Contract Registry" sectionCode="SEC-03">
            <section className="bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ece7dd]">
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-4 h-4 text-stone-800" />
                  <h3 className="text-sm font-bold text-stone-900 tracking-wide uppercase">
                    Institutional Contract Registry
                  </h3>
                  <span className="text-xs font-bold text-stone-500 bg-[#ede8df] px-2 py-0.5 rounded">
                    {filteredContracts.length} agreements
                  </span>
                </div>

                {/* Filter & Search controls */}
                <div className="flex items-center space-x-2.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search title, type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs rounded bg-[#f3efe6] border border-[#d8d1c2] text-stone-900 placeholder:text-stone-500 focus:outline-hidden focus:border-stone-500 w-40 sm:w-48 font-serif"
                    />
                  </div>

                  <div className="flex items-center p-0.5 rounded bg-[#ebe6db] text-xs font-bold text-stone-700 border border-[#d6cfbf]">
                    <button
                      onClick={() => setStatusFilter('ALL')}
                      className={`px-2.5 py-1 rounded transition ${statusFilter === 'ALL' ? 'bg-[#fbfaf7] text-stone-900 shadow-xs' : 'hover:text-stone-900'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setStatusFilter('PENDING')}
                      className={`px-2.5 py-1 rounded transition ${statusFilter === 'PENDING' ? 'bg-[#fbfaf7] text-stone-900 shadow-xs' : 'hover:text-stone-900'}`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setStatusFilter('REMEDIATED')}
                      className={`px-2.5 py-1 rounded transition ${statusFilter === 'REMEDIATED' ? 'bg-[#fbfaf7] text-stone-900 shadow-xs' : 'hover:text-stone-900'}`}
                    >
                      Shielded
                    </button>
                  </div>
                </div>
              </div>

              {filteredContracts.length === 0 ? (
                <div className="p-10 text-center text-stone-500 space-y-2 bg-[#f6f4ef] rounded border border-[#dfd9cd]">
                  <CheckCircle2 className="w-6 h-6 text-stone-400 mx-auto" />
                  <p className="text-xs font-bold text-stone-700">No matching contracts in workspace</p>
                  <p className="text-[11px] text-stone-500 italic">Try adjusting your search criteria or ingest a new document.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#ece7dd]">
                  {filteredContracts.map((contract) => {
                    const highFlags = contract.risk_flags.filter(f => f.severity === 'HIGH').length;
                    const medFlags = contract.risk_flags.filter(f => f.severity === 'MEDIUM').length;

                    return (
                      <div
                        key={contract.id}
                        className="py-4 px-2 rounded hover:bg-[#f5f2eb] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center space-x-2.5">
                            <h4 className="text-sm font-bold text-stone-900 truncate max-w-md">
                              {contract.title}
                            </h4>
                            <span className="text-[11px] text-stone-500 bg-[#ede8df] px-1.5 py-0.5 rounded">
                              v{contract.version}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 text-xs text-stone-600">
                            <span className="font-semibold text-stone-800">{contract.contract_type}</span>
                            <span>·</span>
                            <span>{contract.clauses.length} clauses</span>
                            <span>·</span>
                            <span>Uploaded by <strong className="text-stone-800">{contract.uploaded_by}</strong></span>
                            <span>·</span>
                            <span className="italic">{new Date(contract.uploaded_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 shrink-0">
                          <div className="text-right">
                            <span className={`inline-block text-xs px-2.5 py-1 rounded border ${getScoreBadgeClass(contract.risk_score)}`}>
                              {contract.risk_score} / 100 Risk
                            </span>
                            <div className="text-[11px] text-stone-500 mt-1">
                              {highFlags > 0 && <span className="text-rose-800 font-bold">{highFlags} High </span>}
                              {medFlags > 0 && <span className="text-amber-800 font-semibold">{medFlags} Med</span>}
                            </div>
                          </div>

                          <button
                            onClick={() => onSelectContract(contract)}
                            className="flex items-center space-x-1.5 px-3.5 py-2 rounded bg-[#f3efe6] hover:bg-stone-900 hover:text-[#f6f4ef] border border-[#d8d1c2] text-xs font-bold text-stone-800 transition"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </FaultIsolationBoundary>
        </div>

        {/* Right Column (4 cols): Section 5: Remediation Action Ledger */}
        <div className="lg:col-span-4 space-y-4">
          <FaultIsolationBoundary sectionTitle="Remediation Ledger" sectionCode="SEC-04">
            <section className="bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#ece7dd]">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-800" />
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                    Remediation Ledger
                  </h3>
                </div>
                <span className="text-xs font-bold text-stone-500 bg-[#ede8df] px-2 py-0.5 rounded">
                  {remediations.length} logged
                </span>
              </div>

              {remediations.length === 0 ? (
                <div className="p-8 text-center text-stone-500 space-y-1 bg-[#f6f4ef] rounded border border-[#dfd9cd]">
                  <p className="text-xs font-bold text-stone-700">No remediations logged yet</p>
                  <p className="text-[11px] text-stone-500 italic">Apply alternative clauses in the Legal Auditor to register risk reductions.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {remediations.slice(0, 5).map((rem) => (
                    <div
                      key={rem.id}
                      className="p-3.5 rounded bg-[#f5f2eb] border border-[#e2ddd1] space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-900 truncate max-w-[170px]" title={rem.contractTitle}>
                          {rem.contractTitle}
                        </span>
                        <span className="text-[11px] text-emerald-900 font-bold px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300">
                          -{rem.riskReduction} Risk
                        </span>
                      </div>

                      <div className="text-xs text-stone-600 flex items-center space-x-1.5">
                        <span className="font-bold text-stone-800">Clause {rem.clauseNumber}</span>
                        <span>·</span>
                        <span className="truncate">{rem.category}</span>
                      </div>

                      <div className="text-xs text-stone-700 italic bg-[#fbfaf7] p-2.5 rounded border border-[#e0dad0] leading-relaxed">
                        "{rem.remediatedSnippet}"
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-[#eae5da]">
                        <span>Applied by <strong className="text-stone-700">{rem.appliedBy}</strong></span>
                        <span className="italic">{rem.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </FaultIsolationBoundary>
        </div>
      </div>
    </div>
  );
};
