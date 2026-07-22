'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { Language, translations } from '../lib/translations';

export default function Header() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const pathname = usePathname();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/60 bg-[#090d16]/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
            ⚡ <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">FitAnalyzer</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-400">
            <Link 
              href="/" 
              className={`hover:text-white transition-colors ${pathname === '/' ? 'text-white' : ''}`}
            >
              {t.navHome}
            </Link>
            <Link 
              href="/analyze" 
              className={`hover:text-white transition-colors ${pathname === '/analyze' ? 'text-white' : ''}`}
            >
              {t.navAnalyzer}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-1.5 outline-none cursor-pointer hover:bg-slate-800 transition"
          >
            <option value="en">English</option>
            <option value="it">Italiano</option>
            <option value="de">Deutsch</option>
            <option value="ru">Русский</option>
            <option value="uz">O'zbek</option>
          </select>
        </div>
      </div>
    </header>
  );
}
