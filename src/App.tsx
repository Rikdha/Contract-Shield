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
import { SidebarNav, AppNavTab } from './components/SidebarNav';
import { Header } from './components/Header';
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
import { FaultIsolationBoundary } from './components/FaultIsolationBoundary';
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('contractshield_auth') === 'true';
  });
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = sessionStorage.getItem('contractshield_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const matched = INITIAL_USERS.find(u => u.id === parsed.id || u.email === parsed.email);
        if (matched) return matched;
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_USERS[0]; // Admin by default
  });

  // Navigation State
  const [activeNavTab, setActiveNavTab] = useState<AppNavTab>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

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

  // USER ISOLATION FILTER:
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

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [copiedSha, setCopiedSha] = useState<boolean>(false);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const selectedContract = userContracts.find(c => c.id === selectedContractId) || userContracts[0] || null;

  // Authentication Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    sessionStorage.setItem('contractshield_auth', 'true');
    sessionStorage.setItem('contractshield_user', JSON.stringify(user));
    setActiveNavTab('dashboard');
  };

  const handleRegister = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    sessionStorage.setItem('contractshield_auth', 'true');
    sessionStorage.setItem('contractshield_user', JSON.stringify(newUser));
    setActiveNavTab('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('contractshield_auth');
    sessionStorage.removeItem('contractshield_user');
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

  // Rule management
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

  // Active Remediation
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

  // Document Ingestion with owner_id assignment
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
    <div 
      className="min-h-screen bg-[#f6f4ef] text-stone-900 flex selection:bg-amber-200 selection:text-stone-900"
      style={{ fontFamily: "'Times New Roman', Times, 'Newsreader', Georgia, serif" }}
    >
      {/* SECTION NAVIGATION: LEFT SIDEBAR */}
      <SidebarNav
        activeTab={activeNavTab}
        setActiveTab={setActiveNavTab}
        currentUser={currentUser}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onLogout={handleLogout}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Backdrop for mobile drawer */}
      {isMobileNavOpen && (
        <div 
          onClick={() => setIsMobileNavOpen(false)} 
          className="fixed inset-0 bg-stone-950/40 z-30 lg:hidden backdrop-blur-xs" 
        />
      )}

      {/* MAIN CONTENT VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Contextual Top Header */}
        <Header
          activeTab={activeNavTab}
          currentUser={currentUser}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenChat={() => setIsChatOpen(true)}
          onToggleMobileNav={() => setIsMobileNavOpen(prev => !prev)}
          contractCount={userContracts.length}
        />

        {/* Main Section Content Area with Generous Spacing */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-8">
          {/* VIEW 0: EXECUTIVE OPERATIONS & WORKFLOW OVERVIEW */}
          {activeNavTab === 'dashboard' && (
            <FaultIsolationBoundary sectionTitle="Dashboard Overview" sectionCode="P-01">
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
            </FaultIsolationBoundary>
          )}

          {/* VIEW 1: LEGAL CONTRACT AUDITOR */}
          {activeNavTab === 'auditor' && (
            <FaultIsolationBoundary sectionTitle="Legal Auditor" sectionCode="P-02">
              <div className="space-y-6">
                {userContracts.length === 0 ? (
                  <div className="p-12 text-center bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg max-w-lg mx-auto space-y-4 shadow-xs">
                    <div className="w-12 h-12 rounded bg-[#eeebe3] text-stone-800 mx-auto flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-900">No Contracts in Workspace</h3>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        Tenant isolation is active for <strong className="text-stone-900">{currentUser.name}</strong> ({currentUser.organization}). You have not uploaded any agreements yet.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsUploadOpen(true)}
                      className="inline-flex items-center space-x-2 px-4 py-2.5 rounded bg-stone-900 hover:bg-stone-800 text-[#f6f4ef] font-bold text-xs transition shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ingest First Agreement</span>
                    </button>
                  </div>
                ) : selectedContract ? (
                  <>
                    {/* Document Selector & Integrity Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-[#fbfaf7] border border-[#dfd9cd] text-xs shadow-xs">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <span className="text-stone-600 font-bold shrink-0">
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
                          className="bg-[#eeebe3] text-xs font-bold text-stone-900 px-3 py-1.5 rounded border border-[#d6cfbf] focus:outline-hidden max-w-md truncate cursor-pointer"
                        >
                          {userContracts.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.title} ({c.risk_score} / 100 Risk)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* SHA-256 Integrity Verification */}
                      <div className="flex items-center space-x-2.5 text-xs text-stone-600">
                        <span className="font-bold">SHA-256:</span>
                        <span className="font-mono text-stone-900 truncate max-w-[160px] sm:max-w-[240px] bg-[#f0ecdf] px-2 py-0.5 rounded border border-[#e2ddd1]" title={selectedContract.sha256}>
                          {selectedContract.sha256}
                        </span>
                        <button
                          onClick={handleCopySha}
                          className="p-1 rounded text-stone-600 hover:text-stone-900 transition hover:bg-[#e8e3d6]"
                          title="Copy SHA-256 checksum"
                        >
                          {copiedSha ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Split Screen Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-210px)] min-h-[640px]">
                      {/* Left Column: Interactive Annotated PDF / Document Viewer */}
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

                      {/* Right Column: Rule Matching & Remediation Panel */}
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
            </FaultIsolationBoundary>
          )}

          {/* VIEW 2: SMART CONTRACT AUDITOR STUDIO */}
          {activeNavTab === 'smart_contract' && (
            <FaultIsolationBoundary sectionTitle="Smart Contract Auditor" sectionCode="P-03">
              <SmartContractAuditorView />
            </FaultIsolationBoundary>
          )}

          {/* VIEW 3: CONTRACT VERSION DIFF COMPARISON */}
          {activeNavTab === 'diff' && (
            <FaultIsolationBoundary sectionTitle="Version Diff Comparison" sectionCode="P-04">
              <VersionComparisonView
                contracts={userContracts}
                comparisons={userComparisons}
              />
            </FaultIsolationBoundary>
          )}

          {/* VIEW 4: PORTFOLIO RISK ANALYTICS */}
          {activeNavTab === 'analytics' && (
            <FaultIsolationBoundary sectionTitle="Portfolio Analytics" sectionCode="P-05">
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
            </FaultIsolationBoundary>
          )}

          {/* VIEW 5: COMPLIANCE PLAYBOOK RULES */}
          {activeNavTab === 'playbooks' && (
            <FaultIsolationBoundary sectionTitle="Playbook Manager" sectionCode="P-06">
              <PlaybookManager
                playbooks={playbooks}
                rules={playbookRules}
                userRole={currentUser.role}
                onUpdateRule={handleUpdateRule}
                onAddRule={handleAddRule}
              />
            </FaultIsolationBoundary>
          )}

          {/* VIEW 6: USER MANAGEMENT & RBAC */}
          {activeNavTab === 'users' && (
            <FaultIsolationBoundary sectionTitle="User Manager" sectionCode="P-07">
              <UserManager
                users={users}
                currentUser={currentUser}
                onSwitchUser={handleSwitchUser}
                onUpdateUserRole={handleUpdateUserRole}
              />
            </FaultIsolationBoundary>
          )}
        </main>
      </div>

      {/* Floating AI Legal Advisor Trigger Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center space-x-2.5 px-4 py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-[#f6f4ef] font-bold text-xs shadow-lg transition-all active:scale-95 border border-stone-700"
        >
          <Bot className="w-4 h-4" />
          <span>Ask Legal Advisor</span>
          <span className="text-stone-400">·</span>
          <Mic className="w-3.5 h-3.5 text-stone-300" />
        </button>
      )}

      {/* Chatbot & Voice Assistant Modal/Drawer */}
      <ContractChatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        activeContract={selectedContract || undefined}
      />

      {/* Upload & Ingestion Modal */}
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
