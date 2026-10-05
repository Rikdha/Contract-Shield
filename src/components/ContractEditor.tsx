import React, { useState, useRef } from 'react';
import { 
  Code2, 
  FileText, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Copy, 
  Check, 
  Play, 
  ChevronRight,
  ShieldCheck,
  FileCode,
  Layers
} from 'lucide-react';
import { ContractType, SampleContract } from '../types/contract';
import { SAMPLE_CONTRACTS } from '../data/sampleContracts';

interface ContractEditorProps {
  code: string;
  setCode: (code: string) => void;
  title: string;
  setTitle: (title: string) => void;
  contractType: ContractType;
  setContractType: (type: ContractType) => void;
  onAudit: () => void;
  isAuditing: boolean;
  auditPhase?: string;
}

export const ContractEditor: React.FC<ContractEditorProps> = ({
  code,
  setCode,
  title,
  setTitle,
  contractType,
  setContractType,
  onAudit,
  isAuditing,
  auditPhase,
}) => {
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTitle(file.name.replace(/\.[^/.]+$/, ''));
    if (file.name.endsWith('.sol') || file.name.endsWith('.vy') || file.name.endsWith('.rs')) {
      setContractType('smart_contract');
    } else {
      setContractType('legal_contract');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setCode(content);
    };
    reader.readAsText(file);
  };

  const loadSample = (sample: SampleContract) => {
    setTitle(sample.name);
    setContractType(sample.type);
    setCode(sample.code);
  };

  // Generate line numbers
  const lineCount = Math.max(15, code.split('\n').length);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Category selector & Sample presets */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>Select Contract Paradigm</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Shield detects both Web3 smart contract exploits and predatory legal agreement traps.
            </p>
          </div>

          {/* Type Toggle */}
          <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => {
                setContractType('smart_contract');
                const defaultSample = SAMPLE_CONTRACTS.find(s => s.type === 'smart_contract');
                if (defaultSample) loadSample(defaultSample);
              }}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                contractType === 'smart_contract'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Smart Contract (Web3)</span>
            </button>

            <button
              onClick={() => {
                setContractType('legal_contract');
                const defaultSample = SAMPLE_CONTRACTS.find(s => s.type === 'legal_contract');
                if (defaultSample) loadSample(defaultSample);
              }}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                contractType === 'legal_contract'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Legal & Commercial Agreement</span>
            </button>
          </div>
        </div>

        {/* Quick Sample Contract Badges */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Preloaded Exploit & Reference Samples:</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {SAMPLE_CONTRACTS.filter(s => s.type === contractType).map((sample) => {
              const isSelected = title === sample.name;
              return (
                <button
                  key={sample.id}
                  onClick={() => loadSample(sample)}
                  className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-semibold text-slate-200 truncate">
                      {sample.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium shrink-0 ${
                        sample.tag.includes('Critical') || sample.tag.includes('Exploit')
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : sample.tag.includes('Trap')
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {sample.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {sample.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Editor Surface */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Editor Top Bar */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 gap-3">
          <div className="flex items-center space-x-3 flex-1 min-w-[200px]">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
              {contractType === 'smart_contract' ? <Code2 className="w-4 h-4 text-cyan-400" /> : <FileText className="w-4 h-4 text-indigo-400" />}
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contract Title or Document Name..."
              className="bg-transparent text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 rounded px-2 py-1 w-full max-w-md border border-transparent hover:border-slate-800"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".sol,.vy,.rs,.txt,.md,.json"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition"
              title="Upload file (.sol, .vy, .rs, .txt)"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition"
              title="Copy code to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={() => setCode('')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Clear editor"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Code Input with Line Numbers */}
        <div className="relative flex min-h-[420px] max-h-[560px] overflow-hidden bg-slate-950 font-mono text-xs">
          {/* Gutter / Line Numbers */}
          <div className="select-none py-4 px-3 text-right bg-slate-950/70 border-r border-slate-800/80 text-slate-600 font-mono text-xs leading-6 overflow-hidden w-12 shrink-0">
            {lineNumbers.map((num) => (
              <div key={num} className="h-6 leading-6">
                {num}
              </div>
            ))}
          </div>

          {/* Text Area */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={
              contractType === 'smart_contract'
                ? '// Paste Solidity, Vyper, or Rust contract code here...\ncontract MyContract {\n    ...\n}'
                : 'Paste legal agreement, NDA, MSA, or SLA contract text here...'
            }
            spellCheck={false}
            className="flex-1 bg-transparent p-4 text-slate-200 placeholder-slate-600 leading-6 resize-none focus:outline-none overflow-y-auto whitespace-pre font-mono"
            style={{ tabSize: 2 }}
          />
        </div>

        {/* Bottom Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-950/90 border-t border-slate-800 gap-4">
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>Lines: <strong className="text-slate-200">{code.split('\n').length}</strong></span>
            </span>
            <span className="text-slate-700">|</span>
            <span>Characters: <strong className="text-slate-200">{code.length.toLocaleString()}</strong></span>
            <span className="text-slate-700">|</span>
            <span className="text-cyan-400/90 font-mono">
              {contractType === 'smart_contract' ? 'Solidity / Vyper / Rust' : 'Legal Markdown / Text'}
            </span>
          </div>

          {/* Shield Audit CTA Button */}
          <button
            onClick={onAudit}
            disabled={isAuditing || !code.trim()}
            className={`w-full sm:w-auto relative group flex items-center justify-center space-x-3 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
              isAuditing || !code.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-cyan-500/25 active:scale-98 cursor-pointer ring-1 ring-white/20'
            }`}
          >
            {isAuditing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{auditPhase || 'Auditing with Shield Engine...'}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-cyan-200 group-hover:scale-110 transition-transform" />
                <span>Run Contract Shield Audit</span>
                <ChevronRight className="w-4 h-4 text-cyan-200 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
