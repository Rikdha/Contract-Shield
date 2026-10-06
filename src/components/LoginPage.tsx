import React, { useState } from 'react';
import { User, UserRole } from '../types/contract';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  KeyRound, 
  UserCheck, 
  AlertCircle,
  Eye,
  EyeOff,
  User as UserIcon,
  ShieldCheck,
  Search,
  Zap,
  Info,
  Scale
} from 'lucide-react';

interface LoginPageProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  users,
  onLogin,
  onRegister,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<'admin' | 'analyst' | 'user'>('admin');
  const [email, setEmail] = useState('admin@contractshield.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registration fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('password123');
  const [regOrg, setRegOrg] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Admin');

  // Defined 3 core preset accounts
  const rolePresets = [
    {
      key: 'admin' as const,
      role: 'Admin' as UserRole,
      title: 'Administrator',
      email: 'admin@contractshield.io',
      defaultPass: 'password123',
      badgeClass: 'bg-slate-800 text-slate-200 border-slate-700',
      iconBg: 'bg-slate-800 text-slate-200 border-slate-700',
      buttonClass: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700',
      icon: Shield,
      summary: 'Administrative governance, compliance playbooks, team isolation, and full security auditor privileges.',
    },
    {
      key: 'analyst' as const,
      role: 'Analyst' as UserRole,
      title: 'Security Analyst',
      email: 'analyst@contractshield.io',
      defaultPass: 'password123',
      badgeClass: 'bg-sky-950/60 text-sky-300 border-sky-800/60',
      iconBg: 'bg-sky-950/60 text-sky-300 border-sky-800/60',
      buttonClass: 'bg-sky-900/60 hover:bg-sky-800 text-sky-100 border border-sky-700/60',
      icon: Search,
      summary: 'AST static inspection, exploit simulation, clause-level risk mitigation, and formal audit synthesis.',
    },
    {
      key: 'user' as const,
      role: 'User' as UserRole,
      title: 'Corporate Member',
      email: 'user@contractshield.io',
      defaultPass: 'password123',
      badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
      iconBg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
      buttonClass: 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60',
      icon: UserIcon,
      summary: 'Dedicated workspace portal to inspect agreement scores, view redline diffs, and review diagnostics.',
    },
  ];

  const handleSelectPreset = (presetKey: 'admin' | 'analyst' | 'user') => {
    setSelectedPreset(presetKey);
    const preset = rolePresets.find(p => p.key === presetKey);
    if (preset) {
      setEmail(preset.email);
      setPassword(preset.defaultPass);
      setError(null);
    }
  };

  const handleDirectPresetLogin = (presetKey: 'admin' | 'analyst' | 'user') => {
    setError(null);
    const preset = rolePresets.find(p => p.key === presetKey);
    if (!preset) return;

    let matchedUser = users.find(u => u.email.toLowerCase() === preset.email.toLowerCase());
    if (!matchedUser) {
      matchedUser = users.find(u => u.role === preset.role);
    }
    if (!matchedUser) {
      matchedUser = {
        id: Date.now(),
        name: preset.title,
        email: preset.email,
        role: preset.role,
        password: preset.defaultPass,
        organization: 'ContractShield Institutional Workspace',
        avatar: preset.role.slice(0, 2).toUpperCase(),
      };
    }

    onLogin(matchedUser);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const inputEmail = email.trim().toLowerCase();

    let targetEmail = inputEmail;
    if (inputEmail === 'admin') targetEmail = 'admin@contractshield.io';
    if (inputEmail === 'analyst') targetEmail = 'analyst@contractshield.io';
    if (inputEmail === 'user') targetEmail = 'user@contractshield.io';

    let user = users.find(u => u.email.toLowerCase() === targetEmail);

    if (!user) {
      if (inputEmail.includes('admin')) {
        user = users.find(u => u.role === 'Admin');
      } else if (inputEmail.includes('analyst')) {
        user = users.find(u => u.role === 'Analyst');
      } else if (inputEmail.includes('user') || inputEmail.includes('view')) {
        user = users.find(u => u.role === 'User' || u.role === 'Viewer');
      }
    }

    if (!user) {
      setError(`No account found matching "${email}". Select one of the 3 preconfigured roles or create an account.`);
      return;
    }

    if (user.password && password && user.password !== password) {
      setError('Incorrect password provided. (Default test password: password123)');
      return;
    }

    onLogin(user);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('All fields are required.');
      return;
    }

    const existing = users.find(u => u.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (existing) {
      setError('An account with this email already exists.');
      return;
    }

    const newUser: User = {
      id: Date.now(),
      name: regName.trim(),
      email: regEmail.trim(),
      role: regRole,
      password: regPassword,
      organization: regOrg.trim() || 'Institutional Workspace',
      avatar: regName.trim().slice(0, 2).toUpperCase(),
    };

    onRegister(newUser);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-slate-700 selection:text-white">
      {/* Subtle formal geometric grid background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="w-full max-w-xl space-y-6 relative z-10">
        {/* Formal Institutional Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 shadow-sm mb-1">
            <Scale className="w-5 h-5 text-slate-300" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-white font-heading">
              ContractShield Enterprise
            </h1>
            <p className="text-xs text-slate-400 font-serif italic max-w-md mx-auto">
              Institutional Security Auditor & Governance Platform for Smart Contracts and Commercial Agreements
            </p>
          </div>
        </div>

        {/* 3 PRESET ROLES SELECTION CARDS (Formal, Organized, Balanced) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs px-1 text-slate-400">
            <span className="font-medium text-slate-300 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Select Preconfigured Role:</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">3 Defined Accounts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {rolePresets.map((preset) => {
              const IconComp = preset.icon;
              const isSelected = selectedPreset === preset.key;

              return (
                <div
                  key={preset.key}
                  onClick={() => handleSelectPreset(preset.key)}
                  className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                    isSelected
                      ? 'border-slate-500 bg-slate-900/90 shadow-sm ring-1 ring-slate-600'
                      : 'border-slate-800/90 bg-slate-950/70 hover:bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className={`w-7 h-7 rounded border flex items-center justify-center ${preset.iconBg}`}>
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-medium border ${preset.badgeClass}`}>
                        {preset.role}
                      </span>
                    </div>

                    <div className="font-medium text-white text-xs leading-snug mb-0.5">
                      {preset.title}
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 truncate mb-2">
                      {preset.email}
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed mb-3 line-clamp-3">
                      {preset.summary}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDirectPresetLogin(preset.key);
                    }}
                    className={`w-full py-1.5 px-2 rounded text-[11px] font-medium flex items-center justify-center space-x-1 transition ${preset.buttonClass}`}
                  >
                    <span>Login as {preset.role}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* FORM CARD */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-semibold text-slate-200 text-xs">
              {isRegistering ? 'Register Isolated Organization' : 'Authentication Gateway'}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {isRegistering ? 'New Profile' : `Active: ${rolePresets.find(p => p.key === selectedPreset)?.role}`}
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-center space-x-2 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {!isRegistering ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <label className="text-slate-300 font-medium">Corporate Email Address</label>
                  <span className="text-slate-500 font-mono text-[10px]">
                    admin | analyst | user
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@contractshield.io"
                    className="w-full bg-slate-950 pl-9 pr-3 py-2 rounded-lg border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <label className="text-slate-300 font-medium">Password</label>
                  <span className="text-slate-500 font-mono text-[10px]">
                    password123
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950 pl-9 pr-9 py-2 rounded-lg border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 text-xs font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-slate-200 hover:bg-white text-slate-900 font-semibold text-xs transition shadow-sm active:scale-[0.99]"
              >
                <span>Authorize & Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium text-[11px]">Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full bg-slate-950 px-3 py-2 rounded-lg border border-slate-700/80 text-white focus:outline-none focus:border-slate-500 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium text-[11px]">Corporate Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="name@enterprise.corp"
                  className="w-full bg-slate-950 px-3 py-2 rounded-lg border border-slate-700/80 text-white focus:outline-none focus:border-slate-500 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium text-[11px]">Organization</label>
                <input
                  type="text"
                  value={regOrg}
                  onChange={e => setRegOrg(e.target.value)}
                  placeholder="e.g. Apex Global Corp"
                  className="w-full bg-slate-950 px-3 py-2 rounded-lg border border-slate-700/80 text-white focus:outline-none focus:border-slate-500 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium text-[11px]">System Role</label>
                  <select
                    value={regRole}
                    onChange={e => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 px-3 py-2 rounded-lg border border-slate-700/80 text-white focus:outline-none focus:border-slate-500 text-xs"
                  >
                    <option value="Admin">Admin (Full Control)</option>
                    <option value="Analyst">Analyst (Auditor)</option>
                    <option value="User">User (Standard)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium text-[11px]">Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Create password"
                    className="w-full bg-slate-950 px-3 py-2 rounded-lg border border-slate-700/80 text-white focus:outline-none focus:border-slate-500 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-slate-200 hover:bg-white text-slate-900 font-semibold text-xs transition"
              >
                <span>Create Isolated Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Toggle Login / Register */}
          <div className="text-center pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            {isRegistering ? (
              <span>
                Existing credentials?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="text-slate-200 hover:underline font-medium"
                >
                  Return to Sign In
                </button>
              </span>
            ) : (
              <span>
                Need a new isolated organizational workspace?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="text-slate-200 hover:underline font-medium"
                >
                  Register Profile
                </button>
              </span>
            )}
          </div>
        </div>

        {/* DEMO CREDENTIALS QUICK REFERENCE TABLE */}
        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center space-x-1.5 text-slate-400 font-medium text-[11px]">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Preconfigured Test Accounts:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">1. Admin</span>
                <span className="text-[9px] font-mono text-slate-500">password123</span>
              </div>
              <div className="text-slate-400 font-mono text-[10px] truncate select-all">
                admin@contractshield.io
              </div>
            </div>

            <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">2. Analyst</span>
                <span className="text-[9px] font-mono text-slate-500">password123</span>
              </div>
              <div className="text-slate-400 font-mono text-[10px] truncate select-all">
                analyst@contractshield.io
              </div>
            </div>

            <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">3. User</span>
                <span className="text-[9px] font-mono text-slate-500">password123</span>
              </div>
              <div className="text-slate-400 font-mono text-[10px] truncate select-all">
                user@contractshield.io
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
