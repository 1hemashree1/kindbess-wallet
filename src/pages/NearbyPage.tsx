import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, limit, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { MapPin, Search, Store, Star, Phone, Clock, Navigation, Filter } from 'lucide-react';
import { Merchant } from '../types';
import { formatFirestoreError, OperationType } from '../lib/firestore-errors';

export default function NearbyPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'merchants'), limit(20));
    return onSnapshot(q, (snap) => {
      setMerchants(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Merchant)));
      setLoading(false);
    });
  }, []);

  const handleJoinNetwork = async () => {
    if (!user) return;
    
    const name = prompt("Enter your Business Name to register:");
    if (!name) return;
    
    const category = prompt("What is your Business Category? (e.g., Cafe, Salon, Restaurant)", "Retail");
    if (!category) return;

    try {
      setLoading(true);
      const merchantData = {
        ownerId: user.uid,
        businessName: name,
        category: category,
        acceptsKCX: true,
        verified: false,
        photos: [],
        address: "Pending details",
        createdAt: new Date().toISOString(), // Using string for now to match simplicity or serverTimestamp
      };

      try {
        await addDoc(collection(db, 'merchants'), merchantData);
        alert("Business registered successfully! It is now visible on the KCX network.");
      } catch (error) {
        const errMessage = formatFirestoreError(error, OperationType.CREATE, 'merchants', auth);
        console.error("Firestore Error info:", errMessage);
        alert(`Join Network failed: Protocol Security rejection. Check console for details.`);
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      alert(`Registration internal error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Merchant Directory</h1>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search shops, cafes..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
          <button className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Filter className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {['All', 'Cafe', 'Restaurant', 'Hardware', 'Salon'].map((cat) => (
          <button key={cat} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap active:bg-indigo-600 active:text-white transition-all shadow-sm">
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-slate-100 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : merchants.length > 0 ? (
          merchants.map((shop) => (
            <MerchantCard key={shop.id} merchant={shop} />
          ))
        ) : (
          <div className="text-center py-12 kcx-card border-dashed p-8">
            <MapPin className="w-10 h-10 text-slate-200 mx-auto mb-4" />
            <h3 className="font-bold text-slate-900 mb-1">No merchants found</h3>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-tighter">Register your business to appear on the KCX network!</p>
            <button 
              onClick={handleJoinNetwork}
              disabled={loading}
              className="mt-6 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Join Network'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MerchantCard({ merchant }: { merchant: Merchant, key?: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="kcx-card group active:bg-slate-50 transition-colors"
    >
      <div className="flex p-3 gap-4">
        <div className="w-20 h-20 bg-slate-50 rounded-2xl shrink-0 flex items-center justify-center relative overflow-hidden border border-slate-100">
          {merchant.photos?.[0] ? (
            <img src={merchant.photos[0]} alt={merchant.businessName} className="w-full h-full object-cover" />
          ) : (
            <Store className="w-6 h-6 text-slate-200" />
          )}
          {merchant.verified && (
            <div className="absolute top-1 right-1 bg-white p-0.5 rounded-full shadow-sm">
              <Star className="w-2.5 h-2.5 text-indigo-600 fill-indigo-600" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-0.5">
            <h3 className="font-bold text-slate-900 truncate pr-2 text-sm">{merchant.businessName}</h3>
            <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
               <Star className="w-3 h-3 fill-amber-500" /> 4.5
            </div>
          </div>
          <p className="kcx-label mb-2 tracking-tighter">{merchant.category}</p>
          <div className="flex items-center gap-3 mt-auto">
            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 font-mono uppercase">
               <Navigation className="w-3 h-3" /> 200m
            </p>
            <div className="flex gap-1.5 ml-auto">
              <button className="bg-indigo-50 text-indigo-600 p-2 rounded-lg"><Navigation className="w-3 h-3" /></button>
              <button className="bg-slate-50 text-slate-600 p-2 rounded-lg"><Phone className="w-3 h-3" /></button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
