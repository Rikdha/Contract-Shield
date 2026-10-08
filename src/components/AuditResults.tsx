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
    if (score >= 85) return 'text-emerald-700 border-emerald-300 bg-emerald-50';
    if (score >= 70) return 'text-blue-700 border-blue-300 bg-blue-50';
    if (score >= 50) return 'text-amber-700 border-amber-300 bg-amber-50';
    return 'text-rose-700 border-rose-300 bg-rose-50';
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
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Contract Editor</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={downloadReportMarkdown}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition"
            title="Download full Markdown audit report"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Report (MD)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Score Badge */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
              Security Score
            </div>
            
            <div className={`relative flex items-center justify-center w-28 h-28 rounded-full border-4 ${getScoreColor(report.overallScore)} font-extrabold my-2`}>
              <div className="flex flex-col items-center">
                <span className="text-3xl tracking-tight font-mono">
                  {report.overallScore}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Grade {report.letterGrade}
                </span>
              </div>
            </div>

            <div className="mt-2 text-xs text-slate-600">
              Contract Type:{' '}
              <strong className="text-slate-900 uppercase font-mono">
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
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-semibold font-mono">
                  Audit Verified
                </span>
                {provider && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    Engine: {provider}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {report.contractTitle}
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {report.summary}
              </p>
            </div>

            {/* Severity Pill Counts */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-center">
                <div className="text-lg font-bold font-mono">{report.riskCounts.critical}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold">Critical</div>
              </div>
              <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-center">
                <div className="text-lg font-bold font-mono">{report.riskCounts.high}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold">High</div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-center">
                <div className="text-lg font-bold font-mono">{report.riskCounts.medium}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold">Medium</div>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-center">
                <div className="text-lg font-bold font-mono">{report.riskCounts.low}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold">Low</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-center">
                <div className="text-lg font-bold font-mono">{report.riskCounts.informational}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold">Info</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('findings')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'findings'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Vulnerability Findings ({report.vulnerabilities.length})
          </button>

          {report.exploitSimulation && (
            <button
              onClick={() => setActiveTab('simulation')}
              className={`pb-3 border-b-2 transition ${
                activeTab === 'simulation'
                  ? 'border-rose-600 text-rose-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Exploit Sandbox
            </button>
          )}

          <button
            onClick={() => setActiveTab('optimizations')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'optimizations'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Optimizations ({report.optimizations.length})
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'findings' && (
        <div className="space-y-3">
          {filteredVulns.map((v) => (
            <VulnerabilityCard key={v.id} vuln={v} defaultExpanded={false} />
          ))}
        </div>
      )}

      {activeTab === 'simulation' && report.exploitSimulation && (
        <ExploitSimulator flow={report.exploitSimulation} />
      )}

      {activeTab === 'optimizations' && (
        <div className="space-y-3">
          {report.optimizations.map((opt, i) => (
            <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs">
              <h4 className="font-semibold text-slate-900 text-xs">{opt.title}</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">{opt.description}</p>
              <div className="text-[11px] text-slate-800 font-medium pt-1">
                Recommendation: {opt.suggestion}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
