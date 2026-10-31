import React from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Eye, 
  Download, 
  Upload, 
  RotateCcw,
  Sparkles,
  Home,
  RefreshCw
} from 'lucide-react';

export default function Header({ 
  isAdmin, 
  setIsAdmin, 
  onGoHome,
  syncStatus = 'synced',
  onOpenSyncModal,
  onExportData, 
  onImportData, 
  onResetData 
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/95">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Cloud Realtime Status Indicator */}
            {syncStatus === 'synced' && (
              <div 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-black shadow-2xs"
                title="الموقع متصل بقاعدة بيانات فايربيز ويتزامن فورياً بين جميع الأجهزة"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="hidden md:inline">مزامنة سحابية حية ☁️</span>
                <span className="md:hidden">مباشر 🟢</span>
              </div>
            )}
            {syncStatus === 'saving' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-black shadow-2xs">
                <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                <span className="hidden sm:inline">جاري الحفظ بالسحابة...</span>
                <span className="sm:hidden">حفظ...</span>
              </div>
            )}
            {syncStatus === 'pending_setup' && (
              <a 
                href="https://console.firebase.google.com/project/yara-study-tracker/firestore/rules"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black hover:bg-amber-200 transition-colors shadow-2xs"
                title="اضغط هنا لفتح صفحة القواعد (Rules) وتفعيل السماح بالقراءة والكتابة"
              >
                <span>تفعيل قواعد Firestore ⚠️</span>
              </a>
            )}

            {/* Quick Home Button */}
            <button
              onClick={onGoHome}
              title="العودة للرئيسية"
              className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-all text-xs flex items-center gap-1 font-bold"
            >
              <Home className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">الرئيسية</span>
            </button>

            {/* Sync Devices Button - ALWAYS VISIBLE */}
            <button
              onClick={onOpenSyncModal}
              className="px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
              title="مزامنة التعديلات بين جهاز يارا وجهاز المشرف"
            >
              <RefreshCw className="w-3.5 h-3.5 text-yellow-300" />
              <span className="hidden sm:inline">مزامنة الأجهزة 🔄</span>
              <span className="sm:hidden">مزامنة 🔄</span>
            </button>

            {/* Backup actions */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={onExportData}
                title="تصدير نسخة احتياطية (JSON)"
                className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-white rounded-lg transition-all text-xs flex items-center gap-1 font-semibold"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span className="hidden lg:inline">نسخ احتياطي</span>
              </button>
              <label 
                title="استعادة نسخة احتياطية"
                className="p-2 text-slate-600 hover:text-blue-700 hover:bg-white rounded-lg transition-all text-xs flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Upload className="w-4 h-4 text-blue-600" />
                <span className="hidden lg:inline">استعادة</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportData}
                  className="hidden"
                />
              </label>
              {isAdmin && (
                <button
                  onClick={onResetData}
                  title="إعادة ضبط البيانات الأصلية"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

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
