import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  RotateCw, 
  BookOpen, 
  ExternalLink,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

export default function RevisionsView({ 
  subjects, 
  isAdmin, 
  onOpenTestModal,
  onNavigateToSubject
}) {
  // Aggregate all lessons needing review across all subjects
  const reviewLessons = [];

  subjects.forEach(subject => {
    subject.units.forEach(unit => {
      unit.lessons.forEach(lesson => {
        if (lesson.status === 'needs_review' || (lesson.quiz && lesson.quiz.percentage < 95)) {
          reviewLessons.push({
            subject,
            unit,
            lesson
          });
        }
      });
    });
  });

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm bg-gradient-to-l from-amber-500/10 via-amber-50/50 to-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-800">
                  قسم المراجعات الذكية (Smart Revision Hub)
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                  {reviewLessons.length} دروس تحت المراجعة
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                تجميع تلقائي لكل الدروس التي حصلت على أقل من <span className="font-bold text-amber-800">95%</span> في اختبارات Gemini / NotebookLM مع تفصيل أوجه القصور.
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold text-amber-900 bg-amber-100/80 px-3.5 py-2 rounded-xl border border-amber-200 self-start md:self-auto">
            💡 هدفنا: تحويل كل هذه الدروس إلى 95%+ بإذن الله!
          </div>
        </div>
      </div>

      {/* Review Lessons Grid */}
      {reviewLessons.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">ما شاء الله! لا توجد دروس تحتاج مراجعة حالياً 🎉</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              جميع الدروس التي تم اختبارها اجتازت معيار التفوق بنسبة 95% فما فوق. استمري في هذا التألق!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reviewLessons.map(({ subject, unit, lesson }) => (
            <div 
              key={lesson.id}
              className="bg-white rounded-2xl p-5 border-2 border-amber-300 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                
                {/* Left/Main Column: Subject, Lesson Name & Weaknesses */}
                <div className="space-y-3 flex-1">
                  
                  {/* Badges & Meta */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span 
                      onClick={() => onNavigateToSubject(subject.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
                    >
                      {subject.name}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {unit.title}
                    </span>
                    <span className="mr-auto lg:mr-0 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-700 border border-rose-300">
                      النتيجة: {lesson.quiz?.percentage}% (أقل من 95%)
                    </span>
                  </div>

                  {/* Lesson Title */}
                  <h3 className="text-lg font-black text-slate-900 leading-snug">
                    {lesson.title}
                  </h3>

                  {/* Gemini Weakness Points Box */}
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-900">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>تقرير جيمناي: أوجه القصور والمفاهيم التي يجب مراجعتها</span>
                    </div>

                    <p className="text-xs sm:text-sm text-amber-950 leading-relaxed whitespace-pre-line font-medium pr-2">
                      {lesson.quiz?.weaknesses || "لا توجد ملاحظات تفصيلية مسجلة."}
                    </p>

                    {lesson.quiz?.geminiFeedback && (
                      <div className="text-xs text-slate-600 pt-2 border-t border-amber-200/60">
                        <span className="font-bold text-slate-700">توجيه إضافي: </span>
                        {lesson.quiz.geminiFeedback}
                      </div>
                    )}
                  </div>

                </div>

                {/* Right Column: Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2 shrink-0 lg:w-48 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {isAdmin && (
                    <button
                      onClick={() => onOpenTestModal(subject, lesson)}
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>إعادة الاختبار الآن 📝</span>
                    </button>
                  )}

                  <button
                    onClick={() => onNavigateToSubject(subject.id)}
                    className="w-full px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>عرض فهرس المادة</span>
                  </button>

                  <div className="text-[11px] text-center text-slate-400 font-medium mt-1">
                    تاريخ آخر اختبار: {lesson.quiz?.date || "غير محدد"}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Strategy / NotebookLM Tips Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-yellow-400/20 text-yellow-300 rounded-xl">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 className="font-black text-base text-white">
            طريقة المراجعة الفعالة بواسطة NotebookLM وجيمناي:
          </h3>
        </div>
        <ul className="text-xs sm:text-sm text-slate-300 space-y-2 list-disc list-inside leading-relaxed pr-2">
          <li>افتحي مذكرة الدرس في Google NotebookLM أو ارفعي له ملخص الدرس.</li>
          <li>اطلبي منه: <span className="text-yellow-300 font-mono">"اختبرني في النقاط التي أخطأت فيها وركّز على [أوجه القصور المسجلة أعلاه]"</span>.</li>
          <li>بعد إنهاء الاختبار، اطلبي من جيمناي تقييم الإجابات وإعطاء النسبة المئوية وقائمة بأي نقطة تحتاج مراجعة.</li>
          <li>عند تحقيق 95% أو أعلى، قوموا بتسجيل النتيجة هنا لتنتقل المادة تلقائياً إلى "المتقن بتفوق"!</li>
        </ul>
      </div>

    </div>
  );
}
