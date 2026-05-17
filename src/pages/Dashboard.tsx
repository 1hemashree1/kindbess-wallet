import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Scan, Send, ArrowDownLeft, Plus, Grid, ChevronRight, Store, Star, LayoutGrid, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { profile } = useAuth();

  const quickActions = [
    { id: 'pay', icon: Send, label: 'Pay KC', sub: '↑' },
    { id: 'request', icon: ArrowDownLeft, label: 'Request KC', sub: '↓' },
  ];

  return (
    <div className="space-y-6">
      {/* Wallet Card */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="kcx-gradient-card p-6"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Available Credits</p>
        <h2 className="text-4xl font-light mb-8 flex items-baseline gap-2">
          <span className="text-2xl font-bold opacity-50 tracking-tighter">KC</span> 
          {profile?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <button 
              key={action.id}
              onClick={() => onNavigate(action.id === 'pay' ? 'pay' : 'home')}
              className="bg-white/10 hover:bg-white/20 transition-all py-3 rounded-xl flex flex-col items-center gap-0.5 border border-white/10 active:scale-95"
            >
              <span className="text-[9px] uppercase font-black text-indigo-200 tracking-wider">{action.label}</span>
              <span className="text-lg font-bold leading-none">{action.sub}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-indigo-300 uppercase tracking-tight">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span>NFC READY</span>
          </div>
          <span>OFFLINE TOKEN: 4/5</span>
        </div>
      </motion.div>

      {/* QR Standee Card Mini */}
      <div className="kcx-card p-4 flex items-center gap-4 bg-white">
        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 shrink-0">
          <div className="w-16 h-16 bg-slate-200 grid grid-cols-4 grid-rows-4 gap-0.5 p-0.5 rounded opacity-40">
             {[...Array(16)].map((_, i) => (
               <div key={i} className={cn("rounded-sm", (i % 3 === 0 || i % 7 === 0) ? "bg-slate-900" : "bg-transparent")}></div>
             ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">My QR ID</h3>
          <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">Accept KC payments instantly at your stall or business.</p>
          <button onClick={() => onNavigate('profile')} className="text-[10px] font-black tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">View Code</button>
        </div>
      </div>

      {/* Grid: Directory & KCCC */}
      <div className="space-y-6">
        {/* KCCC Module */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-[32px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-indigo-900 tracking-tight flex items-center gap-2 text-sm uppercase">
              🤝 Community Jobs
            </h3>
            <span className="text-[9px] bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full font-black uppercase">12 Nearby</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-indigo-200 shadow-sm relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Briefcase className="w-12 h-12 text-indigo-600" />
            </div>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Ironing Service</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Batch of 5 shirts ready.</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-indigo-600 underline decoration-indigo-200 underline-offset-2">50.00 KC</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Expires 2h</p>
              </div>
            </div>
            <button onClick={() => onNavigate('kccc')} className="w-full bg-indigo-600 text-white text-[10px] font-black py-2.5 rounded-xl uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all">
              Accept Opportunity
            </button>
          </div>
        </div>

        {/* Directory Section */}
        <div className="space-y-4 px-2">
          <div className="flex justify-between items-center">
            <h3 className="kcx-label italic">Merchant Directory</h3>
            <button onClick={() => onNavigate('nearby')} className="text-[10px] font-bold text-indigo-600 uppercase underline">Explore</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'The Chai Hub', cat: 'Tea Stall', dist: '200m', rat: 4.8, status: 'OPEN' },
              { name: 'City Garage', cat: 'Automotive', dist: '1.2km', rat: 4.5, status: 'CLOSED' }
            ].map((shop, i) => (
              <div key={i} className="kcx-card p-3 flex flex-col bg-white border-slate-100">
                <div className="w-full h-20 bg-slate-100 rounded-xl mb-3 flex items-center justify-center">
                  <Store className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-xs font-bold text-slate-900 truncate mb-0.5">{shop.name}</p>
                <p className="text-[9px] text-slate-500 font-medium">{shop.cat} • {shop.dist}</p>
                <div className="mt-4 flex justify-between items-center border-t border-slate-50 pt-2">
                  <span className={cn(
                    "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
                    shop.status === 'OPEN' ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-400"
                  )}>{shop.status}</span>
                  <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5 leading-none">
                    <Star className="w-2.5 h-2.5 fill-amber-500" /> {shop.rat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Network Stats Card */}
      <div className="kcx-card p-5 bg-white border-slate-100 shadow-sm">
        <h3 className="kcx-label mb-4 tracking-[0.2em] opacity-60">Network Health</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-[10px] font-bold mb-1.5">
              <span className="text-slate-400 uppercase tracking-tight">Total Active Users</span>
              <span className="text-slate-900">128,401</span>
            </div>
            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                className="h-full bg-indigo-600 rounded-full"
              ></motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Status */}
      <div className="bg-slate-900 text-white p-4 rounded-[28px] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <p className="text-[9px] font-black text-slate-500 mb-2 uppercase tracking-widest">Protocol Status</p>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">Encrypted & Bound to Device</span>
        </div>
        <button className="w-full bg-white/5 hover:bg-white/10 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">System Logs</button>
      </div>
    </div>
  );
}
