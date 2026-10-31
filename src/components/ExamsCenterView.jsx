import React, { useState, useMemo } from 'react';
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
  ChevronRight,
  Calculator,
  Zap,
  FlaskConical,
  Languages,
  Dna,
  Mountain,
  Layers,
  Filter
} from 'lucide-react';
import { getExamsAuditSummary, getExamCountdown } from '../utils/masteryHelpers';

const iconMap = {
  Calculator,
  Zap,
  FlaskConical,
  BookOpen,
  Languages,
  Dna,
  Mountain
};

export default function ExamsCenterView({
  subjects,
  scheduledExams = [],
  onOpenScheduleExamModal,
  onDeleteScheduledExam,
  onOpenTestModal,
  onBackToHome
}) {
  const [auditTab, setAuditTab] = useState('pending'); // 'pending' | 'needs_review' | 'mastered'
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');

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
  const otherScheduledExams = sortedScheduledExams.slice(1);

  // Group audit items by Subject
  const subjectStats = useMemo(() => {
    const stats = {};
    subjects.forEach(s => {
      stats[s.id] = {
        pendingUnits: [],
        pendingLessons: [],
        needsReviewUnits: [],
        needsReviewLessons: [],
        masteredItems: []
      };
    });

    audit.pendingUnits.forEach(u => {
      if (stats[u.subjectId]) stats[u.subjectId].pendingUnits.push(u);
    });
    audit.pendingLessons.forEach(l => {
      if (stats[l.subjectId]) stats[l.subjectId].pendingLessons.push(l);
    });

    audit.needsReviewUnits.forEach(u => {
      if (stats[u.subjectId]) stats[u.subjectId].needsReviewUnits.push(u);
    });
    audit.needsReviewLessons.forEach(l => {
      if (stats[l.subjectId]) stats[l.subjectId].needsReviewLessons.push(l);
    });

    audit.masteredItems.forEach(m => {
      if (stats[m.subjectId]) stats[m.subjectId].masteredItems.push(m);
    });

    return stats;
  }, [subjects, audit]);

  // Total count for current tab
  const currentTabTotalCount = 
    auditTab === 'pending' ? audit.totalPending :
    auditTab === 'needs_review' ? audit.totalNeedsReview :
    audit.totalMastered;

  // Subjects that have items to display in the current tab & filter
  const activeSubjectsToDisplay = subjects.filter(s => {
    if (selectedSubjectFilter !== 'all' && s.id !== selectedSubjectFilter) {
      return false;
    }
    const subData = subjectStats[s.id];
    if (!subData) return false;

    if (auditTab === 'pending') {
      return (subData.pendingUnits.length + subData.pendingLessons.length) > 0;
    }
    if (auditTab === 'needs_review') {
      return (subData.needsReviewUnits.length + subData.needsReviewLessons.length) > 0;
    }
    if (auditTab === 'mastered') {
      return subData.masteredItems.length > 0;
    }
    return false;
  });

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
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
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
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>🎯 مركز الاختبارات ومراية المتابعة</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 hidden sm:inline-block">
                  معيار التفوق 95%
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                متابعة دقيقة ومنظمة لكل المواد والدروس لضمان أعلى درجات الإتقان
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenScheduleExamModal}
          className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all self-stretch sm:self-auto justify-center hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>جدولة موعد اختبار جديد 📅</span>
        </button>
      </div>

      {/* 1. UPCOMING SCHEDULED EXAM & LIVE COUNTDOWN (SUPER BOLD & HIGH CONTRAST) */}
      {upcomingExam ? (
        <div className="space-y-3">
          <div className="relative overflow-hidden bg-gradient-to-l from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border-2 border-indigo-500/50">
            <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-sm font-black px-4 py-1.5 rounded-full bg-yellow-400 text-yellow-950 shadow-md animate-pulse flex items-center gap-2">
                    <Hourglass className="w-4 h-4 text-yellow-950" />
                    <span>{countdown?.text || 'موعد الاختبار القادم'}</span>
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

                {/* HIGH CONTRAST BOLD DATE & TIME INFO BADGES */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="bg-white text-slate-950 font-black text-sm sm:text-base px-4 py-2.5 rounded-xl shadow-md border-2 border-slate-200 flex items-center gap-2.5">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span>تاريخ الاختبار: <strong className="font-black text-slate-950 underline underline-offset-4 decoration-blue-500">{upcomingExam.scheduledDate}</strong></span>
                  </div>

                  {upcomingExam.scheduledTime && (
                    <div className="bg-amber-400 text-slate-950 font-black text-sm sm:text-base px-4 py-2.5 rounded-xl shadow-md border-2 border-amber-300 flex items-center gap-2.5">
                      <Clock className="w-5 h-5 text-slate-950" />
                      <span>الساعة: <strong className="font-black text-slate-950">{upcomingExam.scheduledTime}</strong></span>
                    </div>
                  )}

                  {upcomingExam.notes && (
                    <div className="bg-slate-800/90 text-yellow-200 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-yellow-400/30 flex items-center gap-2">
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
                  className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-600/40 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Award className="w-5 h-5 text-yellow-300" />
                  <span>بدء / تسجيل النتيجة ✍️</span>
                </button>

                <button
                  onClick={() => onDeleteScheduledExam(upcomingExam.id)}
                  title="إلغاء موعد هذا الاختبار"
                  className="p-3.5 bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white rounded-2xl transition-all border border-white/10 hover:border-rose-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Additional scheduled exams if any */}
          {otherScheduledExams.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-black text-indigo-950 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-700" />
                <span>اختبارات أخرى مجدولة قادمة ({otherScheduledExams.length}):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {otherScheduledExams.map(ex => (
                  <div key={ex.id} className="bg-white p-3 rounded-xl border border-indigo-100 flex items-center justify-between text-xs shadow-2xs">
                    <div>
                      <div className="font-extrabold text-slate-800 line-clamp-1">{ex.targetTitle}</div>
                      <div className="text-[11px] text-slate-500 font-semibold">{ex.subjectName} • {ex.scheduledDate} {ex.scheduledTime ? `(${ex.scheduledTime})` : ''}</div>
                    </div>
                    <button
                      onClick={() => onDeleteScheduledExam(ex.id)}
                      title="حذف الموعد"
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-base">
                لا يوجد موعد اختبار قادم مجدول حالياً 🌴
              </h4>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                يمكنكِ جدولة موعد اختبار جديد لدرس أو فصل في أي مادة ليظهر بالعد التنازلي المباشر.
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

      {/* 2. THE SUPERVISION AUDIT MIRROR (مراية المتابعة والتدقيق المنظمة حسب المادة) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* Section Header & 3 Main Status Tabs */}
        <div className="space-y-4 border-b border-slate-100 pb-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <span>📋 مراية المتابعة والتدقيق الشاملة</span>
                <span className="text-xs font-bold text-slate-400">(منظمة حسب كل مادة دراسية)</span>
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                فهرس مباشر ومفصل لكل مادة لمتابعة الاختبارات المعلقة، والمراجعات، وسجل التفوق
              </p>
            </div>

            {/* Status Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setAuditTab('pending')}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
                  auditTab === 'pending'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>🔍 بانتظار الاختبار</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                  auditTab === 'pending' ? 'bg-black/20 text-white' : 'bg-amber-100 text-amber-900'
                }`}>
                  {audit.totalPending}
                </span>
              </button>

              <button
                onClick={() => setAuditTab('needs_review')}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
                  auditTab === 'needs_review'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>⚠️ تحت المراجعة (&lt; 95%)</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                  auditTab === 'needs_review' ? 'bg-black/20 text-white' : 'bg-rose-100 text-rose-900'
                }`}>
                  {audit.totalNeedsReview}
                </span>
              </button>

              <button
                onClick={() => setAuditTab('mastered')}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
                  auditTab === 'mastered'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>🏆 متقنة (95%+)</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                  auditTab === 'mastered' ? 'bg-black/20 text-white' : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {audit.totalMastered}
                </span>
              </button>
            </div>
          </div>

          {/* Subject Filter Pills Bar */}
          <div className="pt-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              <span className="text-xs font-extrabold text-slate-400 shrink-0 ml-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                تصفية المادة:
              </span>

              {/* All Subjects Button */}
              <button
                onClick={() => setSelectedSubjectFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedSubjectFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>جميع المواد</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  selectedSubjectFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {currentTabTotalCount}
                </span>
              </button>

              {/* Individual Subject Buttons */}
              {subjects.map(s => {
                const SubIcon = iconMap[s.icon] || BookOpen;
                const isSelected = selectedSubjectFilter === s.id;
                const subData = subjectStats[s.id];
                const count = auditTab === 'pending'
                  ? ((subData?.pendingUnits.length || 0) + (subData?.pendingLessons.length || 0))
                  : auditTab === 'needs_review'
                  ? ((subData?.needsReviewUnits.length || 0) + (subData?.needsReviewLessons.length || 0))
                  : (subData?.masteredItems.length || 0);

                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSubjectFilter(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : count > 0
                        ? 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        : 'bg-slate-50 text-slate-400 border-transparent hover:text-slate-600'
                    }`}
                  >
                    <SubIcon className="w-3.5 h-3.5" />
                    <span>{s.name}</span>
                    {count > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                        isSelected
                          ? 'bg-black/20 text-white'
                          : auditTab === 'pending'
                          ? 'bg-amber-100 text-amber-900'
                          : auditTab === 'needs_review'
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-teal-100 text-teal-900'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* -------------------- TAB 1: PENDING EXAMS (GROUPED BY SUBJECT) -------------------- */}
        {auditTab === 'pending' && (
          <div className="space-y-6">
            {audit.totalPending === 0 ? (
              <div className="p-12 text-center bg-teal-50 border border-teal-200 rounded-3xl space-y-3">
                <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
                <h4 className="font-black text-teal-900 text-lg">
                  ما شاء الله! جميع ما تم دراسته تم اختباره بالكامل 🎉✨
                </h4>
                <p className="text-xs sm:text-sm text-teal-700 font-semibold">
                  لا توجد دروس أو فصول مدروسة متأخرة بدون اختبارات.
                </p>
              </div>
            ) : activeSubjectsToDisplay.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-500 font-bold">
                لا توجد دروس أو فصول بانتظار الاختبار لهذه المادة المحددة ✨
              </div>
            ) : (
              activeSubjectsToDisplay.map(sub => {
                const subData = subjectStats[sub.id];
                const subUnits = subData?.pendingUnits || [];
                const subLessons = subData?.pendingLessons || [];
                const totalSubPending = subUnits.length + subLessons.length;
                const SubIcon = iconMap[sub.icon] || BookOpen;

                return (
                  <div 
                    key={sub.id} 
                    className="border border-slate-200 rounded-2xl bg-white shadow-xs overflow-hidden"
                  >
                    {/* Subject Header */}
                    <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                          <SubIcon className="w-4 h-4" />
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-base">
                          {sub.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {subUnits.length > 0 && (
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-yellow-100 text-yellow-950 border border-yellow-300">
                            {subUnits.length} اختبار فصول
                          </span>
                        )}
                        {subLessons.length > 0 && (
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-950 border border-amber-300">
                            {subLessons.length} دروس
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Subject Items Grid */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* 1. Pending Chapters (Comprehensive Exams) */}
                      {subUnits.map(item => (
                        <div 
                          key={`unit-${item.unitId}`}
                          className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 hover:border-amber-400 transition-all flex items-center justify-between gap-3 shadow-2xs group"
                        >
                          <div className="space-y-1">
                            <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black bg-yellow-100 text-yellow-950 border border-yellow-300">
                              🏆 اختبار شامل للفصل
                            </span>
                            <div className="font-black text-slate-900 text-sm sm:text-base line-clamp-1">
                              {item.unitTitle}
                            </div>
                            <div className="text-xs text-amber-950 font-semibold">
                              تمت دراسة {item.metrics.studiedLessons} من {item.metrics.totalLessons} دروس بهذا الفصل
                            </div>
                          </div>

                          <button
                            onClick={() => handleRecordAuditTest(item)}
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                          >
                            <Award className="w-4 h-4" />
                            <span>تسجيل الاختبار ✍️</span>
                          </button>
                        </div>
                      ))}

                      {/* 2. Pending Lessons */}
                      {subLessons.map(item => (
                        <div 
                          key={`lesson-${item.lessonId}`}
                          className="p-4 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200 transition-all flex items-center justify-between gap-3 shadow-2xs group"
                        >
                          <div className="space-y-1">
                            <span className="text-[11px] text-slate-500 font-bold block line-clamp-1">
                              {item.unitTitle}
                            </span>
                            <div className="font-extrabold text-slate-800 text-xs sm:text-sm line-clamp-1">
                              {item.lessonTitle}
                            </div>
                          </div>

                          <button
                            onClick={() => handleRecordAuditTest(item)}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                          >
                            <span>تسجيل النتيجة ✍️</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* -------------------- TAB 2: NEEDS RETEST (< 95%) (GROUPED BY SUBJECT) -------------------- */}
        {auditTab === 'needs_review' && (
          <div className="space-y-6">
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
            ) : activeSubjectsToDisplay.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-500 font-bold">
                لا توجد دروس أو فصول بحاجة لإعادة اختبار في هذه المادة المحددة ✨
              </div>
            ) : (
              activeSubjectsToDisplay.map(sub => {
                const subData = subjectStats[sub.id];
                const subReviewUnits = subData?.needsReviewUnits || [];
                const subReviewLessons = subData?.needsReviewLessons || [];
                const SubIcon = iconMap[sub.icon] || BookOpen;

                return (
                  <div 
                    key={sub.id} 
                    className="border border-slate-200 rounded-2xl bg-white shadow-xs overflow-hidden"
                  >
                    {/* Subject Header */}
                    <div className="bg-rose-50/70 px-5 py-3.5 border-b border-rose-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-rose-600/10 text-rose-700 flex items-center justify-center font-bold">
                          <SubIcon className="w-4 h-4" />
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-base">
                          {sub.name}
                        </h4>
                      </div>
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
                        {subReviewUnits.length + subReviewLessons.length} بحاجة لإعادة اختبار
                      </span>
                    </div>

                    {/* Subject Items Grid */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* Review Units */}
                      {subReviewUnits.map(item => (
                        <div 
                          key={`review-unit-${item.unitId}`}
                          className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 hover:border-rose-300 transition-all flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-900 border border-rose-300">
                                🏆 اختبار شامل للفصل
                              </span>
                              <span className="text-xs font-black text-rose-700 font-mono">
                                النتيجة: {item.quiz.percentage}%
                              </span>
                            </div>
                            <div className="font-black text-slate-800 text-sm line-clamp-1">
                              {item.unitTitle}
                            </div>
                            {item.quiz.weaknesses && (
                              <div className="text-xs text-rose-950 line-clamp-1 font-semibold">
                                📌 {item.quiz.weaknesses}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleRecordAuditTest(item)}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>إعادة 🔄</span>
                          </button>
                        </div>
                      ))}

                      {/* Review Lessons */}
                      {subReviewLessons.map(item => (
                        <div 
                          key={`review-lesson-${item.lessonId}`}
                          className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 hover:border-amber-300 transition-all flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-500 font-semibold line-clamp-1">
                                {item.unitTitle}
                              </span>
                              <span className="text-xs font-black text-amber-800 font-mono">
                                النتيجة: {item.quiz.percentage}%
                              </span>
                            </div>
                            <div className="font-black text-slate-800 text-sm line-clamp-1">
                              {item.lessonTitle}
                            </div>
                            {item.quiz.weaknesses && (
                              <div className="text-xs text-amber-950 line-clamp-1 font-semibold">
                                📌 {item.quiz.weaknesses}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleRecordAuditTest(item)}
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>إعادة 🔄</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* -------------------- TAB 3: MASTERED ITEMS (95%+) (GROUPED BY SUBJECT) -------------------- */}
        {auditTab === 'mastered' && (
          <div className="space-y-6">
            {audit.totalMastered === 0 ? (
              <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-3xl text-xs sm:text-sm text-slate-400 font-bold">
                لا توجد اختبارات متقنة بتفوق حتى الآن — استمري في التدريب والاجتهاد! 🌸
              </div>
            ) : activeSubjectsToDisplay.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-500 font-bold">
                لا توجد اختبارات متقنة بتفوق مسجلة في هذه المادة المحددة حتى الآن ✨
              </div>
            ) : (
              activeSubjectsToDisplay.map(sub => {
                const subData = subjectStats[sub.id];
                const subMastered = subData?.masteredItems || [];
                const SubIcon = iconMap[sub.icon] || BookOpen;

                return (
                  <div 
                    key={sub.id} 
                    className="border border-slate-200 rounded-2xl bg-white shadow-xs overflow-hidden"
                  >
                    {/* Subject Header */}
                    <div className="bg-teal-50/70 px-5 py-3.5 border-b border-teal-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal-600/10 text-teal-700 flex items-center justify-center font-bold">
                          <SubIcon className="w-4 h-4" />
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-base">
                          {sub.name}
                        </h4>
                      </div>
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-teal-100 text-teal-900 border border-teal-300">
                        {subMastered.length} اختبار متقن ⭐
                      </span>
                    </div>

                    {/* Subject Items Grid */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {subMastered.map((item, idx) => (
                        <div 
                          key={idx}
                          className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-200 flex items-center justify-between text-xs shadow-2xs hover:bg-teal-50 transition-colors"
                        >
                          <div className="line-clamp-1 pr-1">
                            <span className="text-slate-500 text-[10px] block font-bold truncate">
                              {item.subTitle}
                            </span>
                            <span className="text-slate-800 font-extrabold text-xs truncate">
                              {item.title}
                            </span>
                          </div>
                          <span className="font-black text-teal-800 font-mono shrink-0 mr-2 bg-white px-2.5 py-1 rounded-lg border border-teal-300">
                            {item.quiz.percentage}% 🌟
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>

    </div>
  );
}
