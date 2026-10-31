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
  onNavigateToExams,
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
      
      {/* Motivational & Welcome Banner with Famous Scientists & Philosophers Quotes */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 sm:p-8 shadow-xl shadow-emerald-700/10">
        <div className="absolute -left-12 -bottom-12 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
        <div className="absolute right-10 -top-10 w-40 h-40 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-right flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-black backdrop-blur-md border border-white/10">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>مرحباً بكِ يا يارا 🌸 | عام التميز وتحقيق الأحلام</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight text-white">
              خطوة كل يوم تصنع <span className="text-yellow-300">تفوق الغد</span> بإذن الله
            </h2>
            
            {/* Scientist / Philosopher Quote */}
            <div className="pt-1 space-y-2">
              <p className="text-sm sm:text-base lg:text-lg text-emerald-50 max-w-2xl font-bold leading-relaxed">
                <span className="text-yellow-300 text-xl font-serif">« </span>
                <span>{motivationalQuotes[quoteIndex]?.quote || motivationalQuotes[quoteIndex]}</span>
                <span className="text-yellow-300 text-xl font-serif"> »</span>
              </p>
              {motivationalQuotes[quoteIndex]?.author && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/25 text-yellow-300 text-xs font-black border border-white/15 backdrop-blur-xs">
                  <span>— {motivationalQuotes[quoteIndex].author}</span>
                  <span className="text-emerald-200 text-[10px] font-semibold">({motivationalQuotes[quoteIndex].category})</span>
                </div>
              )}
            </div>
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

      {/* 🚨 UNMISSABLE URGENT UPCOMING EXAM ALERT HERO BANNER (لو في امتحان يظهر فورا بأعلى الصفحة بشكل مستحيل يفوت يارا!) */}
      {upcomingExam && (
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-2xl border-3 border-rose-500 ring-4 ring-rose-500/20 animate-in fade-in duration-300">
          <div className="absolute right-0 top-0 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-10 bottom-0 w-60 h-60 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Exam Details */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs sm:text-sm font-black px-4 py-1.5 rounded-full bg-rose-600 text-white shadow-md shadow-rose-600/40 animate-pulse flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                  <Hourglass className="w-4 h-4" />
                  <span>تنبيه هام يا يارا: {countdown?.text || 'موعد اختبار قادم!'}</span>
                </span>
                <span className="text-xs font-black px-3.5 py-1.5 rounded-xl bg-white/15 text-emerald-300 border border-white/20">
                  {upcomingExam.subjectName}
                </span>
                <span className="text-xs font-black px-3.5 py-1.5 rounded-xl bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {upcomingExam.targetType === 'unit' ? '🏆 اختبار شامل للفصل' : '📝 اختبار درس'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-wide">
                {upcomingExam.targetTitle}
              </h3>

              {/* High Contrast Date & Time Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="bg-white text-slate-900 font-black text-sm sm:text-base px-4 py-2 rounded-xl shadow-md border-2 border-slate-200 flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>تاريخ الاختبار: <strong className="font-black text-slate-950 underline underline-offset-4 decoration-blue-500">{upcomingExam.scheduledDate}</strong></span>
                </div>

                {upcomingExam.scheduledTime && (
                  <div className="bg-amber-400 text-slate-950 font-black text-sm sm:text-base px-4 py-2 rounded-xl shadow-md border-2 border-amber-300 flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-slate-950" />
                    <span>الساعة: <strong className="font-black text-slate-950">{upcomingExam.scheduledTime}</strong></span>
                  </div>
                )}

                {upcomingExam.notes && (
                  <div className="bg-slate-800/90 text-yellow-200 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-yellow-400/30 flex items-center gap-2">
                    <span>📌 {upcomingExam.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto shrink-0 pt-2 lg:pt-0">
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
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-600/40 flex items-center gap-2.5 transition-all hover:scale-105"
              >
                <Award className="w-5 h-5 text-yellow-300" />
                <span>بدء / تسجيل النتيجة ✍️</span>
              </button>

              <button
                onClick={onNavigateToExams}
                className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-black text-xs sm:text-sm rounded-2xl transition-all border border-white/20 flex items-center gap-1.5"
              >
                <span>فتح مركز الاختبارات 🎯</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

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
                  فهرس الفصول والدروس، متابعة ما تم إنجازه، وتحديد مكان التوقف لكل مادة وفرع.
                </p>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                  <div className="text-slate-500 font-bold text-[11px]">المدروس</div>
                  <div className="text-slate-800 font-black text-lg mt-0.5">{studiedLessons}</div>
                </div>
                <div className="bg-teal-50 p-2.5 rounded-2xl border border-teal-200">
                  <div className="text-teal-700 font-bold text-[11px]">متقن (95%+)</div>
                  <div className="text-teal-800 font-black text-lg mt-0.5">{masteredLessons}</div>
                </div>
                <div className="bg-amber-50 p-2.5 rounded-2xl border border-amber-200">
                  <div className="text-amber-700 font-bold text-[11px]">مراجعة</div>
                  <div className="text-amber-800 font-black text-lg mt-0.5">{needsReviewLessons}</div>
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

          {/* Card 3: مركز الاختبارات (DEDICATED PORTAL WITH EYE-CATCHING HIGHLIGHT) */}
          <div 
            onClick={onNavigateToExams}
            className={`group relative bg-white rounded-3xl p-6 sm:p-7 border-2 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
              upcomingExam 
                ? 'border-amber-400 hover:border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/20' 
                : 'border-slate-200 hover:border-amber-500 shadow-md hover:shadow-2xl hover:shadow-amber-500/10'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-0 transition-transform group-hover:scale-125 duration-300"></div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <Award className="w-7 h-7" />
                </div>
                {upcomingExam ? (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-600 text-white shadow-sm animate-pulse flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    <span>اختبار قادم ⏳</span>
                  </span>
                ) : (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                    {audit.totalPending} بانتظار الاختبار
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-2xl font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                  🎯 مركز الاختبارات
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 leading-relaxed">
                  مراية المتابعة المصنفة حسب المواد، والعد التنازلي للاختبارات الشاملة والدروس.
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
                    <span className="text-[11px] text-amber-700 underline font-black">فتح مركز الاختبارات 🎯</span>
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
                <span>فتح مركز الاختبارات ومراية المتابعة</span>
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all transform group-hover:-translate-x-1">
                <ArrowLeft className="w-5 h-5" />
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
