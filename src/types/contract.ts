export type UserRole = 'Admin' | 'Analyst' | 'User' | 'Viewer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  password?: string;
  organization?: string;
}

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface BoundingBox {
  page: number;
  x: number;      // percentage from left 0-100
  y: number;      // percentage from top 0-100
  width: number;  // percentage width 0-100
  height: number; // percentage height 0-100
}

export interface Clause {
  id: number;
  contract_id: number;
  clause_number?: string;
  category: string;
  text: string;
  bounding_box: BoundingBox;
}

export interface PlaybookRule {
  id: number;
  playbook_id: number;
  category: string;
  name: string;
  pattern: string; // regex or keyword rule
  description: string;
  severity: RiskSeverity;
  risk_weight: number; // e.g. 10 to 40
  suggested_alternative_template: string;
  is_active: boolean;
}

export interface Playbook {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  rules_count?: number;
}

export interface RiskFlag {
  id: number;
  clause_id: number;
  rule_id: number;
  rule_name: string;
  category: string;
  severity: RiskSeverity;
  issue_summary: string;
  suggested_alternative: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface ContractDoc {
  id: number;
  owner_id: number;
  filename: string;
  title: string;
  sha256: string;
  file_size: string;
  uploaded_at: string;
  uploaded_by: string;
  risk_score: number; // 0 (safest) to 100 (highest risk)
  status: 'AUDITED' | 'IN_REVIEW' | 'REMEDIATED';
  contract_type: 'MSA' | 'NDA' | 'SLA' | 'EMPLOYMENT' | 'SMART_CONTRACT' | 'VENDOR';
  clauses: Clause[];
  risk_flags: RiskFlag[];
  version: string;
}

export interface RiskHistoryPoint {
  date: string;
  avgRiskScore: number;
  highRiskCount: number;
  totalAudited: number;
}

export interface DiffSegment {
  type: 'unchanged' | 'added' | 'removed';
  value: string;
}

export interface ClauseDiff {
  clauseNumber: string;
  category: string;
  status: 'MODIFIED' | 'ADDED' | 'REMOVED' | 'UNCHANGED';
  textA?: string;
  textB?: string;
  riskChange?: string;
  segments: DiffSegment[];
}

export interface VersionComparison {
  id: number;
  contract_id_a: number;
  contract_id_b: number;
  contract_a_title: string;
  contract_b_title: string;
  contract_a_version: string;
  contract_b_version: string;
  risk_score_a: number;
  risk_score_b: number;
  diff_summary: string;
  clause_diffs: ClauseDiff[];
  created_at: string;
}

export interface PortfolioStats {
  totalContracts: number;
  averageRiskScore: number;
  totalHighRisks: number;
  totalMediumRisks: number;
  totalLowRisks: number;
  remediatedCount: number;
  categoryBreakdown: { [category: string]: number };
}

// Compatibility types for smart contract / general vulnerability scans
export type ContractType = 'smart_contract' | 'legal_contract';
export type VulnerabilitySeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

export interface Vulnerability {
  id: string;
  title: string;
  severity: VulnerabilitySeverity;
  category: string;
  lineRange?: [number, number];
  description: string;
  impact: string;
  exploitScenario?: string;
  remediation: string;
  vulnerableSnippet?: string;
  patchedSnippet?: string;
  swcId?: string;
}

export interface OptimizationTip {
  title: string;
  category: 'gas' | 'readability' | 'legal_clarity';
  description: string;
  suggestion: string;
}

export interface ExploitStep {
  step: number;
  actor: string;
  action: string;
  codeOrDetail: string;
}

export interface ExploitFlow {
  vulnerabilityId: string;
  title: string;
  targetVulnerability: string;
  steps: ExploitStep[];
  consequence: string;
}

export interface AuditReport {
  id: string;
  timestamp: string;
  contractTitle: string;
  contractType: ContractType;
  rawCode: string;
  overallScore: number;
  letterGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
  riskCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  vulnerabilities: Vulnerability[];
  optimizations: OptimizationTip[];
  exploitSimulation?: ExploitFlow;
  gasEfficiencyScore?: number;
  legalShieldScore?: number;
  verificationHash: string;
}

export interface SampleContract {
  id: string;
  name: string;
  type: ContractType;
  language: string;
  tag: string;
  description: string;
  code: string;
}

export interface RemediationAction {
  id: string;
  contractId: number;
  contractTitle: string;
  clauseNumber: string;
  category: string;
  appliedBy: string;
  timestamp: string;
  originalSnippet: string;
  remediatedSnippet: string;
  riskReduction: number;
}
