import React, { useState } from 'react';
import { Playbook, PlaybookRule, UserRole } from '../types/contract';
import { 
  BookOpen, 
  ShieldCheck, 
  Plus, 
  Sliders, 
  ToggleLeft, 
  ToggleRight, 
  Edit3, 
  Save, 
  X, 
  Flame, 
  AlertTriangle, 
  Info, 
  CheckCircle2
} from 'lucide-react';
import { FaultIsolationBoundary } from './FaultIsolationBoundary';

interface PlaybookManagerProps {
  playbooks: Playbook[];
  rules: PlaybookRule[];
  userRole: UserRole;
  onUpdateRule: (updatedRule: PlaybookRule) => void;
  onAddRule: (newRule: Omit<PlaybookRule, 'id'>) => void;
}

export const PlaybookManager: React.FC<PlaybookManagerProps> = ({
  playbooks,
  rules,
  userRole,
  onUpdateRule,
  onAddRule,
}) => {
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<number>(playbooks[0]?.id || 1);
  const [isAddingRule, setIsAddingRule] = useState<boolean>(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);

  // New Rule Form state
  const [newRuleCategory, setNewRuleCategory] = useState<string>('Indemnification & Liability');
  const [newRuleName, setNewRuleName] = useState<string>('');
  const [newRulePattern, setNewRulePattern] = useState<string>('');
  const [newRuleDescription, setNewRuleDescription] = useState<string>('');
  const [newRuleSeverity, setNewRuleSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [newRuleWeight, setNewRuleWeight] = useState<number>(30);
  const [newRuleAlternative, setNewRuleAlternative] = useState<string>('');

  const currentRules = rules.filter(r => r.playbook_id === selectedPlaybookId);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newRulePattern.trim()) return;

    onAddRule({
      playbook_id: selectedPlaybookId,
      category: newRuleCategory,
      name: newRuleName,
      pattern: newRulePattern,
      description: newRuleDescription,
      severity: newRuleSeverity,
      risk_weight: newRuleWeight,
      is_active: true,
      suggested_alternative_template: newRuleAlternative || 'Balanced reciprocal clause to be inserted.',
    });

    setIsAddingRule(false);
    setNewRuleName('');
    setNewRulePattern('');
    setNewRuleDescription('');
    setNewRuleAlternative('');
  };

  return (
    <div className="space-y-8" style={{ fontFamily: "'Times New Roman', Times, 'Newsreader', Georgia, serif" }}>
      {/* SECTION 6.1: PLAYBOOK HEADER & CONTROLS */}
      <FaultIsolationBoundary sectionTitle="Playbook Header" sectionCode="SEC-PB1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#dfd9cd]">
          <div>
            <div className="flex items-center space-x-2.5">
              <BookOpen className="w-5 h-5 text-stone-900" />
              <h3 className="text-xl font-bold text-stone-900">
                Compliance Playbooks & Rule Governance
              </h3>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Customize detection heuristics, adjust severity risk weights, and manage approved institutional replacement clauses.
            </p>
          </div>

          {userRole === 'Admin' && (
            <button
              onClick={() => setIsAddingRule(!isAddingRule)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded bg-stone-900 hover:bg-stone-800 text-[#f6f4ef] text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Compliance Rule</span>
            </button>
          )}
        </div>
      </FaultIsolationBoundary>

      {/* SECTION 6.2: PLAYBOOK PROFILES TABS */}
      <FaultIsolationBoundary sectionTitle="Playbook Profiles" sectionCode="SEC-PB2">
        <div className="flex flex-wrap gap-2.5">
          {playbooks.map(pb => (
            <button
              key={pb.id}
              onClick={() => setSelectedPlaybookId(pb.id)}
              className={`px-4 py-2 rounded text-xs font-bold transition border ${
                selectedPlaybookId === pb.id
                  ? 'bg-stone-900 text-[#f6f4ef] border-stone-900 shadow-xs'
                  : 'bg-[#fbfaf7] text-stone-800 hover:bg-[#ede8df] border-[#dfd9cd]'
              }`}
            >
              {pb.name}
            </button>
          ))}
        </div>
      </FaultIsolationBoundary>

      {/* SECTION 6.3: ADD NEW RULE FORM */}
      {isAddingRule && (
        <FaultIsolationBoundary sectionTitle="New Rule Authoring" sectionCode="SEC-PB3">
          <form
            onSubmit={handleCreateRule}
            className="bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg p-6 sm:p-7 shadow-xs space-y-5 text-xs animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-[#ece7dd] pb-3">
              <h4 className="font-bold text-stone-900 flex items-center space-x-2 text-sm uppercase tracking-wide">
                <Plus className="w-4 h-4 text-stone-700" />
                <span>Define New Playbook Compliance Rule</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingRule(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-stone-700 font-bold">Rule Name:</label>
                <input
                  type="text"
                  value={newRuleName}
                  onChange={e => setNewRuleName(e.target.value)}
                  placeholder="e.g. Uncapped Liability Clause"
                  className="w-full bg-[#f5f2eb] p-2.5 rounded border border-[#d8d2c4] text-stone-900 focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-700 font-bold">Category:</label>
                <input
                  type="text"
                  value={newRuleCategory}
                  onChange={e => setNewRuleCategory(e.target.value)}
                  className="w-full bg-[#f5f2eb] p-2.5 rounded border border-[#d8d2c4] text-stone-900 focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-700 font-bold">Severity Level:</label>
                <select
                  value={newRuleSeverity}
                  onChange={e => setNewRuleSeverity(e.target.value as any)}
                  className="w-full bg-[#f5f2eb] p-2.5 rounded border border-[#d8d2c4] text-stone-900 focus:outline-hidden font-bold"
                >
                  <option value="HIGH">HIGH RISK</option>
                  <option value="MEDIUM">MEDIUM RISK</option>
                  <option value="LOW">LOW RISK</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-stone-700 font-bold">Risk Weight:</label>
                  <span className="font-bold text-stone-900">{newRuleWeight} pts</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={newRuleWeight}
                  onChange={e => setNewRuleWeight(Number(e.target.value))}
                  className="w-full accent-stone-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-stone-700 font-bold">Matching Pattern (Regex or Keywords):</label>
              <input
                type="text"
                value={newRulePattern}
                onChange={e => setNewRulePattern(e.target.value)}
                placeholder="e.g. breach.*unlimited|indemnif.*uncapped"
                className="w-full bg-[#f5f2eb] p-2.5 rounded border border-[#d8d2c4] text-stone-900 font-mono focus:outline-hidden"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-stone-700 font-bold">Risk Description & Exposure:</label>
              <textarea
                value={newRuleDescription}
                onChange={e => setNewRuleDescription(e.target.value)}
                placeholder="Explain why this clause creates risk..."
                rows={2}
                className="w-full bg-[#f5f2eb] p-2.5 rounded border border-[#d8d2c4] text-stone-900 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-stone-700 font-bold">Approved Remediation Alternative Template:</label>
              <textarea
                value={newRuleAlternative}
                onChange={e => setNewRuleAlternative(e.target.value)}
                placeholder="Write the balanced replacement clause wording..."
                rows={3}
                className="w-full bg-[#f5f2eb] p-2.5 rounded border border-[#d8d2c4] text-stone-900 font-serif italic focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingRule(false)}
                className="px-4 py-2 rounded bg-[#fbfaf7] border border-[#dfd9cd] text-stone-700 hover:bg-[#ede8df] font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded bg-stone-900 hover:bg-stone-800 text-[#f6f4ef] font-bold"
              >
                Save Rule to Playbook
              </button>
            </div>
          </form>
        </FaultIsolationBoundary>
      )}

      {/* SECTION 6.4: ACTIVE RULES REGISTRY */}
      <FaultIsolationBoundary sectionTitle="Playbook Rules List" sectionCode="SEC-PB4">
        <div className="space-y-4">
          {currentRules.map((rule) => (
            <div
              key={rule.id}
              className={`p-5 rounded-lg border transition-all text-xs ${
                rule.is_active
                  ? 'bg-[#fbfaf7] border-[#dfd9cd] shadow-xs'
                  : 'bg-[#f5f2eb] border-[#e2ddd1] opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                      rule.severity === 'HIGH'
                        ? 'bg-rose-100 text-rose-900 border-rose-300'
                        : rule.severity === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}
                  >
                    {rule.severity}
                  </span>
                  <span className="text-stone-900 font-bold text-sm">
                    {rule.name}
                  </span>
                  <span className="text-stone-600 font-semibold text-xs bg-[#eeebe3] px-2 py-0.5 rounded border border-[#dfd9cd]">
                    {rule.category}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1.5 bg-[#f5f2eb] px-3 py-1 rounded border border-[#e2ddd1]">
                    <span className="text-stone-600 text-xs font-bold">WEIGHT:</span>
                    {userRole === 'Admin' ? (
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={rule.risk_weight}
                        onChange={e => onUpdateRule({ ...rule, risk_weight: Number(e.target.value) })}
                        className="w-12 bg-transparent text-stone-900 font-bold text-center border-b border-stone-400 focus:outline-hidden"
                      />
                    ) : (
                      <span className="font-bold text-stone-900">{rule.risk_weight} pts</span>
                    )}
                  </div>

                  {userRole === 'Admin' && (
                    <button
                      onClick={() => onUpdateRule({ ...rule, is_active: !rule.is_active })}
                      className="text-stone-600 hover:text-stone-900 transition"
                      title={rule.is_active ? 'Deactivate rule' : 'Activate rule'}
                    >
                      {rule.is_active ? (
                        <span className="flex items-center text-emerald-800 text-xs font-bold">
                          <ToggleRight className="w-5 h-5 mr-1 text-emerald-700" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center text-stone-500 text-xs font-bold">
                          <ToggleLeft className="w-5 h-5 mr-1" /> Inactive
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <p className="text-stone-700 leading-relaxed font-serif text-xs mb-3">
                {rule.description}
              </p>

              {/* Pattern and Suggested Alternative */}
              <div className="space-y-2.5 pt-3 border-t border-[#ece7dd]">
                <div className="text-xs text-stone-600 flex items-center space-x-2">
                  <span className="font-bold text-stone-800">PATTERN:</span>
                  <code className="text-stone-900 font-mono bg-[#f5f2eb] px-2 py-0.5 rounded border border-[#e2ddd1] text-[11px]">
                    {rule.pattern}
                  </code>
                </div>

                <div className="p-3.5 rounded bg-emerald-50/70 border border-emerald-300 text-xs">
                  <strong className="text-emerald-950 block mb-1">
                    Standard Remediation Alternative Template:
                  </strong>
                  <p className="text-stone-900 font-serif italic leading-relaxed">
                    "{rule.suggested_alternative_template}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </FaultIsolationBoundary>
    </div>
  );
};
