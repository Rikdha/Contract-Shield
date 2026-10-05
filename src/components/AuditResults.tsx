import React, { useState } from 'react';
import { AuditReport, VulnerabilitySeverity } from '../types/contract';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Flame, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Download, 
  Printer, 
  ArrowLeft, 
  Share2, 
  Check, 
  Zap, 
  FileText, 
  CheckCircle2, 
  SlidersHorizontal,
  Activity,
  Terminal,
  FileCode
} from 'lucide-react';
import { VulnerabilityCard } from './VulnerabilityCard';
import { ExploitSimulator } from './ExploitSimulator';

interface AuditResultsProps {
  report: AuditReport;
  onBackToEditor: () => void;
  provider?: string;
}

export const AuditResults: React.FC<AuditResultsProps> = ({
  report,
  onBackToEditor,
  provider,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'findings' | 'simulation' | 'optimizations' | 'certificate'>('findings');
  const [copiedCertificate, setCopiedCertificate] = useState(false);

  const filteredVulns = report.vulnerabilities.filter((v) => {
    if (severityFilter === 'all') return true;
    return v.severity === severityFilter;
  });

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 70) return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const downloadReportMarkdown = () => {
    let md = `# Contract Shield Security Audit Report\n\n`;
    md += `**Contract Title:** ${report.contractTitle}\n`;
    md += `**Date:** ${new Date(report.timestamp).toUTCString()}\n`;
    md += `**Overall Security Score:** ${report.overallScore}/100 (Grade: ${report.letterGrade})\n`;
    md += `**Audit Verification Hash:** ${report.verificationHash}\n\n`;
    md += `## Executive Summary\n${report.summary}\n\n`;
    md += `## Vulnerability Breakdown\n`;
    md += `- Critical: ${report.riskCounts.critical}\n`;
    md += `- High: ${report.riskCounts.high}\n`;
    md += `- Medium: ${report.riskCounts.medium}\n`;
    md += `- Low: ${report.riskCounts.low}\n`;
    md += `- Informational: ${report.riskCounts.informational}\n\n`;

    md += `## Detailed Vulnerabilities\n\n`;
    report.vulnerabilities.forEach((v, i) => {
      md += `### ${i + 1}. [${v.severity.toUpperCase()}] ${v.title}\n`;
      md += `**Category:** ${v.category}\n`;
      if (v.swcId) md += `**SWC ID:** ${v.swcId}\n`;
      md += `**Description:** ${v.description}\n\n`;
      md += `**Impact:** ${v.impact}\n\n`;
      if (v.exploitScenario) md += `**Exploit Scenario:**\n\`\`\`\n${v.exploitScenario}\n\`\`\`\n\n`;
      md += `**Remediation:**\n${v.remediation}\n\n`;
      if (v.vulnerableSnippet && v.patchedSnippet) {
        md += `**Vulnerable Code:**\n\`\`\`\n${v.vulnerableSnippet}\n\`\`\`\n\n`;
        md += `**Shielded Patch:**\n\`\`\`\n${v.patchedSnippet}\n\`\`\`\n\n`;
      }
      md += `---\n\n`;
    });

    if (report.optimizations.length > 0) {
      md += `## Optimizations & Best Practices\n\n`;
      report.optimizations.forEach((o, i) => {
        md += `### ${i + 1}. ${o.title} (${o.category})\n`;
        md += `${o.description}\n`;
        md += `*Recommendation:* ${o.suggestion}\n\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ContractShield-Audit-${report.contractTitle.replace(/\s+/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBackToEditor}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Contract Editor</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={downloadReportMarkdown}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Download full Markdown audit report"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Report (MD)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Score Badge */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-center">
            <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">
              Shield Security Score
            </div>
            
            <div className={`relative flex items-center justify-center w-28 h-28 rounded-full border-4 ${getScoreColor(report.overallScore)} font-extrabold shadow-inner my-2`}>
              <div className="flex flex-col items-center">
                <span className="text-3xl tracking-tight text-white font-mono">
                  {report.overallScore}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Grade {report.letterGrade}
                </span>
              </div>
            </div>

            <div className="mt-2 text-xs text-slate-400">
              Contract Type:{' '}
              <strong className="text-slate-200 uppercase font-mono">
                {report.contractType === 'smart_contract' ? 'Web3 Smart Contract' : 'Legal Agreement'}
              </strong>
            </div>

            <div className="mt-1 text-[11px] text-slate-500 font-mono">
              Hash: {report.verificationHash}
            </div>
          </div>

          {/* Findings Summary & Stats */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold font-mono">
                  Audit Completed
                </span>
                {provider && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    Engine: {provider}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {report.contractTitle}
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed mt-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                {report.summary}
              </p>
            </div>

            {/* Severity Pill Counts */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center">
                <div className="text-lg font-bold font-mono">{report.riskCounts.critical}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold">Critical</div>
              </div>
              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300 text-center">
                <div className="text-lg font-bold font-mono">{report.riskCounts.high}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold">High</div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-center">
                <div className="text-lg font-bold font-mono">{report.riskCounts.medium}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold">Medium</div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-center">
                <div className="text-lg font-bold font-mono">{report.riskCounts.low}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold">Low</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 text-slate-400 text-center">
                <div className="text-lg font-bold font-mono">{report.riskCounts.informational}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold">Info</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tabs: Findings, Exploit Simulation, Optimizations, Certificate */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('findings')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'findings'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Vulnerabilities ({report.vulnerabilities.length})</span>
        </button>

        {report.exploitSimulation && (
          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'simulation'
                ? 'border-rose-400 text-rose-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-rose-400" />
            <span>Attack Exploit Simulator</span>
          </button>
        )}

        {report.optimizations.length > 0 && (
          <button
            onClick={() => setActiveTab('optimizations')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'optimizations'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>Optimizations ({report.optimizations.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('certificate')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'certificate'
              ? 'border-emerald-400 text-emerald-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Shield Certification Seal</span>
        </button>
      </div>

      {/* Tab 1: Findings */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {/* Severity filter chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </span>
            {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                  severityFilter === sev
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Cards List */}
          {filteredVulns.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
              <p>No vulnerabilities found matching this filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVulns.map((vuln, idx) => (
                <VulnerabilityCard
                  key={vuln.id || idx}
                  vuln={vuln}
                  defaultExpanded={idx === 0}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Exploit Simulator */}
      {activeTab === 'simulation' && (
        <div>
          <ExploitSimulator flow={report.exploitSimulation} />
        </div>
      )}

      {/* Tab 3: Optimizations */}
      {activeTab === 'optimizations' && (
        <div className="space-y-3">
          {report.optimizations.map((opt, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2"
            >
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40 text-[10px] uppercase font-mono font-semibold">
                  {opt.category}
                </span>
                <h4 className="font-bold text-white text-sm">{opt.title}</h4>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">{opt.description}</p>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-cyan-300/90 font-mono text-[11px]">
                <strong className="text-cyan-400">Action: </strong>
                {opt.suggestion}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Certification Seal */}
      {activeTab === 'certificate' && (
        <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 text-center space-y-4 max-w-2xl mx-auto shadow-2xl relative">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-white">
              Contract Shield Audit Verification Certificate
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Cryptographically timestamped audit report certificate for {report.contractTitle}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-left font-mono text-xs space-y-2 text-slate-300">
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-500">CONTRACT:</span>
              <span className="font-bold text-white">{report.contractTitle}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-500">VERIFICATION HASH:</span>
              <span className="font-bold text-cyan-400">{report.verificationHash}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-500">SECURITY SCORE:</span>
              <span className="font-bold text-emerald-400">{report.overallScore}/100 ({report.letterGrade})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">TIMESTAMP:</span>
              <span>{new Date(report.timestamp).toUTCString()}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `CONTRACT SHIELD VERIFIED\nContract: ${report.contractTitle}\nScore: ${report.overallScore}/100 (${report.letterGrade})\nHash: ${report.verificationHash}\nTimestamp: ${report.timestamp}`
                );
                setCopiedCertificate(true);
                setTimeout(() => setCopiedCertificate(false), 2000);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
            >
              {copiedCertificate ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedCertificate ? 'Copied Certificate Proof' : 'Copy Verification Proof'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
