import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Plus, Search, ChevronRight, Star, Clock, CheckCircle2, User, Info, AlertCircle } from 'lucide-react';
import { KCCCTask, TaskStatus } from '../types';
import { cn } from '../lib/utils';

export default function KCCCPage() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<KCCCTask[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'tasks'));
    return onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as KCCCTask)));
      setLoading(false);
    });
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !title || !amount) return;
    try {
      await addDoc(collection(db, 'tasks'), {
        requesterId: profile.uid,
        requesterName: profile.fullName,
        title,
        description: desc,
        amount: parseFloat(amount),
        status: TaskStatus.OPEN,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setTitle('');
      setDesc('');
      setAmount('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptTask = async (taskId: string) => {
    if (!profile) return;
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: TaskStatus.ACCEPTED,
        workerId: profile.uid
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">KCCC Jobs</h1>
          <p className="text-xs text-slate-500 mt-1">Community Contribution Rewards</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {['All Jobs', 'My Requests', 'My Tasks'].map(tab => (
           <button key={tab} className="px-5 py-2.5 bg-white border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-600 whitespace-nowrap shadow-sm">
             {tab}
           </button>
        ))}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <div className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl space-y-6">
               <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold text-slate-900">Request Help</h2>
                 <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><AlertCircle className="w-5 h-5 text-slate-400 rotate-45" /></button>
               </div>
               <form onSubmit={handleCreateTask} className="space-y-4">
                  <input 
                    type="text" placeholder="Job Title (e.g. Ironing 5 shirts)" required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                    value={title} onChange={e => setTitle(e.target.value)}
                  />
                  <textarea 
                    placeholder="Description" rows={3}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                    value={desc} onChange={e => setDesc(e.target.value)}
                  />
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">KC</span>
                    <input 
                      type="number" placeholder="KC Reward" required
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                      value={amount} onChange={e => setAmount(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-3xl shadow-lg shadow-indigo-100 active:scale-95 transition-all">
                    Post Request
                  </button>
               </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 pb-20">
        {loading ? (
           <div className="flex justify-center p-12"><Briefcase className="w-10 h-10 text-indigo-100 animate-bounce" /></div>
        ) : tasks.length > 0 ? (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} onAccept={handleAcceptTask} currentUid={profile?.uid} />
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
            <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 text-sm font-medium italic">No active jobs found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, onAccept, currentUid }: { task: KCCCTask, onAccept: (id: string) => void | Promise<void>, currentUid?: string, key?: any }) {
  const isMine = task.requesterId === currentUid;
  const isAccepted = task.status === TaskStatus.ACCEPTED;
  const isCompleted = task.status === TaskStatus.COMPLETED;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-5 border border-slate-50 shadow-sm space-y-4"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900">{task.title}</h3>
            {isMine && <span className="bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase px-1.5 py-0.5 rounded tracking-widest">My Request</span>}
          </div>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-black text-indigo-600 leading-none tracking-tighter">{task.amount} KC</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Reward</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
             {task.requesterName?.[0] || 'U'}
          </div>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{task.requesterName || 'Community User'}</span>
        </div>
        <span className={cn(
          "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full",
          task.status === TaskStatus.OPEN ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
        )}>
          {task.status}
        </span>
      </div>

      {task.status === TaskStatus.OPEN && !isMine && (
        <button 
          onClick={() => onAccept(task.id)}
          className="w-full bg-slate-900 text-white font-bold py-3 rounded-2xl shadow-lg active:scale-95 transition-all text-xs uppercase tracking-widest"
        >
          Accept Job
        </button>
      )}
    </motion.div>
  );
}
