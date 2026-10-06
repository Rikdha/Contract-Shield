import React, { useState } from 'react';
import { User, UserRole } from '../types/contract';
import { Users, Shield, UserCheck, Check, Lock, ShieldAlert, Sparkles } from 'lucide-react';

interface UserManagerProps {
  users: User[];
  currentUser: User;
  onSwitchUser: (user: User) => void;
  onUpdateUserRole: (userId: number, role: UserRole) => void;
}

export const UserManager: React.FC<UserManagerProps> = ({
  users,
  currentUser,
  onSwitchUser,
  onUpdateUserRole,
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">
            Role-Based Access Control (RBAC) & User Directory
          </h2>
          <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
            FR1 Specification
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage system roles, switch active authenticated session, and inspect access capabilities.
        </p>
      </div>

      {/* Current Active User Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white font-extrabold flex items-center justify-center font-mono text-sm shadow-lg shadow-cyan-500/20">
            {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-sm">{currentUser.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Current Active Session: {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-400">{currentUser.email}</p>
          </div>
        </div>
      </div>

      {/* Role Permissions Matrix Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl text-xs space-y-3">
        <h3 className="font-bold text-white flex items-center space-x-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>RBAC Permissions & Capabilities Matrix</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800 bg-slate-950/50">
              <tr>
                <th className="p-2.5">System Function</th>
                <th className="p-2.5 text-center">Viewer</th>
                <th className="p-2.5 text-center">Analyst</th>
                <th className="p-2.5 text-center">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="p-2.5 font-medium">View Portfolio Analytics & Risk Metrics</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Inspect Flagged Clauses & Bounding Boxes</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Upload Contracts & SHA-256 Checksum</td>
                <td className="p-2.5 text-center text-slate-600 font-mono">—</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Execute Version Comparison (Diff Engine)</td>
                <td className="p-2.5 text-center text-slate-600 font-mono">—</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Apply Active Remediation (Patch Clauses)</td>
                <td className="p-2.5 text-center text-slate-600 font-mono">—</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Configure Playbook Rules & Risk Weights</td>
                <td className="p-2.5 text-center text-slate-600 font-mono">—</td>
                <td className="p-2.5 text-center text-slate-600 font-mono">—</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Manage Users & Assign System Roles</td>
                <td className="p-2.5 text-center text-slate-600 font-mono">—</td>
                <td className="p-2.5 text-center text-slate-600 font-mono">—</td>
                <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* User Accounts Directory */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-xs">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <span className="font-bold text-white text-sm">System Users & Active Role Assignment</span>
          <span className="text-slate-400 text-[11px]">Click "Switch Session" to test any role</span>
        </div>

        <div className="divide-y divide-slate-800">
          {users.map(u => {
            const isSelf = u.id === currentUser.id;

            return (
              <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 text-cyan-300 font-mono font-bold flex items-center justify-center">
                    {u.avatar || u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{u.name}</span>
                      {isSelf && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 text-[11px]">{u.email}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Role Selector (Admin can change role) */}
                  {currentUser.role === 'Admin' ? (
                    <select
                      value={u.role}
                      onChange={e => onUpdateUserRole(u.id, e.target.value as UserRole)}
                      className="bg-slate-950 text-xs text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Analyst">Analyst</option>
                      <option value="User">User</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                      {u.role}
                    </span>
                  )}

                  {!isSelf && (
                    <button
                      onClick={() => onSwitchUser(u)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white font-medium transition"
                    >
                      Switch Session
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
