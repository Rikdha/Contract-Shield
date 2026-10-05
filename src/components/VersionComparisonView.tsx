import React, { useState } from 'react';
import { ContractDoc, VersionComparison, ClauseDiff } from '../types/contract';
import { computeVersionDiff } from '../services/contractEngine';
import { 
  GitCompare, 
  ArrowRight, 
  FileText, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Layers, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface VersionComparisonViewProps {
  contracts: ContractDoc[];
  comparisons: VersionComparison[];
}

export const VersionComparisonView: React.FC<VersionComparisonViewProps> = ({
  contracts,
  comparisons,
}) => {
  const [selectedContractAId, setSelectedContractAId] = useState<number>(contracts[0]?.id || 1);
  const [selectedContractBId, setSelectedContractBId] = useState<number>(contracts[1]?.id || 2);
  const [activeComparison, setActiveComparison] = useState<VersionComparison | null>(comparisons[0] || null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const contractA = contracts.find(c => c.id === Number(selectedContractAId));
  const contractB = contracts.find(c => c.id === Number(selectedContractBId));

  const handleRunDiff = () => {
    if (!contractA || !contractB) return;
    const diff = computeVersionDiff(contractA, contractB);
    setActiveComparison(diff);
  };

  const filteredDiffs = activeComparison?.clause_diffs.filter(d => {
    if (filterStatus === 'ALL') return true;
    return d.status === filterStatus;
  }) || [];

  const handleExportDiff = () => {
    if (!activeComparison) return;
    let md = `# ContractShield Version Comparison Diff Report\n\n`;
    md += `**Base Contract (A):** ${activeComparison.contract_a_title} (v${activeComparison.contract_a_version}) - Risk Score: ${activeComparison.risk_score_a}/100\n`;
    md += `**Compared Contract (B):** ${activeComparison.contract_b_title} (v${activeComparison.contract_b_version}) - Risk Score: ${activeComparison.risk_score_b}/100\n`;
    md += `**Date:** ${new Date(activeComparison.created_at).toUTCString()}\n\n`;
    md += `## Automated Executive Diff Summary\n${activeComparison.diff_summary}\n\n`;
    md += `## Clause-by-Clause Remediation Log\n\n`;

    activeComparison.clause_diffs.forEach(cd => {
      md += `### Clause § ${cd.clauseNumber} (${cd.category}) — [${cd.status}]\n`;
      if (cd.riskChange) md += `**Risk Impact:** ${cd.riskChange}\n`;
      if (cd.textA) md += `**Original (v1):**\n\`\`\`\n${cd.textA}\n\`\`\`\n`;
      if (cd.textB) md += `**Remediated (v2):**\n\`\`\`\n${cd.textB}\n\`\`\`\n\n`;
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ContractShield-Diff-${activeComparison.contract_a_version}-vs-${activeComparison.contract_b_version}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Selector Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <GitCompare className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">
                Contract Version Comparison (Diff Analysis)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select two contract iterations to evaluate structural, textual, and risk reduction deltas.
            </p>
          </div>

          <button
            onClick={handleRunDiff}
            disabled={!contractA || !contractB || contractA.id === contractB.id}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold transition shadow-lg shadow-cyan-500/20"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Compute Version Diff</span>
          </button>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {/* Base A */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Base Contract (Version A):
            </span>
            <select
              value={selectedContractAId}
              onChange={(e) => setSelectedContractAId(Number(e.target.value))}
              className="w-full bg-slate-900 text-xs text-slate-200 p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
            >
              {contracts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title} (v{c.version} - Risk: {c.risk_score})
                </option>
              ))}
            </select>
            {contractA && (
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>SHA-256: <strong className="font-mono text-slate-500">{contractA.sha256.substring(0, 12)}...</strong></span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">
                  Score: {contractA.risk_score}
                </span>
              </div>
            )}
          </div>

          {/* Target B */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Compared Contract (Version B):
            </span>
            <select
              value={selectedContractBId}
              onChange={(e) => setSelectedContractBId(Number(e.target.value))}
              className="w-full bg-slate-900 text-xs text-slate-200 p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
            >
              {contracts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title} (v{c.version} - Risk: {c.risk_score})
                </option>
              ))}
            </select>
            {contractB && (
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>SHA-256: <strong className="font-mono text-slate-500">{contractB.sha256.substring(0, 12)}...</strong></span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  Score: {contractB.risk_score}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Results */}
      {activeComparison ? (
        <div className="space-y-4">
          {/* Executive Delta Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Score Shift Graphic */}
              <div className="lg:col-span-4 flex items-center justify-center space-x-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Original (A)</div>
                  <div className="text-2xl font-bold font-mono text-rose-400">
                    {activeComparison.risk_score_a}
                  </div>
                </div>

                <div className="p-2 rounded-full bg-cyan-500/20 text-cyan-400">
                  <ArrowRight className="w-5 h-5" />
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Remediated (B)</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {activeComparison.risk_score_b}
                  </div>
                </div>

                <div className="pl-3 border-l border-slate-800 text-left">
                  <div className="flex items-center text-xs font-bold text-emerald-400 space-x-1">
                    <TrendingDown className="w-4 h-4" />
                    <span>-{activeComparison.risk_score_a - activeComparison.risk_score_b} pts</span>
                  </div>
                  <div className="text-[9px] text-slate-400 uppercase">Risk Reduction</div>
                </div>
              </div>

              {/* Summary Text */}
              <div className="lg:col-span-8 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono font-bold">
                    Automated Diff Summary
                  </span>
                  <button
                    onClick={handleExportDiff}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Export Diff (MD)</span>
                  </button>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                  {activeComparison.diff_summary}
                </p>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-semibold">Filter Clauses:</span>
              {['ALL', 'MODIFIED', 'ADDED', 'REMOVED', 'UNCHANGED'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    filterStatus === st
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Showing {filteredDiffs.length} clauses
            </span>
          </div>

          {/* Clause Diff Cards */}
          <div className="space-y-3">
            {filteredDiffs.map((diff, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-md text-xs"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-3 bg-slate-950 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-white">
                      § {diff.clauseNumber}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      {diff.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {diff.riskChange && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                        {diff.riskChange}
                      </span>
                    )}
                    <span
                      className={`text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded border ${
                        diff.status === 'MODIFIED'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : diff.status === 'REMOVED'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : diff.status === 'ADDED'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {diff.status}
                    </span>
                  </div>
                </div>

                {/* Redline Diff Comparison */}
                <div className="p-4 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 gap-4 lg:gap-0 font-serif">
                  {/* Left: Original v1 */}
                  <div className="lg:pr-4">
                    <div className="text-[10px] uppercase font-mono font-bold text-rose-400 mb-1.5 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      <span>Version {activeComparison.contract_a_version} (Original)</span>
                    </div>
                    <p className={`p-2.5 rounded text-[11px] leading-relaxed ${
                      diff.status === 'MODIFIED' || diff.status === 'REMOVED'
                        ? 'bg-rose-950/20 text-rose-200 border border-rose-900/30'
                        : 'text-slate-400'
                    }`}>
                      {diff.textA || '(Clause not present in this version)'}
                    </p>
                  </div>

                  {/* Right: Remediated v2 */}
                  <div className="lg:pl-4">
                    <div className="text-[10px] uppercase font-mono font-bold text-emerald-400 mb-1.5 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Version {activeComparison.contract_b_version} (Remediated)</span>
                    </div>
                    <p className={`p-2.5 rounded text-[11px] leading-relaxed ${
                      diff.status === 'MODIFIED' || diff.status === 'ADDED'
                        ? 'bg-emerald-950/20 text-emerald-200 border border-emerald-900/30'
                        : 'text-slate-400'
                    }`}>
                      {diff.textB || '(Clause removed in this version)'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
          <GitCompare className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          <p>Select two different contracts above and click "Compute Version Diff".</p>
        </div>
      )}
    </div>
  );
};
