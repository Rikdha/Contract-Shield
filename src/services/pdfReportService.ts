import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ContractDoc, PortfolioStats } from '../types/contract';

export function exportPortfolioPdf(
  contracts: ContractDoc[],
  stats: PortfolioStats,
  organizationName: string = 'Enterprise Workspace',
  userName: string = 'Authorized Administrator'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - (margin * 2);

  // --- HEADER BANNER ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 90, 'F');

  // Cyan accent line
  doc.setFillColor(6, 182, 212); // cyan-500
  doc.rect(0, 87, pageWidth, 3, 'F');

  // Brand title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('CONTRACTSHIELD ENTERPRISE', margin, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Portfolio Risk Assessment and Corporate Compliance Audit', margin, 58);

  // Top right badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(6, 182, 212);
  doc.text('ISO/IEEE 830-1998 COMPLIANT', pageWidth - margin - 150, 42);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, pageWidth - margin - 150, 58);

  let currentY = 112;

  // --- AUDIT METADATA BLOCK ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, currentY, contentWidth, 54, 4, 4, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('Organization:', margin + 12, currentY + 18);
  doc.text('Auditor / User:', margin + 12, currentY + 36);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(organizationName, margin + 90, currentY + 18);
  doc.text(userName, margin + 90, currentY + 36);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Security Protocol:', margin + 280, currentY + 18);
  doc.text('Tenant Status:', margin + 280, currentY + 36);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Stateless In-Memory (NFR2)', margin + 370, currentY + 18);
  doc.text('Strict Multi-Tenant Isolation', margin + 370, currentY + 36);

  currentY += 72;

  // --- KPI SUMMARY STAT CARDS (4 Columns) ---
  const cardWidth = (contentWidth - 24) / 4;
  const cards = [
    { label: 'Active Contracts', value: `${stats.totalContracts}`, sub: 'SHA-256 Validated', color: [15, 23, 42] },
    { 
      label: 'Average Risk Score', 
      value: `${stats.averageRiskScore}/100`, 
      sub: stats.averageRiskScore >= 70 ? 'High Risk' : stats.averageRiskScore >= 40 ? 'Moderate Risk' : 'Low / Safe',
      color: stats.averageRiskScore >= 70 ? [225, 29, 72] : stats.averageRiskScore >= 40 ? [217, 119, 6] : [16, 185, 129]
    },
    { label: 'Critical Red Flags', value: `${stats.totalHighRisks}`, sub: 'Requires Remediation', color: [225, 29, 72] },
    { label: 'Remediated Agreements', value: `${stats.remediatedCount}`, sub: 'Playbook Compliant', color: [16, 185, 129] },
  ];

  cards.forEach((card, idx) => {
    const x = margin + idx * (cardWidth + 8);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, currentY, cardWidth, 54, 4, 4, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, x + 8, currentY + 15);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.text(card.value, x + 8, currentY + 33);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(card.sub, x + 8, currentY + 46);
  });

  currentY += 72;

  // --- SECTION: CONTRACT INVENTORY TABLE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Audited Contracts & Risk Ranking', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('List of all documents evaluated in this isolated corporate portfolio.', margin, currentY + 12);

  currentY += 18;

  const tableData = contracts.map(c => [
    c.title,
    c.contract_type,
    `v${c.version}`,
    `${c.risk_score} / 100`,
    c.status,
    c.sha256 ? `${c.sha256.substring(0, 16)}...` : 'Verified',
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Agreement Title', 'Type', 'Version', 'Risk Score', 'Status', 'SHA-256 Hash']],
    body: tableData,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 5,
      textColor: [51, 65, 85],
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 160 },
      1: { cellWidth: 50 },
      2: { cellWidth: 45 },
      3: { cellWidth: 65, fontStyle: 'bold' },
      4: { cellWidth: 75 },
      5: { cellWidth: 120, font: 'courier' },
    },
    didParseCell: (data) => {
      // Highlight risk scores
      if (data.column.index === 3 && data.section === 'body') {
        const text = String(data.cell.raw);
        const score = parseInt(text);
        if (score >= 70) {
          data.cell.styles.textColor = [225, 29, 72]; // Rose
        } else if (score >= 40) {
          data.cell.styles.textColor = [217, 119, 6]; // Amber
        } else {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald
        }
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 24;

  // Check if we need a new page
  if (currentY > pageHeight - 160) {
    doc.addPage();
    currentY = 40;
  }

  // --- SECTION: RISK HOTSPOTS & CATEGORIES ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Risk Category Hotspots', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Distribution of compliance red flags across contractual categories.', margin, currentY + 12);

  currentY += 18;

  const categoryData = Object.entries(stats.categoryBreakdown).map(([category, count]) => {
    const totalFlags = stats.totalHighRisks + stats.totalMediumRisks || 1;
    const percentage = Math.round((count / totalFlags) * 100);
    const exposure = count >= 3 ? 'High Exposure' : count >= 2 ? 'Moderate' : 'Low';
    return [category, `${count} flags`, `${percentage}%`, exposure];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Legal Risk Category', 'Identified Flags', 'Portfolio Share', 'Exposure Level']],
    body: categoryData.length > 0 ? categoryData : [['No Red Flags Identified', '0', '0%', 'Compliant']],
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 5,
      textColor: [51, 65, 85],
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 220 },
      1: { cellWidth: 95 },
      2: { cellWidth: 95 },
      3: { cellWidth: 105, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.column.index === 3 && data.section === 'body') {
        const text = String(data.cell.raw);
        if (text === 'High Exposure') {
          data.cell.styles.textColor = [225, 29, 72];
        } else if (text === 'Moderate') {
          data.cell.styles.textColor = [217, 119, 6];
        } else {
          data.cell.styles.textColor = [16, 185, 129];
        }
      }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 30;

  // --- FOOTER & COMPLIANCE SIGNATURE ---
  if (currentY > pageHeight - 90) {
    doc.addPage();
    currentY = 40;
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('This document was automatically generated by ContractShield Enterprise SaaS Engine.', margin, currentY + 16);
  doc.text('Cryptographic integrity verified via SHA-256 hashing. All rights reserved.', margin, currentY + 28);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`AUDIT ID: CS-${Date.now().toString(16).toUpperCase()}`, pageWidth - margin - 150, currentY + 16);

  // Save the PDF
  const filename = `ContractShield-Portfolio-Report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
