import React, { useState, useEffect } from 'react';
import { 
  INITIAL_USERS, 
  INITIAL_PLAYBOOKS, 
  INITIAL_PLAYBOOK_RULES, 
  INITIAL_CONTRACTS, 
  INITIAL_VERSION_COMPARISONS 
} from './data/mockDatabase';
import { 
  User, 
  UserRole, 
  ContractDoc, 
  Playbook, 
  PlaybookRule, 
  VersionComparison,
  RemediationAction
} from './types/contract';
import { evaluateRulesAgainstClauses } from './services/contractEngine';
import { Header, AppNavTab } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { DashboardView } from './components/DashboardView';
import { AnnotatedPdfViewer } from './components/AnnotatedPdfViewer';
import { ClauseRiskPanel } from './components/ClauseRiskPanel';
import { VersionComparisonView } from './components/VersionComparisonView';
import { PortfolioAnalyticsView } from './components/PortfolioAnalyticsView';
import { PlaybookManager } from './components/PlaybookManager';
import { UserManager } from './components/UserManager';
import { UploadModal } from './components/UploadModal';
import { ContractChatbot } from './components/ContractChatbot';
import { SmartContractAuditorView } from './components/SmartContractAuditorView';
import { 
  FileText, 
  Lock, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Layers,
  MessageSquare,
  Mic,
  Bot,
  Plus,
  AlertCircle
} from 'lucide-react';

export function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Rikdha Sarkar, Admin

  // Navigation State
  const [activeNavTab, setActiveNavTab] = useState<AppNavTab>('dashboard');

  // Playbook & Governance State (FR7)
  const [playbooks, setPlaybooks] = useState<Playbook[]>(INITIAL_PLAYBOOKS);
  const [playbookRules, setPlaybookRules] = useState<PlaybookRule[]>(INITIAL_PLAYBOOK_RULES);

  // All Contracts in Database
  const [contracts, setContracts] = useState<ContractDoc[]>(INITIAL_CONTRACTS);

  // Recent Remediation Actions Log
  const [remediations, setRemediations] = useState<RemediationAction[]>([
    {
      id: 'rem-1',
      contractId: 1001,
      contractTitle: 'Nexus Enterprise Solutions MSA',
      clauseNumber: '2.0',
      category: 'Indemnification & Liability',
      appliedBy: 'Rikdha Sarkar',
      timestamp: 'Today at 07:14 AM',
      originalSnippet: 'Contractor liability shall be UNLIMITED and not subject to any cap...',
      remediatedSnippet: 'Each party’s aggregate cumulative liability shall be capped at total fees paid in the preceding twelve (12) months...',
      riskReduction: 45,
    },
    {
      id: 'rem-2',
      contractId: 1002,
      contractTitle: 'Nexus Senior Engineering Employment Agreement',
      clauseNumber: '3.0',
      category: 'Restrictive Covenants',
      appliedBy: 'Rikdha Sarkar',
      timestamp: 'Yesterday at 04:30 PM',
      originalSnippet: 'Employee shall not directly or indirectly engage in software globally for thirty-six (36) months...',
      remediatedSnippet: 'Contractor shall not directly solicit active clients personally served during engagement for six (6) months...',
      riskReduction: 35,
    },
    {
      id: 'rem-3',
      contractId: 1003,
      contractTitle: 'Cloud Infrastructure SLA & Terms',
      clauseNumber: '4.0',
      category: 'Term & Renewal',
      appliedBy: 'Rikdha Sarkar',
      timestamp: 'Oct 3, 2026',
      originalSnippet: 'Agreement automatically renews for twenty-four months with 50% price escalation...',
      remediatedSnippet: 'Renews month-to-month unless 30 days email notice provided, price adjustment capped at 3% CPI...',
      riskReduction: 25,
    }
  ]);

  // USER ISOLATION FILTER (Core Requirement):
  // One admin cannot see contracts of the other admin.
  // Each user strictly accesses contracts where owner_id === currentUser.id
  const userContracts = contracts.filter(c => c.owner_id === currentUser.id);

  const [selectedContractId, setSelectedContractId] = useState<number | null>(
    userContracts[0]?.id || null
  );
  const [selectedClauseId, setSelectedClauseId] = useState<number | null>(
    userContracts[0]?.clauses[0]?.id || null
  );

  // Sync selected contract when user switches or logs in
  useEffect(() => {
    if (userContracts.length > 0) {
      if (!selectedContractId || !userContracts.some(c => c.id === selectedContractId)) {
        setSelectedContractId(userContracts[0].id);
        setSelectedClauseId(userContracts[0].clauses[0]?.id || null);
      }
    } else {
      setSelectedContractId(null);
      setSelectedClauseId(null);
    }
  }, [currentUser.id, contracts]);

  // Comparisons State (Filtered to user's contracts)
  const [comparisons, setComparisons] = useState<VersionComparison[]>(INITIAL_VERSION_COMPARISONS);
  const userComparisons = comparisons.filter(comp => 
    userContracts.some(c => c.id === comp.contract_id_a) &&
    userContracts.some(c => c.id === comp.contract_id_b)
  );

  // Upload Modal State (FR2)
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [copiedSha, setCopiedSha] = useState<boolean>(false);

  // Chatbot & Voice Assistant State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const selectedContract = userContracts.find(c => c.id === selectedContractId) || userContracts[0] || null;

  // Authentication Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveNavTab('auditor');
  };

  const handleRegister = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setActiveNavTab('auditor');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Role switching
  const handleSwitchRole = (newRole: UserRole) => {
    setCurrentUser(prev => ({ ...prev, role: newRole }));
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, role: newRole } : u));
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
  };

  const handleUpdateUserRole = (userId: number, role: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, role }));
    }
  };

  // Rule management (FR7)
  const handleUpdateRule = (updatedRule: PlaybookRule) => {
    setPlaybookRules(prev => prev.map(r => r.id === updatedRule.id ? updatedRule : r));
    if (selectedContract) {
      recalculateContractRisks(selectedContract.id, playbookRules.map(r => r.id === updatedRule.id ? updatedRule : r));
    }
  };

  const handleAddRule = (newRuleData: Omit<PlaybookRule, 'id'>) => {
    const newRule: PlaybookRule = {
      ...newRuleData,
      id: Date.now(),
    };
    setPlaybookRules(prev => [...prev, newRule]);
  };

  const recalculateContractRisks = (contractId: number, currentRules: PlaybookRule[]) => {
    setContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        const { riskScore, riskFlags } = evaluateRulesAgainstClauses(c.clauses, currentRules);
        return {
          ...c,
          risk_score: riskScore,
          risk_flags: riskFlags,
        };
      }
      return c;
    }));
  };

  // Active Remediation (FR5)
  const handleApplyRemediation = (clauseId: number, alternativeText: string) => {
    if (!selectedContract) return;

    const originalClause = selectedContract.clauses.find(c => c.id === clauseId);

    setContracts(prev => prev.map(c => {
      if (c.id === selectedContract.id) {
        const updatedClauses = c.clauses.map(clause => {
          if (clause.id === clauseId) {
            return {
              ...clause,
              text: alternativeText,
            };
          }
          return clause;
        });

        const { riskScore, riskFlags } = evaluateRulesAgainstClauses(updatedClauses, playbookRules);
        const riskDiff = Math.max(0, c.risk_score - riskScore);

        if (originalClause) {
          const newRemediation: RemediationAction = {
            id: `rem-${Date.now()}`,
            contractId: c.id,
            contractTitle: c.title,
            clauseNumber: originalClause.clause_number || '1.0',
            category: originalClause.category,
            appliedBy: currentUser.name,
            timestamp: 'Just now',
            originalSnippet: originalClause.text.slice(0, 90) + '...',
            remediatedSnippet: alternativeText.slice(0, 110) + '...',
            riskReduction: riskDiff || 25,
          };
          setRemediations(r => [newRemediation, ...r]);
        }

        return {
          ...c,
          clauses: updatedClauses,
          risk_score: riskScore,
          risk_flags: riskFlags,
          status: riskScore < 40 ? 'REMEDIATED' : c.status,
        };
      }
      return c;
    }));
  };

  // Ask AI about a specific clause
  const handleAskAiAboutClause = (clauseText: string, clauseNum: string) => {
    setIsChatOpen(true);
  };

  // Document Ingestion (FR2) with owner_id assignment
  const handleUploadSuccess = (newDoc: ContractDoc) => {
    setContracts(prev => [newDoc, ...prev]);
    setSelectedContractId(newDoc.id);
    setSelectedClauseId(newDoc.clauses[0]?.id || null);
    setActiveNavTab('auditor');
  };

  const handleCopySha = () => {
    if (!selectedContract) return;
    navigator.clipboard.writeText(selectedContract.sha256);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  // If not authenticated, render Login Page
  if (!isAuthenticated) {
    return (
      <LoginPage
        users={users}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      <Header
        activeTab={activeNavTab}
        setActiveTab={setActiveNavTab}
        currentUser={currentUser}
        onOpenUpload={() => setIsUploadOpen(true)}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 0: HIGH-LEVEL OPERATIONAL DASHBOARD */}
        {activeNavTab === 'dashboard' && (
          <DashboardView
            contracts={userContracts}
            remediations={remediations}
            activeRules={playbookRules}
            currentUser={currentUser}
            onSelectContract={(contract) => {
              setSelectedContractId(contract.id);
              setSelectedClauseId(contract.clauses[0]?.id || null);
              setActiveNavTab('auditor');
            }}
            onOpenUpload={() => setIsUploadOpen(true)}
            onNavigateToTab={(tab) => setActiveNavTab(tab as any)}
          />
        )}

        {/* VIEW 1: ANNOTATED AUDITOR & PDF SPLIT-SCREEN (FR2, FR3, FR4, FR5, NFR5) */}
        {activeNavTab === 'auditor' && (
          <div className="space-y-4">
            {userContracts.length === 0 ? (
              /* Empty state if current admin has no uploaded contracts yet */
              <div className="p-12 text-center bg-slate-900/80 border border-slate-800 rounded-2xl max-w-xl mx-auto space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800/40 text-cyan-400 mx-auto flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">No Contracts in Workspace</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    User isolation is active for <strong className="text-white">{currentUser.name}</strong> ({currentUser.organization}). You have not uploaded any agreements yet.
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ingest First Agreement</span>
                </button>
              </div>
            ) : selectedContract ? (
              <>
                {/* Document Selector & Integrity Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs">
                  <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                    <span className="text-slate-400 font-medium text-[11px] shrink-0">
                      Active Agreement:
                    </span>
                    <select
                      value={selectedContractId || ''}
                      onChange={e => {
                        const id = Number(e.target.value);
                        setSelectedContractId(id);
                        const contract = userContracts.find(c => c.id === id);
                        if (contract) setSelectedClauseId(contract.clauses[0]?.id || null);
                      }}
                      className="bg-slate-950 text-xs font-medium text-white px-3 py-1.5 rounded-lg border border-slate-700/80 focus:outline-none focus:border-slate-500 max-w-md truncate cursor-pointer"
                    >
                      {userContracts.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.risk_score} / 100 Risk)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SHA-256 Integrity Verification (Quiet unboxed style) */}
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <span className="text-slate-500">SHA-256:</span>
                    <span className="font-mono text-slate-300 truncate max-w-[160px] sm:max-w-[220px]" title={selectedContract.sha256}>
                      {selectedContract.sha256}
                    </span>
                    <button
                      onClick={handleCopySha}
                      className="p-1 rounded text-slate-400 hover:text-white transition"
                      title="Copy SHA-256 checksum"
                    >
                      {copiedSha ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Split Screen Layout (NFR5) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-210px)] min-h-[640px]">
                  {/* Left Column: Interactive Annotated PDF Viewer (FR3, NFR5) */}
                  <div className="lg:col-span-7 h-full">
                    <AnnotatedPdfViewer
                      title={selectedContract.title}
                      filename={selectedContract.filename}
                      sha256={selectedContract.sha256}
                      clauses={selectedContract.clauses}
                      riskFlags={selectedContract.risk_flags}
                      selectedClauseId={selectedClauseId}
                      onSelectClause={setSelectedClauseId}
                    />
                  </div>

                  {/* Right Column: Rule Matching & Active Remediation Panel (FR4, FR5) */}
                  <div className="lg:col-span-5 h-full">
                    <ClauseRiskPanel
                      clauses={selectedContract.clauses}
                      riskFlags={selectedContract.risk_flags}
                      riskScore={selectedContract.risk_score}
                      userRole={currentUser.role}
                      selectedClauseId={selectedClauseId}
                      onSelectClause={setSelectedClauseId}
                      onApplyRemediation={handleApplyRemediation}
                      onAskAiAboutClause={handleAskAiAboutClause}
                    />
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* VIEW: SMART CONTRACT AUDITOR (SPECIALIZING IN REENTRANCY & INTEGER OVERFLOWS) */}
        {activeNavTab === 'smart_contract' && (
          <SmartContractAuditorView />
        )}

        {/* VIEW 2: CONTRACT VERSION DIFF COMPARISON (FR6 - STRICT USER ISOLATION) */}
        {activeNavTab === 'diff' && (
          <VersionComparisonView
            contracts={userContracts}
            comparisons={userComparisons}
          />
        )}

        {/* VIEW 3: PORTFOLIO RISK ANALYTICS WITH RECHARTS 30-DAY TREND (FR8) */}
        {activeNavTab === 'analytics' && (
          <PortfolioAnalyticsView
            contracts={userContracts}
            currentUserOrg={currentUser.organization}
            userName={currentUser.name}
            onSelectContract={(contract) => {
              setSelectedContractId(contract.id);
              setSelectedClauseId(contract.clauses[0]?.id || null);
              setActiveNavTab('auditor');
            }}
          />
        )}

        {/* VIEW 4: COMPLIANCE PLAYBOOK RULES (FR7) */}
        {activeNavTab === 'playbooks' && (
          <PlaybookManager
            playbooks={playbooks}
            rules={playbookRules}
            userRole={currentUser.role}
            onUpdateRule={handleUpdateRule}
            onAddRule={handleAddRule}
          />
        )}

        {/* VIEW 5: USER MANAGEMENT & RBAC (FR1) */}
        {activeNavTab === 'users' && (
          <UserManager
            users={users}
            currentUser={currentUser}
            onSwitchUser={handleSwitchUser}
            onUpdateUserRole={handleUpdateUserRole}
          />
        )}
      </main>

      {/* Floating AI Legal Advisor Trigger Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-xs border border-slate-700/80 shadow-xl transition-all active:scale-95"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <Bot className="w-4 h-4 text-cyan-400" />
          <span>Ask Legal Advisor</span>
          <span className="text-slate-600">·</span>
          <Mic className="w-3.5 h-3.5 text-slate-400" />
        </button>
      )}

      {/* Chatbot & Voice Assistant Modal/Drawer */}
      <ContractChatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        activeContract={selectedContract || undefined}
      />

      {/* Upload & Ingestion Modal (FR2) */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        activeRules={playbookRules}
        onUploadSuccess={handleUploadSuccess}
        uploaderName={currentUser.name}
        ownerId={currentUser.id}
      />
    </div>
  );
}

export default App;
