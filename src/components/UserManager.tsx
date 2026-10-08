import React, { useState } from 'react';
import { User, UserRole } from '../types/contract';
import { Users, Shield, UserCheck, Check, Lock, ShieldAlert, Sparkles, Building2 } from 'lucide-react';
import { FaultIsolationBoundary } from './FaultIsolationBoundary';

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
    <div className="space-y-8 max-w-4xl mx-auto" style={{ fontFamily: "'Times New Roman', Times, 'Newsreader', Georgia, serif" }}>
      {/* SECTION 7.1: TOP HEADER & ACTIVE SESSION */}
      <FaultIsolationBoundary sectionTitle="RBAC Header" sectionCode="SEC-USR1">
        <div className="pb-3 border-b border-[#dfd9cd]">
          <div className="flex items-center space-x-2.5">
            <Users className="w-5 h-5 text-stone-900" />
            <h3 className="text-xl font-bold text-stone-900">
              Role-Based Access Control (RBAC) & Team Directory
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300">
              Tenant Isolated
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Manage system roles, switch active tenant workspace session, and inspect institutional privileges.
          </p>
        </div>

        {/* Current Active User Banner */}
        <div className="p-5 rounded-lg bg-[#fbfaf7] border border-[#dfd9cd] shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded bg-stone-900 text-[#f6f4ef] font-bold flex items-center justify-center text-sm">
              {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="font-bold text-stone-900 text-base">{currentUser.name}</span>
                <span className="text-xs px-2.5 py-0.5 rounded font-bold bg-[#eeebe3] text-stone-800 border border-[#d6cfbf]">
                  Active Session: {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">{currentUser.email} · {currentUser.organization}</p>
            </div>
          </div>
        </div>
      </FaultIsolationBoundary>

      {/* SECTION 7.2: ROLE PERMISSIONS MATRIX */}
      <FaultIsolationBoundary sectionTitle="Permissions Matrix" sectionCode="SEC-USR2">
        <div className="bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg p-6 shadow-xs text-xs space-y-4">
          <h4 className="font-bold text-stone-900 flex items-center space-x-2 text-sm uppercase tracking-wide">
            <Shield className="w-4 h-4 text-stone-700" />
            <span>RBAC Permissions & Capabilities Matrix</span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs font-bold uppercase text-stone-700 border-b border-[#dfd9cd] bg-[#f5f2eb]">
                <tr>
                  <th className="p-3">System Capability</th>
                  <th className="p-3 text-center">Viewer</th>
                  <th className="p-3 text-center">Analyst</th>
                  <th className="p-3 text-center">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece7dd] text-stone-800">
                <tr>
                  <td className="p-3 font-semibold">View Portfolio Analytics & Risk Metrics</td>
                  <td className="p-3 text-center text-emerald-800 font-bold">✓</td>
                  <td className="p-3 text-center text-emerald-800 font-bold">✓</td>
                  <td className="p-3 text-center text-emerald-800 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Inspect Flagged Clauses & Bounding Boxes</td>
                  <td className="p-3 text-center text-emerald-800 font-bold">✓</td>
                  <td className="p-3 text-center text-emerald-800 font-bold">✓</td>
                  <td className="p-3 text-center text-emerald-800 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Upload Contracts & Cryptographic SHA-256</td>
                  <td className="p-3 text-center text-stone-400">—</td>
                  <td className="p-3 text-center text-emerald-800 font-bold">✓</td>
                  <td className="p-3 text-center text-emerald-800 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Execute Version Comparison (Diff Engine)</td>
                  <td className="p-3 text-center text-stone-400">—</td>
                  <td className="p-3 text-center text-emerald-800 font-bold">✓</td>
                  <td className="p-3 text-center text-emerald-800 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Apply Active Remediation (Patch Clauses)</td>
                  <td className="p-3 text-center text-stone-400">—</td>
                  <td className="p-3 text-center text-emerald-800 font-bold">✓</td>
                  <td className="p-3 text-center text-emerald-800 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Configure Playbook Rules & Risk Weights</td>
                  <td className="p-3 text-center text-stone-400">—</td>
                  <td className="p-3 text-center text-stone-400">—</td>
                  <td className="p-3 text-center text-emerald-800 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Manage Users & Assign System Roles</td>
                  <td className="p-3 text-center text-stone-400">—</td>
                  <td className="p-3 text-center text-stone-400">—</td>
                  <td className="p-3 text-center text-emerald-800 font-bold">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </FaultIsolationBoundary>

      {/* SECTION 7.3: USER DIRECTORY */}
      <FaultIsolationBoundary sectionTitle="User Directory" sectionCode="SEC-USR3">
        <div className="bg-[#fbfaf7] border border-[#dfd9cd] rounded-lg overflow-hidden shadow-xs text-xs">
          <div className="p-4 bg-[#f5f2eb] border-b border-[#dfd9cd] flex items-center justify-between">
            <span className="font-bold text-stone-900 text-sm uppercase tracking-wide">Workspace Users Directory</span>
            <span className="text-stone-600 text-xs italic">Click "Switch Session" to test isolated user workspace</span>
          </div>

          <div className="divide-y divide-[#ece7dd]">
            {users.map(u => {
              const isSelf = u.id === currentUser.id;

              return (
                <div key={u.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#f5f2eb] transition">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-9 h-9 rounded bg-[#eeebe3] text-stone-800 font-bold flex items-center justify-center border border-[#d6cfbf]">
                      {u.avatar || u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2.5">
                        <span className="font-bold text-stone-900 text-sm">{u.name}</span>
                        {isSelf && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                            ACTIVE CURRENT
                          </span>
                        )}
                      </div>
                      <span className="text-stone-600 text-xs">{u.email} · {u.organization}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Role Selector */}
                    {currentUser.role === 'Admin' ? (
                      <select
                        value={u.role}
                        onChange={e => onUpdateUserRole(u.id, e.target.value as UserRole)}
                        className="bg-[#eeebe3] text-xs font-bold text-stone-900 px-3 py-1.5 rounded border border-[#d6cfbf] focus:outline-hidden"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Analyst">Analyst</option>
                        <option value="User">User</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    ) : (
                      <span className="px-3 py-1 rounded bg-[#eeebe3] text-stone-800 font-bold text-xs border border-[#d6cfbf]">
                        {u.role}
                      </span>
                    )}

                    {!isSelf && (
                      <button
                        onClick={() => onSwitchUser(u)}
                        className="px-3.5 py-1.5 rounded bg-[#fbfaf7] hover:bg-stone-900 hover:text-[#f6f4ef] border border-[#dfd9cd] text-stone-800 font-bold transition"
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
      </FaultIsolationBoundary>
    </div>
  );
};
