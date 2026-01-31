
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, isConfigPlaceholder } from './firebase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import FinancialAdvisor from './components/FinancialAdvisor';
import SettingsModal from './components/SettingsModal';
import { Wallet, CloudOff, Cloud, Headset, Settings, Zap, ExternalLink, ShieldCheck } from 'lucide-react';
import { CustomCategory, TransactionType } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [isKeySelected, setIsKeySelected] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser: User | null) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Check for API key selection on mount if we're logged in
  useEffect(() => {
    if (user && typeof window.aistudio !== 'undefined') {
      window.aistudio.hasSelectedApiKey().then((hasKey: boolean) => {
        setIsKeySelected(hasKey);
      });
    }
  }, [user]);

  const handleOpenKeySelector = async () => {
    if (typeof window.aistudio !== 'undefined') {
      await window.aistudio.openSelectKey();
      // Assume success as per race condition guidelines
      setIsKeySelected(true);
    }
  };

  // Listen for custom categories
  useEffect(() => {
    if (!user) {
      setCustomCategories([]);
      return;
    }

    if (db.isMock) {
      const saved = localStorage.getItem(`finsd_settings_${user.uid}`);
      if (saved) {
        setCustomCategories(JSON.parse(saved).customCategories || []);
      }
      return;
    }

    const settingsRef = doc(db, 'users', user.uid, 'settings', 'profile');
    const unsub = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setCustomCategories(docSnap.data().customCategories || []);
      }
    });

    return () => unsub();
  }, [user]);

  const handleAddCustomCategory = async (name: string, type: TransactionType) => {
    if (!user) return;
    const newList = [...customCategories, { name, type }];
    
    if (db.isMock) {
      localStorage.setItem(`finsd_settings_${user.uid}`, JSON.stringify({ customCategories: newList }));
      setCustomCategories(newList);
      return;
    }

    await setDoc(doc(db, 'users', user.uid, 'settings', 'profile'), {
      customCategories: newList
    }, { merge: true });
  };

  const handleRemoveCustomCategory = async (name: string, type: TransactionType) => {
    if (!user) return;
    const newList = customCategories.filter(c => !(c.name === name && c.type === type));
    
    if (db.isMock) {
      localStorage.setItem(`finsd_settings_${user.uid}`, JSON.stringify({ customCategories: newList }));
      setCustomCategories(newList);
      return;
    }

    await setDoc(doc(db, 'users', user.uid, 'settings', 'profile'), {
      customCategories: newList
    }, { merge: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (user && !isKeySelected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center space-y-8 animate-in zoom-in duration-300">
          <div className="mx-auto w-20 h-20 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100 ring-8 ring-indigo-50">
            <Zap size={40} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Activate AI</h2>
            <p className="mt-3 text-gray-500 font-medium leading-relaxed">
              To provide financial insights and live voice chat using <span className="text-indigo-600 font-bold">Gemini AI</span>, you need to select an API key.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-100">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center">
              <ShieldCheck size={14} className="mr-2 text-indigo-500" />
              Why is this needed?
            </h4>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              We use Gemini models to ensure your advice is accurate and personal. These models require your own API key for secure access.
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleOpenKeySelector}
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Select API Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors"
            >
              <span>Setup Billing Docs</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full relative overflow-x-hidden">
      {!user ? (
        <Login />
      ) : (
        <div className="flex flex-col flex-1 w-full max-w-6xl mx-auto lg:px-6 lg:py-8">
          <header className="p-4 lg:px-8 bg-white lg:rounded-3xl flex justify-between items-center border-b lg:border border-gray-100 sticky top-0 lg:static z-30 lg:shadow-sm lg:mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <Wallet size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900">
                  Fin.<span className="text-indigo-600">SD</span>
                </h1>
                <div className="flex items-center space-x-1.5 -mt-0.5">
                  {isConfigPlaceholder || db.isMock ? (
                    <>
                      <CloudOff size={10} className="text-amber-500" />
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter">Demo Mode</span>
                    </>
                  ) : (
                    <>
                      <Cloud size={10} className="text-green-500" />
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">Cloud Sync</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={() => setIsAdvisorOpen(true)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all border ${isAdvisorOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-100 text-gray-600 hover:border-indigo-200 hover:text-indigo-600'}`}
              >
                <Headset size={18} className={isAdvisorOpen ? 'animate-pulse' : ''} />
                <span className="hidden sm:inline text-sm font-bold">Ask AI</span>
              </button>

              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active User</span>
                <span className="text-sm font-semibold text-gray-700">{user.email?.split('@')[0]}</span>
              </div>
              
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                title="Settings"
              >
                <Settings size={22} />
              </button>
            </div>
          </header>
          
          <main className="flex-1 w-full pb-24 lg:pb-8">
            <Dashboard userId={user.uid} customCategories={customCategories} />
          </main>
          
          <FinancialAdvisor 
            userId={user.uid} 
            isOpen={isAdvisorOpen} 
            onClose={() => setIsAdvisorOpen(false)} 
            onKeyRequired={() => setIsKeySelected(false)}
          />

          <SettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            userId={user.uid}
            customCategories={customCategories}
            onAddCategory={handleAddCustomCategory}
            onRemoveCategory={handleRemoveCustomCategory}
          />
        </div>
      )}
    </div>
  );
};

export default App;
