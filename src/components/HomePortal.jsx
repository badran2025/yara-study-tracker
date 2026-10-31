import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Target, 
  ChevronLeft,
  GraduationCap,
  CalendarClock,
  Award,
  Plus,
  Trash2,
  RotateCcw,
  FileText,
  Check,
  AlertCircle,
  HelpCircle,
  Hourglass
} from 'lucide-react';
import { motivationalQuotes } from '../data/defaultData';
import { getNextUpcomingClass } from '../utils/scheduleHelpers';
import { getExamsAuditSummary, getExamCountdown } from '../utils/masteryHelpers';

export default function HomePortal({ 
  subjects, 
  schedule, 
  scheduledExams = [],
  onNavigateToSubjects, 
  onNavigateToSchedule,
  onSelectSubject,
  onOpenScheduleExamModal,
  onDeleteScheduledExam,
  onOpenTestModal,
  isAdmin
}) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [auditTab, setAuditTab] = useState('pending'); // 'pending' | 'needs_review' | 'mastered'

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  // Compute aggregate stats across all subjects
  let totalLessons = 0;
  let studiedLessons = 0;
  let masteredLessons = 0;
  let needsReviewLessons = 0;

  subjects.forEach(subject => {
    subject.units.forEach(unit => {
      unit.lessons.forEach(lesson => {
        totalLessons++;
        if (lesson.isStudied === true) {
          studiedLessons++;
        }
        if (lesson.quiz && lesson.quiz.percentage >= 95) {
          masteredLessons++;
        }
        if (lesson.quiz && lesson.quiz.percentage < 95) {
          needsReviewLessons++;
        }
      });
    });
  });

  const completionPercent = totalLessons > 0 
    ? Math.round((masteredLessons / totalLessons) * 100) 
    : 0;

  // Real-time Next upcoming class from schedule (calculated by date & time)
  const nextClassInfo = getNextUpcomingClass(schedule, subjects);

  // Real-time Exams Audit Summary
  const audit = getExamsAuditSummary(subjects);

  // Find the earliest upcoming scheduled exam
  const sortedScheduledExams = [...scheduledExams].sort((a, b) => {
    const timeA = new Date(`${a.scheduledDate}T${a.scheduledTime || '18:00'}:00`).getTime();
    const timeB = new Date(`${b.scheduledDate}T${b.scheduledTime || '18:00'}:00`).getTime();
    return timeA - timeB;
  });

  const upcomingExam = sortedScheduledExams[0] || null;
  const countdown = upcomingExam ? getExamCountdown(upcomingExam.scheduledDate, upcomingExam.scheduledTime) : null;

  // Handler to open test recording modal directly from audit item
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
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Motivational & Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 sm:p-8 shadow-xl shadow-emerald-700/10">
        <div className="absolute -left-12 -bottom-12 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
        <div className="absolute right-10 -top-10 w-40 h-40 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-black backdrop-blur-md border border-white/10">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>مرحباً بكِ يا يارا 🌸 | عام التميز وتحقيق الأحلام</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight text-white">
              خطوة كل يوم تصنع <span className="text-yellow-300">تفوق الغد</span> بإذن الله
            </h2>
            
            <p className="text-sm sm:text-base text-emerald-50 max-w-2xl font-medium leading-relaxed">
              {motivationalQuotes[quoteIndex]}
            </p>
          </div>

          {/* Quick Progress Dial */}
          <div className="flex items-center gap-4 bg-black/25 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15 shrink-0">
            <div className="text-right">
              <div className="text-xs text-emerald-200 font-bold">نسبة إتقان المنهج</div>
              <div className="text-2xl font-black text-white">{completionPercent}%</div>
              <div className="text-[11px] text-emerald-100 font-semibold">{masteredLessons} من {totalLessons} درس متقن</div>
            </div>
            <div className="w-14 h-14 relative flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  className="text-white/20"
                  strokeWidth="6"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  className="text-yellow-300 transition-all duration-1000 ease-out"
                  strokeWidth="6"
                  strokeDasharray={144.5}
                  strokeDashoffset={144.5 - (144.5 * completionPercent) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">
                {completionPercent}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Three Navigation Portals (المواد الدراسية | الدروس الخصوصية | مركز الاختبارات) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800">
              بوابات المتابعة الرئيسية الثلاث 🚀
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
              المناهج الدراسية، جدول الحصص الأسبوعية، ومركز الاختبارات والتقييمات
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: المواد الدراسية */}
          <div 
            onClick={onNavigateToSubjects}
            className="group relative bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-emerald-500 shadow-md hover:shadow-2xl hover:shadow-emerald-600/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 transition-transform group-hover:scale-125 duration-300"></div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7" />
                </div>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {subjects.length} مواد مقررة
                </span>
              </div>

              <div>
                <h4 className="text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                  📚 المواد الدراسية
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 leading-relaxed">
                  فهرس الفصول والدروس، مكان التوقف الحالي، وتحديد ما تمت دراسته ومراجعته.
                </p>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-bold text-[11px]">المدروس</div>
                  <div className="text-slate-800 font-black text-base mt-0.5">{studiedLessons}</div>
                </div>
                <div className="bg-teal-50 p-2 rounded-xl border border-teal-100">
                  <div className="text-teal-700 font-bold text-[11px]">متقن (95%+)</div>
                  <div className="text-teal-800 font-black text-base mt-0.5">{masteredLessons}</div>
                </div>
                <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                  <div className="text-amber-700 font-bold text-[11px]">مراجعة</div>
                  <div className="text-amber-800 font-black text-base mt-0.5">{needsReviewLessons}</div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-5 mt-4 flex items-center justify-between border-t border-slate-100 text-emerald-700 font-extrabold text-sm group-hover:text-emerald-800">
              <span className="flex items-center gap-1.5">
                <span>تصفح المواد وفهرس الفصول</span>
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:-translate-x-1">
                <ArrowLeft className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Card 2: الدروس الخصوصية */}
          <div 
            onClick={onNavigateToSchedule}
            className="group relative bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-blue-500 shadow-md hover:shadow-2xl hover:shadow-blue-600/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 transition-transform group-hover:scale-125 duration-300"></div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform">
                  <Calendar className="w-7 h-7" />
                </div>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-300">
                  {schedule.length} حصص أسبوعية
                </span>
              </div>

              <div>
                <h4 className="text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                  📅 الدروس الخصوصية
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 leading-relaxed">
                  جدول المواعيد الأسبوعية، أسماء المدرسين، المراكز، وتحديث الحصص القادمة.
                </p>
              </div>

              {/* Next Class Highlight */}
              <div className="bg-blue-50/90 border border-blue-200/90 rounded-2xl p-3.5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-blue-900">
                    <CalendarClock className="w-4 h-4 text-blue-600" />
                    <span>الحصة القادمة:</span>
                  </div>
                  {nextClassInfo && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-600 text-white shadow-2xs">
                      {nextClassInfo.relativeDay}
                    </span>
                  )}
                </div>

                {nextClassInfo ? (
                  <div className="space-y-1.5 pt-1 border-t border-blue-200/60">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-black text-slate-900">
                        {nextClassInfo.subjectName}
                      </span>
                      <span className="font-bold text-slate-600 text-xs">
                        {nextClassInfo.teacher}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs pt-0.5">
                      <span className="font-black text-blue-900 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
                        ⏰ {nextClassInfo.formattedTime}
                      </span>
                      {nextClassInfo.location && (
                        <span className="text-slate-500 font-semibold text-[11px]">
                          📍 {nextClassInfo.location}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-1 font-semibold">لا توجد حصص مسجلة حالياً</div>
                )}
              </div>
            </div>

            <div className="relative z-10 pt-5 mt-4 flex items-center justify-between border-t border-slate-100 text-blue-700 font-extrabold text-sm group-hover:text-blue-800">
              <span className="flex items-center gap-1.5">
                <span>عرض ومتابعة جدول الحصص</span>
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:-translate-x-1">
                <ArrowLeft className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Card 3: مركز الاختبارات (NEW HORIZONTAL TAB) */}
          <div 
            onClick={() => {
              const el = document.getElementById('exam-center-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="group relative bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-amber-500 shadow-md hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-0 transition-transform group-hover:scale-125 duration-300"></div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <Award className="w-7 h-7" />
                </div>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                  {audit.totalPending} بانتظار الاختبار
                </span>
              </div>

              <div>
                <h4 className="text-2xl font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                  🎯 مركز الاختبارات
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 leading-relaxed">
                  العد التنازلي للاختبار، مراية التدقيق، وتسجيل نتائج الدروس والفصول الشاملة.
                </p>
              </div>

              {/* Upcoming Exam Highlight Box */}
              <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3.5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                    <Hourglass className="w-4 h-4 text-amber-600" />
                    <span>الاختبار القادم:</span>
                  </div>
                  {upcomingExam && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-600 text-white shadow-2xs animate-pulse">
                      {countdown?.text || 'قريباً'}
                    </span>
                  )}
                </div>

                {upcomingExam ? (
                  <div className="space-y-2 pt-1 border-t border-amber-200/70">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-black text-slate-900 line-clamp-1">
                        {upcomingExam.targetTitle}
                      </span>
                      <span className="font-bold text-amber-900 text-xs px-2 py-0.5 bg-amber-100 rounded-md shrink-0 mr-1 border border-amber-300">
                        {upcomingExam.subjectName}
                      </span>
                    </div>

                    {/* BOLD, HIGH CONTRAST DATE & TIME BADGES */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="font-black text-slate-950 bg-white px-2.5 py-1 rounded-lg border-2 border-slate-300 shadow-xs text-xs flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>تاريخ: <strong className="font-black text-slate-900">{upcomingExam.scheduledDate}</strong></span>
                      </span>
                      {upcomingExam.scheduledTime && (
                        <span className="font-black text-slate-950 bg-amber-300 px-2.5 py-1 rounded-lg border border-amber-400 shadow-xs text-xs flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-950" />
                          <span>الساعة: <strong className="font-black text-slate-950">{upcomingExam.scheduledTime}</strong></span>
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-amber-900/80 font-bold py-1 flex items-center justify-between">
                    <span>لا يوجد اختبار مجدول حالياً</span>
                    <span className="text-[11px] text-amber-700 underline font-black">جدولة اختبار 📅</span>
                  </div>
                )}
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                  <div className="text-amber-800 font-bold text-[10px]">بانتظار الاختبار</div>
                  <div className="text-amber-950 font-black text-base mt-0.5">{audit.totalPending}</div>
                </div>
                <div className="bg-rose-50 p-2 rounded-xl border border-rose-100">
                  <div className="text-rose-700 font-bold text-[10px]">بحاجة لمراجعة</div>
                  <div className="text-rose-900 font-black text-base mt-0.5">{audit.totalNeedsReview}</div>
                </div>
                <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                  <div className="text-emerald-700 font-bold text-[10px]">متقن (95%+)</div>
                  <div className="text-emerald-900 font-black text-base mt-0.5">{audit.totalMastered}</div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-5 mt-4 flex items-center justify-between border-t border-slate-100 text-amber-700 font-extrabold text-sm group-hover:text-amber-800">
              <span className="flex items-center gap-1.5">
                <span>مراية المتابعة والتدقيق</span>
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all transform group-hover:-translate-x-1">
                <ArrowLeft className="w-5 h-5" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* NEW SECTION: مركز الاختبارات والتقييمات الذكية | مراية متابعة يارا 🎯 */}
      <div id="exam-center-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-lg sm:text-2xl">
                  مركز الاختبارات والتقييمات | مراية المتابعة 🎯
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-bold mt-0.5">
                العد التنازلي للاختبار القادم، ومتابعة الدروس والفصول التي لم تُختبر بعد لضمان التفوق الكامل.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenScheduleExamModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>جدولة موعد اختبار جديد 📅</span>
          </button>
        </div>

        {/* 1. UPCOMING SCHEDULED EXAM & LIVE COUNTDOWN (SUPER BOLD & CLEAR) */}
        {upcomingExam ? (
          <div className="relative overflow-hidden bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border-2 border-indigo-500/40">
            <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

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

                <h4 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-wide">
                  {upcomingExam.targetTitle}
                </h4>

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
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">
                  لا يوجد موعد اختبار قادم مجدول حالياً 🌴
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  يمكنكِ جدولة موعد اختبار جديد لدرس أو فصل في أي مادة ليظهر بالعد التنازلي.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenScheduleExamModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
            >
              تحديد موعد اختبار الآن 📅
            </button>
          </div>
        )}

        {/* 2. THE SUPERVISION AUDIT MIRROR (مراية المتابعة والتدقيق) */}
        <div className="space-y-4 pt-2">
          
          {/* Audit Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setAuditTab('pending')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                  auditTab === 'pending'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>🔍 دروس وفصول بانتظار الاختبار</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  auditTab === 'pending' ? 'bg-black/20 text-white' : 'bg-amber-100 text-amber-800 font-black'
                }`}>
                  {audit.totalPending}
                </span>
              </button>

              <button
                onClick={() => setAuditTab('needs_review')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                  auditTab === 'needs_review'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>⚠️ تحتاج مراجعة وإعادة اختبار (&lt; 95%)</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  auditTab === 'needs_review' ? 'bg-black/20 text-white' : 'bg-rose-100 text-rose-800 font-black'
                }`}>
                  {audit.totalNeedsReview}
                </span>
              </button>

              <button
                onClick={() => setAuditTab('mastered')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                  auditTab === 'mastered'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>🏆 سجل الاختبارات المتقنة (95%+)</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  auditTab === 'mastered' ? 'bg-black/20 text-white' : 'bg-emerald-100 text-emerald-800 font-black'
                }`}>
                  {audit.totalMastered}
                </span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-semibold hidden lg:inline">
              اضغطي على أي درس أو فصل لتسجيل نتيجته فوراً بنقرة واحدة
            </span>
          </div>

          {/* TAB 1: PENDING EXAMS (دروس وفصول تمت دراستها ولم تختبر بعد) */}
          {auditTab === 'pending' && (
            <div className="space-y-3">
              {audit.totalPending === 0 ? (
                <div className="p-8 text-center bg-teal-50 border border-teal-200 rounded-2xl space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto" />
                  <h4 className="font-black text-teal-900 text-base">
                    ما شاء الله! جميع ما تم دراسته تم اختباره وتقييمه بالكامل 🎉✨
                  </h4>
                  <p className="text-xs text-teal-700 font-semibold">
                    لا توجد دروس أو فصول مدروسة متأخرة بدون اختبارات.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  
                  {/* Pending Chapters (Comprehensive Exams) */}
                  {audit.pendingUnits.map(item => (
                    <div 
                      key={`unit-${item.unitId}`}
                      className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/90 hover:border-amber-400 transition-all flex items-center justify-between gap-3 shadow-2xs group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                            {item.subjectName}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-yellow-100 text-yellow-900 border border-yellow-300">
                            🏆 اختبار شامل للفصل
                          </span>
                        </div>
                        <div className="font-extrabold text-slate-800 text-xs sm:text-sm line-clamp-1">
                          {item.unitTitle}
                        </div>
                        <div className="text-[11px] text-amber-800 font-medium">
                          تمت دراسة {item.metrics.studiedLessons} من {item.metrics.totalLessons} دروس بهذا الفصل
                        </div>
                      </div>

                      <button
                        onClick={() => handleRecordAuditTest(item)}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>تسجيل الاختبار الشامل ✍️</span>
                      </button>
                    </div>
                  ))}

                  {/* Pending Lessons */}
                  {audit.pendingLessons.map(item => (
                    <div 
                      key={`lesson-${item.lessonId}`}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 transition-all flex items-center justify-between gap-3 shadow-2xs group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-white border border-slate-200 text-slate-700">
                            {item.subjectName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold line-clamp-1 max-w-[150px]">
                            {item.unitTitle}
                          </span>
                        </div>
                        <div className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1">
                          {item.lessonTitle}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRecordAuditTest(item)}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0"
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
            <div className="space-y-3">
              {audit.totalNeedsReview === 0 ? (
                <div className="p-8 text-center bg-teal-50 border border-teal-200 rounded-2xl space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto" />
                  <h4 className="font-black text-teal-900 text-base">
                    ممتاز جداً! كل الاختبارات محققة لمعيار التفوق (95% فأعلى) 🌟
                  </h4>
                  <p className="text-xs text-teal-700 font-semibold">
                    لا توجد دروس أو فصول بحاجة لإعادة اختبار حالياً.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  
                  {/* Needs review units */}
                  {audit.needsReviewUnits.map(item => (
                    <div 
                      key={`review-unit-${item.unitId}`}
                      className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 hover:border-rose-400 transition-all flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-900 border border-rose-300">
                            {item.subjectName}
                          </span>
                          <span className="text-xs font-black text-rose-700 font-mono">
                            النتيجة: {item.quiz.percentage}%
                          </span>
                        </div>
                        <div className="font-extrabold text-slate-800 text-xs sm:text-sm line-clamp-1">
                          الاختبار الشامل: {item.unitTitle}
                        </div>
                        {item.quiz.weaknesses && (
                          <div className="text-[11px] text-rose-900 line-clamp-1">
                            📌 {item.quiz.weaknesses}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleRecordAuditTest(item)}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0"
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
                      className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 hover:border-amber-400 transition-all flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                            {item.subjectName}
                          </span>
                          <span className="text-xs font-black text-amber-700 font-mono">
                            النتيجة: {item.quiz.percentage}%
                          </span>
                        </div>
                        <div className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1">
                          {item.lessonTitle}
                        </div>
                        {item.quiz.weaknesses && (
                          <div className="text-[11px] text-amber-900 line-clamp-1">
                            📌 {item.quiz.weaknesses}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleRecordAuditTest(item)}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0"
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
            <div className="space-y-3">
              {audit.totalMastered === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-400">
                  لا توجد اختبارات متقنة بتفوق حتى الآن — استمري في التدريب والاجتهاد! 🌸
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {audit.masteredItems.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl bg-teal-50/50 border border-teal-200 flex items-center justify-between text-xs"
                    >
                      <div className="line-clamp-1">
                        <span className="font-black text-teal-900">{item.subjectName}: </span>
                        <span className="text-slate-800 font-semibold">{item.title}</span>
                      </div>
                      <span className="font-black text-teal-700 font-mono shrink-0 mr-2 bg-white px-2 py-0.5 rounded border border-teal-300">
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

    </div>
  );
}
