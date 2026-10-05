import React, { useState } from 'react';
import { Copy, Check, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface DiffViewerProps {
  vulnerableSnippet: string;
  patchedSnippet: string;
  title?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  vulnerableSnippet,
  patchedSnippet,
  title,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(patchedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden my-3">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2 text-slate-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{title || 'Shielded Code Remediation (Patch)'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 transition font-mono"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Patch' : 'Copy Shielded Patch'}</span>
        </button>
      </div>

      {/* Grid: Vulnerable vs Patch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 font-mono text-xs">
        {/* Vulnerable side */}
        <div className="p-3 bg-rose-950/15">
          <div className="flex items-center space-x-1.5 text-rose-400 font-semibold mb-2 text-[11px]">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Vulnerable Unshielded Implementation</span>
          </div>
          <pre className="text-rose-200/90 whitespace-pre-wrap leading-relaxed overflow-x-auto p-2.5 rounded bg-rose-950/30 border border-rose-900/40">
            {vulnerableSnippet}
          </pre>
        </div>

        {/* Patched side */}
        <div className="p-3 bg-emerald-950/15">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold mb-2 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Shield-Remediated Implementation</span>
          </div>
          <pre className="text-emerald-200/90 whitespace-pre-wrap leading-relaxed overflow-x-auto p-2.5 rounded bg-emerald-950/30 border border-emerald-900/40">
            {patchedSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
