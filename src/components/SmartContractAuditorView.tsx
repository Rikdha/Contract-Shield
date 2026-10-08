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
import { FaultIsolationBoundary } from './FaultIsolationBoundary';

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

    let md = `# Contract Shield Security Audit Report\n\n`;
    md += `**Contract:** ${report.contractTitle}\n`;
    md += `**Security Score:** ${report.overallScore}/100 (Grade: ${report.letterGrade})\n`;
    md += `**Timestamp:** ${new Date(report.timestamp).toUTCString()}\n\n`;
    md += `## Executive Vulnerability Summary\n`;
    md += `- Critical Severity: ${report.riskCounts.critical}\n`;
    md += `- High Severity: ${report.riskCounts.high}\n`;
    md += `- Medium Severity: ${report.riskCounts.medium}\n`;
    md += `- Low Severity: ${report.riskCounts.low}\n\n`;

    md += `## Detailed Findings & Defensive Remediations\n\n`;
    report.vulnerabilities.forEach((v, index) => {
      md += `### ${index + 1}. ${v.title} [${v.severity.toUpperCase()}]\n`;
      md += `**SWC-ID:** ${v.swcId || 'N/A'}\n\n`;
      md += `**Description:** ${v.description}\n\n`;
      md += `**Impact:** ${v.impact}\n\n`;
      if (v.vulnerableSnippet) {
        md += `**Vulnerable Code:**\n\`\`\`solidity\n${v.vulnerableSnippet}\n\`\`\`\n\n`;
      }
      if (v.patchedSnippet) {
        md += `**Defensive Patch:**\n\`\`\`solidity\n${v.patchedSnippet}\n\`\`\`\n\n`;
      }
      md += `**Remediation Recommendation:** ${v.remediation}\n\n---\n\n`;
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
    <div className="space-y-6" style={{ fontFamily: "'Times New Roman', Times, 'Newsreader', Georgia, serif" }}>
      {/* SECTION 1: CONTRACT PRESETS & WORKSPACE CONTROLS */}
      <FaultIsolationBoundary sectionTitle="Smart Contract Controls" sectionCode="SEC-SC1">
        <section className="p-6 rounded-lg bg-[#fbfaf7] border border-[#dfd9cd] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded bg-stone-900 text-[#f6f4ef] flex items-center justify-center font-bold">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Smart Contract Security Studio
                </h3>
                <p className="text-xs text-stone-600">
                  Static analysis & simulation engine specializing in SWC-107 Reentrancy, SWC-101 Arithmetic, and DeFi Invariants.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-1.5 px-3 py-2 rounded bg-[#fbfaf7] hover:bg-[#ede8df] border border-[#dfd9cd] text-xs font-bold text-stone-800 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-stone-700" />
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
                  className="flex items-center space-x-1.5 px-3 py-2 rounded bg-[#fbfaf7] hover:bg-[#ede8df] border border-[#dfd9cd] text-xs font-bold text-stone-800 transition"
                >
                  <Download className="w-3.5 h-3.5 text-stone-700" />
                  <span>Export Report</span>
                </button>
              )}

              <button
                onClick={() => runAudit(code, contractTitle)}
                disabled={isAuditing || !code.trim()}
                className="flex items-center space-x-2 px-4 py-2 rounded bg-stone-900 hover:bg-stone-800 text-[#f6f4ef] font-bold text-xs shadow-xs disabled:opacity-50 transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isAuditing ? 'Auditing Invariants...' : 'Run Security Audit'}</span>
              </button>
            </div>
          </div>

          {/* Quick Vulnerability Benchmark Archetypes */}
          <div className="pt-3 border-t border-[#ece7dd] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-stone-600 font-bold mr-1">
              Vulnerability Archetypes:
            </span>
            {smartContractSamples.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`px-3 py-1 rounded text-xs font-bold transition flex items-center space-x-1.5 ${
                  contractTitle === sample.name
                    ? 'bg-stone-900 text-[#f6f4ef]'
                    : 'bg-[#f5f2eb] text-stone-700 hover:text-stone-900 hover:bg-[#ede8df] border border-[#dfd9cd]'
                }`}
              >
                <span>{sample.name}</span>
              </button>
            ))}
          </div>
        </section>
      </FaultIsolationBoundary>

      {/* SECTION 2 & 3: SPLIT-SCREEN WORKSPACE (EDITOR & FINDINGS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-250px)] min-h-[640px]">
        {/* Left Column: Solidity Code Editor */}
        <div className="lg:col-span-6 flex flex-col h-full bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg overflow-hidden shadow-xs">
          <FaultIsolationBoundary sectionTitle="Code Editor" sectionCode="SEC-SC2">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#f5f2eb] border-b border-[#dfd9cd] text-xs">
              <div className="flex items-center space-x-2 truncate">
                <FileCode className="w-4 h-4 text-stone-800 shrink-0" />
                <input
                  type="text"
                  value={contractTitle}
                  onChange={e => setContractTitle(e.target.value)}
                  className="bg-transparent font-bold text-stone-900 focus:outline-hidden truncate max-w-[240px]"
                  title="Contract Name"
                />
                <span className="text-stone-500 text-xs">
                  · Solidity ({lines.length} lines)
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyCode}
                  className="p-1 rounded text-stone-600 hover:text-stone-900 transition hover:bg-[#ede8df]"
                  title="Copy code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setCode('')}
                  className="p-1 rounded text-stone-600 hover:text-rose-700 transition hover:bg-[#ede8df]"
                  title="Clear code"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive Code Viewport with Line Numbers */}
            <div className="flex-1 flex overflow-hidden bg-[#fcfbfa] font-mono text-xs">
              {/* Line Numbers Column */}
              <div className="py-3 px-2 text-right select-none text-stone-400 bg-[#f5f2eb] border-r border-[#dfd9cd] w-12 shrink-0 overflow-hidden font-mono text-[11px] leading-relaxed">
                {lines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Editable Code Body */}
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="// Paste Solidity smart contract code here..."
                className="flex-1 p-3.5 bg-[#fcfbfa] text-stone-900 resize-none focus:outline-hidden font-mono text-xs leading-relaxed selection:bg-amber-200 selection:text-stone-900 overflow-auto"
                spellCheck={false}
              />
            </div>

            {/* Live Scanning Status Footer */}
            {isAuditing && (
              <div className="px-4 py-2 bg-[#f5f2eb] border-t border-[#dfd9cd] text-xs text-stone-800 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-stone-900 animate-ping" />
                <span className="font-bold">{auditPhase}</span>
              </div>
            )}
          </FaultIsolationBoundary>
        </div>

        {/* Right Column: Vulnerability Diagnostics & Exploit Analysis */}
        <div className="lg:col-span-6 flex flex-col h-full bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg overflow-hidden shadow-xs">
          <FaultIsolationBoundary sectionTitle="Security Diagnostics" sectionCode="SEC-SC3">
            {report ? (
              <div className="flex flex-col h-full">
                {/* Score & Risk Summary Header */}
                <div className="p-4 sm:p-5 bg-[#f5f2eb] border-b border-[#dfd9cd] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-stone-900">
                          {report.overallScore} / 100
                        </span>
                        <span className="text-stone-400 text-xs">·</span>
                        <span className={`font-bold text-xs px-2.5 py-0.5 rounded border ${
                          report.letterGrade === 'A+' || report.letterGrade === 'A' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                          report.letterGrade === 'B' || report.letterGrade === 'C' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                          'bg-rose-100 text-rose-900 border-rose-300'
                        }`}>
                          Grade {report.letterGrade}
                        </span>
                        <span className="text-stone-600 text-xs italic">
                          ({report.vulnerabilities.length === 0 ? 'Verified Invariants' : `${report.vulnerabilities.length} Flaws Detected`})
                        </span>
                      </div>
                    </div>

                    {/* Clean unboxed counts */}
                    <div className="flex items-center space-x-2 text-xs font-bold">
                      <span className="text-rose-900 flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-rose-600" />
                        <span>{report.riskCounts.critical} Critical</span>
                      </span>
                      <span className="text-amber-900 flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-amber-600" />
                        <span>{report.riskCounts.high} High</span>
                      </span>
                      <span className="text-stone-700 flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-stone-500" />
                        <span>{report.riskCounts.medium} Med</span>
                      </span>
                    </div>
                  </div>

                  {/* Sub-tab Navigation */}
                  <div className="flex items-center space-x-1.5 pt-2 border-t border-[#dfd9cd] text-xs font-bold">
                    <button
                      onClick={() => setActiveSubTab('vulnerabilities')}
                      className={`px-3 py-1.5 rounded transition ${
                        activeSubTab === 'vulnerabilities'
                          ? 'bg-stone-900 text-[#f6f4ef]'
                          : 'text-stone-700 hover:text-stone-900 hover:bg-[#e6e2d8]'
                      }`}
                    >
                      Vulnerabilities ({report.vulnerabilities.length})
                    </button>

                    {report.exploitSimulation && (
                      <button
                        onClick={() => setActiveSubTab('exploit')}
                        className={`px-3 py-1.5 rounded transition flex items-center space-x-1 ${
                          activeSubTab === 'exploit'
                            ? 'bg-rose-800 text-white'
                            : 'text-rose-800 hover:bg-rose-100'
                        }`}
                      >
                        <Flame className="w-3 h-3" />
                        <span>Exploit Trace</span>
                      </button>
                    )}

                    <button
                      onClick={() => setActiveSubTab('optimizations')}
                      className={`px-3 py-1.5 rounded transition ${
                        activeSubTab === 'optimizations'
                          ? 'bg-stone-900 text-[#f6f4ef]'
                          : 'text-stone-700 hover:text-stone-900 hover:bg-[#e6e2d8]'
                      }`}
                    >
                      Gas Optimizations ({report.optimizations.length})
                    </button>
                  </div>
                </div>

                {/* Tab Contents */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  {activeSubTab === 'vulnerabilities' && (
                    report.vulnerabilities.length === 0 ? (
                      <div className="p-8 text-center text-stone-600 space-y-2 bg-[#f6f4ef] rounded border border-[#dfd9cd]">
                        <ShieldCheck className="w-10 h-10 text-emerald-700 mx-auto" />
                        <h4 className="text-sm font-bold text-stone-900">No Security Flaws Detected</h4>
                        <p className="text-xs text-stone-600 max-w-sm mx-auto italic">
                          This contract follows Checks-Effects-Interactions, arithmetic overflow guards, and strict access control invariants.
                        </p>
                      </div>
                    ) : (
                      report.vulnerabilities.map((vuln) => (
                        <div
                          key={vuln.id}
                          className="p-4 rounded bg-[#fcfbfa] border border-[#dfd9cd] space-y-2.5 text-xs shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${
                                vuln.severity === 'critical' ? 'bg-rose-600' :
                                vuln.severity === 'high' ? 'bg-amber-600' : 'bg-stone-600'
                              }`} />
                              <h4 className="font-bold text-stone-900 text-sm">
                                {vuln.title}
                              </h4>
                            </div>

                            <span className="font-mono text-[11px] text-stone-700 px-2 py-0.5 rounded bg-[#f5f2eb] border border-[#dfd9cd]">
                              {vuln.swcId || 'SWC INVARIANT'}
                            </span>
                          </div>

                          <p className="text-stone-700 text-xs leading-relaxed font-serif">
                            {vuln.description}
                          </p>

                          <div className="p-3 rounded bg-rose-50/70 border border-rose-300 text-xs text-rose-950">
                            <span className="font-bold text-rose-900">Impact:</span> {vuln.impact}
                          </div>

                          {/* Vulnerable vs Patched Snippet Comparison */}
                          {vuln.vulnerableSnippet && vuln.patchedSnippet && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 font-mono text-[11px]">
                              <div className="p-3 rounded bg-rose-50/60 border border-rose-300 text-stone-900">
                                <div className="text-[10px] text-rose-900 font-bold mb-1 uppercase tracking-wider font-serif">
                                  Flawed Code
                                </div>
                                <pre className="overflow-x-auto whitespace-pre-wrap">{vuln.vulnerableSnippet}</pre>
                              </div>

                              <div className="p-3 rounded bg-emerald-50/60 border border-emerald-300 text-stone-900">
                                <div className="text-[10px] text-emerald-900 font-bold mb-1 uppercase tracking-wider font-serif">
                                  Defensive Patch
                                </div>
                                <pre className="overflow-x-auto whitespace-pre-wrap">{vuln.patchedSnippet}</pre>
                              </div>
                            </div>
                          )}

                          <div className="text-xs text-emerald-900 pt-1">
                            <span className="font-bold text-stone-900">Remediation:</span> {vuln.remediation}
                          </div>
                        </div>
                      ))
                    )
                  )}

                  {/* Exploit Trace Tab */}
                  {activeSubTab === 'exploit' && report.exploitSimulation && (
                    <div className="space-y-4">
                      <div className="p-4 rounded bg-rose-50/80 border border-rose-300 text-xs">
                        <div className="font-bold text-rose-950 mb-1 text-sm">
                          {report.exploitSimulation.title}
                        </div>
                        <div className="text-xs text-rose-900">
                          Consequence: {report.exploitSimulation.consequence}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {report.exploitSimulation.steps.map((st) => (
                          <div key={st.step} className="p-4 rounded bg-[#fcfbfa] border border-[#dfd9cd] text-xs space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-stone-900">
                                Step {st.step} · {st.actor}
                              </span>
                            </div>
                            <p className="text-stone-700 text-xs leading-relaxed font-serif">
                              {st.action}
                            </p>
                            <div className="p-2 rounded bg-[#f5f2eb] border border-[#e2ddd1] font-mono text-[11px] text-stone-900 overflow-x-auto">
                              {st.codeOrDetail}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gas Optimizations Tab */}
                  {activeSubTab === 'optimizations' && (
                    <div className="space-y-3">
                      {report.optimizations.map((opt, i) => (
                        <div key={i} className="p-4 rounded bg-[#fcfbfa] border border-[#dfd9cd] text-xs space-y-1.5">
                          <div className="font-bold text-stone-900 text-xs">
                            {opt.title}
                          </div>
                          <p className="text-stone-700 text-xs leading-relaxed font-serif">
                            {opt.description}
                          </p>
                          <div className="text-xs text-stone-900 pt-1">
                            <span className="font-bold text-stone-900">Optimization:</span> {opt.suggestion}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-stone-500 text-xs">
                <div>
                  <Code2 className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="font-bold text-stone-800">No audit in memory</p>
                  <p className="text-stone-500 italic mt-0.5">Click "Run Security Audit" to evaluate smart contract invariants.</p>
                </div>
              </div>
            )}
          </FaultIsolationBoundary>
        </div>
      </div>
    </div>
  );
};
