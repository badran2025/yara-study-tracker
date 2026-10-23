import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  Target, 
  CalendarClock, 
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { motivationalQuotes } from '../data/defaultData';

export default function StatsOverview({ 
  subjects, 
  schedule, 
  onNavigateToRevisions,
  onNavigateToSchedule,
  onSelectSubject
}) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Compute stats
  let totalLessons = 0;
  let masteredLessons = 0;
  let needsReviewLessons = 0;
  let inProgressLessons = 0;

  subjects.forEach(subject => {
    subject.units.forEach(unit => {
      unit.lessons.forEach(lesson => {
        totalLessons++;
        if (lesson.quiz && lesson.quiz.percentage >= 95) masteredLessons++;
        if (lesson.quiz && lesson.quiz.percentage < 95) needsReviewLessons++;
        if (lesson.status === 'current') inProgressLessons++;
      });
    });
  });

  const completionPercent = totalLessons > 0 
    ? Math.round(((masteredLessons) / totalLessons) * 100) 
    : 0;

  // Find next class from schedule (sample preview: first one or by day)
  const nextClass = schedule[0];

  return (
    <div className="space-y-4">
      
      {/* Motivational Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-5 shadow-lg shadow-emerald-700/10">
        <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/15 backdrop-blur-md rounded-xl text-yellow-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-100 font-bold mb-1">
                كلمة اليوم التشجيعية
              </div>
              <p className="text-base sm:text-lg font-bold leading-snug">
                {motivationalQuotes[quoteIndex]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 w-full md:w-auto justify-between md:justify-start">
            <div className="text-right">
              <div className="text-xs text-emerald-100">نسبة الإتقان الكلية</div>
              <div className="text-xl font-black text-white">{completionPercent}%</div>
            </div>
            <div className="w-14 h-14 relative flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-white/20"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={125.6}
                  strokeDashoffset={125.6 - (125.6 * completionPercent) / 100}
                  className="text-yellow-300 transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-xs font-black text-white">
                {masteredLessons}/{totalLessons}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Lessons */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">إجمالي الدروس</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{totalLessons}</div>
          <div className="text-xs text-slate-500 mt-1">موزعة على 5 مواد دراسية</div>
        </div>

        {/* Mastered Lessons >= 95% */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm hover:shadow-md transition-shadow bg-emerald-50/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800">متقن بتفوق (≥ 95%)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">{masteredLessons}</div>
          <div className="text-xs text-emerald-600 mt-1 font-semibold">اجتياز كامل لمعيار التفوق</div>
        </div>

        {/* Needs Review Lessons < 95% */}
        <div 
          onClick={onNavigateToRevisions}
          className="bg-white p-4 rounded-2xl border border-amber-300 shadow-sm hover:shadow-md transition-all cursor-pointer bg-amber-50/30 hover:border-amber-400 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
              <span>يحتاج مراجعة (&lt; 95%)</span>
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 flex items-center justify-between">
            <span>{needsReviewLessons}</span>
            {needsReviewLessons > 0 && (
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                مطلوب التركيز
              </span>
            )}
          </div>
          <div className="text-xs text-amber-800 mt-1 flex items-center justify-between">
            <span>تحليل أوجه القصور</span>
            <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Next Scheduled Tutoring */}
        <div 
          onClick={onNavigateToSchedule}
          className="bg-white p-4 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md transition-all cursor-pointer bg-blue-50/20 hover:border-blue-300 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-900">أقرب حصة دراسية</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>
          {nextClass ? (
            <div>
              <div className="text-base font-black text-slate-800 truncate">
                {nextClass.day}: {nextClass.teacher}
              </div>
              <div className="text-xs text-blue-700 font-semibold mt-1 flex items-center justify-between">
                <span>{nextClass.time}</span>
                <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 mt-2">لا توجد حصص مسجلة</div>
          )}
        </div>

      </div>

      {/* Quick Summary of Current Lessons Across 5 Subjects */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              أين تقف يارا الآن؟ (الدروس المتوقف عندها حالياً)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            علامة خضراء ترشدك لآخر درس تم التوقف عنده في كل مادة
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {subjects.map(subject => {
            // Find current lesson
            let currentLesson = null;
            for (const unit of subject.units) {
              const found = unit.lessons.find(l => l.id === subject.currentLessonId);
              if (found) {
                currentLesson = found;
                break;
              }
            }

            return (
              <button
                key={subject.id}
                onClick={() => onSelectSubject(subject.id)}
                className="text-right p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 transition-all flex flex-col justify-between group text-xs hover:border-emerald-400 shadow-sm"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="font-extrabold text-slate-800">{subject.shortName}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-200"></span>
                </div>
                <div className="text-slate-700 font-medium line-clamp-2 leading-relaxed">
                  {currentLesson ? currentLesson.title : "لم يحدد بعد"}
                </div>
                <div className="text-[10px] text-emerald-800 font-bold mt-2 flex items-center justify-between pt-1 border-t border-emerald-200/60">
                  <span>الانتقال للفهرس</span>
                  <ChevronLeft className="w-3 h-3 transform group-hover:-translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
