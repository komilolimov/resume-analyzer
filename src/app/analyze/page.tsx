'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb, ArrowRight, Loader2, Zap, FileText, Check, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Language, translations } from '../../lib/translations';
import { copyHtmlToClipboard } from '../../lib/copyToWord';

interface AnalysisResult {
  is_valid_input: boolean;
  validation_error?: string | null;
  match_score: number;
  job_title: string;
  company_name: string;
  found_skills: string[];
  missing_skills: string[];
  actionable_advice: string[];
  summary: string;
  tailored_resume_html: string;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
};

export default function AnalyzePage() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  
  // MAANG Modal State
  const [showMaangModal, setShowMaangModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please fill in both fields.'); 
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription,
          language: language,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Server error');
      }
      
      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMaang = async () => {
    if (!result?.tailored_resume_html) return;
    const success = await copyHtmlToClipboard(result.tailored_resume_html);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-10 font-sans relative overflow-hidden">
      
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

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-pink-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10 pt-4">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              {t.step1Title}
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder={t.resumePlaceholder}
              className={`w-full h-72 p-4 bg-slate-900/50 border rounded-2xl text-sm text-slate-200 focus:outline-none focus:ring-2 transition-all font-mono resize-none backdrop-blur-sm ${
                result && !result.is_valid_input ? 'border-rose-500/60 focus:border-rose-500/80 focus:ring-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-slate-800/80 focus:border-blue-500/50 focus:ring-blue-500/20'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              {t.step2Title}
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder={t.jobPlaceholder}
              className={`w-full h-72 p-4 bg-slate-900/50 border rounded-2xl text-sm text-slate-200 focus:outline-none focus:ring-2 transition-all font-mono resize-none backdrop-blur-sm ${
                result && !result.is_valid_input ? 'border-rose-500/60 focus:border-rose-500/80 focus:ring-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-slate-800/80 focus:border-purple-500/50 focus:ring-purple-500/20'
              }`}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-400 text-sm">
              {error}
            </motion.p>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="group relative inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-white transition-all bg-slate-900 rounded-full border border-slate-700/80 hover:border-blue-500/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:pointer-events-none overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex items-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent animate-pulse">
                    {t.analyzingBtn}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
                  <span>{t.analyzeBtn}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </button>
        </div>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-8 border border-slate-800/80 rounded-3xl bg-slate-900/30 backdrop-blur-md space-y-4 animate-pulse"
            >
              <div className="h-6 bg-slate-800/60 rounded-md w-1/3" />
              <div className="h-4 bg-slate-800/40 rounded-md w-2/3" />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="h-20 bg-slate-800/30 rounded-xl" />
                <div className="h-20 bg-slate-800/30 rounded-xl" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && !loading && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="p-8 border border-slate-800/80 rounded-3xl bg-slate-900/40 backdrop-blur-xl space-y-8 shadow-2xl relative"
            >
              {!result.is_valid_input ? (
                <div className="bg-rose-500/10 border border-rose-500/50 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                  <AlertTriangle className="w-16 h-16 text-rose-500 animate-pulse" />
                  <h3 className="text-2xl font-bold text-rose-400">Validation Error</h3>
                  <p className="text-slate-300 max-w-lg text-lg leading-relaxed">{result.validation_error}</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/60 pb-6">
                    <div>
                      <div className="text-xs font-mono text-blue-400 uppercase tracking-widest mb-1">
                        {t.targetRole}
                      </div>
                      <h2 className="text-2xl font-bold text-white">{result.job_title}</h2>
                      <p className="text-slate-400 text-sm">{result.company_name}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* MAANG Button */}
                      <button
                        onClick={() => setShowMaangModal(true)}
                        className="group relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white transition-all bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] overflow-hidden"
                      >
                        <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-white" />
                          <span>{t.maangBtn}</span>
                        </div>
                      </button>

                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="flex items-center gap-4 bg-slate-950/60 border border-slate-800/80 px-6 py-3 rounded-2xl self-start md:self-auto"
                      >
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                            {t.atsMatchScore}
                          </span>
                          <span className={`text-3xl font-black ${
                            result.match_score >= 75 ? 'text-emerald-400' : 
                            result.match_score >= 50 ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {result.match_score}%
                          </span>
                        </div>
                        <Zap className={`w-6 h-6 ${
                          result.match_score >= 75 ? 'text-emerald-400' : 
                          result.match_score >= 50 ? 'text-amber-400' : 'text-rose-400'
                        }`} />
                      </motion.div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      {t.executiveSummary}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
                      {result.summary}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 tracking-wider uppercase">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {t.foundSkills} ({result.found_skills.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.found_skills.map((skill, i) => (
                          <motion.span
                            key={i}
                            variants={itemVariants}
                            className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl font-mono"
                          >
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-mono text-rose-400 tracking-wider uppercase">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        {t.missingKeywords} ({result.missing_skills.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.missing_skills.map((skill, i) => (
                          <motion.span
                            key={i}
                            variants={itemVariants}
                            className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl font-mono"
                          >
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/60 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-amber-400 tracking-wider uppercase">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      {t.recommendations}
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300">
                      {result.actionable_advice.map((item, i) => (
                        <motion.li
                          key={i}
                          variants={itemVariants}
                          className="flex items-start gap-3 bg-slate-950/30 p-3 rounded-xl border border-slate-800/40"
                        >
                          <span className="text-amber-400 font-mono text-xs mt-0.5">•</span>
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAANG Modal */}
        <AnimatePresence>
          {showMaangModal && result?.tailored_resume_html && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-slate-900 border border-slate-700 shadow-2xl rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                      {t.maangModalTitle}
                    </h2>
                    <div className="text-xs font-mono text-blue-400 mt-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {t.maangModalBadge}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMaangModal(false)}
                    className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content - HTML Preview */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50 text-slate-900">
                  <div
                    className="prose prose-sm md:prose-base max-w-none prose-h2:text-slate-800 prose-h2:border-b-2 prose-h2:border-slate-800 prose-h2:pb-1 prose-h3:text-slate-700 prose-strong:text-slate-900"
                    dangerouslySetInnerHTML={{ __html: result.tailored_resume_html }}
                  />
                </div>

                {/* Modal Footer */}
                <div className="p-5 border-t border-slate-800 bg-slate-950 flex justify-end">
                  <button
                    onClick={handleCopyMaang}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                      copied
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                        : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        {t.copiedBtn}
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        {t.copyToWordBtn}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
