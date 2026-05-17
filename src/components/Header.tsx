import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, ShieldCheck } from 'lucide-react';

export default function Header() {
  const { profile } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 text-white font-black text-xl w-10 h-10 flex items-center justify-center rounded-xl shadow-lg shadow-indigo-100">KCX</div>
        <div>
          <h1 className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Kindness Credits Xchange</h1>
          <div className="flex items-center gap-1.5 leading-none">
            {profile?.kycStatus === 'VERIFIED' ? (
              <span className="bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Verified</span>
            ) : (
              <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Pending</span>
            )}
            <span className="text-[10px] font-mono text-slate-300 italic tracking-tighter">v1.0.4-stable</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs font-bold text-slate-900 leading-none mb-0.5">{profile?.fullName}</p>
          <p className="text-[10px] text-slate-500 font-mono leading-none">{profile?.kcxId.split('@')[0]} • {profile?.emovenNo}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 border border-indigo-100 overflow-hidden ring-2 ring-white">
          {profile?.profilePhoto ? (
            <img src={profile.profilePhoto} alt={profile.fullName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">{profile?.fullName[0]}</div>
          )}
        </div>
      </div>
    </header>
  );
}
