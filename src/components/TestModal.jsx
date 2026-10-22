import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Percent, 
  Calendar,
  FileText,
  Flame,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TestModal({ 
  isOpen, 
  onClose, 
  subject, 
  lesson, 
  onSaveQuiz 
}) {
  if (!isOpen || !lesson) return null;

  const existingQuiz = lesson.quiz || {};

  const [inputMode, setInputMode] = useState('percentage'); // 'percentage' | 'raw'
  const [percentage, setPercentage] = useState(existingQuiz.percentage || 95);
  const [rawScore, setRawScore] = useState(existingQuiz.score || 19);
  const [totalScore, setTotalScore] = useState(existingQuiz.totalScore || 20);
  const [date, setDate] = useState(existingQuiz.date || new Date().toISOString().split('T')[0]);
  const [weaknesses, setWeaknesses] = useState(existingQuiz.weaknesses || '');
  const [geminiFeedback, setGeminiFeedback] = useState(existingQuiz.geminiFeedback || '');

  // Calculate effective percentage
  const currentPercentage = inputMode === 'percentage' 
    ? Number(percentage) 
    : (totalScore > 0 ? Math.round((Number(rawScore) / Number(totalScore)) * 100) : 0);

  const isPassed = currentPercentage >= 95;

  const handleSubmit = (e) => {
    e.preventDefault();

    const quizData = {
      date,
      score: inputMode === 'raw' ? Number(rawScore) : currentPercentage,
      totalScore: inputMode === 'raw' ? Number(totalScore) : 100,
      percentage: currentPercentage,
      passed: isPassed,
      weaknesses: weaknesses.trim(),
      geminiFeedback: geminiFeedback.trim()
    };

    if (isPassed) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore confetti errors
      }
    }

    onSaveQuiz(subject.id, lesson.id, quizData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-emerald-100 text-emerald-800">
                {subject?.name}
              </span>
              <span className="text-xs text-slate-400 font-bold">
                تقييم الدرس واختبار Gemini
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              {lesson.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-5 mt-4 text-xs">
          
          {/* Score Calculation Mode Toggle */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">طريقة إدخال الدرجة:</span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px]">
                <button
                  type="button"
                  onClick={() => setInputMode('percentage')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    inputMode === 'percentage'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  نسبة مئوية مباشرة (%)
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('raw')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    inputMode === 'raw'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  درجة من مجموع (مثال 19 من 20)
                </button>
              </div>
            </div>

            {/* Inputs based on mode */}
            {inputMode === 'percentage' ? (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  النسبة المئوية النهائية من تحليل جيمناي:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    className="w-full p-2.5 pl-10 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-black text-lg text-slate-800 outline-none"
                    placeholder="مثال: 95"
                    required
                  />
                  <Percent className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الدرجة التي حصلت عليها:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={rawScore}
                    onChange={(e) => setRawScore(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-black text-base text-slate-800 outline-none"
                    placeholder="مثال: 19"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المجموع الكلي للاختبار:</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={totalScore}
                    onChange={(e) => setTotalScore(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-black text-base text-slate-800 outline-none"
                    placeholder="مثال: 20"
                    required
                  />
                </div>
              </div>
            )}

            {/* Live Threshold Verdict Banner */}
            <div className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
              isPassed 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}>
              <div className="flex items-center gap-2.5">
                {isPassed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                <div>
                  <div className="font-black text-xs sm:text-sm">
                    {isPassed 
                      ? '🎉 النتيجة 95% فما فوق: الدرس مجتاز ومتقن بتفوق!' 
                      : '⚠️ النتيجة أقل من 95%: الدرس سيُصنف كـ "يحتاج مراجعة"'}
                  </div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    {isPassed 
                      ? 'تم تحقيق معيار الإتقان الكامل بنجاح.' 
                      : 'سيتم إضافة الدرس لقسم المراجعات الذكية حتى معالجة أوجه القصور.'}
                  </div>
                </div>
              </div>

              <div className={`text-xl font-black shrink-0 ${isPassed ? 'text-emerald-700' : 'text-amber-700'}`}>
                {currentPercentage}%
              </div>
            </div>

          </div>

          {/* Weaknesses from Gemini (Mandatory especially if < 95%) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>أوجه القصور والمفاهيم المطلوب مراجعتها (من تحليل جيمناي):</span>
              </label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                !isPassed ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-slate-400'
              }`}>
                {!isPassed ? 'مهم جداً للتحسين' : 'اختياري'}
              </span>
            </div>

            <textarea
              rows={4}
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
              placeholder="انسخ هنا النقاط التي حددها جيمناي/NotebookLM بعد تصحيح الاختبار، مثل:&#10;1. خطأ في استخدام قانون كيرشوف الثاني في المسار المغلق.&#10;2. الارتباك في تحديد إشارة القوة الدافعة الكهربية للبطارية.&#10;3. تحتاج حل 3 مسائل إضافية للتدريب."
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-slate-800 outline-none leading-relaxed resize-none text-xs"
              required={!isPassed}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              ستظهر هذه النقاط بوضوح لأختك في قسم المراجعات لتسهيل التركيز عليها وإعادة اختبارها.
            </p>
          </div>

          {/* Additional Feedback / Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                تاريخ إجراء الاختبار:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-slate-800 outline-none text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                ملاحظة تشجيعية عامة (اختياري):
              </label>
              <input
                type="text"
                value={geminiFeedback}
                onChange={(e) => setGeminiFeedback(e.target.value)}
                placeholder="مثال: أحسنتِ جداً ومستواك في تقدم رائع!"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-slate-800 outline-none text-xs"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>حفظ نتيجة الاختبار وتحديث حالة الدرس</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
