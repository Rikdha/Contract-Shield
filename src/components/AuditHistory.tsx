import React from 'react';
import { AuditReport } from '../types/contract';
import { 
  History, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  FileCode, 
  FileText 
} from 'lucide-react';
import { clearAuditHistory } from '../services/auditService';

interface AuditHistoryProps {
  history: AuditReport[];
  onSelectReport: (report: AuditReport) => void;
  onClearHistory: () => void;
  onNewAudit: () => void;
}

export const AuditHistory: React.FC<AuditHistoryProps> = ({
  history,
  onSelectReport,
  onClearHistory,
  onNewAudit,
}) => {
  if (history.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-xl space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
          <History className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">No Prior Audits Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Audits you run are saved locally in your browser so you can track vulnerability remediations over time.
          </p>
        </div>
        <button
          onClick={onNewAudit}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
        >
          <span>Audit Your First Contract</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <History className="w-5 h-5 text-cyan-400" />
            <span>Audit History & Scans ({history.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Past vulnerability reports and security verification proofs.
          </p>
        </div>

        <button
          onClick={onClearHistory}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition border border-transparent hover:border-rose-500/30"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {history.map((report) => (
          <div
            key={report.id}
            onClick={() => onSelectReport(report)}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-800/40 cursor-pointer transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  {report.contractType === 'smart_contract' ? (
                    <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                  )}
                  <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition truncate max-w-[220px]">
                    {report.contractTitle}
                  </h4>
                </div>

                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                    report.overallScore >= 80
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : report.overallScore >= 60
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {report.overallScore}/100 ({report.letterGrade})
                </span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {report.summary}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/60 text-[11px] text-slate-500">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(report.timestamp).toLocaleDateString()}</span>
              </span>

              <div className="flex items-center space-x-2 font-mono">
                {report.riskCounts.critical > 0 && (
                  <span className="text-rose-400 font-semibold">{report.riskCounts.critical} Crit</span>
                )}
                {report.riskCounts.high > 0 && (
                  <span className="text-orange-400 font-semibold">{report.riskCounts.high} High</span>
                )}
                <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center">
                  View <ArrowRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
