import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { KYCStatus } from '../types';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (emailStr: string) => {
    const validDomains = ['@proton.me', '@protonmail.com', '@gmail.com'];
    return validDomains.some(domain => emailStr.toLowerCase().endsWith(domain));
  };

  const generateEmovenNo = () => {
    return 'EM' + Math.floor(100000 + Math.random() * 900000).toString();
  };

  const generateKcxId = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '.') + Math.floor(Math.random() * 1000) + '@kcx';
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!validateEmail(email)) {
      setError('Only authorized email domains allowed.');
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Reset link sent! Please check your inbox (including spam).');
      setTimeout(() => {
        setIsForgotPassword(false);
        setMessage('');
      }, 5000);
    } catch (err: any) {
      console.error("Reset Error:", err.code);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait before trying again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!validateEmail(email)) {
      setError('Only authorized email domains allowed.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { user } = userCredential;

        await updateProfile(user, { displayName: fullName });

        // Initialize profile
        await setDoc(doc(db, 'users', user.uid), {
          fullName,
          email,
          kcxId: generateKcxId(fullName),
          emovenNo: generateEmovenNo(),
          kycStatus: KYCStatus.PENDING,
          balance: 500, // Welcome bonus
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      console.error("Auth Error:", err.code, err.message);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. If you just reset your password, please make sure to use the new one.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try logging in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please wait a few minutes before trying again or reset your password.');
      } else if (err.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact support.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)] mb-4"
          >
            <ShieldCheck className="text-white w-10 h-10" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tighter">KCX</h1>
          <p className="text-slate-400 text-sm mt-1 uppercase tracking-[0.2em] font-black">Kindness Credits Xchange</p>
        </div>

        {isForgotPassword ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <button 
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-lg font-bold text-white tracking-tight">Reset Password</h2>
            </div>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest leading-relaxed mb-4">
              Enter your email and we'll send you a link to reset your password.
            </p>
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="email" 
                placeholder="Email Address" 
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            {message && <p className="text-emerald-500 text-xs text-center">{message}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input 
                  type="password" 
                  placeholder="Password" 
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {isLogin && (
                <div className="text-right">
                  <button 
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              {message && <p className="text-emerald-500 text-xs text-center">{message}</p>}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isLogin ? 'Login' : 'Signup')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-slate-400 text-sm hover:text-white transition-colors"
              >
                {isLogin ? "Don't have an account? Signup" : "Already have an account? Login"}
              </button>
            </div>
          </>
        )}

        <p className="mt-12 text-center text-[10px] text-slate-600 uppercase tracking-widest leading-loose">
          Secure Fintech Protocol<br />
          v1.0.0 MVP Build
        </p>
      </motion.div>
    </div>
  );
}
