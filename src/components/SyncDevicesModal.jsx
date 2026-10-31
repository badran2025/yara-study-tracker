import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  Smartphone, 
  Laptop, 
  Sparkles, 
  Share2, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function SyncDevicesModal({ 
  isOpen, 
  onClose, 
  subjects, 
  schedule, 
  scheduledExams, 
  onApplyImportedData 
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('export'); // 'export' | 'import'
  const [copied, setCopied] = useState(false);
  const [pastedCode, setPastedCode] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);

  // Generate payload
  const currentData = {
    subjects,
    schedule,
    scheduledExams,
    exportDate: new Date().toISOString(),
    version: '3.0'
  };

  const jsonString = JSON.stringify(currentData);
  const base64Code = btoa(unescape(encodeURIComponent(jsonString)));

  // Copy code to clipboard
  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(base64Code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = base64Code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Download JSON file
  const handleDownloadFile = () => {
    const blob = new Blob([JSON.stringify(currentData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yara-study-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import from pasted code
  const handleApplyPastedCode = () => {
    if (!pastedCode.trim()) {
      setStatusMsg({ type: 'error', text: 'يرجى لصق كود المزامنة أولاً!' });
      return;
    }

    try {
      let parsed = null;
      try {
        const decoded = decodeURIComponent(escape(atob(pastedCode.trim())));
        parsed = JSON.parse(decoded);
      } catch {
        parsed = JSON.parse(pastedCode.trim());
      }

      if (parsed && (parsed.subjects || Array.isArray(parsed))) {
        const importedSubjects = parsed.subjects || parsed;
        const importedSchedule = parsed.schedule || schedule;
        const importedScheduledExams = parsed.scheduledExams || scheduledExams;
        
        onApplyImportedData({
          subjects: importedSubjects,
          schedule: importedSchedule,
          scheduledExams: importedScheduledExams
        });

        setStatusMsg({ type: 'success', text: 'تمت المزامنة وتطبيق بيانات يارا بنجاح تام! 🌸✨' });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setStatusMsg({ type: 'error', text: 'الكود الملصوق غير صالح أو لا يحتوي على بنية بيانات المنصة.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'حدث خطأ أثناء قراءة الكود، يرجى التأكد من نسخه بالكامل.' });
    }
  };

  // Import from file
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && (parsed.subjects || Array.isArray(parsed))) {
          const importedSubjects = parsed.subjects || parsed;
          const importedSchedule = parsed.schedule || schedule;
          const importedScheduledExams = parsed.scheduledExams || scheduledExams;

          onApplyImportedData({
            subjects: importedSubjects,
            schedule: importedSchedule,
            scheduledExams: importedScheduledExams
          });

          setStatusMsg({ type: 'success', text: 'تم استيراد وتطبيق ملف يارا بنجاح! 🌸' });
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setStatusMsg({ type: 'error', text: 'الملف غير صالح أو لا يحتوي على بيانات يارا.' });
        }
      } catch {
        setStatusMsg({ type: 'error', text: 'حدث خطأ أثناء قراءة الملف.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <RefreshCw className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                مزامنة البيانات بين أجهزة يارا والمشرف 🔄
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                نقل التعديلات والدروس التي حددتها يارا إلى جهازك في ثوانٍ معدودة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explain Notice */}
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 flex items-start gap-2.5 mb-4">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            <strong>توضيح مهم:</strong> كل جهاز يحتفظ ببياناته مؤقتاً في متصفحه؛ لذا لنقل ما حددته يارا على هاتفها إلى جهازك، تقوم يارا بـ <strong>نسخ الكود</strong> وإرساله لك على الواتساب، وأنت تقوم بـ <strong>لصقه هنا</strong> لتظهر التعديلات فوراً.
          </p>
        </div>

        {/* Tabs: Export vs Import */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-5 text-xs font-black">
          <button
            type="button"
            onClick={() => { setActiveTab('export'); setStatusMsg(null); }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'export'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>1. من جهاز يارا (نسخ / إرسال)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('import'); setStatusMsg(null); }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'import'
                ? 'bg-white text-blue-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-4 h-4 text-blue-600" />
            <span>2. على جهازك (لصق / استلام)</span>
          </button>
        </div>

        {/* Status Alert if any */}
        {statusMsg && (
          <div className={`p-3 rounded-xl mb-4 text-xs font-bold flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-rose-100 text-rose-900 border border-rose-300'
          }`}>
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* TAB 1: EXPORT (من جهاز يارا) */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="font-extrabold text-slate-800 text-xs sm:text-sm">
                الطريقة الأسرع والأسهل عبر الواتساب:
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                اضغطي على الزر الأخضر أدناه لنسخ كود البيانات بالكامل، ثم الصقيه في محادثة الواتساب وأرسليه لأخيكِ:
              </p>

              <button
                type="button"
                onClick={handleCopyCode}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-yellow-300" />
                    <span>تم نسخ الكود بنجاح! الصقيه في الواتساب الآن 📋</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>نسخ كود بيانات يارا بالكامل 📋</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
              <span>أو تنزيل ملف كنسخة احتياطية:</span>
              <button
                type="button"
                onClick={handleDownloadFile}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>تنزيل ملف النسخة (JSON) 📥</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: IMPORT (على جهاز المشرف) */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block font-bold text-slate-700 text-xs">
                الصق كود البيانات الذي أرسلته يارا هنا:
              </label>
              <textarea
                rows="4"
                value={pastedCode}
                onChange={(e) => setPastedCode(e.target.value)}
                placeholder="الصق الكود الطويل هنا (Ctrl+V أو ضغطة مطولة ولصق)..."
                className="w-full p-3 rounded-2xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
              />

              <button
                type="button"
                onClick={handleApplyPastedCode}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>تطبيق وتحديث بيانات يارا على هذا الجهاز فوراً 🚀</span>
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
              <span>أو إذا أرسلت لكِ ملفاً عبر الواتساب:</span>
              <label className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>اختيار الملف واستعادته 📤</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
