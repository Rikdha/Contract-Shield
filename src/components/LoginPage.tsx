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
  EyeOff
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
  const [email, setEmail] = useState('sarkarrikdha@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registration fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOrg, setRegOrg] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Admin');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      setError('No account found with this email address.');
      return;
    }

    if (user.password && user.password !== password) {
      setError('Incorrect password provided.');
      return;
    }

    onLogin(user);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('All registration fields are required.');
      return;
    }

    const existing = users.find(u => u.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (existing) {
      setError('An account with this email address already exists.');
      return;
    }

    const newUser: User = {
      id: Date.now(),
      name: regName.trim(),
      email: regEmail.trim(),
      role: regRole,
      password: regPassword,
      organization: regOrg.trim() || 'Independent Organization',
      avatar: regName.trim().slice(0, 2).toUpperCase(),
    };

    onRegister(newUser);
  };

  const handleQuickLogin = (user: User) => {
    setEmail(user.email);
    setPassword(user.password || 'password123');
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Background radial accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-xl shadow-cyan-500/20 ring-1 ring-cyan-400/30 mb-1">
            <Shield className="w-6 h-6 text-cyan-200" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            ContractShield Enterprise
          </h1>
          <p className="text-xs text-slate-400">
            Corporate Contract Compliance and Risk Auditor
          </p>
        </div>

        {/* User Isolation Architecture Notice */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold font-mono text-[10px] uppercase tracking-wider">
            <Lock className="w-3 h-3" />
            <span>Multi-Tenant User Isolation Enforced</span>
          </div>
          <p className="leading-relaxed">
            Contracts, audit logs, and analytical profiles are strictly compartmentalized. Administrators and analysts cannot view another administrator's documents.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 flex items-center space-x-2 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {!isRegistering ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block text-[11px]">
                  Corporate Email:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-950 pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <label className="text-slate-300 font-semibold">Password:</label>
                  <span className="text-cyan-400 hover:text-cyan-300 cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full bg-slate-950 pl-9 pr-9 py-2.5 rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold transition shadow-lg shadow-cyan-500/25 active:scale-98"
              >
                <span>Sign In to ContractShield</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block text-[11px]">Full Name:</label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g. Rachel Sterling"
                  className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block text-[11px]">Corporate Email:</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="name@enterprise.com"
                  className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block text-[11px]">Organization:</label>
                <input
                  type="text"
                  value={regOrg}
                  onChange={e => setRegOrg(e.target.value)}
                  placeholder="e.g. Apex Global Corp"
                  className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block text-[11px]">System Role:</label>
                  <select
                    value={regRole}
                    onChange={e => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Analyst">Analyst</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block text-[11px]">Password:</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Create password"
                    className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-lg shadow-cyan-500/25"
              >
                <span>Create Isolated Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Toggle Login / Register */}
          <div className="text-center pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            {isRegistering ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                New organization?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Create Account
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Quick Demo Switcher - To Test User Isolation in 1-Click */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Test User Isolation (1-Click Switch):</span>
            <span className="text-cyan-400">Strict Data Boundary</span>
          </div>

          <div className="space-y-1.5">
            {users.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 transition text-left group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-800 text-cyan-300 font-mono font-bold text-[10px] flex items-center justify-center">
                    {u.avatar || u.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200 text-[11px] group-hover:text-white">
                      {u.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {u.organization || 'Corporate Workspace'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded font-bold border ${
                    u.role === 'Admin'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : u.role === 'Analyst'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {u.role}
                  </span>
                  <span className="text-cyan-400 font-mono text-[10px] hidden sm:inline">
                    Login
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
