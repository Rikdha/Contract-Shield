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
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      iconBg: 'bg-stone-900 text-[#f6f4ef]',
      buttonClass: 'bg-stone-900 hover:bg-stone-800 text-[#f6f4ef]',
      icon: Shield,
      summary: 'Administrative governance, compliance playbooks, team isolation, and full security auditor privileges.',
    },
    {
      key: 'analyst' as const,
      role: 'Analyst' as UserRole,
      title: 'Security Analyst',
      email: 'analyst@contractshield.io',
      defaultPass: 'password123',
      badgeClass: 'bg-[#eeebe3] text-stone-900 border-[#d6cfbf] font-bold',
      iconBg: 'bg-stone-900 text-[#f6f4ef]',
      buttonClass: 'bg-stone-900 hover:bg-stone-800 text-[#f6f4ef]',
      icon: Search,
      summary: 'AST static inspection, exploit simulation, clause-level risk mitigation, and formal audit synthesis.',
    },
    {
      key: 'user' as const,
      role: 'User' as UserRole,
      title: 'Corporate Member',
      email: 'user@contractshield.io',
      defaultPass: 'password123',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
      iconBg: 'bg-stone-900 text-[#f6f4ef]',
      buttonClass: 'bg-stone-900 hover:bg-stone-800 text-[#f6f4ef]',
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
        organization: 'Institutional Workspace',
        avatar: preset.role.slice(0, 2).toUpperCase(),
      };
    }

    onLogin(matchedUser);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      setError(`No account found registered to ${email}. You may click any preset card above to authenticate.`);
      return;
    }

    if (user.password && user.password !== password) {
      setError('Invalid credentials provided. Enter "password123" for test accounts.');
      return;
    }

    onLogin(user);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim() || !regEmail.trim()) {
      setError('Please provide your name and work email.');
      return;
    }

    const existing = users.find(u => u.email.toLowerCase() === regEmail.toLowerCase());
    if (existing) {
      setError('An account with this email already exists.');
      return;
    }

    const newUser: User = {
      id: Date.now(),
      name: regName.trim(),
      email: regEmail.trim(),
      role: regRole,
      password: regPassword || 'password123',
      organization: regOrg.trim() || 'Custom Enterprise Corp',
      avatar: regName.slice(0, 2).toUpperCase(),
    };

    onRegister(newUser);
  };

  return (
    <div 
      className="min-h-screen bg-[#f6f4ef] text-stone-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-amber-200 selection:text-stone-900"
      style={{ fontFamily: "'Times New Roman', Times, 'Newsreader', Georgia, serif" }}
    >
      <div className="max-w-2xl w-full mx-auto space-y-8">
        {/* LOGO & TITLE BANNER */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-stone-900 text-[#f6f4ef] shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">
              Contract Shield
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto leading-relaxed">
              Institutional security and vulnerability auditor for commercial agreements and Web3 smart contract invariants.
            </p>
          </div>
        </div>

        {/* 3 PRESET ROLES SELECTION CARDS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs px-1 text-stone-700">
            <span className="font-bold flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-stone-500" />
              <span>Select Preconfigured Role:</span>
            </span>
            <span className="text-[11px] text-stone-500 italic">3 Defined Accounts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {rolePresets.map((preset) => {
              const IconComp = preset.icon;
              const isSelected = selectedPreset === preset.key;

              return (
                <div
                  key={preset.key}
                  onClick={() => handleSelectPreset(preset.key)}
                  className={`p-4 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-stone-900 bg-[#fbfaf7] shadow-xs ring-1 ring-stone-900'
                      : 'border-[#dfd9cd] bg-[#fbfaf7] hover:border-[#b8b09f]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${preset.iconBg}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${preset.badgeClass}`}>
                        {preset.role}
                      </span>
                    </div>

                    <div className="font-bold text-stone-900 text-sm mb-1">
                      {preset.title}
                    </div>

                    <div className="text-xs font-mono text-stone-600 truncate mb-2">
                      {preset.email}
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed mb-4 line-clamp-3">
                      {preset.summary}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDirectPresetLogin(preset.key);
                    }}
                    className={`w-full py-2 px-3 rounded text-xs font-bold flex items-center justify-center space-x-1 transition ${preset.buttonClass}`}
                  >
                    <span>Login as {preset.role}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* FORM CARD */}
        <div className="bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg p-7 shadow-xs space-y-5 text-xs">
          <div className="flex items-center justify-between border-b border-[#ece7dd] pb-3">
            <span className="font-bold text-stone-900 text-sm">
              {isRegistering ? 'Register Organization Profile' : 'Authentication Gateway'}
            </span>
            <span className="text-xs font-bold text-stone-600 bg-[#eeebe3] px-2 py-0.5 rounded">
              {isRegistering ? 'New Profile' : `Active: ${rolePresets.find(p => p.key === selectedPreset)?.role}`}
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded bg-rose-50 border border-rose-300 text-rose-900 flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
              <span>{error}</span>
            </div>
          )}

          {!isRegistering ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-stone-800 font-bold">Email Address</label>
                  <span className="text-stone-500 italic text-[11px]">
                    admin | analyst | user
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@contractshield.io"
                    className="w-full bg-[#f5f2eb] pl-9 pr-3 py-2.5 rounded border border-[#d8d2c4] text-stone-900 placeholder-stone-500 focus:outline-hidden text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-stone-800 font-bold">Password</label>
                  <span className="text-stone-500 italic text-[11px]">
                    password123
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-[#f5f2eb] pl-9 pr-10 py-2.5 rounded border border-[#d8d2c4] text-stone-900 placeholder-stone-500 focus:outline-hidden text-xs font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-500 hover:text-stone-900"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded bg-stone-900 hover:bg-stone-800 text-[#f6f4ef] font-bold text-xs transition shadow-xs"
              >
                <span>Authorize & Enter Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-stone-800 font-bold">Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full bg-[#f5f2eb] px-3 py-2.5 rounded border border-[#d8d2c4] text-stone-900 focus:outline-hidden text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-800 font-bold">Corporate Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="name@enterprise.corp"
                  className="w-full bg-[#f5f2eb] px-3 py-2.5 rounded border border-[#d8d2c4] text-stone-900 focus:outline-hidden text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-800 font-bold">Organization</label>
                <input
                  type="text"
                  value={regOrg}
                  onChange={e => setRegOrg(e.target.value)}
                  placeholder="e.g. Apex Global Corp"
                  className="w-full bg-[#f5f2eb] px-3 py-2.5 rounded border border-[#d8d2c4] text-stone-900 focus:outline-hidden text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-stone-800 font-bold">System Role</label>
                  <select
                    value={regRole}
                    onChange={e => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-[#f5f2eb] px-3 py-2.5 rounded border border-[#d8d2c4] text-stone-900 focus:outline-hidden text-xs font-bold"
                  >
                    <option value="Admin">Admin (Full Control)</option>
                    <option value="Analyst">Analyst (Auditor)</option>
                    <option value="User">User (Standard)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-800 font-bold">Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Create password"
                    className="w-full bg-[#f5f2eb] px-3 py-2.5 rounded border border-[#d8d2c4] text-stone-900 focus:outline-hidden text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded bg-stone-900 hover:bg-stone-800 text-[#f6f4ef] font-bold text-xs transition shadow-xs"
              >
                <span>Create Isolated Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Toggle Login / Register */}
          <div className="text-center pt-3 border-t border-[#ece7dd] text-xs text-stone-600">
            {isRegistering ? (
              <span>
                Existing credentials?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="text-stone-900 hover:underline font-bold"
                >
                  Return to Sign In
                </button>
              </span>
            ) : (
              <span>
                Need a new organizational workspace?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="text-stone-900 hover:underline font-bold"
                >
                  Register Profile
                </button>
              </span>
            )}
          </div>
        </div>

        {/* DEMO CREDENTIALS QUICK REFERENCE TABLE */}
        <div className="p-4 rounded-lg bg-[#eeebe3] border border-[#dfd9cd] text-xs space-y-2">
          <div className="flex items-center space-x-2 text-stone-800 font-bold">
            <Info className="w-4 h-4 text-stone-600" />
            <span>Preconfigured Test Accounts:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded bg-[#fbfaf7] border border-[#dfd9cd] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">1. Admin</span>
                <span className="text-[11px] font-mono text-stone-500">password123</span>
              </div>
              <div className="text-stone-700 font-mono text-xs truncate select-all">
                admin@contractshield.io
              </div>
            </div>

            <div className="p-3 rounded bg-[#fbfaf7] border border-[#dfd9cd] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">2. Analyst</span>
                <span className="text-[11px] font-mono text-stone-500">password123</span>
              </div>
              <div className="text-stone-700 font-mono text-xs truncate select-all">
                analyst@contractshield.io
              </div>
            </div>

            <div className="p-3 rounded bg-[#fbfaf7] border border-[#dfd9cd] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">3. User</span>
                <span className="text-[11px] font-mono text-stone-500">password123</span>
              </div>
              <div className="text-stone-700 font-mono text-xs truncate select-all">
                user@contractshield.io
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
