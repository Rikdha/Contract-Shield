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
      explanation: 'If the counterparty incurs damages or dispute costs, they expect you to cover unlimited costs, while assuming zero reciprocal accountability.',
      action: 'Demand a mutual liability cap equal to fees paid over the preceding 12 months.',
    };
  }
  if (ruleName.includes('Non-Compete') || category.includes('Restrictive')) {
    return {
      title: 'Broad Restrictive Covenant (3-Year Industry Exclusion)',
      explanation: 'This clause attempts to prevent you from providing services or operating in the software sector globally for 36 months following termination.',
      action: 'Strike out or narrow to a 6-month non-solicitation of active clients directly served.',
    };
  }
  if (ruleName.includes('IP') || ruleName.includes('Landgrab') || category.includes('Intellectual Property')) {
    return {
      title: 'Broad IP Assignment (Loss of Personal Inventions)',
      explanation: 'Assigns all pre-existing tools, open-source libraries, and off-hours inventions to the client indefinitely.',
      action: 'Specify client ownership only for paid Statement of Work deliverables, retaining prior IP and tools.',
    };
  }
  if (ruleName.includes('Auto-Renewal') || category.includes('Term & Renewal')) {
    return {
      title: 'Auto-Renewal with Unilateral Escalation',
      explanation: 'Locks you into successive 24-month renewals with up to 50% price escalation unless notice is served in a narrow window.',
      action: 'Switch to month-to-month renewal with 30-day email notice and capped CPI rate adjustments.',
    };
  }
  if (ruleName.includes('Venue') || ruleName.includes('Arbitration') || category.includes('Dispute')) {
    return {
      title: 'Asymmetric Foreign Dispute Jurisdiction',
      explanation: 'Mandates offshore arbitration incurring prohibitive legal and travel costs in the event of dispute.',
      action: 'Designate mutual local jurisdiction or neutral mutual arbitration.',
    };
  }
  if (ruleName.includes('Withholding') || category.includes('Payment')) {
    return {
      title: 'Unilateral Payment Withholding Discretion',
      explanation: 'Permits the client to withhold fees based on subjective internal dissatisfaction.',
      action: 'Require payment of undisputed invoices within 30 days, with 10-day notice and cure for disputes.',
    };
  }
  return {
    title: 'Unbalanced Agreement Provision',
    explanation: 'Disproportionately favors the counterparty and creates unmitigated operational exposure.',
    action: 'Review and apply balanced market-standard compromise wording below.',
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
        title: 'Option 1: Mutual Liability Cap (Market Standard)',
        posture: 'Mutual Compromise',
        explanation: 'Caps liability symmetrically for both parties at 12 months fees, disclaiming all consequential damages.',
        text: 'Each party’s aggregate cumulative liability arising out of or related to this Agreement shall be strictly capped at the total fees actually paid or payable by Company to Contractor in the twelve (12) months preceding the claim. In no event shall either party be liable for indirect, special, or consequential damages.',
      },
      {
        id: 'opt-2',
        title: 'Option 2: Signer-Protective Safe Harbor',
        posture: 'Maximum Protection',
        explanation: 'Excludes contractor liability entirely except for willful intentional gross misconduct.',
        text: 'Contractor shall have no liability to Company or any third party for any damages, losses, or claims arising from deliverables, except in cases of proven intentional gross misconduct. Company agrees to indemnify and hold harmless Contractor against third-party claims arising from Company’s deployment.',
      },
      {
        id: 'opt-3',
        title: 'Option 3: Fixed Dollar Exposure Ceiling',
        posture: 'Narrowed Exposure',
        explanation: 'Fixes total exposure at a predictable flat dollar amount with written notice and cure requirements.',
        text: 'Notwithstanding anything to the contrary, Contractor’s total liability for all claims arising under this Agreement shall not exceed the lesser of $10,000 or total contract compensation received. Any indemnification claim is contingent upon Company providing prompt written notice within thirty (30) days.',
      },
    ];
  }

  if (cat.includes('restrictive') || cat.includes('compete') || rule.includes('compete')) {
    return [
      {
        id: 'opt-1',
        title: 'Option 1: Narrow Client Non-Solicit (6 Months)',
        posture: 'Mutual Compromise',
        explanation: 'Replaces broad industry ban with a reasonable 6-month non-solicitation of active directly served clients.',
        text: 'For a period of six (6) months following termination of this Agreement, Contractor shall not directly solicit the business of any active client of Company whom Contractor personally and substantially provided services to during the engagement. No general restriction on software engineering or consulting shall apply.',
      },
      {
        id: 'opt-2',
        title: 'Option 2: Right-to-Work Clause',
        posture: 'Maximum Protection',
        explanation: 'Affirms unencumbered right to practice profession without restriction, in line with California Bus. & Prof. Code § 16600.',
        text: 'The parties acknowledge and agree that Contractor retains the complete and unrestricted right to provide services, seek employment, and operate in any industry or geographic region without restriction. Any non-competition covenant is hereby struck and void.',
      },
      {
        id: 'opt-3',
        title: 'Option 3: Paid Standstill (Garden Leave)',
        posture: 'Compensated Standstill',
        explanation: 'Restricts competition solely if client pays full compensation for the standstill duration.',
        text: 'Any covenant not to compete shall apply solely for a maximum duration of three (3) months and shall be contingent upon Company paying Contractor 100% of average monthly contract compensation for each month of the restriction period.',
      },
    ];
  }

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
      title: 'Option 2: Strict Notice & 30-Day Cure',
      posture: 'Safe Harbor',
      explanation: 'Requires 30 days written notice with mandatory cure opportunity before any penalty can be assessed.',
      text: 'Prior to exercising any remedy, withholding, or claim under this Section, the non-breaching party must provide thirty (30) days detailed written notice specifying the deficiency, and provide thirty (30) days to cure such breach in good faith.',
    },
    {
      id: 'opt-3',
      title: 'Option 3: Scope-Restricted Commercial Terms',
      posture: 'Narrowed Scope',
      explanation: 'Restricts obligations strictly to direct documented damages under standard commercial law.',
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
  const [suggestionsMap, setSuggestionsMap] = useState<{ [clauseId: number]: RemediationOption[] }>({});
  const [loadingMap, setLoadingMap] = useState<{ [clauseId: number]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedOptionMap, setAppliedOptionMap] = useState<{ [clauseId: number]: string }>({});

  // Auto load suggestions for the selected clause
  useEffect(() => {
    if (selectedClauseId) {
      const clause = clauses.find(c => c.id === selectedClauseId);
      const flag = riskFlags.find(f => f.clause_id === selectedClauseId);
      if (clause && !suggestionsMap[selectedClauseId]) {
        fetchAlternativesForClause(clause, flag);
      }
    }
  }, [selectedClauseId]);

  const fetchAlternativesForClause = async (clause: Clause, flag?: RiskFlag) => {
    if (suggestionsMap[clause.id] || loadingMap[clause.id]) return;

    setLoadingMap(prev => ({ ...prev, [clause.id]: true }));

    try {
      const res = await fetch('/api/remediation-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clauseText: clause.text,
          category: clause.category,
          ruleName: flag?.rule_name || 'Commercial Risk',
          issueSummary: flag?.suggested_alternative || 'Unbalanced legal exposure',
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
      console.warn('API suggestion fetch failed, using fallback:', err);
    }

    const fallbacks = generateClientFallbackOptions(clause.category, flag?.rule_name || '');
    setSuggestionsMap(prev => ({ ...prev, [clause.id]: fallbacks }));
    setLoadingMap(prev => ({ ...prev, [clause.id]: false }));
  };

  const toggleRemediation = (clauseId: number) => {
    setExpandedRemediations(prev => ({
      ...prev,
      [clauseId]: !prev[clauseId],
    }));

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

  const getScoreBadgeClass = (score: number) => {
    if (score >= 70) return 'text-rose-700 bg-rose-50 border-rose-200';
    if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  };

  return (
    <div 
      className="flex flex-col h-full bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg overflow-hidden shadow-xs"
      style={{ fontFamily: "'Times New Roman', Times, 'Newsreader', Georgia, serif" }}
    >
      {/* Panel Header */}
      <div className="p-4 sm:p-5 bg-[#f5f2eb] border-b border-[#dfd9cd] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-stone-800" />
            <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
              Risk Diagnostics & Remediation Studio
            </h3>
          </div>

          {/* Clean Risk Score */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-stone-600 font-medium">Risk Index:</span>
            <span className={`font-bold text-xs px-2.5 py-0.5 rounded border ${getScoreBadgeClass(riskScore)}`}>
              {riskScore} / 100
            </span>
          </div>
        </div>

        {/* Filter Bar & Plain English Toggle */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center space-x-1.5">
            {['ALL', 'HIGH', 'MEDIUM', 'SAFE'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded text-xs transition ${
                  filterSeverity === sev
                    ? 'bg-stone-900 text-[#f6f4ef] font-bold shadow-xs'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-[#e6e2d8]'
                }`}
              >
                {sev === 'ALL' ? 'All Clauses' : sev === 'SAFE' ? 'Compliant' : `${sev} Risk`}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPlainEnglishMode(!plainEnglishMode)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-bold transition ${
              plainEnglishMode
                ? 'bg-amber-100 text-amber-950 border border-amber-300'
                : 'text-stone-700 hover:text-stone-900 hover:bg-[#e6e2d8] border border-transparent'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Plain English</span>
          </button>
        </div>
      </div>

      {/* Clauses Risk List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {filteredClauses.length === 0 ? (
          <div className="p-8 text-center text-stone-500 space-y-2 bg-[#f6f4ef] rounded border border-[#dfd9cd]">
            <CheckCircle2 className="w-6 h-6 text-stone-400 mx-auto" />
            <p className="text-xs font-bold text-stone-700">No clauses matching this filter</p>
          </div>
        ) : (
          filteredClauses.map((clause) => {
            const flags = riskFlags.filter(f => f.clause_id === clause.id);
            const isSelected = selectedClauseId === clause.id;
            const primaryFlag = flags[0];
            const isHighRisk = flags.some(f => f.severity === 'HIGH');
            const isRemediationOpen = expandedRemediations[clause.id] !== false;
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
                className={`p-4 rounded border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-stone-500 bg-[#f5f2eb] ring-1 ring-stone-400 shadow-xs'
                    : 'border-[#dfd9cd] bg-[#fcfbfa] hover:border-[#b8b09f]'
                }`}
              >
                {/* Clause Header */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center space-x-2 font-medium truncate">
                    <span className="font-bold text-stone-900">
                      Clause {clause.clause_number}
                    </span>
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-700 font-semibold truncate max-w-[200px]">
                      {clause.category}
                    </span>
                  </div>

                  {/* Clean unboxed risk indicator */}
                  <div className="flex items-center space-x-2.5 shrink-0">
                    {appliedOptionTitle && (
                      <span className="flex items-center space-x-1 text-[11px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                        <Check className="w-3 h-3 text-emerald-700" />
                        <span>Remediated</span>
                      </span>
                    )}
                    <span className={`flex items-center space-x-1.5 text-xs font-bold ${
                      highestSev === 'HIGH' ? 'text-rose-900' :
                      highestSev === 'MEDIUM' ? 'text-amber-900' : 'text-emerald-900'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        highestSev === 'HIGH' ? 'bg-rose-600' :
                        highestSev === 'MEDIUM' ? 'bg-amber-600' : 'bg-emerald-600'
                      }`} />
                      <span>{highestSev === 'SAFE' ? 'Compliant' : `${highestSev} Risk`}</span>
                    </span>
                  </div>
                </div>

                {/* Plain English Editorial Translation */}
                {plainEnglishMode && plainInfo && (
                  <div className="my-2.5 p-3 rounded bg-amber-100/70 border border-amber-300/80 space-y-1">
                    <div className="font-bold text-amber-950 text-xs flex items-center space-x-1">
                      <span>{plainInfo.title}</span>
                    </div>
                    <p className="text-xs text-stone-800 leading-relaxed font-serif">
                      {plainInfo.explanation}
                    </p>
                    <div className="text-[11px] text-stone-900 pt-0.5 font-bold">
                      <span className="text-amber-900">Recommended position:</span> {plainInfo.action}
                    </div>
                  </div>
                )}

                {/* Original Clause Text */}
                <div className="my-2.5 p-3 rounded bg-[#f6f4ef] border border-[#e2ddd1]">
                  <p className="text-stone-800 leading-relaxed font-serif text-xs">
                    {clause.text}
                  </p>
                </div>

                {/* Action Bar */}
                {primaryFlag && (
                  <div className="pt-2.5 border-t border-[#ece7dd] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        {onAskAiAboutClause && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAskAiAboutClause(clause.text, clause.clause_number || '');
                            }}
                            className="flex items-center space-x-1 text-stone-600 hover:text-stone-900 text-xs font-bold transition"
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
                          className="flex items-center space-x-1 text-stone-700 hover:text-stone-900 text-xs font-bold"
                        >
                          <Sparkles className="w-3 h-3 text-stone-500" />
                          <span>{isRemediationOpen ? 'Hide 3 Alternatives' : 'View 3 Alternatives'}</span>
                          {isRemediationOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      {userRole !== 'Viewer' && userRole !== 'User' && !isHighRisk && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onApplyRemediation(clause.id, primaryFlag.suggested_alternative);
                          }}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-stone-900 hover:bg-stone-800 text-[#f6f4ef] text-xs font-bold transition shadow-xs"
                          title="Apply standard balanced alternative clause"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Apply Patch</span>
                        </button>
                      )}
                    </div>

                    {/* EXPANDED 3 ALTERNATIVE CLAUSE SUGGESTIONS */}
                    {isRemediationOpen && (
                      <div className="mt-3 space-y-2.5 pt-2.5 border-t border-[#ece7dd]">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1.5 text-stone-900 font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-stone-600" />
                            <span>3 Pre-drafted Replacement Options:</span>
                          </div>
                          {isLoadingSuggestions && (
                            <div className="flex items-center space-x-1 text-stone-500 text-[11px] italic">
                              <Loader2 className="w-3 h-3 animate-spin text-stone-600" />
                              <span>Drafting options...</span>
                            </div>
                          )}
                        </div>

                        {/* Suggestions List */}
                        {suggestions && suggestions.length > 0 ? (
                          <div className="space-y-2.5">
                            {suggestions.map((option, idx) => {
                              const isApplied = appliedOptionTitle === option.title;

                              return (
                                <div
                                  key={option.id || idx}
                                  className={`p-3.5 rounded border transition-all text-xs space-y-2 ${
                                    isApplied
                                      ? 'bg-emerald-100/70 border-emerald-400 ring-1 ring-emerald-300'
                                      : 'bg-[#fcfbfa] border-[#dfd9cd] hover:border-[#b8b09f]'
                                  }`}
                                >
                                  {/* Option Header */}
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-bold text-stone-900 text-xs">
                                        {option.title}
                                      </span>
                                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#eeebe3] text-stone-800 border border-[#d8d2c4]">
                                        {option.posture}
                                      </span>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopy(`${clause.id}-${option.id}`, option.text);
                                        }}
                                        className="p-1 rounded text-stone-500 hover:text-stone-900 transition hover:bg-[#eeebe3]"
                                        title="Copy replacement clause"
                                      >
                                        {copiedId === `${clause.id}-${option.id}` ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
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
                                          className={`flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-bold transition ${
                                            isApplied
                                              ? 'bg-emerald-200 text-emerald-900 cursor-default'
                                              : 'bg-stone-900 hover:bg-stone-800 text-[#f6f4ef] shadow-xs'
                                          }`}
                                          title="Apply this alternative directly"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                          <span>{isApplied ? 'Applied' : 'Apply'}</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Strategy */}
                                  <p className="text-xs text-stone-600 leading-relaxed">
                                    <span className="font-bold text-stone-800">Rationale:</span> {option.explanation}
                                  </p>

                                  {/* Replacement Text */}
                                  <div className="p-2.5 rounded bg-[#f6f4ef] border border-[#e2ddd1] text-xs font-serif text-stone-800 italic leading-relaxed">
                                    "{option.text}"
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
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
