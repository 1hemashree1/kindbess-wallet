import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { motion } from 'motion/react';
import QRCode from 'react-qr-code';
import { LogOut, ShieldCheck, Share2, Copy, Settings, ChevronRight, User, Mail, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ProfilePage() {
  const { profile } = useAuth();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      window.location.href = '/';
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center pt-4">
        <div className="w-24 h-24 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-xl shadow-indigo-200">
          {profile?.fullName[0]}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{profile?.fullName}</h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-xs text-slate-500 font-medium">{profile?.kcxId}</span>
          <button onClick={() => handleCopy(profile?.kcxId || '')}>
            <Copy className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* QR Section */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-0"></div>
        <div className="relative z-10 flex flex-col items-center">
            <div className="p-4 bg-white rounded-3xl border-4 border-slate-50 shadow-inner inline-block">
              <QRCode 
                value={profile?.kcxId || ''} 
                size={180}
                fgColor="#1e1b4b"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-6">Secure Payment QR</p>
            <div className="flex gap-4 mt-6">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition-all">
                <Settings className="w-4 h-4" /> Customize
              </button>
            </div>
        </div>
      </div>

      {/* Profile Details List */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-4 space-y-4">
          <DetailItem icon={User} label="Emoven Number" value={profile?.emovenNo} />
          <DetailItem icon={Mail} label="Email Address" value={profile?.email} />
          <DetailItem icon={Globe} label="Region" value={`${profile?.city || 'Not set'}, ${profile?.state || 'Not set'}`} />
          <DetailItem icon={ShieldCheck} label="KYC Status" value={profile?.kycStatus} active />
        </div>
      </div>

      <button 
        onClick={handleSignOut}
        className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-all active:scale-95"
      >
        <LogOut className="w-5 h-5" />
        Logout Session
      </button>

      <p className="text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest py-8">
        KCX Fintech Security Protocol • End-to-End Encrypted
      </p>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value, active }: any) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1">{label}</p>
          <p className={cn("text-sm font-semibold text-slate-900 leading-none", active && "text-indigo-600")}>{value || '---'}</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
    </div>
  );
}
