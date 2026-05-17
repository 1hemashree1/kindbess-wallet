import React from 'react';
import { Home, Send, QrCode, MapPin, Briefcase, Wallet, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'pay', icon: Send, label: 'Pay' },
    { id: 'scan', icon: null, label: 'Scan' }, // Empty holder for center
    { id: 'nearby', icon: MapPin, label: 'Nearby' },
    { id: 'wallet', icon: Wallet, label: 'Wallet' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 max-w-md mx-auto shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex justify-between items-center w-full max-w-4xl mx-auto relative">
        {tabs.slice(0, 2).map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all w-12",
              activeTab === tab.id ? "text-indigo-600" : "text-slate-400 opacity-40 hover:opacity-100"
            )}
          >
            {tab.icon && <tab.icon className={cn("w-5 h-5", activeTab === tab.id && "fill-indigo-50")} />}
            <span className="text-[9px] font-black uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}

        {/* Prominent Center Scan Button */}
        <div className="flex flex-col items-center justify-center -mt-10 mx-2">
          <button 
            onClick={() => onTabChange('scan')}
            className={cn(
              "w-14 h-14 bg-indigo-600 rounded-full border-[6px] border-slate-50 flex items-center justify-center text-white shadow-xl transition-all active:scale-90",
              activeTab === 'scan' ? "shadow-indigo-300" : "shadow-indigo-100 opacity-90"
            )}
          >
            <QrCode className="w-6 h-6" />
          </button>
          <span className={cn(
            "text-[9px] font-black uppercase mt-1 tracking-widest",
            activeTab === 'scan' ? "text-indigo-600" : "text-slate-400 opacity-40"
          )}>Scan QR</span>
        </div>

        {tabs.slice(3).map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all w-12",
              activeTab === tab.id ? "text-indigo-600" : "text-slate-400 opacity-40 hover:opacity-100"
            )}
          >
            {tab.icon && <tab.icon className={cn("w-5 h-5", activeTab === tab.id && "fill-indigo-50")} />}
            <span className="text-[9px] font-black uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
