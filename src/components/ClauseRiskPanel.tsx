import React, { useState, useEffect } from 'react';
import { Clause, RiskFlag, UserRole } from '../types/contract';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  FileCheck2, 
  MessageSquare, 
  Lightbulb, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Loader2,
  Scale,
  Shield,
  Layers
} from 'lucide-react';

export interface RemediationOption {
  id: string;
  title: string;
  posture: string;
  explanation: string;
  text: string;
}

interface ClauseRiskPanelProps {
  clauses: Clause[];
  riskFlags: RiskFlag[];
  riskScore: number;
  userRole: UserRole;
  selectedClauseId: number | null;
  onSelectClause: (clauseId: number) => void;
  onApplyRemediation: (clauseId: number, alternativeText: string) => void;
  onAskAiAboutClause?: (clauseText: string, clauseNum: string) => void;
}

// Plain English mapping for friendly terms
function getPlainEnglishExplanation(category: string, ruleName: string): { title: string; explanation: string; action: string } {
  if (ruleName.includes('Indemnification') || category.includes('Liability')) {
    return {
      title: 'Unlimited Liability Trap (One-Sided Financial Exposure)',
      explanation: 'If the other party is sued or unhappy with your work, they expect you to pay all legal fees and damages with no cap on the total cost, while they assume zero reciprocal responsibility.',
      action: 'Demand a mutual liability cap equal to the fees actually paid to you over the prior 12 months.',
    };
  }
  if (ruleName.includes('Non-Compete') || category.includes('Restrictive')) {
    return {
      title: 'Career Restraint Covenant (3-Year Industry Exclusion)',
      explanation: 'This clause attempts to prevent you from taking another job, consulting, or starting a business anywhere in software or technology for 36 months after leaving.',
      action: 'Strike this out or narrow it to a 6-month non-solicitation of active clients whom you directly served.',
    };
  }
  if (ruleName.includes('IP') || ruleName.includes('Landgrab') || category.includes('Intellectual Property')) {
    return {
      title: 'Post-Termination IP Assignment (Loss of Personal Inventions)',
      explanation: 'They claim ownership of everything you invent or write—even on your personal equipment, during your off-hours, for five years after this contract terminates.',
      action: 'Specify that they only own the deliverables specifically paid for, while you retain all prior tools, codebases, and independent works.',
    };
  }
  if (ruleName.includes('Auto-Renewal') || category.includes('Term & Renewal')) {
    return {
      title: 'Automatic Multi-Year Renewal with Unilateral Escalation',
      explanation: 'Unless you send written certified postal mail in a narrow 30-day window, you are automatically locked in for another 24-month term with up to 50% price increases.',
      action: 'Convert this to month-to-month renewal with standard 30-day email cancellation notice and capped annual rate adjustments.',
    };
  }
  if (ruleName.includes('Venue') || ruleName.includes('Arbitration') || category.includes('Dispute')) {
    return {
      title: 'Asymmetric Foreign Arbitration Jurisdiction',
      explanation: 'In the event of a dispute, you are forced to travel to an expensive offshore location (such as the Cayman Islands), imposing prohibitive travel and legal costs.',
      action: 'Designate your local state court or neutral mutual arbitration.',
    };
  }
  if (ruleName.includes('Withholding') || category.includes('Payment')) {
    return {
      title: 'Unilateral Payment Withholding Discretion',
      explanation: 'The client reserves the right to reduce or cancel milestone payments based purely on subjective internal feelings.',
      action: 'Require payment of undisputed invoices within 30 days, with mandatory written notice and a 10-day cure period for bona fide disputes.',
    };
  }
  return {
    title: 'Unbalanced Contract Clause',
    explanation: 'This clause disproportionately favors the counterparty and creates unmitigated legal exposure.',
    action: 'Review and apply the balanced market-standard wording recommended below.',
  };
}

// Client fallback generation
function generateClientFallbackOptions(category: string, ruleName: string): RemediationOption[] {
  const cat = (category || '').toLowerCase();
  const rule = (ruleName || '').toLowerCase();

  if (cat.includes('indemnif') || cat.includes('liability') || rule.includes('indemnif')) {
    return [
      {
        id: 'opt-1',
        title: 'Option 1: Mutual 12-Month Liability Cap',
        posture: 'Mutual Compromise',
        explanation: 'Standard market compromise capping exposure for both parties equally at 12 months fees, disclaiming consequential damages.',
        text: 'Each party’s aggregate cumulative liability arising out of or related to this Agreement shall be strictly capped at the total fees actually paid or payable by Company to Contractor in the twelve (12) months preceding the claim. In no event shall either party be liable for any indirect, special, incidental, or consequential damages.',
      },
      {
        id: 'opt-2',
        title: 'Option 2: Signer-Protective Safe Harbor',
        posture: 'Signer Protective',
        explanation: 'Excludes contractor liability entirely except for proven intentional gross misconduct, shifting project usage risk to the client.',
        text: 'Contractor shall have no liability to Company or any third party for any damages, losses, or claims arising from the deliverables, except in cases of proven intentional gross misconduct. Company agrees to defend, indemnify, and hold harmless Contractor against all third-party claims arising from Company’s use of the deliverables.',
      },
      {
        id: 'opt-3',
        title: 'Option 3: Fixed Dollar Exposure Ceiling ($10,000)',
        posture: 'Narrowed Scope',
        explanation: 'Caps exposure at a predictable flat dollar amount with strict 30-day written notice and cure requirements.',
        text: 'Notwithstanding anything to the contrary, Contractor’s total cumulative liability for all claims arising under this Agreement shall not exceed the lesser of $10,000 or the total compensation received. Any indemnification claim is contingent upon Company providing prompt written notice within thirty (30) days.',
      },
    ];
  }

  if (cat.includes('restrictive') || cat.includes('compete') || rule.includes('compete')) {
    return [
      {
        id: 'opt-1',
        title: 'Option 1: Narrow Client Non-Solicit (6 Months)',
        posture: 'Mutual Compromise',
        explanation: 'Replaces the excessive global industry restriction with a standard 6-month non-solicitation of directly served clients.',
        text: 'For a period of six (6) months following termination of this Agreement, Contractor shall not directly solicit the business of any active client of Company whom Contractor personally and substantially provided services to during the engagement. No general restriction on software engineering, technology consulting, or independent business shall apply.',
      },
      {
        id: 'opt-2',
        title: 'Option 2: Complete Deletion (Right-to-Work)',
        posture: 'Signer Protective',
        explanation: 'Explicitly strikes out the non-compete covenant in compliance with California Bus. & Prof. Code § 16600 and modern labor policy.',
        text: 'The parties acknowledge and agree that Contractor retains the complete and unrestricted right to provide services, seek employment, and operate in any industry or geographic region without restriction. Any non-competition covenant is hereby struck and void.',
      },
      {
        id: 'opt-3',
        title: 'Option 3: Fully Paid Garden Leave Stanza',
        posture: 'Compensated Standstill',
        explanation: 'Allows non-compete only if Company pays 100% full monthly compensation during the restricted standstill duration.',
        text: 'Any covenant not to compete shall apply solely for a maximum duration of three (3) months and shall be contingent upon Company paying Contractor 100% of the average monthly contract compensation for each month of the restriction period.',
      },
    ];
  }

  if (cat.includes('intellectual') || cat.includes('ip') || rule.includes('ip') || rule.includes('inventions')) {
    return [
      {
        id: 'opt-1',
        title: 'Option 1: Deliverables-Only Assignment (Tool Retainer)',
        posture: 'Mutual Compromise',
        explanation: 'Transfers ownership of paid custom deliverables while explicitly protecting your pre-existing tools and independent frameworks.',
        text: 'Company shall exclusively own all final custom deliverables created and paid for pursuant to an authorized Statement of Work. Contractor exclusively retains all right, title, and interest in all pre-existing tools, codebases, frameworks, developer utilities, and independently authored materials.',
      },
      {
        id: 'opt-2',
        title: 'Option 2: Commercial License Only (Contractor Retains IP)',
        posture: 'Signer Protective',
        explanation: 'Contractor retains ultimate IP ownership and grants the company a perpetual, royalty-free commercial usage license.',
        text: 'Contractor retains full intellectual property ownership of all software and materials created. Subject to payment in full, Contractor grants Company a perpetual, worldwide, non-exclusive, royalty-free license to use, modify, and deploy the deliverables for internal business operations.',
      },
      {
        id: 'opt-3',
        title: 'Option 3: Strict On-Hours & Company Equipment Boundary',
        posture: 'Personal Boundary Carve-Out',
        explanation: 'Carves out strict protection for everything created outside paid client hours and personal hardware.',
        text: 'Ownership assignments shall apply exclusively to inventions conceived solely during working hours, using Company-provided equipment, and directly related to Company’s current proprietary software. Contractor retains full title to all independent off-hours works.',
      },
    ];
  }

  // General fallback
  return [
    {
      id: 'opt-1',
      title: 'Option 1: Bilateral Mutual Protection (Standard)',
      posture: 'Mutual Compromise',
      explanation: 'Converts one-sided stipulations into equal, balanced obligations for both parties.',
      text: 'The obligations in this Section shall apply mutually and equally to both parties. Neither party shall be subject to unilateral discretion, unmitigated exposure, or unreciprocated indemnities without equal protection.',
    },
    {
      id: 'opt-2',
      title: 'Option 2: Strict Notice & Cure Safe Harbor',
      posture: 'Due Process Safeguard',
      explanation: 'Requires 30 days written notice with mandatory cure opportunity before any penalty can be assessed.',
      text: 'Prior to exercising any remedy, withholding, or claim under this Section, the non-breaching party must provide thirty (30) days detailed written notice specifying the deficiency, and provide thirty (30) days to cure such breach in good faith.',
    },
    {
      id: 'opt-3',
      title: 'Option 3: Balanced Neutral Commercial Wording',
      posture: 'Narrowed Exposure',
      explanation: 'Restricts scope to direct documented damages under governing commercial laws.',
      text: 'Any rights or remedies under this Section shall be strictly limited to direct, documented damages and governed by standard commercial equity principles without punitive penalties or unilateral forfeiture.',
    },
  ];
}

export const ClauseRiskPanel: React.FC<ClauseRiskPanelProps> = ({
  clauses,
  riskFlags,
  riskScore,
  userRole,
  selectedClauseId,
  onSelectClause,
  onApplyRemediation,
  onAskAiAboutClause,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [plainEnglishMode, setPlainEnglishMode] = useState<boolean>(true);
  const [expandedRemediations, setExpandedRemediations] = useState<{ [clauseId: number]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedOptionMap, setAppliedOptionMap] = useState<{ [clauseId: number]: string }>({});

  // AI Alternative suggestions state
  const [suggestionsMap, setSuggestionsMap] = useState<{ [clauseId: number]: RemediationOption[] }>({});
  const [loadingMap, setLoadingMap] = useState<{ [clauseId: number]: boolean }>({});

  // Automatically fetch 3 alternative clauses for all high-risk flags
  useEffect(() => {
    clauses.forEach((clause) => {
      const flags = riskFlags.filter(f => f.clause_id === clause.id);
      const isHigh = flags.some(f => f.severity === 'HIGH');

      if (isHigh && !suggestionsMap[clause.id] && !loadingMap[clause.id]) {
        fetchAlternativesForClause(clause, flags[0]);
      }
    });
  }, [clauses, riskFlags]);

  const fetchAlternativesForClause = async (clause: Clause, flag?: RiskFlag) => {
    setLoadingMap(prev => ({ ...prev, [clause.id]: true }));

    try {
      const res = await fetch('/api/remediation-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clauseText: clause.text,
          category: clause.category,
          ruleName: flag?.rule_name || clause.category,
          issueSummary: flag?.issue_summary || 'High risk contractual exposure',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length >= 3) {
          setSuggestionsMap(prev => ({ ...prev, [clause.id]: data.suggestions }));
          setLoadingMap(prev => ({ ...prev, [clause.id]: false }));
          return;
        }
      }
    } catch (err) {
      console.warn('API suggestion fetch failed, using expert fallback:', err);
    }

    // Fallback if network or server unavailable
    const fallbacks = generateClientFallbackOptions(clause.category, flag?.rule_name || '');
    setSuggestionsMap(prev => ({ ...prev, [clause.id]: fallbacks }));
    setLoadingMap(prev => ({ ...prev, [clause.id]: false }));
  };

  const toggleRemediation = (clauseId: number) => {
    setExpandedRemediations(prev => ({
      ...prev,
      [clauseId]: !prev[clauseId],
    }));

    // If opened and suggestions don't exist yet, trigger fetch
    if (!suggestionsMap[clauseId] && !loadingMap[clauseId]) {
      const clause = clauses.find(c => c.id === clauseId);
      const flag = riskFlags.find(f => f.clause_id === clauseId);
      if (clause) {
        fetchAlternativesForClause(clause, flag);
      }
    }
  };

  const handleCopy = (idStr: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idStr);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyAlternative = (clauseId: number, option: RemediationOption) => {
    onApplyRemediation(clauseId, option.text);
    setAppliedOptionMap(prev => ({ ...prev, [clauseId]: option.title }));
  };

  const filteredClauses = clauses.filter(c => {
    const flags = riskFlags.filter(f => f.clause_id === c.id);
    if (filterSeverity === 'ALL') return true;
    if (filterSeverity === 'SAFE') return flags.length === 0;
    return flags.some(f => f.severity === filterSeverity);
  });

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-rose-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-white text-sm font-heading">
              Risk Diagnostics & AI Remediation
            </h3>
          </div>

          {/* Clean Risk Score */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400">Risk Index:</span>
            <span className={`font-mono font-bold text-sm ${getScoreColor(riskScore)}`}>
              {riskScore}/100
            </span>
          </div>
        </div>

        {/* Filter Bar & Plain English Toggle */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center space-x-1">
            {['ALL', 'HIGH', 'MEDIUM', 'SAFE'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  filterSeverity === sev
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {sev === 'ALL' ? 'All Clauses' : sev === 'SAFE' ? 'Compliant' : `${sev}`}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPlainEnglishMode(!plainEnglishMode)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition ${
              plainEnglishMode
                ? 'bg-amber-950/40 text-amber-300 border border-amber-800/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Plain English</span>
          </button>
        </div>
      </div>

      {/* Clauses Risk List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredClauses.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs">No clauses found matching the current filter criteria.</p>
          </div>
        ) : (
          filteredClauses.map((clause) => {
            const flags = riskFlags.filter(f => f.clause_id === clause.id);
            const isSelected = selectedClauseId === clause.id;
            const primaryFlag = flags[0];
            const isHighRisk = flags.some(f => f.severity === 'HIGH');
            const isRemediationOpen = expandedRemediations[clause.id] !== false; // Open by default for clarity
            const suggestions = suggestionsMap[clause.id];
            const isLoadingSuggestions = loadingMap[clause.id];
            const appliedOptionTitle = appliedOptionMap[clause.id];

            const highestSev = flags.some(f => f.severity === 'HIGH')
              ? 'HIGH'
              : flags.some(f => f.severity === 'MEDIUM')
              ? 'MEDIUM'
              : 'SAFE';

            const plainInfo = primaryFlag 
              ? getPlainEnglishExplanation(clause.category, primaryFlag.rule_name)
              : null;

            return (
              <div
                key={clause.id}
                onClick={() => onSelectClause(clause.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500/50 bg-slate-900/90 ring-1 ring-cyan-500/20 shadow-md'
                    : 'border-slate-800/80 bg-slate-950/70 hover:border-slate-700/80 hover:bg-slate-900/40'
                }`}
              >
                {/* Clause Header */}
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center space-x-1.5 font-medium truncate">
                    <span className="font-mono font-semibold text-white">
                      Section {clause.clause_number}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-300 truncate max-w-[200px]">
                      {clause.category}
                    </span>
                  </div>

                  {/* Clean unboxed risk indicator */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {appliedOptionTitle && (
                      <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-mono">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Patched</span>
                      </span>
                    )}
                    <span className={`flex items-center space-x-1.5 font-mono text-[11px] ${
                      highestSev === 'HIGH' ? 'text-rose-400' :
                      highestSev === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        highestSev === 'HIGH' ? 'bg-rose-500' :
                        highestSev === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <span>{highestSev === 'SAFE' ? 'Compliant' : `${highestSev} Risk`}</span>
                    </span>
                  </div>
                </div>

                {/* Plain English Editorial Translation */}
                {plainEnglishMode && plainInfo && (
                  <div className="my-2 pl-3 border-l-2 border-amber-500/40 space-y-1 py-0.5">
                    <div className="font-medium text-amber-300 text-xs flex items-center space-x-1">
                      <span>{plainInfo.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      {plainInfo.explanation}
                    </p>
                    <div className="text-[10px] text-emerald-400 pt-0.5">
                      <span className="font-semibold">Recommended position:</span> {plainInfo.action}
                    </div>
                  </div>
                )}

                {/* Original Clause Text */}
                <div className="my-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <p className="text-slate-300 leading-relaxed font-serif text-[11px]">
                    {clause.text}
                  </p>
                </div>

                {/* Action Bar */}
                {primaryFlag && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        {onAskAiAboutClause && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAskAiAboutClause(clause.text, clause.clause_number || '');
                            }}
                            className="flex items-center space-x-1 text-slate-400 hover:text-cyan-300 text-[11px] transition"
                            title="Consult AI Assistant"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Ask Advisor</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRemediation(clause.id);
                          }}
                          className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 text-[11px] font-medium"
                        >
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>{isRemediationOpen ? 'Hide 3 Alternatives' : 'View 3 AI Alternatives'}</span>
                          {isRemediationOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      {userRole !== 'Viewer' && userRole !== 'User' && !isHighRisk && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onApplyRemediation(clause.id, primaryFlag.suggested_alternative);
                          }}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-medium transition shadow-xs"
                          title="Apply standard balanced alternative clause"
                        >
                          <Check className="w-3 h-3" />
                          <span>Apply Patch</span>
                        </button>
                      )}
                    </div>

                    {/* EXPANDED 3 ALTERNATIVE CLAUSE SUGGESTIONS (FOR HIGH-RISK FLAGS) */}
                    {isRemediationOpen && (
                      <div className="mt-3 space-y-2.5 pt-2 border-t border-slate-800/60">
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center space-x-1.5 text-cyan-400 font-medium">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>3 AI Alternative Suggestions (1-Click Remediation):</span>
                          </div>
                          {isLoadingSuggestions && (
                            <div className="flex items-center space-x-1 text-slate-400 text-[10px]">
                              <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                              <span>Drafting options...</span>
                            </div>
                          )}
                        </div>

                        {/* Suggestions List */}
                        {suggestions && suggestions.length > 0 ? (
                          <div className="space-y-2">
                            {suggestions.map((option, idx) => {
                              const isApplied = appliedOptionTitle === option.title;

                              return (
                                <div
                                  key={option.id || idx}
                                  className={`p-3 rounded-lg border transition-all text-xs space-y-1.5 ${
                                    isApplied
                                      ? 'bg-emerald-950/20 border-emerald-500/50 ring-1 ring-emerald-500/30'
                                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                                  }`}
                                >
                                  {/* Option Header */}
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-semibold text-white text-[11px]">
                                        {option.title}
                                      </span>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                        idx === 0
                                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/40'
                                          : idx === 1
                                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/40'
                                          : 'bg-amber-950 text-amber-300 border border-amber-800/40'
                                      }`}>
                                        {option.posture}
                                      </span>
                                    </div>

                                    <div className="flex items-center space-x-1.5">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopy(`${clause.id}-${option.id}`, option.text);
                                        }}
                                        className="p-1 rounded text-slate-400 hover:text-white transition"
                                        title="Copy replacement clause"
                                      >
                                        {copiedId === `${clause.id}-${option.id}` ? (
                                          <Check className="w-3 h-3 text-emerald-400" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>

                                      {userRole !== 'Viewer' && userRole !== 'User' && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleApplyAlternative(clause.id, option);
                                          }}
                                          disabled={isApplied}
                                          className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-medium transition ${
                                            isApplied
                                              ? 'bg-emerald-800/50 text-emerald-200 cursor-default'
                                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                                          }`}
                                          title="Apply this specific alternative directly to contract"
                                        >
                                          <Check className="w-3 h-3" />
                                          <span>{isApplied ? 'Applied' : 'Apply Alternative'}</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Explanation / Negotiation Strategy */}
                                  <p className="text-[10px] text-slate-400 leading-relaxed">
                                    <span className="text-slate-500 font-medium">Strategy:</span> {option.explanation}
                                  </p>

                                  {/* Replacement Text */}
                                  <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                                    <p className="text-[11px] leading-relaxed text-emerald-200/90 font-serif">
                                      {option.text}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          // Fallback single suggested alternative
                          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] text-emerald-400 font-medium">
                              <span>Standard Market Remediation:</span>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(`${clause.id}-std`, primaryFlag.suggested_alternative);
                                  }}
                                  className="flex items-center space-x-1 text-slate-400 hover:text-white"
                                >
                                  {copiedId === `${clause.id}-std` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedId === `${clause.id}-std` ? 'Copied' : 'Copy'}</span>
                                </button>
                                {userRole !== 'Viewer' && userRole !== 'User' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onApplyRemediation(clause.id, primaryFlag.suggested_alternative);
                                    }}
                                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px]"
                                  >
                                    Apply
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-emerald-200/90 text-[11px] leading-relaxed font-serif">
                              {primaryFlag.suggested_alternative}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
