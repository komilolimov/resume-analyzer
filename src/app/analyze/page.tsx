'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb, ArrowRight, Loader2, Zap, FileText, Check, X, Download } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Language, translations } from '../../lib/translations';
import { copyHtmlToClipboard } from '../../lib/copyToWord';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!result?.tailored_resume_html) return;
    setDownloadingPdf(true);
    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('resume-preview');
      
      const opt: any = {
        margin:       0,
        filename:     `${result.job_title.replace(/[^a-zA-Z0-9]/g, '_')}_Resume.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
      };
      
      await html2pdf().set(opt).from(element as HTMLElement).save();
    } catch (err) {
      console.error("Failed to generate PDF", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

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
      
      // PDF Renderer Fix: Force strict margins using structural DOM elements instead of border/padding
      if (data.tailored_resume_html) {
        let html = data.tailored_resume_html;
        // Strip any border-bottom from LLM output
        html = html.replace(/border-bottom\s*:[^;"']+;?/gi, '');
        // Append a hardcoded line with margin-top after every <h2>
        html = html.replace(/<\/h2>/gi, '</h2><div style="border-top: 1px solid #000; margin-top: 8px; margin-bottom: 8px; width: 100%; height: 1px;"></div>');
        data.tailored_resume_html = html;
      }
      
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
    <main className="min-h-screen p-4 md:p-10 font-sans relative overflow-hidden print:p-0 print:overflow-visible print:bg-white print:text-black">
      
      {/* Floating Language Selector */}
      <div className="absolute top-6 right-6 z-50 print:hidden">
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

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-pink-500/10 blur-[120px] pointer-events-none rounded-full print:hidden" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10 pt-4 print:space-y-0 print:pt-0 print:max-w-none">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10 print:hidden">
          <Link 
            href="/analyze" 
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              pathname === '/analyze' 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {t.tabMatch}
          </Link>
          <Link 
            href="/format" 
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              pathname === '/format' 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {t.tabFormat}
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-5 print:hidden">
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

        <div className="flex flex-col items-center gap-3 print:hidden">

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
              className="p-8 border border-slate-800/80 rounded-3xl bg-slate-900/30 backdrop-blur-md space-y-4 animate-pulse print:hidden"
            >
              <div className="h-6 bg-slate-800/60 rounded-md w-1/3" />
              <div className="h-4 bg-slate-800/40 rounded-md w-2/3" />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="h-20 bg-slate-800/30 rounded-xl" />
                <div className="h-20 bg-slate-800/30 rounded-xl" />
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8 p-8 border border-rose-500/40 rounded-3xl bg-rose-500/10 backdrop-blur-xl shadow-[0_0_50px_rgba(244,63,94,0.15)] relative overflow-hidden print:hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500/0 via-rose-500 to-rose-500/0 opacity-50"></div>
              <div className="flex flex-col items-center justify-center text-center space-y-5 relative z-10">
                <div className="p-4 bg-rose-950/50 rounded-2xl border border-rose-500/30">
                  <AlertTriangle className="w-10 h-10 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">System Error</h3>
                  <p className="text-slate-300 max-w-2xl text-base leading-relaxed">
                    {error.includes('GEMINI_API_KEY') 
                      ? 'The AI API Key is not configured on the server. Please contact the administrator to set up the GEMINI_API_KEY.' 
                      : error.includes('Failed to fetch') || error.includes('Network')
                      ? 'Network connection failed. The backend server might be offline, restarting, or unreachable.'
                      : error.includes('429') || error.includes('RESOURCE_EXHAUSTED') || error.includes('quota')
                      ? 'Daily API quota exceeded (429). The free tier limit for Gemini AI has been reached. Please try again later or upgrade your API plan.'
                      : error.includes('503') || error.includes('high demand') || error.includes('UNAVAILABLE')
                      ? 'The Gemini AI is currently experiencing high demand (503). Spikes in demand are temporary. Please wait a few seconds and try again.'
                      : error}
                  </p>
                </div>
                <div className="pt-2">
                  <button 
                    onClick={() => setError('')} 
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-semibold text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-all"
                  >
                    <X className="w-4 h-4" />
                    Dismiss Error
                  </button>
                </div>
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
              className="p-8 border border-slate-800/80 rounded-3xl bg-slate-900/40 backdrop-blur-xl space-y-8 shadow-2xl relative print:shadow-none print:border-none print:bg-transparent print:p-0 print:space-y-0"
            >
              {!result.is_valid_input ? (
                <div className="bg-rose-500/10 border border-rose-500/50 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                  <AlertTriangle className="w-16 h-16 text-rose-500 animate-pulse" />
                  <h3 className="text-2xl font-bold text-rose-400">Validation Error</h3>
                  <p className="text-slate-300 max-w-lg text-lg leading-relaxed">{result.validation_error}</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/60 pb-6 print:hidden">
                    <div>
                      <div className="text-xs font-mono text-blue-400 uppercase tracking-widest mb-1">
                        {t.targetRole}
                      </div>
                      <h2 className="text-2xl font-bold text-white">{result.job_title}</h2>
                      <p className="text-slate-400 text-sm">{result.company_name}</p>
                    </div>

                    <div className="flex items-center gap-4">


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

                  <div className="space-y-2 print:hidden">
                    <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      {t.executiveSummary}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
                      {result.summary}
                    </p>
                  </div>

                  {/* Navigation Tabs */}


        <div className="grid md:grid-cols-2 gap-6 print:hidden">
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

                  <div className="pt-4 border-t border-slate-800/60 space-y-3 print:hidden">
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

        {/* Live Tailored Resume Preview */}
        <AnimatePresence>
          {result?.tailored_resume_html && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 border border-slate-800/80 rounded-3xl bg-slate-900/40 backdrop-blur-xl shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:bg-white print:rounded-none"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-800/60 bg-slate-900/60 print:hidden">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    Live Tailored Resume
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    ATS-optimized and ready for your next application.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {downloadingPdf ? 'Saving...' : 'Download PDF'}
                  </button>
                  <button
                    onClick={handleCopyMaang}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      copied
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                        : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]'
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
              </div>

              {/* A4 Document Container */}
              <div className="p-8 md:p-12 overflow-x-auto bg-slate-950/20 print:bg-white print:p-0">
                <div 
                  id="resume-preview"
                  className="bg-white mx-auto text-black shadow-2xl min-h-[1122px] w-[794px] max-w-full print:shadow-none print:w-full print:min-h-auto p-10"
                >
                  <div
                    className="text-[13px] leading-snug text-black"
                    dangerouslySetInnerHTML={{ __html: result.tailored_resume_html }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
