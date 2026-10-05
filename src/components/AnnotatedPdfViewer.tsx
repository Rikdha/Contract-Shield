import React, { useState } from 'react';
import { Clause, RiskFlag } from '../types/contract';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface AnnotatedPdfViewerProps {
  title: string;
  filename: string;
  sha256: string;
  clauses: Clause[];
  riskFlags: RiskFlag[];
  selectedClauseId: number | null;
  onSelectClause: (clauseId: number) => void;
}

export const AnnotatedPdfViewer: React.FC<AnnotatedPdfViewerProps> = ({
  title,
  filename,
  sha256,
  clauses,
  riskFlags,
  selectedClauseId,
  onSelectClause,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Group clauses by page
  const totalPages = Math.max(1, ...clauses.map(c => c.bounding_box.page));
  const pageClauses = clauses.filter(c => c.bounding_box.page === currentPage);

  // Map clause ID to highest risk severity
  const clauseSeverityMap = new Map<number, 'HIGH' | 'MEDIUM' | 'LOW'>();
  riskFlags.forEach(flag => {
    const existing = clauseSeverityMap.get(flag.clause_id);
    if (!existing || flag.severity === 'HIGH' || (flag.severity === 'MEDIUM' && existing === 'LOW')) {
      clauseSeverityMap.set(flag.clause_id, flag.severity);
    }
  });

  return (
    <div className="flex flex-col h-full bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden">
      {/* Document Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 text-xs">
        <div className="flex items-center space-x-2 min-w-0">
          <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="font-medium text-slate-200 truncate max-w-[220px]" title={filename}>
            {filename}
          </span>
          <span className="text-slate-500 font-normal">
            · Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* Page Switcher & Zoom */}
        <div className="flex items-center space-x-3">
          {/* Page navigation */}
          <div className="flex items-center space-x-1 text-slate-400">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:text-white hover:bg-slate-800 disabled:opacity-30 transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] text-slate-300 px-1">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded hover:text-white hover:bg-slate-800 disabled:opacity-30 transition"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Zoom controls */}
          <div className="flex items-center space-x-1 text-slate-400">
            <button
              onClick={() => setZoomLevel(z => Math.max(70, z - 10))}
              className="p-1 rounded hover:text-white hover:bg-slate-800 transition"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] text-slate-300 w-9 text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel(z => Math.min(140, z + 10))}
              className="p-1 rounded hover:text-white hover:bg-slate-800 transition"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="p-1 rounded hover:text-white hover:bg-slate-800 transition"
              title="Reset zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Viewport (Dark Theme Cohesive Document Sheet) */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-950 flex justify-center items-start">
        <div 
          className="relative bg-slate-900 border border-slate-800 shadow-2xl rounded-xl transition-transform origin-top select-none"
          style={{
            width: `${Math.round(640 * (zoomLevel / 100))}px`,
            minHeight: `${Math.round(860 * (zoomLevel / 100))}px`,
            padding: `${Math.round(40 * (zoomLevel / 100))}px ${Math.round(36 * (zoomLevel / 100))}px`,
          }}
        >
          {/* Subtle document header */}
          <div className="border-b border-slate-800/80 pb-3 mb-5 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="font-medium tracking-wide uppercase text-slate-300 text-[10px]">
                Audited Agreement Document
              </span>
            </div>
            <span className="font-mono text-slate-500 text-[10px]">Page {currentPage} of {totalPages}</span>
          </div>

          {currentPage === 1 && (
            <div className="text-center mb-6 pb-4 border-b border-slate-800/50">
              <h1 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight font-heading">
                {title}
              </h1>
              <p className="text-[11px] text-slate-400 mt-1">
                Execution Copy · Confidential
              </p>
            </div>
          )}

          {/* Render clauses with cohesive dark highlights */}
          <div className="space-y-3.5">
            {pageClauses.map((clause) => {
              const severity = clauseSeverityMap.get(clause.id);
              const isSelected = selectedClauseId === clause.id;

              return (
                <div
                  key={clause.id}
                  onClick={() => onSelectClause(clause.id)}
                  className={`relative p-3.5 rounded-lg transition-all cursor-pointer border-l-2 ${
                    isSelected
                      ? 'border-l-cyan-400 bg-cyan-500/10 ring-1 ring-cyan-500/30 shadow-md'
                      : severity === 'HIGH'
                      ? 'border-l-rose-500 bg-rose-500/[0.06] hover:bg-rose-500/[0.12] border border-t-0 border-r-0 border-b-0'
                      : severity === 'MEDIUM'
                      ? 'border-l-amber-500 bg-amber-500/[0.06] hover:bg-amber-500/[0.12] border border-t-0 border-r-0 border-b-0'
                      : 'border-l-emerald-500 bg-emerald-500/[0.05] hover:bg-emerald-500/[0.1] border border-t-0 border-r-0 border-b-0'
                  } group`}
                >
                  {/* Clean unboxed clause header */}
                  <div className="flex items-center justify-between mb-1.5 text-[10px]">
                    <div className="flex items-center space-x-1.5 font-medium">
                      <span className="font-mono font-semibold text-white">
                        Section {clause.clause_number}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-300">
                        {clause.category}
                      </span>
                    </div>

                    {/* Unboxed risk indicator dot */}
                    {severity && (
                      <span className={`flex items-center space-x-1 text-[10px] font-medium font-mono ${
                        severity === 'HIGH' ? 'text-rose-400' :
                        severity === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          severity === 'HIGH' ? 'bg-rose-500' :
                          severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <span>{severity === 'HIGH' ? 'High Risk' : severity === 'MEDIUM' ? 'Moderate' : 'Compliant'}</span>
                      </span>
                    )}
                  </div>

                  {/* Clause Text */}
                  <p className="text-[11px] leading-relaxed text-slate-300 font-sans">
                    {clause.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Document Footer with quiet SHA-256 Checksum Stamp */}
          <div className="mt-8 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
            <span className="truncate max-w-[340px] font-mono">
              SHA-256: <span className="text-slate-400">{sha256.substring(0, 24)}...</span>
            </span>
            <span className="text-slate-500 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Validated In-Memory</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
