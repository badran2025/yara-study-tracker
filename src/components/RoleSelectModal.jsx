import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  CalendarClock, 
  Award,
  ArrowLeft,
  Check
} from 'lucide-react';

export default function RoleSelectModal({ isOpen, onSelectRole }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-6 my-auto animate-in zoom-in-95">
        
        {/* Header Icon & Title */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 mx-auto">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            مرحباً بكِ في مِنَصّة إنجَاز 🌸
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-bold max-w-md mx-auto">
            منصة المتابعة والتفوق الدراسي لشهادة الثانوية العامة. يرجى اختيار وضع الدخول للمتابعة:
          </p>
        </div>

        {/* Two Big Role Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right">
          
          {/* Card 1: وضع يارا 🌸 */}
          <div 
            onClick={() => onSelectRole('yara')}
            className="group relative bg-gradient-to-b from-rose-50/70 to-white hover:to-rose-50/40 p-6 rounded-3xl border-2 border-rose-200 hover:border-rose-500 shadow-sm hover:shadow-xl hover:shadow-rose-500/15 cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-yellow-200" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                  وضع المذاكرة والتفوق
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-rose-600 transition-colors">
                  أنا يارا 🌸
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  متابعة الدروس، تحديد ما تم إنجازه، مكان التوقف، والاختبارات الذكية.
                </p>
              </div>

              <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>تحديد الدروس المدروسة بنقرة واحدة</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>معرفة الحصة القادمة ومكان التوقف</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>اختبارات ذكية لتحقيق 95% فأعلى</span>
                </li>
              </ul>
            </div>

            <button 
              className="w-full py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-rose-500/30 flex items-center justify-center gap-2 transition-all group-hover:scale-102"
            >
              <span>الدخول في وضع يارا 🌸</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: وضع الإشراف 🛡️ */}
          <div 
            onClick={() => onSelectRole('admin')}
            className="group relative bg-gradient-to-b from-emerald-50/70 to-white hover:to-emerald-50/40 p-6 rounded-3xl border-2 border-emerald-200 hover:border-emerald-600 shadow-sm hover:shadow-xl hover:shadow-emerald-600/15 cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-emerald-100" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  لوحة المتابعة الشاملة
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                  أنا المشرف 🛡️
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  الإشراف والمتابعة، جدولة الاختبارات، تعديل المدرسين والمراكز، وتدقيق النتائج.
                </p>
              </div>

              <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>مراية التدقيق لمتابعة ما لم يُختبر</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>جدولة مواعيد الاختبارات بالعد التنازلي</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تعديل المناهج والحصص والمدرسين</span>
                </li>
              </ul>
            </div>

            <button 
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all group-hover:scale-102"
            >
              <span>الدخول في وضع الإشراف 🛡️</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-slate-400 font-semibold pt-1">
          💡 ملحوظة: يمكنكِ التبديل بين الوضعين بسهولة في أي وقت من أعلى الشاشة 🔄
        </p>

      </div>
    </div>
  );
}
