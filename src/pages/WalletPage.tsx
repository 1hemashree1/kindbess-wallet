import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Filter, 
  Wallet, 
  Loader2, 
  Clock 
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { cn } from '../lib/utils';

export default function WalletPage() {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    // Fetch transactions
    const q1 = query(
      collection(db, 'transactions'),
      where('fromId', '==', profile.uid),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const q2 = query(
      collection(db, 'transactions'),
      where('toId', '==', profile.uid),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsub1 = onSnapshot(q1, (snap) => {
      const txs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(prev => {
        const combined = [...txs, ...prev];
        return combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
                       .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      });
      setLoading(false);
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      const txs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(prev => {
        const combined = [...txs, ...prev];
        return combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
                       .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      });
      setLoading(false);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [profile]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Wallet Ledger</h1>
        <p className="kcx-label mt-1">Transaction History</p>
      </div>

      {/* High Density Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="kcx-card p-4 bg-white">
          <p className="kcx-label mb-1">Total Inflow</p>
          <p className="text-lg font-black text-emerald-600 tracking-tight">+{transactions.filter(t => t.toId === profile?.uid).reduce((acc, t) => acc + t.amount, 0).toLocaleString()}</p>
        </div>
        <div className="kcx-card p-4 bg-white">
          <p className="kcx-label mb-1">Total Outflow</p>
          <p className="text-lg font-black text-slate-900 tracking-tight">-{transactions.filter(t => t.fromId === profile?.uid).reduce((acc, t) => acc + t.amount, 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="kcx-card">
        <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recent Activity</h3>
          <Filter className="w-4 h-4 text-slate-400" />
        </div>
        
        <div className="divide-y divide-slate-50">
          {loading ? (
             <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>
          ) : transactions.length > 0 ? (
            transactions.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} currentUid={profile?.uid} />
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <History className="w-6 h-6 text-slate-200" />
              </div>
              <p className="text-xs text-slate-400 font-medium italic">No transactions found.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-4 rounded-[28px] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-amber-400 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-amber-200/50 flex-shrink-0">🎁</div>
           <div className="min-w-0">
             <p className="text-xs font-bold text-amber-900 leading-none mb-1">Refer a Merchant</p>
             <p className="text-[10px] text-amber-800/60 font-mono truncate">{profile?.kcxId}</p>
           </div>
        </div>
        <button className="text-[10px] font-black text-amber-900 uppercase underline decoration-amber-300 underline-offset-4 flex-shrink-0">Get KC</button>
      </div>
    </div>
  );
}

function TransactionItem({ transaction, currentUid }: { transaction: Transaction, currentUid?: string, key?: any }) {
  const isSender = transaction.fromId === currentUid;
  const isAdd = transaction.type === TransactionType.ADD;
  
  return (
    <div className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group active:bg-slate-100">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
          isAdd ? "bg-indigo-50 text-indigo-600" : isSender ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-600"
        )}>
          {isAdd ? 'A' : isSender ? '↑' : '↓'}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900 leading-none mb-1.5 truncate max-w-[120px] md:max-w-none">
            {transaction.note || (isAdd ? 'Wallet Topup' : isSender ? `To ${transaction.toId.split('@')[0]}` : `From ${transaction.fromId.split('@')[0]}`)}
          </p>
          <p className="text-[9px] text-slate-400 font-mono flex items-center gap-1 uppercase tracking-tight">
             <Clock className="w-2.5 h-2.5" /> 
             {transaction.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {transaction.status}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn(
          "text-sm font-black tracking-tight",
          isSender ? "text-slate-900" : "text-emerald-600"
        )}>
          {isSender ? '-' : '+'}{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mt-0.5">{isSender ? 'Debit' : 'Credit'}</p>
      </div>
    </div>
  );
}
