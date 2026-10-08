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
    <div 
      className="rounded-lg border border-[#dfd9cd] bg-[#fbfaf7] overflow-hidden my-4 shadow-xs"
      style={{ fontFamily: "'Times New Roman', Times, 'Newsreader', Georgia, serif" }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#f5f2eb] border-b border-[#dfd9cd] text-xs">
        <div className="flex items-center space-x-2 text-stone-900 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-800" />
          <span>{title || 'Remediated Code Patch'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 px-3 py-1 rounded bg-[#fbfaf7] hover:bg-[#ede8df] border border-[#d6cfbf] text-xs text-stone-800 font-bold transition font-serif"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Patch' : 'Copy Patch'}</span>
        </button>
      </div>

      {/* Grid: Vulnerable vs Patch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#dfd9cd] text-xs">
        {/* Vulnerable side */}
        <div className="p-4 bg-rose-50/50">
          <div className="flex items-center space-x-2 text-rose-900 font-bold mb-2 text-xs">
            <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
            <span>Vulnerable Implementation</span>
          </div>
          <pre className="font-mono text-stone-900 whitespace-pre-wrap leading-relaxed overflow-x-auto p-3 rounded bg-[#fcfbfa] border border-rose-300 text-[11px]">
            {vulnerableSnippet}
          </pre>
        </div>

        {/* Patched side */}
        <div className="p-4 bg-emerald-50/50">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold mb-2 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Remediated & Patched Implementation</span>
          </div>
          <pre className="font-mono text-stone-900 whitespace-pre-wrap leading-relaxed overflow-x-auto p-3 rounded bg-[#fcfbfa] border border-emerald-300 text-[11px]">
            {patchedSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
