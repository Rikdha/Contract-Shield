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
      suggested_alternative_template: newRuleAlternative,
      is_active: true,
    });

    setIsAddingRule(false);
    setNewRuleName('');
    setNewRulePattern('');
    setNewRuleDescription('');
    setNewRuleAlternative('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Compliance Playbook Rules & Risk Weights
            </h2>
            <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
              Admin Governance (FR7)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure automated pattern criteria, customize risk weights, and manage corporate remediation templates.
          </p>
        </div>

        {userRole === 'Admin' && (
          <button
            onClick={() => setIsAddingRule(!isAddingRule)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Compliance Rule</span>
          </button>
        )}
      </div>

      {/* Playbook Switcher Tabs */}
      <div className="flex flex-wrap gap-2">
        {playbooks.map(pb => (
          <button
            key={pb.id}
            onClick={() => setSelectedPlaybookId(pb.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
              selectedPlaybookId === pb.id
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            {pb.name}
          </button>
        ))}
      </div>

      {/* Add New Rule Form */}
      {isAddingRule && (
        <form
          onSubmit={handleCreateRule}
          className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-4 text-xs animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white flex items-center space-x-2 text-sm">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Define New Playbook Compliance Rule</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingRule(false)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Rule Name:</label>
              <input
                type="text"
                value={newRuleName}
                onChange={e => setNewRuleName(e.target.value)}
                placeholder="e.g. Uncapped Data Breach Liability"
                className="w-full bg-slate-950 p-2 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Category:</label>
              <input
                type="text"
                value={newRuleCategory}
                onChange={e => setNewRuleCategory(e.target.value)}
                className="w-full bg-slate-950 p-2 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Severity Level:</label>
              <select
                value={newRuleSeverity}
                onChange={e => setNewRuleSeverity(e.target.value as any)}
                className="w-full bg-slate-950 p-2 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="HIGH">HIGH RISK</option>
                <option value="MEDIUM">MEDIUM RISK</option>
                <option value="LOW">LOW RISK</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-slate-400 font-semibold">Risk Weight (Points):</label>
                <span className="font-mono text-cyan-400 font-bold">{newRuleWeight} pts</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={newRuleWeight}
                onChange={e => setNewRuleWeight(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Matching Pattern (Regex or Keywords):</label>
            <input
              type="text"
              value={newRulePattern}
              onChange={e => setNewRulePattern(e.target.value)}
              placeholder="e.g. breach.*unlimited|indemnif.*uncapped"
              className="w-full bg-slate-950 p-2 rounded-lg border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Risk Description & Impact:</label>
            <textarea
              value={newRuleDescription}
              onChange={e => setNewRuleDescription(e.target.value)}
              placeholder="Explain why this clause creates risk and what compliance issue it breaches..."
              rows={2}
              className="w-full bg-slate-950 p-2 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Active Remediation Template (Suggested Alternative):</label>
            <textarea
              value={newRuleAlternative}
              onChange={e => setNewRuleAlternative(e.target.value)}
              placeholder="Write the balanced replacement clause wording..."
              rows={3}
              className="w-full bg-slate-950 p-2 rounded-lg border border-slate-700 text-white font-serif focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingRule(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
            >
              Save Rule to Playbook
            </button>
          </div>
        </form>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {currentRules.map((rule) => {
          const isEditing = editingRuleId === rule.id;

          return (
            <div
              key={rule.id}
              className={`p-4 rounded-xl border transition-all text-xs ${
                rule.is_active
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded border ${
                      rule.severity === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : rule.severity === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    }`}
                  >
                    {rule.severity}
                  </span>
                  <span className="text-white font-bold text-sm">
                    {rule.name}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {rule.category}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] font-mono">WEIGHT:</span>
                    {userRole === 'Admin' ? (
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={rule.risk_weight}
                        onChange={e => onUpdateRule({ ...rule, risk_weight: Number(e.target.value) })}
                        className="w-12 bg-transparent text-cyan-400 font-mono font-bold text-center border-b border-cyan-500/50 focus:outline-none"
                      />
                    ) : (
                      <span className="font-mono font-bold text-cyan-400">{rule.risk_weight} pts</span>
                    )}
                  </div>

                  {userRole === 'Admin' && (
                    <button
                      onClick={() => onUpdateRule({ ...rule, is_active: !rule.is_active })}
                      className="text-slate-400 hover:text-white transition"
                      title={rule.is_active ? 'Deactivate rule' : 'Activate rule'}
                    >
                      {rule.is_active ? (
                        <span className="flex items-center text-emerald-400 text-[11px] font-semibold">
                          <ToggleRight className="w-5 h-5 mr-1" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center text-slate-500 text-[11px]">
                          <ToggleLeft className="w-5 h-5 mr-1" /> Inactive
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed font-sans mb-3">
                {rule.description}
              </p>

              {/* Pattern and Suggested Alternative */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <span className="font-semibold text-slate-500 font-mono">PATTERN:</span>
                  <code className="text-cyan-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[10px]">
                    {rule.pattern}
                  </code>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-[11px]">
                  <strong className="text-emerald-400 block mb-1">
                    Standard Remediation Alternative:
                  </strong>
                  <p className="text-emerald-200/90 font-serif leading-relaxed">
                    {rule.suggested_alternative_template}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
