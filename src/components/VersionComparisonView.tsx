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
import { FaultIsolationBoundary } from './FaultIsolationBoundary';

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
    let md = `# Contract Shield Version Comparison Diff Report\n\n`;
    md += `**Base Contract (A):** ${activeComparison.contract_a_title} (v${activeComparison.contract_a_version}) - Risk Score: ${activeComparison.risk_score_a}/100\n`;
    md += `**Compared Contract (B):** ${activeComparison.contract_b_title} (v${activeComparison.contract_b_version}) - Risk Score: ${activeComparison.risk_score_b}/100\n`;
    md += `**Date:** ${new Date(activeComparison.created_at).toUTCString()}\n\n`;
    md += `## Automated Executive Diff Summary\n${activeComparison.diff_summary}\n\n`;
    md += `## Clause-by-Clause Remediation Log\n\n`;

    activeComparison.clause_diffs.forEach(cd => {
      md += `### Clause ${cd.clauseNumber} (${cd.category}) — [${cd.status}]\n`;
      if (cd.riskChange) md += `**Risk Impact:** ${cd.riskChange}\n`;
      if (cd.textA) md += `**Original (v1):**\n\`\`\`\n${cd.textA}\n\`\`\`\n`;
      if (cd.textB) md += `**Remediated (v2):**\n\`\`\`\n${cd.textB}\n\`\`\`\n\n`;
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diff-${activeComparison.contract_a_title.toLowerCase().replace(/\s+/g, '-')}-vs-v${activeComparison.contract_b_version}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8" style={{ fontFamily: "'Times New Roman', Times, 'Newsreader', Georgia, serif" }}>
      {/* SECTION 4.1: VERSION DIFF AUDITOR CONTROLS */}
      <FaultIsolationBoundary sectionTitle="Diff Config" sectionCode="SEC-DIFF1">
        <section className="bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ece7dd]">
            <div>
              <div className="flex items-center space-x-2.5">
                <GitCompare className="w-5 h-5 text-stone-900" />
                <h3 className="text-lg font-bold text-stone-900">
                  Contract Version Diff & Redline Studio
                </h3>
              </div>
              <p className="text-xs text-stone-600 mt-1">
                Select two contract revisions to audit structural, liability, and risk reduction deltas.
              </p>
            </div>

            <button
              onClick={handleRunDiff}
              disabled={!contractA || !contractB || contractA.id === contractB.id}
              className="flex items-center space-x-2 px-4 py-2.5 rounded bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-[#f6f4ef] text-xs font-bold transition shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Compute Version Diff</span>
            </button>
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Base A */}
            <div className="p-4 rounded bg-[#f5f2eb] border border-[#e2ddd1] space-y-3">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                Base Contract (Revision A):
              </span>
              <select
                value={selectedContractAId}
                onChange={(e) => setSelectedContractAId(Number(e.target.value))}
                className="w-full bg-[#fbfaf7] text-xs font-bold text-stone-900 p-2.5 rounded border border-[#d8d2c4] focus:outline-hidden"
              >
                {contracts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title} (v{c.version} - Risk: {c.risk_score}/100)
                  </option>
                ))}
              </select>
              {contractA && (
                <div className="text-xs text-stone-600 flex items-center justify-between pt-1">
                  <span>SHA-256: <strong className="font-mono text-stone-900">{contractA.sha256.substring(0, 14)}...</strong></span>
                  <span className="px-2.5 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 font-bold">
                    Risk: {contractA.risk_score}
                  </span>
                </div>
              )}
            </div>

            {/* Target B */}
            <div className="p-4 rounded bg-[#f5f2eb] border border-[#e2ddd1] space-y-3">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                Compared Contract (Revision B):
              </span>
              <select
                value={selectedContractBId}
                onChange={(e) => setSelectedContractBId(Number(e.target.value))}
                className="w-full bg-[#fbfaf7] text-xs font-bold text-stone-900 p-2.5 rounded border border-[#d8d2c4] focus:outline-hidden"
              >
                {contracts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title} (v{c.version} - Risk: {c.risk_score}/100)
                  </option>
                ))}
              </select>
              {contractB && (
                <div className="text-xs text-stone-600 flex items-center justify-between pt-1">
                  <span>SHA-256: <strong className="font-mono text-stone-900">{contractB.sha256.substring(0, 14)}...</strong></span>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                    Risk: {contractB.risk_score}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      </FaultIsolationBoundary>

      {/* SECTION 4.2 & 4.3: COMPARISON RESULTS */}
      <FaultIsolationBoundary sectionTitle="Diff Output" sectionCode="SEC-DIFF2">
        {activeComparison ? (
          <div className="space-y-6">
            {/* Executive Delta Card */}
            <div className="bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg p-6 shadow-xs relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Score Shift */}
                <div className="lg:col-span-4 flex items-center justify-center space-x-4 p-4 rounded bg-[#f5f2eb] border border-[#e2ddd1] text-center">
                  <div>
                    <div className="text-[11px] text-stone-500 uppercase font-bold">Original (A)</div>
                    <div className="text-2xl font-bold text-rose-800 mt-1">
                      {activeComparison.risk_score_a}
                    </div>
                  </div>

                  <div className="p-2 rounded-full bg-[#e5e0d4] text-stone-800">
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="text-[11px] text-stone-500 uppercase font-bold">Remediated (B)</div>
                    <div className="text-2xl font-bold text-emerald-800 mt-1">
                      {activeComparison.risk_score_b}
                    </div>
                  </div>

                  <div className="pl-4 border-l border-[#d8d2c4] text-left">
                    <div className="flex items-center text-sm font-bold text-emerald-800 space-x-1">
                      <TrendingDown className="w-4 h-4" />
                      <span>-{activeComparison.risk_score_a - activeComparison.risk_score_b} pts</span>
                    </div>
                    <div className="text-[10px] text-stone-500 uppercase font-bold mt-0.5">Delta Reduction</div>
                  </div>
                </div>

                {/* Summary Text */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2.5 py-1 rounded bg-[#eeebe3] text-stone-900 border border-[#d8d2c4] font-bold">
                      Automated Executive Diff Summary
                    </span>
                    <button
                      onClick={handleExportDiff}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#f5f2eb] hover:bg-[#eae4d7] border border-[#d8d1c2] text-xs font-bold text-stone-800 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-stone-700" />
                      <span>Export Diff Report</span>
                    </button>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed bg-[#f5f2eb] p-3.5 rounded border border-[#e2ddd1]">
                    {activeComparison.diff_summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center space-x-1.5">
                {['ALL', 'MODIFIED', 'ADDED', 'REMOVED', 'UNCHANGED'].map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 rounded text-xs transition ${
                      filterStatus === st
                        ? 'bg-stone-900 text-[#f6f4ef] font-bold shadow-xs'
                        : 'bg-[#fbfaf7] text-stone-700 hover:text-stone-900 border border-[#dfd9cd]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <span className="text-xs text-stone-500 font-bold">
                Showing {filteredDiffs.length} clauses
              </span>
            </div>

            {/* Clause Diff Cards */}
            <div className="space-y-4">
              {filteredDiffs.map((diff, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[#dfd9cd] bg-[#fbfaf7] overflow-hidden shadow-xs text-xs"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-3.5 bg-[#f5f2eb] border-b border-[#dfd9cd]">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-bold text-stone-900">
                        Clause {diff.clauseNumber}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-[#fbfaf7] text-stone-800 border border-[#dfd9cd] font-semibold">
                        {diff.category}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {diff.riskChange && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {diff.riskChange}
                        </span>
                      )}
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          diff.status === 'MODIFIED'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : diff.status === 'REMOVED'
                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                            : diff.status === 'ADDED'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-stone-100 text-stone-700 border-stone-300'
                        }`}
                      >
                        {diff.status}
                      </span>
                    </div>
                  </div>

                  {/* Redline Diff Comparison */}
                  <div className="p-5 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#dfd9cd] gap-5 lg:gap-0 font-serif">
                    {/* Left: Original v1 */}
                    <div className="lg:pr-5">
                      <div className="text-[11px] uppercase font-bold text-rose-800 mb-2 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                        <span>Version {activeComparison.contract_a_version} (Original)</span>
                      </div>
                      <p className={`p-3 rounded text-xs leading-relaxed italic ${
                        diff.status === 'MODIFIED' || diff.status === 'REMOVED'
                          ? 'bg-rose-50/70 text-stone-900 border border-rose-300'
                          : 'text-stone-700'
                      }`}>
                        {diff.textA ? `"${diff.textA}"` : '(Clause not present in this version)'}
                      </p>
                    </div>

                    {/* Right: Remediated v2 */}
                    <div className="lg:pl-5">
                      <div className="text-[11px] uppercase font-bold text-emerald-800 mb-2 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <span>Version {activeComparison.contract_b_version} (Remediated)</span>
                      </div>
                      <p className={`p-3 rounded text-xs leading-relaxed italic ${
                        diff.status === 'MODIFIED' || diff.status === 'ADDED'
                          ? 'bg-emerald-50/70 text-stone-900 border border-emerald-300'
                          : 'text-stone-700'
                      }`}>
                        {diff.textB ? `"${diff.textB}"` : '(Clause removed in this version)'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-[#fbfaf7] rounded-lg border border-[#dfd9cd] text-stone-600 text-xs shadow-xs space-y-2">
            <GitCompare className="w-8 h-8 mx-auto text-stone-400 mb-2" />
            <p className="font-bold text-stone-800">No active comparison computed</p>
            <p className="text-stone-500 italic">Select two different contracts above and click "Compute Version Diff".</p>
          </div>
        )}
      </FaultIsolationBoundary>
    </div>
  );
};
