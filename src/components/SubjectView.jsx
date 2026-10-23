import React, { useState } from 'react';
import { 
  Calculator, 
  Zap, 
  FlaskConical, 
  BookOpen, 
  Languages, 
  Dna,
  Mountain,
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  User, 
  FileEdit, 
  Sparkles, 
  ArrowRight, 
  Filter,
  CalendarClock,
  Home,
  Check,
  ChevronLeft,
  RotateCcw,
  Trash2
} from 'lucide-react';

const iconMap = {
  Calculator,
  Zap,
  FlaskConical,
  BookOpen,
  Languages,
  Dna,
  Mountain
};

export default function SubjectView({
  subjects,
  activeSubjectId,
  setActiveSubjectId,
  isAdmin,
  schedule = [],
  onSetCurrentLesson,
  onToggleStudiedLesson,
  onOpenTestModal,
  onOpenSyllabusEditor,
  onDeleteQuiz,
  onBackToHub,
  onBackToHome
}) {
  const [subjectTab, setSubjectTab] = useState('syllabus'); // 'syllabus' | 'revisions'
  const [filterStatus, setFilterStatus] = useState('all'); // all, current, studied, unstudied, needs_review, mastered
  const [selectedBranch, setSelectedBranch] = useState('all'); // for arabic: 'all' | 'story' | 'grammar' | 'other'
  const [collapsedUnits, setCollapsedUnits] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleSetCurrentWithToast = (subjectId, lessonId, lessonTitle) => {
    onSetCurrentLesson(subjectId, lessonId);
    showToast(`تم تحديث مكان توقفك بنجاح إلى: "${lessonTitle}" 📍✨`);
  };

  const handleToggleStudiedWithToast = (subjectId, lessonId, lessonTitle, willBeStudied) => {
    onToggleStudiedLesson(subjectId, lessonId);
    showToast(
      willBeStudied
        ? `تم تحديد الدرس: "${lessonTitle}" كـ (تمت دراسته ✅)`
        : `تم تغيير حالة الدرس: "${lessonTitle}" إلى (لم يُدرس بعد ⏳)`
    );
  };

  const activeSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];
  const IconComponent = iconMap[activeSubject.icon] || BookOpen;

  const toggleUnit = (unitId) => {
    setCollapsedUnits(prev => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };

  // Stats for active subject
  let subjectTotal = 0;
  let subjectStudied = 0;
  let subjectMastered = 0;
  let subjectNeedsReview = 0;
  let currentLessonTitle = "لم يتم تحديده بعد";
  const needsReviewLessonsList = [];

  activeSubject.units.forEach(u => {
    u.lessons.forEach(l => {
      subjectTotal++;
      const isStudied = l.isStudied === true;
      if (isStudied) subjectStudied++;
      
      const isMastered = Boolean(l.quiz && l.quiz.percentage >= 95);
      const isNeedsRev = Boolean(l.quiz && l.quiz.percentage < 95);

      if (isMastered) subjectMastered++;
      if (isNeedsRev) {
        subjectNeedsReview++;
        needsReviewLessonsList.push({ ...l, unitTitle: u.title });
      }

      if (l.id === activeSubject.currentLessonId) {
        currentLessonTitle = l.title;
      }
    });
  });

  const subjectPercent = subjectTotal > 0 
    ? Math.round((subjectStudied / subjectTotal) * 100) 
    : 0;

  // Next class for this subject specifically from schedule
  const subjectClasses = schedule.filter(c => c.subjectId === activeSubject.id);
  const nextClass = subjectClasses[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-slate-600">
          <button 
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <Home className="w-4 h-4 text-emerald-600" />
            <span>الرئيسية</span>
          </button>
          <span className="text-slate-300">/</span>
          <button 
            onClick={onBackToHub}
            className="text-slate-500 hover:text-emerald-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            المواد الدراسية
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-emerald-800 font-extrabold flex items-center gap-1">
            <IconComponent className="w-4 h-4 text-emerald-600" />
            <span>{activeSubject.name}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToHub}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لقائمة المواد</span>
          </button>
        </div>
      </div>

      {/* Subjects Switcher Bar (Quick Navigation) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {subjects.map((sub) => {
            const SubIcon = iconMap[sub.icon] || BookOpen;
            const isActive = sub.id === activeSubjectId;
            
            let hasReview = false;
            sub.units.forEach(u => {
              if (u.lessons.some(l => l.status === 'needs_review' || (l.quiz && l.quiz.percentage < 95))) {
                hasReview = true;
              }
            });

            return (
              <button
                key={sub.id}
                onClick={() => {
                  setActiveSubjectId(sub.id);
                  setSubjectTab('syllabus');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all relative ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <SubIcon className="w-4 h-4" />
                <span>{sub.shortName}</span>

                {hasReview && (
                  <span 
                    title="يوجد دروس تحتاج مراجعة"
                    className="w-2 h-2 rounded-full bg-amber-400 border border-white"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Subject Main Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 bg-gradient-to-l from-slate-900 to-slate-800 text-white relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-400 border border-white/15">
                <IconComponent className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {activeSubject.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-300">
                  <span className="flex items-center gap-1 font-semibold">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    المعلم: {activeSubject.teacherName}
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    المكان: {activeSubject.tutoringLocation}
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            {isAdmin && (
              <button
                onClick={() => onOpenSyllabusEditor(activeSubject)}
                className="self-start md:self-center px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold text-white flex items-center gap-2 border border-white/15 transition-all shadow-sm"
              >
                <FileEdit className="w-4 h-4 text-yellow-300" />
                <span>تعديل فهرس ومحتوى المادة</span>
              </button>
            )}

          </div>

          {/* Current Lesson Spotlight Bar inside Banner */}
          <div className="mt-5 p-3.5 bg-emerald-500/20 border border-emerald-400/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-3.5 w-3.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400"></span>
              </span>
              <div>
                <div className="text-[11px] font-bold text-emerald-200">
                  العلامة الخضراء: الدرس المتوقفين عنده حالياً
                </div>
                <div className="text-sm sm:text-base font-extrabold text-white">
                  {currentLessonTitle}
                </div>
              </div>
            </div>

            <div className="text-xs bg-emerald-600/40 px-3 py-1.5 rounded-lg border border-emerald-400/40 text-emerald-100 font-bold self-start sm:self-auto">
              نسبة ما تمت دراسته: {subjectPercent}% ({subjectStudied}/{subjectTotal})
            </div>
          </div>

          {/* Neutral Custom Notice if applicable */}
          {activeSubject.customNotice && (
            <div className="mt-3.5 p-3.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-xs flex items-start gap-2.5">
              <span className="text-base shrink-0">📌</span>
              <p className="leading-relaxed font-bold text-amber-100">
                {activeSubject.customNotice}
              </p>
            </div>
          )}
        </div>

        {/* SUBJECT-SPECIFIC KPI DASHBOARD BAR (المؤشرات الأساسية الخاصة بمادة الفيزياء/المادة الحالية) */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200">
          <div className="text-xs font-black text-slate-700 mb-2.5">
            📊 المؤشرات الأساسية لمادة {activeSubject.name}:
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            
            {/* 1. Total Lessons */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-bold">إجمالي الدروس</div>
              <div className="text-xl font-black text-slate-800 mt-0.5">{subjectTotal}</div>
              <div className="text-[10px] text-slate-400">{activeSubject.units.length} فصول بالمنهج</div>
            </div>

            {/* 2. Studied Lessons */}
            <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
              <div className="text-[11px] text-emerald-800 font-bold">تمت دراستها ✅</div>
              <div className="text-xl font-black text-emerald-700 mt-0.5">{subjectStudied}</div>
              <div className="text-[10px] text-emerald-600 font-bold">{subjectPercent}% من المنهج</div>
            </div>

            {/* 3. Mastered >= 95% */}
            <div className="bg-white p-3 rounded-2xl border border-teal-200 shadow-2xs bg-teal-50/20">
              <div className="text-[11px] text-teal-800 font-bold">متقن بتفوق (≥ 95%)</div>
              <div className="text-xl font-black text-teal-700 mt-0.5">{subjectMastered}</div>
              <div className="text-[10px] text-teal-600 font-bold">درجة اختبار ممتازة</div>
            </div>

            {/* 4. Needs Review < 95% */}
            <div 
              onClick={() => setSubjectTab('revisions')}
              className={`p-3 rounded-2xl border shadow-2xs cursor-pointer transition-all ${
                subjectNeedsReview > 0 
                  ? 'bg-amber-50/60 border-amber-300 hover:border-amber-400' 
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="text-[11px] text-amber-900 font-bold flex items-center justify-between">
                <span>يحتاج مراجعة (&lt; 95%)</span>
                {subjectNeedsReview > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                )}
              </div>
              <div className="text-xl font-black text-amber-700 mt-0.5">{subjectNeedsReview}</div>
              <div className="text-[10px] text-amber-800 font-semibold">
                {subjectNeedsReview > 0 ? 'عرض أوجه القصور' : 'لا يوجد ملاحظات'}
              </div>
            </div>

            {/* 5. Next Tutoring Class for THIS Subject specifically */}
            <div className="bg-white p-3 rounded-2xl border border-blue-200 shadow-2xs col-span-2 sm:col-span-1 bg-blue-50/20">
              <div className="text-[11px] text-blue-900 font-bold flex items-center gap-1">
                <CalendarClock className="w-3.5 h-3.5 text-blue-600" />
                <span>أقرب حصة دراسية للمادة</span>
              </div>
              {nextClass ? (
                <div>
                  <div className="text-sm font-black text-slate-800 mt-0.5 truncate">
                    {nextClass.day}: {nextClass.time}
                  </div>
                  <div className="text-[10px] text-blue-700 font-bold truncate">
                    {nextClass.teacher} ({nextClass.location})
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 mt-1">غير مسجلة بالجدول</div>
              )}
            </div>

          </div>
        </div>

        {/* Sub Tabs: فهرس المادة vs مراجعات المادة */}
        <div className="px-5 pt-3 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSubjectTab('syllabus')}
              className={`pb-3 pt-2 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
                subjectTab === 'syllabus'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>فهرس دروس المادة ({subjectTotal})</span>
            </button>

            <button
              onClick={() => setSubjectTab('revisions')}
              className={`pb-3 pt-2 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
                subjectTab === 'revisions'
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>مراجعات المادة الذكية</span>
              {subjectNeedsReview > 0 && (
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {subjectNeedsReview}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: SYLLABUS & LESSONS */}
        {subjectTab === 'syllabus' && (
          <div>
            {/* Branch Filter Bar for Arabic Subject */}
            {activeSubject.id === 'arabic' && (
              <div className="px-5 py-3 bg-amber-50/80 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-black text-amber-950 ml-1">فروع اللغة العربية:</span>
                  <button
                    onClick={() => setSelectedBranch('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      selectedBranch === 'all'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    جميع الفروع
                  </button>
                  <button
                    onClick={() => setSelectedBranch('story')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                      selectedBranch === 'story'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    <span>📖 قصة الأيام (طه حسين)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 font-bold">26 فصلاً ودرساً</span>
                  </button>
                  <button
                    onClick={() => setSelectedBranch('grammar')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                      selectedBranch === 'grammar'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    <span>📝 كتاب النحو</span>
                  </button>
                  <button
                    onClick={() => setSelectedBranch('other')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                      selectedBranch === 'other'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    <span>📚 باقي الفروع</span>
                  </button>
                </div>

                <div className="text-[11px] font-bold text-amber-800">
                  تم إدراج كتاب قصة الأيام كاملاً (المدخل + الجزأين 1 و 2)
                </div>
              </div>
            )}

            {/* Filter Bar */}
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
                <span className="text-slate-500 font-bold">تصفية:</span>
                
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    filterStatus === 'all' 
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-200' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  الكل ({subjectTotal})
                </button>
                
                <button
                  onClick={() => setFilterStatus('current')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    filterStatus === 'current' 
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  المتوقف عنده حالياً
                </button>

                <button
                  onClick={() => setFilterStatus('studied')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    filterStatus === 'studied' 
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  تمت دراسته ({subjectStudied})
                </button>

                <button
                  onClick={() => setFilterStatus('unstudied')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    filterStatus === 'unstudied' 
                      ? 'bg-slate-200 text-slate-800 border border-slate-300' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Clock className="w-3 h-3 text-slate-500" />
                  لم يُدرس بعد ({subjectTotal - subjectStudied})
                </button>

                <button
                  onClick={() => setFilterStatus('needs_review')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    filterStatus === 'needs_review' 
                      ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  يحتاج مراجعة ({subjectNeedsReview})
                </button>

                <button
                  onClick={() => setFilterStatus('mastered')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    filterStatus === 'mastered' 
                      ? 'bg-teal-100 text-teal-900 border border-teal-300' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-teal-600" />
                  متقن ({subjectMastered})
                </button>
              </div>

              <div className="text-[11px] text-slate-400 font-semibold">
                يمكن تحديد ما تم دراسته لكل درس بدون التقيد بالترتيب
              </div>
            </div>

            {/* Units and Lessons Accordion Tree */}
            <div className="p-5 sm:p-6 space-y-6">
              {activeSubject.units.map((unit, unitIdx) => {
                const isCollapsed = collapsedUnits[unit.id];

                // Arabic branch filter check
                if (activeSubject.id === 'arabic' && selectedBranch !== 'all' && unit.branch && unit.branch !== selectedBranch) {
                  return null;
                }
                
                // Filter lessons
                const filteredLessons = unit.lessons.filter(l => {
                  const isCurrent = l.id === activeSubject.currentLessonId;
                  const isStudied = l.isStudied === true;
                  const isMastered = Boolean(l.quiz && l.quiz.percentage >= 95);
                  const isNeedsRev = Boolean(l.quiz && l.quiz.percentage < 95);

                  if (filterStatus === 'current') return isCurrent;
                  if (filterStatus === 'studied') return isStudied;
                  if (filterStatus === 'unstudied') return !isStudied;
                  if (filterStatus === 'needs_review') return isNeedsRev;
                  if (filterStatus === 'mastered') return isMastered;
                  return true;
                });

                if (filteredLessons.length === 0 && filterStatus !== 'all') {
                  return null;
                }

                return (
                  <div 
                    key={unit.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm"
                  >
                    {/* Unit Header */}
                    <div 
                      onClick={() => toggleUnit(unit.id)}
                      className="p-4 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between border-b border-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                          {unitIdx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                            {unit.title}
                          </h3>
                          {unit.branch === 'story' && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                              القصة
                            </span>
                          )}
                          {unit.branch === 'grammar' && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                              النحو
                            </span>
                          )}
                          {unit.branch === 'other' && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-300">
                              باقي الفروع
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-semibold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          {unit.lessons.length} دروس
                        </span>
                        {isCollapsed ? (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Lessons List */}
                    {!isCollapsed && (
                      <div className="divide-y divide-slate-100 p-2 sm:p-3 space-y-2">
                        {filteredLessons.map((lesson) => {
                          const isCurrent = lesson.id === activeSubject.currentLessonId;
                          const isStudied = lesson.isStudied === true;
                          const hasQuiz = Boolean(lesson.quiz);
                          const isMastered = Boolean(hasQuiz && lesson.quiz.percentage >= 95);
                          const needsReview = Boolean(hasQuiz && lesson.quiz.percentage < 95);

                          return (
                            <div
                              key={lesson.id}
                              className={`p-4 rounded-xl transition-all relative ${
                                isCurrent
                                  ? 'border-2 border-emerald-500 bg-emerald-50/70 shadow-md ring-2 ring-emerald-400/20'
                                  : needsReview
                                  ? 'border border-amber-300 bg-amber-50/30'
                                  : isStudied
                                  ? 'border border-emerald-200 bg-white hover:bg-emerald-50/20'
                                  : 'border border-slate-100 bg-slate-50/50 hover:bg-white'
                              }`}
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                
                                {/* Lesson Info */}
                                <div className="flex items-start gap-3 flex-1">
                                  
                                  {/* Icon Status */}
                                  <div className="pt-0.5">
                                    {isCurrent ? (
                                      <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md animate-pulse">
                                        <Sparkles className="w-4 h-4" />
                                      </div>
                                    ) : isMastered ? (
                                      <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4" />
                                      </div>
                                    ) : needsReview ? (
                                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                                        <AlertTriangle className="w-4 h-4" />
                                      </div>
                                    ) : isStudied ? (
                                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                        <Check className="w-4 h-4" />
                                      </div>
                                    ) : (
                                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                                        <Clock className="w-4 h-4" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug">
                                        {lesson.title}
                                      </h4>

                                      {/* CURRENT LESSON BADGE */}
                                      {isCurrent && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-200">
                                          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                                          📍 متوقفين عنده حالياً
                                        </span>
                                      )}

                                      {/* Studied Status Badge */}
                                      {isStudied ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                          <Check className="w-3 h-3 text-emerald-600" />
                                          تمت دراسته
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                          <Clock className="w-3 h-3 text-slate-400" />
                                          لم يُدرس بعد
                                        </span>
                                      )}

                                      {/* Mastered Badge */}
                                      {isMastered && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300">
                                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                                          متقن ({lesson.quiz?.percentage}%)
                                        </span>
                                      )}

                                      {/* Needs Review Badge */}
                                      {needsReview && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                                          يحتاج مراجعة ({lesson.quiz?.percentage}%)
                                        </span>
                                      )}
                                    </div>

                                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                      {lesson.description}
                                    </p>
                                  </div>
                                </div>

                                {/* Action Buttons: Toggle Studied + Set Current + Quiz */}
                                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60 justify-end">
                                  
                                  {/* 1. Toggle Studied Button (Independent of order!) */}
                                  <button
                                    onClick={() => handleToggleStudiedWithToast(activeSubject.id, lesson.id, lesson.title, !isStudied)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border shadow-2xs ${
                                      isStudied
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                        : 'bg-white text-slate-600 border-slate-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                                    }`}
                                    title="تحديد هل تمت دراسة هذا الدرس أم لا"
                                  >
                                    <Check className={`w-3.5 h-3.5 ${isStudied ? 'text-emerald-600 stroke-[3]' : 'text-slate-400'}`} />
                                    <span>{isStudied ? 'تمت دراسته ✅' : 'تحديد كـ (تمت دراسته)'}</span>
                                  </button>

                                  {/* 2. Set as Current Lesson (Available in BOTH Yara and Admin modes) */}
                                  {!isCurrent && (
                                    <button
                                      onClick={() => handleSetCurrentWithToast(activeSubject.id, lesson.id, lesson.title)}
                                      className="px-3 py-1.5 rounded-xl text-xs font-black bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 border border-slate-200 transition-all flex items-center gap-1 shadow-2xs"
                                      title="تحديد هذا الدرس كعلامة للدرس المتوقفين عنده حالياً"
                                    >
                                      <span>وصلت هنا اليوم 📍</span>
                                    </button>
                                  )}

                                  {/* 3. Record / View Quiz Result */}
                                  <button
                                    onClick={() => onOpenTestModal(activeSubject, lesson)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm ${
                                      hasQuiz
                                        ? 'bg-slate-800 text-white hover:bg-slate-900'
                                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    }`}
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                    <span>{hasQuiz ? 'تعديل الاختبار' : 'رصد اختبار Gemini'}</span>
                                  </button>

                                  {/* Quick Delete / Cancel Quiz button if quiz exists */}
                                  {hasQuiz && (
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`هل أنت متأكد من إلغاء نتيجة اختبار درس: "${lesson.title}"؟`)) {
                                          onDeleteQuiz(activeSubject.id, lesson.id);
                                          showToast(`تم إلغاء نتيجة اختبار: "${lesson.title}" 🗑️`);
                                        }
                                      }}
                                      className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-all shadow-2xs"
                                      title="إلغاء وحذف نتيجة الاختبار"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                </div>

                              </div>

                              {/* Weaknesses / Gemini notes callout */}
                              {needsReview && lesson.quiz?.weaknesses && (
                                <div className="mt-3 p-3 rounded-xl bg-amber-100/60 border border-amber-300/80 text-xs text-amber-950 space-y-1">
                                  <div className="font-black flex items-center gap-1 text-amber-900">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                                    <span>أوجه القصور المطلوب مراجعتها (وفق تقييم جيمناي):</span>
                                  </div>
                                  <p className="text-amber-900 leading-relaxed whitespace-pre-line font-medium pr-4">
                                    {lesson.quiz.weaknesses}
                                  </p>
                                </div>
                              )}

                              {/* Positive feedback if mastered */}
                              {isMastered && lesson.quiz?.geminiFeedback && (
                                <div className="mt-2.5 p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                                  <span className="font-semibold">{lesson.quiz.geminiFeedback}</span>
                                </div>
                              )}

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 2: SUBJECT REVISIONS VIEW */}
        {subjectTab === 'revisions' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">
                  الدروس المطلوب مراجعتها في مادة {activeSubject.name}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  تشمل أي درس لم يحقق نسبة التفوق (95%) وتحليل أوجه القصور الخاص به
                </p>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                {needsReviewLessonsList.length} دروس تحتاج مراجعة
              </span>
            </div>

            {needsReviewLessonsList.length === 0 ? (
              <div className="p-8 text-center bg-teal-50/50 border border-teal-200 rounded-2xl space-y-2">
                <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto" />
                <h4 className="font-black text-teal-900 text-base">
                  ما شاء الله! لا توجد دروس تحتاج مراجعة في هذه المادة 🌸✨
                </h4>
                <p className="text-xs text-teal-700 font-semibold">
                  جميع الدروس المختبرة في مادة {activeSubject.name} حققت معيار التفوق (95% فأعلى).
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {needsReviewLessonsList.map((lesson) => (
                  <div 
                    key={lesson.id}
                    className="p-4 rounded-2xl border border-amber-300 bg-amber-50/40 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          {lesson.unitTitle}
                        </span>
                        <h4 className="font-black text-slate-800 text-sm sm:text-base mt-1">
                          {lesson.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black bg-amber-200 text-amber-950 px-3 py-1 rounded-lg">
                          الدرجة: {lesson.quiz?.percentage || 0}%
                        </span>
                        <button
                          onClick={() => onOpenTestModal(activeSubject, lesson)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                          <span>رصد اختبار جديد</span>
                        </button>
                      </div>
                    </div>

                    {lesson.quiz?.weaknesses && (
                      <div className="p-3 bg-white/80 rounded-xl border border-amber-200 text-xs text-amber-950">
                        <div className="font-black text-amber-900 mb-1">
                          تحليل جيمناي لأوجه القصور:
                        </div>
                        <p className="leading-relaxed whitespace-pre-line font-medium">
                          {lesson.quiz.weaknesses}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Floating Success Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-bold border border-emerald-500/40 backdrop-blur-md animate-in fade-in slide-in-from-bottom-5">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>{toast}</span>
        </div>
      )}

    </div>
  );
}