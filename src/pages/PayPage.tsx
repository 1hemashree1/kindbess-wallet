import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Send, User, ChevronRight, X, Loader2, CheckCircle2 } from 'lucide-react';
import { TransactionType, TransactionStatus, UserProfile } from '../types';

export default function PayPage() {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      // Search by KCX ID or Emoven No
      const q = query(
        collection(db, 'users'), 
        where('kcxId', '==', searchQuery.includes('@kcx') ? searchQuery : searchQuery + '@kcx')
      );
      const q2 = query(collection(db, 'users'), where('emovenNo', '==', searchQuery));
      
      const snap1 = await getDocs(q);
      const snap2 = await getDocs(q2);
      
      const results: UserProfile[] = [];
      snap1.forEach(doc => results.push({ uid: doc.id, ...doc.data() } as UserProfile));
      snap2.forEach(doc => {
        if (!results.find(r => r.uid === doc.id)) {
          results.push({ uid: doc.id, ...doc.data() } as UserProfile);
        }
      });
      
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePayment = async () => {
    if (!profile || !selectedUser || !amount || isPaying) return;
    const payAmount = parseFloat(amount);
    if (isNaN(payAmount) || payAmount <= 0) return;
    if (profile.balance < payAmount) {
      alert("Insufficient balance");
      return;
    }

    setIsPaying(true);
    try {
      await runTransaction(db, async (transaction) => {
        const senderRef = doc(db, 'users', profile.uid);
        const receiverRef = doc(db, 'users', selectedUser.uid);
        const newTxRef = doc(collection(db, 'transactions'));

        const senderSnap = await transaction.get(senderRef);
        if (!senderSnap.exists()) throw "Sender not found";
        
        const currentBalance = senderSnap.data().balance;
        if (currentBalance < payAmount) throw "Insufficient balance";

        // Update balances
        transaction.update(senderRef, { balance: currentBalance - payAmount });
        transaction.update(receiverRef, { balance: selectedUser.balance + payAmount });
        
        // Record transaction
        transaction.set(newTxRef, {
          fromId: profile.uid,
          toId: selectedUser.uid,
          fromName: profile.fullName,
          toName: selectedUser.fullName,
          amount: payAmount,
          type: TransactionType.SEND,
          status: TransactionStatus.COMPLETED,
          note: note,
          timestamp: serverTimestamp()
        });
      });
      setPaymentStatus('success');
    } catch (err) {
      console.error(err);
      setPaymentStatus('error');
    } finally {
      setIsPaying(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl min-h-[400px] text-center"
      >
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="text-emerald-500 w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
        <p className="text-slate-500 mb-8">{amount} KC sent to {selectedUser?.fullName}</p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl"
        >
          Done
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Send KC</h1>
        <p className="text-xs text-slate-500 mt-1">Transfer Kindness Credits instantly</p>
      </div>

      <AnimatePresence mode="wait">
        {!selectedUser ? (
          <motion.div
            key="search"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search by KCX ID or Emoven No"
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="hidden"></button>
            </form>

            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">Results</span>
              {isSearching ? (
                <div className="flex justify-center p-8 text-indigo-600">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((u) => (
                  <button 
                    key={u.uid}
                    onClick={() => setSelectedUser(u)}
                    className="w-full bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between group active:scale-95 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 text-lg font-bold">
                        {u.fullName[0]}
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-slate-900">{u.fullName}</h3>
                        <p className="text-xs text-slate-500">{u.kcxId}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600" />
                  </button>
                ))
              ) : searchQuery && !isSearching && (
                  <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm italic">No users found for "{searchQuery}"</p>
                  </div>
                )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {selectedUser.fullName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{selectedUser.fullName}</h3>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">{selectedUser.kcxId}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="text-center">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Enter Amount</span>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="text-2xl font-bold text-slate-400">KC</span>
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-32 text-4xl font-bold text-slate-900 focus:outline-none text-center bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <input 
                type="text" 
                placeholder="Add a note (optional)"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm text-slate-700 outline-none"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <button 
              onClick={handlePayment}
              disabled={isPaying || !amount || parseFloat(amount) <= 0}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {isPaying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {isPaying ? 'Processing...' : `Pay ${amount || '0'} KC`}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
