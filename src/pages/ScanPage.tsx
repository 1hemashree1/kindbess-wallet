import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, Camera, Shield, Zap, X, Search, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [flash, setFlash] = useState(false);

  return (
    <div className="h-full flex flex-col space-y-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">QR Scanner</h1>
        <p className="kcx-label mt-1">Institutional Payment Protocol</p>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center">
        {/* Scanner Viewfinder */}
        <div className="relative w-64 h-64 rounded-[48px] overflow-hidden bg-slate-950 shadow-2xl border-[6px] border-white ring-1 ring-slate-200">
          {/* Animated Scan Line */}
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-0.5 bg-indigo-400 shadow-[0_0_20px_rgba(129,140,248,1)] z-10"
          ></motion.div>
          
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <QrCode className="w-24 h-24 text-white" />
          </div>

          {/* Grain & Pinstripe Overlay to match design mood */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-10 pointer-events-none"></div>
          
          {/* Edge Markers */}
          <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-white/30 rounded-tl-lg"></div>
          <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-white/30 rounded-tr-lg"></div>
          <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-white/30 rounded-bl-lg"></div>
          <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-white/30 rounded-br-lg"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button 
            onClick={() => setFlash(!flash)}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90 border",
              flash ? "bg-amber-400 text-white border-amber-300" : "bg-white text-slate-400 border-slate-100"
            )}
          >
            <Zap className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-lg active:scale-90">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-indigo-950 text-white p-4 rounded-3xl flex items-start gap-4 shadow-xl border border-white/5">
          <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-indigo-300" />
          </div>
          <div className="flex-1">
            <h4 className="text-[10px] font-black text-indigo-300 leading-none mb-1.5 uppercase tracking-widest">Trust Protocol v2</h4>
            <p className="text-[9px] text-indigo-100/60 font-medium leading-relaxed font-mono">Your biometric and cryptographic keys are isolated in the Secure Enclave. Pay with absolute confidence.</p>
          </div>
        </div>

        <button 
          onClick={() => {
            alert('Simulation: Scanned "@kcx-admin"... Redirecting.');
          }}
          className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-slate-200 active:scale-95 transition-all text-[11px] uppercase tracking-[0.2em]"
        >
          <Camera className="w-4 h-4" />
          Engage Scanner
        </button>
      </div>
    </div>
  );
}
