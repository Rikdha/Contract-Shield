import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  ShieldAlert, 
  ShieldCheck, 
  Play, 
  RotateCcw, 
  Upload, 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  FileCode, 
  ChevronRight, 
  Layers,
  Cpu,
  History,
  Download,
  Flame,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { AuditReport, Vulnerability, SampleContract } from '../types/contract';
import { performClientSecurityAudit, getAuditHistory, saveAuditToHistory } from '../services/auditService';
import { SAMPLE_CONTRACTS } from '../data/sampleContracts';

export const SmartContractAuditorView: React.FC = () => {
  const smartContractSamples = SAMPLE_CONTRACTS.filter(s => s.type === 'smart_contract');
  const defaultSample = smartContractSamples[0];

  const [code, setCode] = useState<string>(defaultSample?.code || '');
  const [contractTitle, setContractTitle] = useState<string>(defaultSample?.name || 'Smart Contract Audit');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditPhase, setAuditPhase] = useState<string>('');
  const [report, setReport] = useState<AuditReport | null>(null);
  const [selectedVulnId, setSelectedVulnId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'vulnerabilities' | 'exploit' | 'optimizations'>('vulnerabilities');

  // Run initial audit on mount
  useEffect(() => {
    if (code) {
      runAudit(code, contractTitle);
    }
  }, []);

  const runAudit = (targetCode: string, title: string) => {
    setIsAuditing(true);
    setAuditPhase('Phase 1: Parsing AST & Contract Invariants...');

    setTimeout(() => {
      setAuditPhase('Phase 2: Checking SWC-107 Reentrancy & CEI Violations...');
      setTimeout(() => {
        setAuditPhase('Phase 3: Evaluating SWC-101 Integer Overflows & SafeMath...');
        setTimeout(() => {
          setAuditPhase('Phase 4: Synthesizing Exploit Simulation & Defensive Patches...');
          setTimeout(() => {
            const auditResult = performClientSecurityAudit(targetCode, 'smart_contract', title);
            setReport(auditResult);
            saveAuditToHistory(auditResult);
            setIsAuditing(false);
            setAuditPhase('');
            if (auditResult.vulnerabilities.length > 0) {
              setSelectedVulnId(auditResult.vulnerabilities[0].id);
            }
          }, 300);
        }, 300);
      }, 300);
    }, 300);
  };

  const handleSelectSample = (sample: SampleContract) => {
    setCode(sample.code);
    setContractTitle(sample.name);
    runAudit(sample.code, sample.name);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const title = file.name.replace(/\.[^/.]+$/, '');
    setContractTitle(title);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCode(content);
        runAudit(content, title);
      }
    };
    reader.readAsText(file);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const exportReportMarkdown = () => {
    if (!report) return;
    let md = `# Smart Contract Security Audit Report: ${report.contractTitle}\n\n`;
    md += `**Timestamp:** ${report.timestamp}\n`;
    md += `**Security Score:** ${report.overallScore}/100 (Grade: ${report.letterGrade})\n`;
    md += `**Verification Hash:** \`${report.verificationHash}\`\n\n`;
    md += `## Executive Summary\n${report.summary}\n\n`;
    md += `## Vulnerability Diagnostics (${report.vulnerabilities.length} Found)\n\n`;

    report.vulnerabilities.forEach((v, idx) => {
      md += `### ${idx + 1}. [${v.severity.toUpperCase()}] ${v.title} (${v.swcId || 'SWC'})\n`;
      md += `**Category:** ${v.category}\n`;
      md += `**Impact:** ${v.impact}\n\n`;
      md += `**Technical Description:**\n${v.description}\n\n`;
      if (v.vulnerableSnippet) {
        md += `\`\`\`solidity\n// VULNERABLE SNIPPET\n${v.vulnerableSnippet}\n\`\`\`\n\n`;
      }
      if (v.patchedSnippet) {
        md += `\`\`\`solidity\n// DEFENSIVE PATCH\n${v.patchedSnippet}\n\`\`\`\n\n`;
      }
      md += `**Remediation Recommendation:**\n${v.remediation}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AuditReport-${report.contractTitle.replace(/\s+/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate line numbers
  const lines = code.split('\n');

  return (
    <div className="space-y-4">
      {/* Top Header & Presets Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white font-heading">
                Smart Contract Security Auditor
              </h2>
              <p className="text-xs text-slate-400">
                Static analysis engine specializing in SWC-107 Reentrancy, SWC-101 Integer Overflows, and DeFi invariants.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 cursor-pointer transition">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upload .sol</span>
              <input 
                type="file" 
                accept=".sol,.vy,.rs,.txt" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>

            {report && (
              <button
                onClick={exportReportMarkdown}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export Report</span>
              </button>
            )}

            <button
              onClick={() => runAudit(code, contractTitle)}
              disabled={isAuditing || !code.trim()}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md shadow-cyan-500/20 disabled:opacity-50 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isAuditing ? 'Auditing...' : 'Run Security Audit'}</span>
            </button>
          </div>
        </div>

        {/* Quick Vulnerability Sample Presets */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 text-[11px] font-medium mr-1">
            Vulnerability Benchmarks:
          </span>
          {smartContractSamples.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center space-x-1.5 ${
                contractTitle === sample.name
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              <span>{sample.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-250px)] min-h-[640px]">
        {/* Left Column: Solidity Code Editor */}
        <div className="lg:col-span-6 flex flex-col h-full bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 text-xs">
            <div className="flex items-center space-x-2 truncate">
              <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <input
                type="text"
                value={contractTitle}
                onChange={e => setContractTitle(e.target.value)}
                className="bg-transparent font-medium text-slate-200 focus:outline-none focus:text-white truncate max-w-[240px]"
                title="Contract Name"
              />
              <span className="text-slate-500 text-[11px]">
                · Solidity ({lines.length} lines)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyCode}
                className="p-1 rounded text-slate-400 hover:text-white transition"
                title="Copy code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setCode('')}
                className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
                title="Clear code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Code Viewport with Line Numbers */}
          <div className="flex-1 flex overflow-hidden bg-slate-950 font-mono text-xs">
            {/* Line Numbers Column */}
            <div className="py-3 px-2 text-right select-none text-slate-600 bg-slate-950/80 border-r border-slate-800/60 w-12 shrink-0 overflow-hidden font-mono text-[11px] leading-relaxed">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Editable Code Body */}
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="// Paste Solidity smart contract code here..."
              className="flex-1 p-3 bg-transparent text-slate-200 resize-none focus:outline-none font-mono text-[11px] leading-relaxed selection:bg-cyan-500/20 selection:text-cyan-200 overflow-auto"
              spellCheck={false}
            />
          </div>

          {/* Live Scanning Status Footer */}
          {isAuditing && (
            <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-cyan-400 flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>{auditPhase}</span>
            </div>
          )}
        </div>

        {/* Right Column: Vulnerability Diagnostics & Exploit Analysis */}
        <div className="lg:col-span-6 flex flex-col h-full bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden">
          {report ? (
            <div className="flex flex-col h-full">
              {/* Score & Risk Summary Header */}
              <div className="p-4 bg-slate-950/80 border-b border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xl font-bold font-mono ${
                        report.overallScore >= 80 ? 'text-emerald-400' :
                        report.overallScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {report.overallScore} / 100
                      </span>
                      <span className="text-slate-500 text-xs">·</span>
                      <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        report.letterGrade === 'A+' || report.letterGrade === 'A' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50' :
                        report.letterGrade === 'B' || report.letterGrade === 'C' ? 'bg-amber-950 text-amber-300 border border-amber-800/50' :
                        'bg-rose-950 text-rose-300 border border-rose-800/50'
                      }`}>
                        Grade {report.letterGrade}
                      </span>
                      <span className="text-slate-400 text-xs">
                        ({report.vulnerabilities.length === 0 ? 'Audited Secure' : `${report.vulnerabilities.length} Flaws Detected`})
                      </span>
                    </div>
                  </div>

                  {/* Clean unboxed vulnerability counts */}
                  <div className="flex items-center space-x-2 font-mono text-[11px]">
                    <span className="text-rose-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>{report.riskCounts.critical} Critical</span>
                    </span>
                    <span className="text-amber-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{report.riskCounts.high} High</span>
                    </span>
                    <span className="text-blue-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{report.riskCounts.medium} Med</span>
                    </span>
                  </div>
                </div>

                {/* Sub-tab Navigation */}
                <div className="flex items-center space-x-1 pt-1 border-t border-slate-800/60 text-xs">
                  <button
                    onClick={() => setActiveSubTab('vulnerabilities')}
                    className={`px-3 py-1 rounded-md transition font-medium ${
                      activeSubTab === 'vulnerabilities'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Vulnerabilities ({report.vulnerabilities.length})
                  </button>

                  {report.exploitSimulation && (
                    <button
                      onClick={() => setActiveSubTab('exploit')}
                      className={`px-3 py-1 rounded-md transition font-medium flex items-center space-x-1 ${
                        activeSubTab === 'exploit'
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                          : 'text-rose-400 hover:text-rose-300'
                      }`}
                    >
                      <Flame className="w-3 h-3" />
                      <span>Exploit Trace</span>
                    </button>
                  )}

                  <button
                    onClick={() => setActiveSubTab('optimizations')}
                    className={`px-3 py-1 rounded-md transition font-medium ${
                      activeSubTab === 'optimizations'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Gas Optimizations ({report.optimizations.length})
                  </button>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeSubTab === 'vulnerabilities' && (
                  report.vulnerabilities.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                      <h4 className="text-sm font-semibold text-white">No Security Flaws Detected</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        This contract follows safe state modification patterns, arithmetic guards, and access control invariants.
                      </p>
                    </div>
                  ) : (
                    report.vulnerabilities.map((vuln) => (
                      <div
                        key={vuln.id}
                        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5 text-xs"
                      >
                        {/* Title & SWC Badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${
                              vuln.severity === 'critical' ? 'bg-rose-500' :
                              vuln.severity === 'high' ? 'bg-amber-500' : 'bg-blue-500'
                            }`} />
                            <h4 className="font-semibold text-white text-xs">
                              {vuln.title}
                            </h4>
                          </div>

                          <span className="font-mono text-[10px] text-slate-500">
                            {vuln.swcId || 'SWC INVARIANT'}
                          </span>
                        </div>

                        {/* Description & Impact */}
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {vuln.description}
                        </p>

                        <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/30 text-[11px] text-rose-300">
                          <span className="font-semibold">Impact:</span> {vuln.impact}
                        </div>

                        {/* Vulnerable vs Patched Snippet Comparison */}
                        {vuln.vulnerableSnippet && vuln.patchedSnippet && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                            {/* Vulnerable Snippet */}
                            <div className="p-2.5 rounded bg-rose-950/30 border border-rose-800/40 text-rose-200">
                              <div className="text-[9px] text-rose-400 font-semibold mb-1 uppercase tracking-wider">
                                Flawed Code
                              </div>
                              <pre className="overflow-x-auto whitespace-pre-wrap">{vuln.vulnerableSnippet}</pre>
                            </div>

                            {/* Patched Snippet */}
                            <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-800/40 text-emerald-200">
                              <div className="text-[9px] text-emerald-400 font-semibold mb-1 uppercase tracking-wider">
                                Defensive Patch
                              </div>
                              <pre className="overflow-x-auto whitespace-pre-wrap">{vuln.patchedSnippet}</pre>
                            </div>
                          </div>
                        )}

                        {/* Remediation Note */}
                        <div className="text-[11px] text-emerald-400 pt-1">
                          <span className="font-semibold text-slate-300">Remediation:</span> {vuln.remediation}
                        </div>
                      </div>
                    ))
                  )
                )}

                {/* Exploit Trace Tab */}
                {activeSubTab === 'exploit' && report.exploitSimulation && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs">
                      <div className="font-semibold text-rose-200 mb-0.5">
                        {report.exploitSimulation.title}
                      </div>
                      <div className="text-[11px] text-rose-300/80">
                        Consequence: {report.exploitSimulation.consequence}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {report.exploitSimulation.steps.map((st) => (
                        <div key={st.step} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-cyan-400 font-semibold">
                              Step {st.step} · {st.actor}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {st.action}
                          </p>
                          <div className="p-1.5 rounded bg-slate-900 border border-slate-800/60 font-mono text-[10px] text-slate-400 overflow-x-auto">
                            {st.codeOrDetail}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gas Optimizations Tab */}
                {activeSubTab === 'optimizations' && (
                  <div className="space-y-2.5">
                    {report.optimizations.map((opt, i) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="font-semibold text-white text-xs">
                          {opt.title}
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          {opt.description}
                        </p>
                        <div className="text-[11px] text-cyan-300 pt-0.5">
                          <span className="font-semibold text-slate-400">Recommendation:</span> {opt.suggestion}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500 text-xs">
              <div>
                <Code2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p>Click "Run Security Audit" to evaluate smart contract vulnerabilities.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
