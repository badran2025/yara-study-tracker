import React, { useState } from 'react';
import { 
  Award, 
  Plus, 
  Calendar, 
  Clock, 
  Hourglass, 
  Trash2, 
  Home, 
  ArrowRight,
  CheckCircle2, 
  RotateCcw,
  AlertTriangle,
  BookOpen,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { getExamsAuditSummary, getExamCountdown } from '../utils/masteryHelpers';

export default function ExamsCenterView({
  subjects,
  scheduledExams = [],
  onOpenScheduleExamModal,
  onDeleteScheduledExam,
  onOpenTestModal,
  onBackToHome
}) {
  const [auditTab, setAuditTab] = useState('pending'); // 'pending' | 'needs_review' | 'mastered'

  // Real-time audit metrics
  const audit = getExamsAuditSummary(subjects);

  // Sort scheduled exams to get the earliest upcoming one
  const sortedScheduledExams = [...scheduledExams].sort((a, b) => {
    const timeA = new Date(`${a.scheduledDate}T${a.scheduledTime || '18:00'}:00`).getTime();
    const timeB = new Date(`${b.scheduledDate}T${b.scheduledTime || '18:00'}:00`).getTime();
    return timeA - timeB;
  });

  const upcomingExam = sortedScheduledExams[0] || null;
  const countdown = upcomingExam ? getExamCountdown(upcomingExam.scheduledDate, upcomingExam.scheduledTime) : null;

  // Record test handler
  const handleRecordAuditTest = (item) => {
    const sub = subjects.find(s => s.id === item.subjectId);
    if (!sub) return;

    if (item.type === 'unit') {
      onOpenTestModal(sub, {
        id: item.unitId,
        title: `الاختبار النهائي الشامل: ${item.unitTitle}`,
        quiz: item.quiz || null,
        type: 'unit'
      });
    } else {
      onOpenTestModal(sub, {
        id: item.lessonId,
        title: item.lessonTitle,
        quiz: item.quiz || null,
        type: 'lesson'
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-all flex items-center gap-1.5 font-bold text-xs"
            title="العودة للصفحة الرئيسية"
          >
            <Home className="w-4 h-4 text-emerald-600" />
            <span>الرئيسية</span>
          </button>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                🎯 مركز الاختبارات ومراية المتابعة
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                متابعة دقيقة لكل ما تم وما لم يتم اختباره لضمان التفوق والـ 95%
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenScheduleExamModal}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>جدولة موعد اختبار جديد 📅</span>
        </button>
      </div>

      {/* 1. UPCOMING SCHEDULED EXAM & LIVE COUNTDOWN (SUPER BOLD & CLEAR) */}
      {upcomingExam ? (
        <div className="relative overflow-hidden bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border-2 border-indigo-500/40">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-sm font-black px-4 py-1.5 rounded-full bg-yellow-400 text-yellow-950 shadow-md animate-pulse flex items-center gap-2">
                  <Hourglass className="w-4 h-4 text-yellow-950" />
                  <span>{countdown?.text || 'موعد الاختبار القادم'}</span>
                </span>
                <span className="text-xs font-black px-3 py-1 rounded-xl bg-white/15 text-emerald-300 border border-white/20">
                  {upcomingExam.subjectName}
                </span>
                <span className="text-xs font-black px-3 py-1 rounded-xl bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {upcomingExam.targetType === 'unit' ? '🏆 اختبار شامل للفصل' : '📝 اختبار درس'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-wide">
                {upcomingExam.targetTitle}
              </h3>

              {/* HIGH CONTRAST BOLD DATE & TIME INFO BADGES */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="bg-white text-slate-900 font-black text-sm sm:text-base px-4 py-2 rounded-xl shadow-md border-2 border-slate-200 flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>تاريخ الاختبار: <strong className="font-black text-slate-950 underline underline-offset-4 decoration-blue-500">{upcomingExam.scheduledDate}</strong></span>
                </div>

                {upcomingExam.scheduledTime && (
                  <div className="bg-amber-400 text-slate-950 font-black text-sm sm:text-base px-4 py-2 rounded-xl shadow-md border-2 border-amber-300 flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-slate-950" />
                    <span>الساعة / التوقيت: <strong className="font-black text-slate-950">{upcomingExam.scheduledTime}</strong></span>
                  </div>
                )}

                {upcomingExam.notes && (
                  <div className="bg-slate-800/90 text-yellow-200 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-yellow-400/30 flex items-center gap-2">
                    <span>📌 {upcomingExam.notes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-auto shrink-0 pt-2 lg:pt-0">
              <button
                onClick={() => {
                  const sub = subjects.find(s => s.id === upcomingExam.subjectId);
                  if (sub) {
                    onOpenTestModal(sub, {
                      id: upcomingExam.targetId,
                      title: upcomingExam.targetTitle,
                      quiz: null,
                      type: upcomingExam.targetType
                    });
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-600/40 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Award className="w-5 h-5 text-yellow-300" />
                <span>بدء / تسجيل النتيجة ✍️</span>
              </button>

              <button
                onClick={() => onDeleteScheduledExam(upcomingExam.id)}
                title="إلغاء موعد هذا الاختبار"
                className="p-3 bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white rounded-2xl transition-all border border-white/10 hover:border-rose-500"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-base">
                لا يوجد موعد اختبار قادم مجدول حالياً 🌴
              </h4>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                يمكنكِ جدولة موعد اختبار جديد لدرس أو فصل في أي مادة ليظهر بالعد التنازلي.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenScheduleExamModal}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0"
          >
            تحديد موعد اختبار الآن 📅
          </button>
        </div>
      )}

      {/* 2. THE SUPERVISION AUDIT MIRROR (مراية المتابعة والتدقيق الشاملة) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* Section Header & 3 Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setAuditTab('pending')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2.5 ${
                auditTab === 'pending'
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>🔍 دروس وفصول بانتظار الاختبار</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                auditTab === 'pending' ? 'bg-black/20 text-white' : 'bg-amber-100 text-amber-900'
              }`}>
                {audit.totalPending}
              </span>
            </button>

            <button
              onClick={() => setAuditTab('needs_review')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2.5 ${
                auditTab === 'needs_review'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>⚠️ تحتاج مراجعة وإعادة اختبار (&lt; 95%)</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                auditTab === 'needs_review' ? 'bg-black/20 text-white' : 'bg-rose-100 text-rose-900'
              }`}>
                {audit.totalNeedsReview}
              </span>
            </button>

            <button
              onClick={() => setAuditTab('mastered')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2.5 ${
                auditTab === 'mastered'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>🏆 سجل الاختبارات المتقنة (95%+)</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                auditTab === 'mastered' ? 'bg-black/20 text-white' : 'bg-emerald-100 text-emerald-900'
              }`}>
                {audit.totalMastered}
              </span>
            </button>
          </div>

          <span className="text-xs text-slate-400 font-bold hidden xl:inline">
            اضغطي على أي درس أو فصل لتسجيل نتيجته فوراً بنقرة واحدة
          </span>
        </div>

        {/* TAB 1: PENDING EXAMS */}
        {auditTab === 'pending' && (
          <div className="space-y-4">
            {audit.totalPending === 0 ? (
              <div className="p-12 text-center bg-teal-50 border border-teal-200 rounded-3xl space-y-3">
                <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
                <h4 className="font-black text-teal-900 text-lg">
                  ما شاء الله! جميع ما تم دراسته تم اختباره وتقييمه بالكامل 🎉✨
                </h4>
                <p className="text-xs sm:text-sm text-teal-700 font-semibold">
                  لا توجد دروس أو فصول مدروسة متأخرة بدون اختبارات.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                {/* Pending Chapters (Comprehensive Exams) */}
                {audit.pendingUnits.map(item => (
                  <div 
                    key={`unit-${item.unitId}`}
                    className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 hover:border-amber-400 transition-all flex items-center justify-between gap-3 shadow-xs group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          {item.subjectName}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-yellow-100 text-yellow-900 border border-yellow-300">
                          🏆 اختبار شامل للفصل
                        </span>
                      </div>
                      <div className="font-black text-slate-800 text-sm sm:text-base line-clamp-1">
                        {item.unitTitle}
                      </div>
                      <div className="text-xs text-amber-900 font-medium">
                        تمت دراسة {item.metrics.studiedLessons} من {item.metrics.totalLessons} دروس بهذا الفصل
                      </div>
                    </div>

                    <button
                      onClick={() => handleRecordAuditTest(item)}
                      className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                    >
                      <Award className="w-4 h-4" />
                      <span>تسجيل الاختبار الشامل ✍️</span>
                    </button>
                  </div>
                ))}

                {/* Pending Lessons */}
                {audit.pendingLessons.map(item => (
                  <div 
                    key={`lesson-${item.lessonId}`}
                    className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 transition-all flex items-center justify-between gap-3 shadow-xs group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-white border border-slate-200 text-slate-700">
                          {item.subjectName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold line-clamp-1 max-w-[150px]">
                          {item.unitTitle}
                        </span>
                      </div>
                      <div className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1">
                        {item.lessonTitle}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRecordAuditTest(item)}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                    >
                      <span>تسجيل نتيجة الدرس ✍️</span>
                    </button>
                  </div>
                ))}

              </div>
            )}
          </div>
        )}

        {/* TAB 2: NEEDS RETEST (< 95%) */}
        {auditTab === 'needs_review' && (
          <div className="space-y-4">
            {audit.totalNeedsReview === 0 ? (
              <div className="p-12 text-center bg-teal-50 border border-teal-200 rounded-3xl space-y-3">
                <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
                <h4 className="font-black text-teal-900 text-lg">
                  ممتاز جداً! كل الاختبارات محققة لمعيار التفوق (95% فأعلى) 🌟
                </h4>
                <p className="text-xs sm:text-sm text-teal-700 font-semibold">
                  لا توجد دروس أو فصول بحاجة لإعادة اختبار حالياً.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                {/* Needs review units */}
                {audit.needsReviewUnits.map(item => (
                  <div 
                    key={`review-unit-${item.unitId}`}
                    className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 hover:border-rose-400 transition-all flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-rose-100 text-rose-900 border border-rose-300">
                          {item.subjectName}
                        </span>
                        <span className="text-xs font-black text-rose-700 font-mono">
                          النتيجة: {item.quiz.percentage}%
                        </span>
                      </div>
                      <div className="font-black text-slate-800 text-sm line-clamp-1">
                        الاختبار الشامل: {item.unitTitle}
                      </div>
                      {item.quiz.weaknesses && (
                        <div className="text-xs text-rose-900 line-clamp-1 font-medium">
                          📌 {item.quiz.weaknesses}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleRecordAuditTest(item)}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>إعادة الاختبار 🔄</span>
                    </button>
                  </div>
                ))}

                {/* Needs review lessons */}
                {audit.needsReviewLessons.map(item => (
                  <div 
                    key={`review-lesson-${item.lessonId}`}
                    className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 hover:border-amber-400 transition-all flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          {item.subjectName}
                        </span>
                        <span className="text-xs font-black text-amber-700 font-mono">
                          النتيجة: {item.quiz.percentage}%
                        </span>
                      </div>
                      <div className="font-black text-slate-800 text-sm line-clamp-1">
                        {item.lessonTitle}
                      </div>
                      {item.quiz.weaknesses && (
                        <div className="text-xs text-amber-900 line-clamp-1 font-medium">
                          📌 {item.quiz.weaknesses}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleRecordAuditTest(item)}
                      className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>إعادة الاختبار 🔄</span>
                    </button>
                  </div>
                ))}

              </div>
            )}
          </div>
        )}

        {/* TAB 3: MASTERED ITEMS (95%+) */}
        {auditTab === 'mastered' && (
          <div className="space-y-4">
            {audit.totalMastered === 0 ? (
              <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-3xl text-xs sm:text-sm text-slate-400 font-bold">
                لا توجد اختبارات متقنة بتفوق حتى الآن — استمري في التدريب والاجتهاد! 🌸
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {audit.masteredItems.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200 flex items-center justify-between text-xs"
                  >
                    <div className="line-clamp-1">
                      <span className="font-black text-teal-900">{item.subjectName}: </span>
                      <span className="text-slate-800 font-bold">{item.title}</span>
                    </div>
                    <span className="font-black text-teal-700 font-mono shrink-0 mr-2 bg-white px-2.5 py-1 rounded-lg border border-teal-300">
                      {item.quiz.percentage}% 🌟
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
