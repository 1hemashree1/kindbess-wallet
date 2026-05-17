import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { auth, db } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'lucide-react';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import PayPage from './pages/PayPage';
import ScanPage from './pages/ScanPage';
import NearbyPage from './pages/NearbyPage';
import KCCCPage from './pages/KCCCPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = React.useState('home');
  const [repairing, setRepairing] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      window.location.href = '/'; 
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white font-bold text-2xl tracking-widest"
        >
          KCX
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!profile) {
    const handleRepair = async () => {
      if (!user || !user.email) return;
      setRepairing(true);
      try {
        const name = user.displayName || user.email.split('@')[0];
        const kcxId = name.toLowerCase().replace(/\s+/g, '.') + Math.floor(Math.random() * 1000) + '@kcx';
        const emovenNo = 'EM' + Math.floor(100000 + Math.random() * 900000).toString();
        
        const path = `users/${user.uid}`;
        const userData = {
          fullName: name,
          email: user.email,
          kcxId: kcxId,
          emovenNo: emovenNo,
          kycStatus: 'PENDING',
          balance: 500,
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          createdAt: serverTimestamp(),
        };

        try {
          await setDoc(doc(db, 'users', user.uid), userData);
        } catch (error) {
          const errInfo = {
            error: error instanceof Error ? error.message : String(error),
            operationType: 'write',
            path,
            authInfo: {
              userId: auth.currentUser?.uid,
              email: auth.currentUser?.email,
              emailVerified: auth.currentUser?.emailVerified,
            }
          };
          console.error('Firestore Error Path info:', JSON.stringify(errInfo));
          throw error;
        }
      } catch (err: any) {
        console.error("Repair failed:", err);
        alert(`Repair failed: ${err.message || 'Unknown error'}`);
      } finally {
        setRepairing(false);
      }
    };

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="space-y-6 max-w-sm">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
            <User className="w-8 h-8 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">KCX Profile Missing</h2>
            <p className="text-sm text-slate-400 font-medium">
              You are signed in as <span className="text-white">{user.email}</span>, but your KCX Protocol profile is missing.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleRepair}
              disabled={repairing}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {repairing ? 'Creating Profile...' : 'Repair & Create Profile'}
            </button>
            <button 
              onClick={handleSignOut}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl border border-slate-800"
            >
              Sign Out
            </button>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-4">
              Security Protocol: PROFILE_SYNC_ERROR
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Dashboard onNavigate={setActiveTab} />;
      case 'pay': return <PayPage />;
      case 'scan': return <ScanPage />;
      case 'nearby': return <NearbyPage />;
      case 'kccc': return <KCCCPage />;
      case 'wallet': return <WalletPage />;
      case 'profile': return <ProfilePage />;
      default: return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl">
      <Header />
      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
