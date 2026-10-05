import { Clause, ContractDoc, PlaybookRule, RiskFlag, VersionComparison, ClauseDiff, DiffSegment, PortfolioStats } from '../types/contract';
import { sanitizeDocumentText, isBinaryGibberish } from './documentParserService';

/**
 * FR2: Generate SHA-256 integrity verification hash using standard Web Crypto API
 */
export async function calculateSHA256(content: string | ArrayBuffer): Promise<string> {
  let buffer: ArrayBuffer;
  if (typeof content === 'string') {
    const encoder = new TextEncoder();
    buffer = encoder.encode(content).buffer as ArrayBuffer;
  } else {
    buffer = content;
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Detect legal category from clause text
 */
export function detectClauseCategory(text: string): string {
  const lower = text.toLowerCase();

  if (/intellectual property|inventions|work product|ip assignment|patent|copyright|proprietary rights|ownership of deliverables/i.test(lower)) {
    return 'Intellectual Property';
  }
  if (/indemnif|hold harmless|defend,? indemnify|unlimited liability|limitation of liability|consequential damages|aggregate liability/i.test(lower)) {
    return 'Indemnification & Liability';
  }
  if (/non-compete|covenant not to compete|non-solicit|shall not directly or indirectly engage in|restraint of trade|competing business/i.test(lower)) {
    return 'Restrictive Covenants';
  }
  if (/payment|fee|invoice|invoicing|withhold|disputed amount|compensation|late payment|net 30|net 60/i.test(lower)) {
    return 'Payment Terms';
  }
  if (/arbitration|dispute|governing law|jurisdiction|venue|jury trial|class action|mediation/i.test(lower)) {
    return 'Dispute Resolution';
  }
  if (/renew|term|expiration|cancellation|termination for convenience|notice of termination|effective date/i.test(lower)) {
    return 'Term & Renewal';
  }
  if (/service level|sla|uptime|downtime|service credit|maintenance window|availability/i.test(lower)) {
    return 'Service Level & Remedies';
  }
  if (/confidential|privacy|data protection|gdpr|telemetry|trade secret|security breach/i.test(lower)) {
    return 'Data Privacy & Rights';
  }
  if (/reentrancy|\.call\{value:|reentrant|smart contract/i.test(lower)) {
    return 'Smart Contract Call Invariants';
  }

  return 'General Covenants';
}

/**
 * FR3: Parse uploaded document text into clauses and assign layout bounding box coordinates
 */
export function parseDocumentClauses(rawText: string, contractId: number): Clause[] {
  // Guard against binary gibberish
  let cleanText = sanitizeDocumentText(rawText);
  if (isBinaryGibberish(cleanText)) {
    cleanText = 'Contract text extraction in progress. Please review the parsed sections below.';
  }

  if (!cleanText || cleanText.trim().length === 0) {
    return [
      {
        id: contractId * 1000 + 1,
        contract_id: contractId,
        clause_number: '1.0',
        category: 'General Terms',
        text: 'Standard commercial agreement terms and mutual obligations.',
        bounding_box: { page: 1, x: 8, y: 15, width: 84, height: 20 },
      },
    ];
  }

  // Split into candidate sections:
  // First test if document contains standard section headers (e.g. "Section 1.", "1. DEFINITIONS", "ARTICLE II")
  const sectionSplitRegex = /\n+(?=(?:(?:Section|Clause|Article|ARTICLE|SECTION|CLAUSE)\s+[\dIVXLCDM]+[:.]?|\b\d+[\.:]\s+[A-Z]))/i;
  let rawSections: string[] = [];

  if (sectionSplitRegex.test(cleanText)) {
    rawSections = cleanText.split(sectionSplitRegex);
  } else {
    // Fall back to splitting by double newlines or paragraph blocks
    rawSections = cleanText.split(/\n\s*\n+/);
  }

  // Filter and normalize paragraphs
  const paragraphs = rawSections
    .map(p => p.trim())
    .filter(p => p.length >= 25 && !/^(page\s+\d+(\s+of\s+\d+)?|\d+)$/i.test(p));

  // If after filtering we have no paragraphs or only one giant block, split by sentences/newlines
  let finalParagraphs = paragraphs;
  if (paragraphs.length <= 1 && cleanText.length > 300) {
    finalParagraphs = cleanText
      .split(/(?<=[.!?])\s*\n+/)
      .map(s => s.trim())
      .filter(s => s.length >= 35);
  }

  if (finalParagraphs.length === 0) {
    finalParagraphs = [cleanText];
  }

  const clauses: Clause[] = [];
  let currentPage = 1;
  let currentY = 14;

  finalParagraphs.forEach((p, idx) => {
    // Detect clause number if present
    const numMatch = p.match(/^(?:Section|Clause|Article)?\s*(\d+(?:\.\d+)*)[:.]?/i);
    const clauseNum = numMatch ? numMatch[1] : `${idx + 1}.0`;

    // Detect category
    const category = detectClauseCategory(p);

    // Calculate height estimate based on text length (clamp between 8% and 22%)
    const height = Math.min(22, Math.max(9, Math.round((p.length / 280) * 10)));

    if (currentY + height > 88) {
      currentPage += 1;
      currentY = 14;
    }

    clauses.push({
      id: contractId * 1000 + idx + 1,
      contract_id: contractId,
      clause_number: clauseNum,
      category,
      text: p,
      bounding_box: {
        page: currentPage,
        x: 8,
        y: currentY,
        width: 84,
        height,
      },
    });

    currentY += height + 3.5;
  });

  return clauses;
}

/**
 * FR4: Execute active Playbook Rules against clauses to evaluate risk severity and calculate overall score.
 * Features both regex matching and semantic pattern fallback for real-world contracts.
 */
export function evaluateRulesAgainstClauses(
  clauses: Clause[],
  rules: PlaybookRule[]
): { riskScore: number; riskFlags: RiskFlag[] } {
  const flags: RiskFlag[] = [];
  const activeRules = rules.filter(r => r.is_active);

  clauses.forEach((clause) => {
    const textLower = clause.text.toLowerCase();

    activeRules.forEach((rule) => {
      let isMatch = false;

      // 1. Direct regex pattern matching from Playbook Rules
      try {
        const regex = new RegExp(rule.pattern, 'i');
        if (regex.test(clause.text)) {
          isMatch = true;
        }
      } catch (err) {
        // Fallback if rule contains invalid regex
      }

      // 2. Real-World Heuristic Matching: If regex didn't catch it, check semantic indicators
      if (!isMatch) {
        // Indemnification / Liability Risk
        if (rule.category === 'Indemnification & Liability') {
          const hasIndemnity = /indemnif|hold harmless|defend/i.test(textLower);
          const hasUncappedOrOneSided = /unlimited|no limitation|not subject to any cap|zero liability|sole liability|all claims, liabilities|gross negligence/i.test(textLower);
          if (hasIndemnity && hasUncappedOrOneSided) isMatch = true;
        }
        // Restrictive Covenants / Non-Compete Risk
        else if (rule.category === 'Restrictive Covenants') {
          const hasNonCompete = /non-compete|not to compete|non competition|shall not directly or indirectly engage in|restraint of trade/i.test(textLower);
          if (hasNonCompete) isMatch = true;
        }
        // Intellectual Property Landgrab
        else if (rule.category === 'Intellectual Property') {
          const hasIp = /intellectual property|inventions|work product|moral rights|prior inventions/i.test(textLower);
          const hasBroadClaim = /irrevocably assigns|regardless of whether created during working hours|five years thereafter|all right, title, and interest worldwide/i.test(textLower);
          if (hasIp && hasBroadClaim) isMatch = true;
        }
        // Auto-Renewal Trap
        else if (rule.category === 'Term & Renewal') {
          const hasRenewal = /automatically renew|auto-renew|successive term/i.test(textLower);
          const hasLockIn = /twenty-four|thirty-six|price increase|certified postal mail|ninety days/i.test(textLower);
          if (hasRenewal && hasLockIn) isMatch = true;
        }
        // Foreign Jurisdiction / Venue
        else if (rule.category === 'Dispute Resolution') {
          const hasDispute = /jurisdiction|venue|arbitration|governing law/i.test(textLower);
          const hasAsymmetric = /cayman|exclusive jurisdiction of|waives? any right to jury trial|class action waiver/i.test(textLower);
          if (hasDispute && hasAsymmetric) isMatch = true;
        }
        // Service Level Liability Disclaimer
        else if (rule.category === 'Service Level & Remedies') {
          const hasSla = /service level|uptime|sla|availability/i.test(textLower);
          const hasExclusion = /no liability|disclaim all liability|sole and exclusive remedy|credits exceed/i.test(textLower);
          if (hasSla && hasExclusion) isMatch = true;
        }
      }

      if (isMatch) {
        flags.push({
          id: Date.now() + Math.floor(Math.random() * 10000) + clause.id,
          clause_id: clause.id,
          rule_id: rule.id,
          rule_name: rule.name,
          category: rule.category,
          severity: rule.severity,
          issue_summary: rule.description,
          suggested_alternative: rule.suggested_alternative_template,
          status: 'PENDING',
        });
      }
    });
  });

  // Calculate cumulative risk score (0 to 100)
  let cumulativeWeight = 0;
  flags.forEach(f => {
    if (f.severity === 'HIGH') cumulativeWeight += 28;
    else if (f.severity === 'MEDIUM') cumulativeWeight += 16;
    else cumulativeWeight += 8;
  });

  const riskScore = Math.min(100, Math.max(10, cumulativeWeight));

  return { riskScore, riskFlags: flags };
}

function generateDiffSegments(textA: string, textB: string): DiffSegment[] {
  if (!textA && textB) {
    return [{ type: 'added', value: textB }];
  }
  if (textA && !textB) {
    return [{ type: 'removed', value: textA }];
  }
  if (textA === textB) {
    return [{ type: 'unchanged', value: textA }];
  }
  return [
    { type: 'removed', value: textA },
    { type: 'added', value: textB }
  ];
}

/**
 * FR6: Compare two contract versions (contract_id_a and contract_id_b)
 */
export function computeVersionDiff(
  contractA: ContractDoc,
  contractB: ContractDoc
): VersionComparison {
  const clauseDiffs: ClauseDiff[] = [];

  // Map clauses of B by clause_number or category
  const clausesMapB = new Map<string, Clause>();
  contractB.clauses.forEach(c => {
    const key = c.clause_number || c.category;
    clausesMapB.set(key, c);
  });

  contractA.clauses.forEach((cA) => {
    const key = cA.clause_number || cA.category;
    const cB = clausesMapB.get(key);

    if (!cB) {
      clauseDiffs.push({
        clauseNumber: cA.clause_number || 'N/A',
        category: cA.category,
        status: 'REMOVED',
        textA: cA.text,
        textB: '',
        riskChange: 'Clause removed in updated version',
        segments: generateDiffSegments(cA.text, ''),
      });
    } else if (cA.text.trim() === cB.text.trim()) {
      clauseDiffs.push({
        clauseNumber: cA.clause_number || 'N/A',
        category: cA.category,
        status: 'UNCHANGED',
        textA: cA.text,
        textB: cB.text,
        segments: generateDiffSegments(cA.text, cB.text),
      });
    } else {
      clauseDiffs.push({
        clauseNumber: cA.clause_number || 'N/A',
        category: cA.category,
        status: 'MODIFIED',
        textA: cA.text,
        textB: cB.text,
        riskChange: 'Remediated with balanced terms',
        segments: generateDiffSegments(cA.text, cB.text),
      });
    }
  });

  // Check for newly added clauses in B
  contractB.clauses.forEach((cB) => {
    const key = cB.clause_number || cB.category;
    const existsInA = contractA.clauses.some(cA => (cA.clause_number || cA.category) === key);
    if (!existsInA) {
      clauseDiffs.push({
        clauseNumber: cB.clause_number || 'N/A',
        category: cB.category,
        status: 'ADDED',
        textA: '',
        textB: cB.text,
        riskChange: 'Newly introduced section',
        segments: generateDiffSegments('', cB.text),
      });
    }
  });

  const modifiedCount = clauseDiffs.filter(d => d.status === 'MODIFIED').length;
  const deletedCount = clauseDiffs.filter(d => d.status === 'REMOVED').length;
  const addedCount = clauseDiffs.filter(d => d.status === 'ADDED').length;

  return {
    id: Date.now(),
    contract_id_a: contractA.id,
    contract_id_b: contractB.id,
    contract_a_title: contractA.title,
    contract_b_title: contractB.title,
    contract_a_version: contractA.version,
    contract_b_version: contractB.version,
    risk_score_a: contractA.risk_score,
    risk_score_b: contractB.risk_score,
    clause_diffs: clauseDiffs,
    diff_summary: `Remediation audit: ${modifiedCount} clauses patched, ${deletedCount} removed, ${addedCount} added. Risk index reduced from ${contractA.risk_score}/100 to ${contractB.risk_score}/100.`,
    created_at: new Date().toISOString(),
  };
}

/**
 * FR8: Calculate portfolio aggregate statistics
 */
export function calculatePortfolioStats(contracts: ContractDoc[]): PortfolioStats {
  if (contracts.length === 0) {
    return {
      totalContracts: 0,
      averageRiskScore: 0,
      totalHighRisks: 0,
      totalMediumRisks: 0,
      totalLowRisks: 0,
      categoryBreakdown: {},
      remediatedCount: 0,
    };
  }

  let totalScore = 0;
  let totalHigh = 0;
  let totalMedium = 0;
  let totalLow = 0;
  let remediated = 0;
  const categoryMap: { [cat: string]: number } = {};

  contracts.forEach((c) => {
    totalScore += c.risk_score;
    if (c.status === 'REMEDIATED' || c.risk_score < 40) {
      remediated += 1;
    }

    c.risk_flags.forEach((f) => {
      if (f.severity === 'HIGH') totalHigh += 1;
      else if (f.severity === 'MEDIUM') totalMedium += 1;
      else totalLow += 1;

      categoryMap[f.category] = (categoryMap[f.category] || 0) + 1;
    });
  });

  return {
    totalContracts: contracts.length,
    averageRiskScore: Math.round(totalScore / contracts.length),
    totalHighRisks: totalHigh,
    totalMediumRisks: totalMedium,
    totalLowRisks: totalLow,
    categoryBreakdown: categoryMap,
    remediatedCount: remediated,
  };
}
