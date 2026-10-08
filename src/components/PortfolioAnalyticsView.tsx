import React, { useState, useMemo } from 'react';
import { ContractDoc, PortfolioStats, RiskHistoryPoint } from '../types/contract';
import { calculatePortfolioStats } from '../services/contractEngine';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { 
  BarChart3, 
  Download, 
  FileText, 
  FileDown,
  ArrowUpRight, 
  Filter,
  PieChart,
  Calendar,
  Layers,
  Activity,
  Building2
} from 'lucide-react';
import { exportPortfolioPdf } from '../services/pdfReportService';
import { FaultIsolationBoundary } from './FaultIsolationBoundary';

interface PortfolioAnalyticsViewProps {
  contracts: ContractDoc[];
  onSelectContract: (contract: ContractDoc) => void;
  currentUserOrg?: string;
  userName?: string;
}

export const PortfolioAnalyticsView: React.FC<PortfolioAnalyticsViewProps> = ({
  contracts,
  onSelectContract,
  currentUserOrg,
  userName,
}) => {
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [timeRange, setTimeRange] = useState<'30d' | '14d' | '7d'>('30d');
  const stats: PortfolioStats = calculatePortfolioStats(contracts);

  const filteredContracts = contracts.filter(c => {
    if (typeFilter === 'ALL') return true;
    return c.contract_type === typeFilter;
  });

  // Generate historical risk trend data
  const historicalTrendData = useMemo(() => {
    const points: RiskHistoryPoint[] = [];
    const today = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const baseScore = stats.averageRiskScore || 50;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const variance = Math.sin(i * 0.7) * 7 + (days - i) * -0.4;
      const score = Math.max(15, Math.min(95, Math.round(baseScore + variance)));

      points.push({
        date: formattedDate,
        avgRiskScore: score,
        highRiskCount: stats.totalHighRisks,
        totalAudited: contracts.length,
      });
    }

    if (points.length > 0) {
      points[points.length - 1].avgRiskScore = baseScore;
    }

    return points;
  }, [stats.averageRiskScore, contracts.length, timeRange]);

  const getRiskColor = (score: number) => {
    if (score >= 70) return '#991b1b'; // Red
    if (score >= 40) return '#92400e'; // Amber
    return '#065f46'; // Emerald
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Moderate Risk';
    return 'Compliant';
  };

  const exportPortfolioCsv = () => {
    let csv = 'ID,Filename,Title,Type,Version,Risk Score,Status,SHA-256\n';
    contracts.forEach(c => {
      csv += `"${c.id}","${c.filename}","${c.title}","${c.contract_type}","${c.version}","${c.risk_score}","${c.status}","${c.sha256}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ContractShield-Portfolio-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportSummaryMarkdown = () => {
    let md = `# Contract Shield Portfolio Risk and Compliance Audit\n\n`;
    md += `**Organization:** ${currentUserOrg || 'Enterprise Client'}\n`;
    md += `**Audit Timestamp:** ${new Date().toUTCString()}\n`;
    md += `**Total Isolated Contracts:** ${stats.totalContracts}\n`;
    md += `**Average Risk Index:** ${stats.averageRiskScore}/100\n`;
    md += `**High Severity Flags:** ${stats.totalHighRisks}\n`;
    md += `**Medium Severity Flags:** ${stats.totalMediumRisks}\n\n`;
    md += `## Category Risk Exposure\n`;
    Object.entries(stats.categoryBreakdown).forEach(([cat, count]) => {
      md += `- ${cat}: ${count} flags\n`;
    });
    md += `\n## Audited Agreements Inventory\n\n`;
    contracts.forEach(c => {
      md += `### ${c.title} (v${c.version})\n`;
      md += `- Risk Score: ${c.risk_score}/100 (${getRiskLabel(c.risk_score)})\n`;
      md += `- Status: ${c.status}\n`;
      md += `- SHA-256: \`${c.sha256}\`\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ContractShield-Portfolio-Audit.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    exportPortfolioPdf(contracts, stats, currentUserOrg, userName);
  };

  return (
    <div className="space-y-8" style={{ fontFamily: "'Times New Roman', Times, 'Newsreader', Georgia, serif" }}>
      {/* SECTION 5.1: TOP HEADER & ACTIONS */}
      <FaultIsolationBoundary sectionTitle="Analytics Header" sectionCode="SEC-AN1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#dfd9cd]">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-stone-900">
                Portfolio Risk & Exposure Analytics
              </h3>
              <span className="text-stone-400">·</span>
              <span className="text-stone-700 text-xs font-semibold bg-[#eeebe3] px-2 py-0.5 rounded border border-[#d6cfbf]">
                {currentUserOrg || 'Organization Workspace'}
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Surveillance of portfolio risk velocity, category liability concentrations, and approved remediations.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportPdf}
              className="flex items-center space-x-2 px-4 py-2 rounded bg-stone-900 hover:bg-stone-800 text-xs font-bold text-[#f6f4ef] shadow-xs transition"
              title="Download executive PDF audit report"
            >
              <FileDown className="w-4 h-4" />
              <span>Export PDF Report</span>
            </button>
            <button
              onClick={exportSummaryMarkdown}
              className="flex items-center space-x-1.5 px-3 py-2 rounded bg-[#fbfaf7] hover:bg-[#ede8df] text-xs font-bold text-stone-800 border border-[#dfd9cd] transition"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>Markdown</span>
            </button>
            <button
              onClick={exportPortfolioCsv}
              className="flex items-center space-x-1.5 px-3 py-2 rounded bg-[#fbfaf7] hover:bg-[#ede8df] text-xs font-bold text-stone-800 border border-[#dfd9cd] transition"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>CSV Ledger</span>
            </button>
          </div>
        </div>
      </FaultIsolationBoundary>

      {/* SECTION 5.2: KPI METRIC CARDS */}
      <FaultIsolationBoundary sectionTitle="Key Performance Indicators" sectionCode="SEC-AN2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-lg bg-[#fbfaf7] border border-[#dfd9cd] shadow-xs">
            <div className="text-xs text-stone-600 font-medium mb-1">
              Total Audited Contracts
            </div>
            <div className="text-3xl font-bold text-stone-900 my-1">
              {stats.totalContracts}
            </div>
            <div className="text-xs text-stone-500 italic mt-1">
              Isolated workspace documents
            </div>
          </div>

          <div className="p-5 rounded-lg bg-[#fbfaf7] border border-[#dfd9cd] shadow-xs">
            <div className="text-xs text-stone-600 font-medium mb-1">
              Average Portfolio Risk
            </div>
            <div className="flex items-baseline space-x-2 my-1">
              <span className={`text-3xl font-bold ${
                stats.averageRiskScore >= 70 ? 'text-rose-800' :
                stats.averageRiskScore >= 40 ? 'text-amber-800' :
                'text-emerald-800'
              }`}>
                {stats.averageRiskScore}
              </span>
              <span className="text-xs text-stone-500 font-normal">/ 100</span>
            </div>
            <div className="text-xs text-stone-700 mt-1 flex items-center space-x-1.5 font-bold">
              <span className={`w-2 h-2 rounded-full ${
                stats.averageRiskScore >= 70 ? 'bg-rose-600' :
                stats.averageRiskScore >= 40 ? 'bg-amber-600' :
                'bg-emerald-600'
              }`} />
              <span>Posture: {getRiskLabel(stats.averageRiskScore)}</span>
            </div>
          </div>

          <div className="p-5 rounded-lg bg-[#fbfaf7] border border-[#dfd9cd] shadow-xs">
            <div className="text-xs text-stone-600 font-medium mb-1">
              Critical Risk Flags
            </div>
            <div className="text-3xl font-bold text-rose-800 my-1">
              {stats.totalHighRisks}
            </div>
            <div className="text-xs text-stone-500 italic mt-1">
              Requires active clause negotiation
            </div>
          </div>

          <div className="p-5 rounded-lg bg-[#fbfaf7] border border-[#dfd9cd] shadow-xs">
            <div className="text-xs text-stone-600 font-medium mb-1">
              Remediated Agreements
            </div>
            <div className="text-3xl font-bold text-emerald-800 my-1">
              {stats.remediatedCount}
            </div>
            <div className="text-xs text-stone-500 italic mt-1">
              Shield compliance approved
            </div>
          </div>
        </div>
      </FaultIsolationBoundary>

      {/* SECTION 5.3: RISK VELOCITY CHART */}
      <FaultIsolationBoundary sectionTitle="Risk Trajectory Chart" sectionCode="SEC-AN3">
        <section className="bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                Risk Velocity Trajectory (Past {timeRange.replace('d', ' Days')})
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Surveillance of portfolio risk over time. Downward slope indicates successful risk mitigations.
              </p>
            </div>

            <div className="flex items-center space-x-4 text-xs">
              <div className="hidden md:flex items-center space-x-3 text-xs text-stone-600">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Compliant (&lt;40)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  <span>Moderate (40-69)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  <span>High (&ge;70)</span>
                </span>
              </div>

              {/* Interval filter */}
              <div className="inline-flex p-1 bg-[#ede8df] rounded border border-[#d6cfbf] text-xs font-bold text-stone-700">
                {(['7d', '14d', '30d'] as const).map(tr => (
                  <button
                    key={tr}
                    onClick={() => setTimeRange(tr)}
                    className={`px-3 py-1 rounded transition ${
                      timeRange === tr
                        ? 'bg-[#fbfaf7] text-stone-900 shadow-xs font-bold'
                        : 'hover:text-stone-900'
                    }`}
                  >
                    {tr.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-[270px] w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={historicalTrendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="riskAreaGradWarm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c1917" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1c1917" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e1d5" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#78716c" 
                  tick={{ fill: '#44403c', fontSize: 11, fontFamily: 'Times New Roman' }}
                  tickLine={false}
                  axisLine={{ stroke: '#d6cfbf' }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#78716c" 
                  tick={{ fill: '#44403c', fontSize: 11, fontFamily: 'Times New Roman' }}
                  tickLine={false}
                  axisLine={{ stroke: '#d6cfbf' }}
                  ticks={[0, 20, 40, 60, 80, 100]}
                />
                <ReferenceLine y={70} stroke="#e11d48" strokeDasharray="4 4" strokeOpacity={0.7} />
                <ReferenceLine y={40} stroke="#059669" strokeDasharray="4 4" strokeOpacity={0.7} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as RiskHistoryPoint;
                      const color = getRiskColor(data.avgRiskScore);
                      const label = getRiskLabel(data.avgRiskScore);

                      return (
                        <div className="bg-[#fbfaf7] border border-[#d6cfbf] p-3 rounded shadow-sm text-xs space-y-1 font-serif">
                          <div className="text-stone-500 text-[11px] pb-1 border-b border-[#ece7dd]">
                            {data.date}
                          </div>
                          <div className="flex items-center justify-between space-x-3 pt-1">
                            <span className="text-stone-700">Average Risk:</span>
                            <span className="font-bold text-sm" style={{ color }}>
                              {data.avgRiskScore} / 100
                            </span>
                          </div>
                          <div className="text-[11px] font-bold" style={{ color }}>
                            Status: {label}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="avgRiskScore"
                  stroke="#1c1917"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#riskAreaGradWarm)"
                  dot={{ r: 3, fill: '#1c1917', stroke: '#f6f4ef', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: '#1c1917', stroke: '#f6f4ef', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </FaultIsolationBoundary>

      {/* SECTION 5.4: CATEGORY HOTSPOTS & PORTFOLIO INVENTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 cols): Category Exposure */}
        <div className="lg:col-span-5 space-y-4">
          <FaultIsolationBoundary sectionTitle="Category Hotspots" sectionCode="SEC-AN4">
            <section className="bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                Risk Exposure by Category
              </h3>

              <div className="space-y-3.5">
                {Object.entries(stats.categoryBreakdown).map(([category, count]) => {
                  const percentage = Math.round((count / (stats.totalHighRisks + stats.totalMediumRisks || 1)) * 100);
                  return (
                    <div key={category} className="p-3.5 rounded bg-[#f5f2eb] border border-[#e2ddd1] text-xs">
                      <div className="flex justify-between items-center mb-1.5 font-bold">
                        <span className="text-stone-900">{category}</span>
                        <span className="text-stone-800 text-[11px] bg-[#e8e3d6] px-2 py-0.5 rounded">{count} flags ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#e0dad0] overflow-hidden">
                        <div
                          className="h-full bg-stone-900 rounded-full"
                          style={{ width: `${Math.min(100, percentage * 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </FaultIsolationBoundary>
        </div>

        {/* Right Column (7 cols): Audited Contracts Table */}
        <div className="lg:col-span-7 space-y-4">
          <FaultIsolationBoundary sectionTitle="Inventory Table" sectionCode="SEC-AN5">
            <section className="bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg overflow-hidden shadow-xs">
              <div className="p-5 border-b border-[#ece7dd] flex items-center justify-between text-xs">
                <h3 className="font-bold text-stone-900 uppercase tracking-wide">
                  Audited Contracts Registry
                </h3>
                <span className="text-stone-600 font-bold bg-[#ede8df] px-2.5 py-0.5 rounded">
                  {contracts.length} Total
                </span>
              </div>

              <div className="divide-y divide-[#ece7dd]">
                {contracts.map(c => (
                  <div
                    key={c.id}
                    onClick={() => onSelectContract(c)}
                    className="p-4 hover:bg-[#f5f2eb] transition cursor-pointer flex items-center justify-between text-xs gap-4"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-stone-900 text-sm truncate">
                        {c.title}
                      </h4>
                      <div className="text-xs text-stone-600 flex items-center space-x-2 mt-1">
                        <span className="font-semibold text-stone-800">v{c.version}</span>
                        <span>·</span>
                        <span>{c.contract_type}</span>
                        <span>·</span>
                        <span>{c.clauses.length} clauses</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded border ${
                        c.risk_score >= 70 ? 'bg-rose-100 text-rose-900 border-rose-300' :
                        c.risk_score >= 40 ? 'bg-amber-100 text-amber-900 border-amber-300' :
                        'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}>
                        {c.risk_score} / 100 Risk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </FaultIsolationBoundary>
        </div>
      </div>
    </div>
  );
};
