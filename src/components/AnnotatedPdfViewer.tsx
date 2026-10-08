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
    <div 
      className="flex flex-col h-full bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg overflow-hidden shadow-xs"
      style={{ fontFamily: "'Times New Roman', Times, 'Newsreader', Georgia, serif" }}
    >
      {/* Document Top Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#f5f2eb] border-b border-[#dfd9cd] text-xs">
        <div className="flex items-center space-x-2.5 min-w-0">
          <FileText className="w-4 h-4 text-stone-700 shrink-0" />
          <span className="font-bold text-stone-900 truncate max-w-[240px]" title={filename}>
            {filename}
          </span>
          <span className="text-stone-500 font-normal">
            · Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* Page Switcher & Zoom */}
        <div className="flex items-center space-x-3">
          {/* Page navigation */}
          <div className="flex items-center space-x-1 text-stone-700">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:text-stone-900 hover:bg-[#e6e2d8] disabled:opacity-30 transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs text-stone-900 px-1 font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded hover:text-stone-900 hover:bg-[#e6e2d8] disabled:opacity-30 transition"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-3 w-px bg-[#dfd9cd]" />

          {/* Zoom controls */}
          <div className="flex items-center space-x-1 text-stone-700">
            <button
              onClick={() => setZoomLevel(z => Math.max(70, z - 10))}
              className="p-1 rounded hover:text-stone-900 hover:bg-[#e6e2d8] transition"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs text-stone-900 w-10 text-center font-bold">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel(z => Math.min(140, z + 10))}
              className="p-1 rounded hover:text-stone-900 hover:bg-[#e6e2d8] transition"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="p-1 rounded hover:text-stone-900 hover:bg-[#e6e2d8] transition"
              title="Reset zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Viewport (Warm Minimal Paper Canvas) */}
      <div className="flex-1 overflow-auto p-6 sm:p-8 bg-[#eeebe3] flex justify-center items-start">
        <div 
          className="relative bg-[#fcfbfa] border border-[#d8d2c4] shadow-sm rounded transition-transform origin-top select-none"
          style={{
            width: `${Math.round(650 * (zoomLevel / 100))}px`,
            minHeight: `${Math.round(880 * (zoomLevel / 100))}px`,
            padding: `${Math.round(44 * (zoomLevel / 100))}px ${Math.round(40 * (zoomLevel / 100))}px`,
          }}
        >
          {/* Subtle document header */}
          <div className="border-b border-[#dfd9cd] pb-3 mb-6 flex items-center justify-between text-xs text-stone-600">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-stone-900" />
              <span className="font-bold tracking-wider uppercase text-stone-800 text-[11px]">
                Contract Execution Copy
              </span>
            </div>
            <span className="font-mono text-stone-500 text-[11px]">Page {currentPage} of {totalPages}</span>
          </div>

          {currentPage === 1 && (
            <div className="text-center mb-8 pb-5 border-b border-[#ece7dd]">
              <h3 className="text-base sm:text-lg font-bold text-stone-900 uppercase tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-stone-600 mt-1 italic">
                Institutional Agreement · Confidential & Legally Binding
              </p>
            </div>
          )}

          {/* Render clauses */}
          <div className="space-y-4">
            {pageClauses.map((clause) => {
              const severity = clauseSeverityMap.get(clause.id);
              const isSelected = selectedClauseId === clause.id;

              return (
                <div
                  key={clause.id}
                  onClick={() => onSelectClause(clause.id)}
                  className={`relative p-4 rounded transition-all cursor-pointer border-l-4 ${
                    isSelected
                      ? 'border-l-stone-900 bg-[#f5f2eb] ring-1 ring-stone-400 shadow-xs'
                      : severity === 'HIGH'
                      ? 'border-l-rose-700 bg-rose-50/70 hover:bg-rose-50 border border-rose-200/80'
                      : severity === 'MEDIUM'
                      ? 'border-l-amber-700 bg-amber-50/70 hover:bg-amber-50 border border-amber-200/80'
                      : 'border-l-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200/80'
                  } group`}
                >
                  {/* Clean clause header */}
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-stone-900">
                        Clause {clause.clause_number}
                      </span>
                      <span className="text-stone-400">·</span>
                      <span className="font-semibold text-stone-700">
                        {clause.category}
                      </span>
                    </div>

                    {/* Risk indicator */}
                    {severity && (
                      <span className={`flex items-center space-x-1.5 text-xs font-bold ${
                        severity === 'HIGH' ? 'text-rose-900' :
                        severity === 'MEDIUM' ? 'text-amber-900' : 'text-emerald-900'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          severity === 'HIGH' ? 'bg-rose-600' :
                          severity === 'MEDIUM' ? 'bg-amber-600' : 'bg-emerald-600'
                        }`} />
                        <span>{severity === 'HIGH' ? 'High Risk' : severity === 'MEDIUM' ? 'Moderate Risk' : 'Compliant'}</span>
                      </span>
                    )}
                  </div>

                  {/* Clause Text in Times New Roman */}
                  <p className="text-xs sm:text-[13px] leading-relaxed text-stone-800 font-serif">
                    {clause.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Document Footer with quiet SHA-256 Checksum Stamp */}
          <div className="mt-10 pt-4 border-t border-[#dfd9cd] text-[11px] text-stone-500 flex items-center justify-between">
            <span className="truncate max-w-[360px] font-mono">
              SHA-256: <strong className="text-stone-800">{sha256.substring(0, 24)}...</strong>
            </span>
            <span className="text-stone-700 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Cryptographically Attested</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
