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
  Award,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TestModal({ 
  isOpen, 
  onClose, 
  subject, 
  target,
  lesson, 
  onSaveQuiz,
  onDeleteQuiz 
}) {
  const targetItem = target || (lesson ? { id: lesson.id, title: lesson.title, quiz: lesson.quiz, type: 'lesson' } : null);
  
  if (!isOpen || !targetItem) return null;

  const existingQuiz = targetItem.quiz || {};
  const isUnitExam = targetItem.type === 'unit';

  const [inputMode, setInputMode] = useState('percentage'); // 'percentage' | 'raw'
  const [percentage, setPercentage] = useState(existingQuiz.percentage || 95);
  const [rawScore, setRawScore] = useState(existingQuiz.score || 19);
  const [totalScore, setTotalScore] = useState(existingQuiz.totalScore || 20);
  const [date, setDate] = useState(existingQuiz.date || new Date().toISOString().split('T')[0]);
  const [weaknesses, setWeaknesses] = useState(existingQuiz.weaknesses || '');
  const [geminiFeedback, setGeminiFeedback] = useState(existingQuiz.geminiFeedback || '');

  // Reset form when targetItem changes
  useEffect(() => {
    if (targetItem) {
      const q = targetItem.quiz || {};
      setPercentage(q.percentage !== undefined ? q.percentage : 95);
      setRawScore(q.score !== undefined ? q.score : 19);
      setTotalScore(q.totalScore !== undefined ? q.totalScore : 20);
      setDate(q.date || new Date().toISOString().split('T')[0]);
      setWeaknesses(q.weaknesses || '');
      setGeminiFeedback(q.geminiFeedback || '');
    }
  }, [targetItem?.id]);

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

    onSaveQuiz(subject.id, targetItem.id, quizData, targetItem.type || 'lesson');
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
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black ${
                isUnitExam ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'
              }`}>
                {isUnitExam ? '🏆 اختبار نهائي شامل للفصل' : '📝 اختبار درس'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1.5 leading-snug">
              {targetItem.title}
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
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  نسبة مئوية (%)
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('raw')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    inputMode === 'raw' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  درجة فعلية (من إجمالي)
                </button>
              </div>
            </div>

            {/* Input by percentage */}
            {inputMode === 'percentage' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">النسبة المئوية:</span>
                  <span className="font-black text-lg text-emerald-700 font-mono">
                    {percentage}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={percentage}
                  onChange={(e) => setPercentage(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span className="text-emerald-600 font-bold">95% (معيار التفوق)</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            {/* Input by raw score */}
            {inputMode === 'raw' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">الدرجة المحققة:</label>
                  <input
                    type="number"
                    min="0"
                    max={totalScore}
                    value={rawScore}
                    onChange={(e) => setRawScore(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-center text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">الدرجة الكلية للاختبار:</label>
                  <input
                    type="number"
                    min="1"
                    value={totalScore}
                    onChange={(e) => setTotalScore(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-center text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Test Status & Grade Badge */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isPassed 
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' 
              : 'bg-amber-50/80 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-center gap-2.5">
              {isPassed ? (
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <Award className="w-5 h-5 text-yellow-300" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              <div>
                <div className="font-extrabold text-sm">
                  {isPassed ? 'متقن بتفوق (95% فأعلى) 🌟' : 'يحتاج مراجعة وتدريب إضافي ⚠️'}
                </div>
                <div className="text-[11px] opacity-80">
                  {isPassed 
                    ? (isUnitExam ? 'اجتياز ممتاز لاختبار الفصل الشامل!' : 'ممتاز جداً! تم استيعاب أفكار الدرس بنجاح.') 
                    : 'النتيجة أقل من معيار التفوق؛ يُنصح بإعادة التدريب.'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black font-mono">
                {currentPercentage}%
              </span>
            </div>
          </div>

          {/* Date of Test */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>تاريخ إجراء الاختبار:</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 font-bold"
              required
            />
          </div>

          {/* Weaknesses / Mistakes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>أوجه القصور والأسئلة التي أخطأت فيها يارا (اختياري):</span>
            </label>
            <textarea
              rows="2"
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
              placeholder="مثال: الخلط بين المقصور والمنقوص، أو نسيان قانون كيرشوف الثاني..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
            />
          </div>

          {/* AI / Teacher Recommendation */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              <span>توصية المعلم / تقييم الذكاء الاصطناعي (Gemini Feedback):</span>
            </label>
            <textarea
              rows="2"
              value={geminiFeedback}
              onChange={(e) => setGeminiFeedback(e.target.value)}
              placeholder="مثال: مراجعة حل 10 مسائل تطبيقية على الجزئية لضمان تثبيت المعلومة."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-4 border-t border-slate-100">
            {targetItem.quiz ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`هل تريد بالتأكيد إلغاء وحذف نتيجة اختبار: "${targetItem.title}"؟`)) {
                    onDeleteQuiz(subject.id, targetItem.id, targetItem.type || 'lesson');
                    onClose();
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>حذف / إلغاء الاختبار 🗑️</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
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
                <span>حفظ نتيجة الاختبار</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
