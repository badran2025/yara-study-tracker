import React from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Eye, 
  Download, 
  Upload, 
  RotateCcw,
  Sparkles,
  Home
} from 'lucide-react';

export default function Header({ 
  isAdmin, 
  setIsAdmin, 
  onGoHome,
  onExportData, 
  onImportData, 
  onResetData 
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Title (Clickable to return Home) */}
          <div 
            onClick={onGoHome}
            className="flex items-center gap-3 cursor-pointer group"
            title="العودة للصفحة الرئيسية"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight group-hover:text-emerald-700 transition-colors">
                  مِنَصّة إنجَاز
                </h1>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  معيار 95%
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                رفيق المتابعة والتميز الدراسي لأختي يارا 🌸
              </p>
            </div>
          </div>

          {/* Right Controls: Mode Switcher & Backup */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Quick Home Button */}
            <button
              onClick={onGoHome}
              title="العودة للرئيسية"
              className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-all text-xs flex items-center gap-1 font-bold"
            >
              <Home className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">الرئيسية</span>
            </button>

            {/* Backup actions (visible in Admin mode) */}
            {isAdmin && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={onExportData}
                  title="تصدير نسخة احتياطية (JSON)"
                  className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-white rounded-lg transition-all text-xs flex items-center gap-1 font-semibold"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span className="hidden md:inline">نسخ احتياطي</span>
                </button>
                <label 
                  title="استعادة نسخة احتياطية"
                  className="p-2 text-slate-600 hover:text-blue-700 hover:bg-white rounded-lg transition-all text-xs flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span className="hidden md:inline">استعادة</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImportData}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={onResetData}
                  title="إعادة ضبط البيانات الأصلية"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setIsAdmin(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isAdmin
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>وضع يارا 🌸</span>
              </button>

              <button
                onClick={() => setIsAdmin(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isAdmin
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>وضع الإشراف</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
