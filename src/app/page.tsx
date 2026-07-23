'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Briefcase, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { Language, translations } from '../lib/translations';

export default function LandingPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem('hasSeenIntro') === 'true') {
      router.replace('/analyze');
    }
  }, [router]);

  const handleStart = () => {
    localStorage.setItem('hasSeenIntro', 'true');
    router.push('/analyze');
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Floating Language Selector */}
      <div className="absolute top-6 right-6 z-50">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-slate-900/80 border border-slate-800 text-slate-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 outline-none cursor-pointer hover:bg-slate-800 backdrop-blur-md transition"
        >
          <option value="en">English</option>
          <option value="it">Italiano</option>
          <option value="de">Deutsch</option>
          <option value="ru">Русский</option>
          <option value="uz">O'zbek</option>
        </select>
      </div>

      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/10 via-purple-600/10 to-pink-500/10 blur-[100px] pointer-events-none rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl mx-auto text-center space-y-8 relative z-10 pt-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs font-mono tracking-wide mx-auto">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-blue-400" />
          <span>POWERED BY GEMINI 3.5 FLASH</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
          {t.heroTitle.split(' ')[0]} <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{t.heroTitle.split(' ').slice(1).join(' ')}</span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
          {t.heroSubtitle}
        </p>

        <div className="pt-4 pb-12 flex flex-col sm:flex-row items-center justify-center gap-6">
          <button 
            onClick={() => { localStorage.setItem('hasSeenIntro', 'true'); router.push('/analyze'); }}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all bg-slate-900 rounded-full border border-slate-700/80 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] overflow-hidden w-full sm:w-auto"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-2">
              <span>Match & Tailor</span>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
          
          <button 
            onClick={() => { localStorage.setItem('hasSeenIntro', 'true'); router.push('/format'); }}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all bg-slate-900 rounded-full border border-slate-700/80 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] overflow-hidden w-full sm:w-auto"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform" />
              <span>Auto-Format Only</span>
            </div>
          </button>
        </div>

        {/* How It Works */}
        <div className="pt-12 border-t border-slate-800/60">
          <h2 className="text-xl font-semibold text-slate-300 mb-8">{t.howItWorksTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <motion.div whileHover={{ y: -5 }} className="p-6 bg-slate-900/40 border border-slate-800/60 rounded-2xl backdrop-blur-sm space-y-4">
              <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center rounded-xl border border-blue-500/20">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-medium">{t.step1Title}</h3>
              <p className="text-sm text-slate-400">{t.step1Desc}</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="p-6 bg-slate-900/40 border border-slate-800/60 rounded-2xl backdrop-blur-sm space-y-4">
              <div className="w-12 h-12 bg-purple-500/10 flex items-center justify-center rounded-xl border border-purple-500/20">
                <Briefcase className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-white font-medium">{t.step2Title}</h3>
              <p className="text-sm text-slate-400">{t.step2Desc}</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="p-6 bg-slate-900/40 border border-slate-800/60 rounded-2xl backdrop-blur-sm space-y-4">
              <div className="w-12 h-12 bg-pink-500/10 flex items-center justify-center rounded-xl border border-pink-500/20">
                <Sparkles className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-white font-medium">{t.step3Title}</h3>
              <p className="text-sm text-slate-400">{t.step3Desc}</p>
            </motion.div>
          </div>
        </div>

      </motion.div>
    </main>
  );
}
