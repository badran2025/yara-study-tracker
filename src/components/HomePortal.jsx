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
  CalendarClock
} from 'lucide-react';
import { motivationalQuotes } from '../data/defaultData';

export default function HomePortal({ 
  subjects, 
  schedule, 
  onNavigateToSubjects, 
  onNavigateToSchedule,
  onSelectSubject,
  isAdmin
}) {
  const [quoteIndex, setQuoteIndex] = useState(0);

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

  // Next upcoming class from schedule
  const nextClass = schedule[0];

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
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-white/20"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray={144.5}
                  strokeDashoffset={144.5 - (144.5 * completionPercent) / 100}
                  className="text-yellow-300 transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-xs font-black text-white">
                {completionPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* THE TWO MAIN PORTAL CARDS (مربعات المواد الدراسية والدروس الخصوصية) */}
      <div>
        <div className="text-center sm:text-right mb-4">
          <h3 className="text-lg font-black text-slate-800">
            الوصول السريع للأقسام الرئيسية
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            اختاري القسم المطلوب للمتابعة وإدارة الدراسة والحصص
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: المواد الدراسية */}
          <div 
            onClick={onNavigateToSubjects}
            className="group relative bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 hover:border-emerald-500 shadow-md hover:shadow-2xl hover:shadow-emerald-600/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 transition-transform group-hover:scale-125 duration-300"></div>
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8" />
                </div>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {subjects.length} مواد دراسية
                </span>
              </div>

              <div>
                <h4 className="text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                  📚 المواد الدراسية
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 leading-relaxed">
                  فهرس الفصول، متابعة الدروس التي تمت دراستها، العلامة الخضراء للتوقف الحالي، والمراجعات الذكية لكل مادة.
                </p>
              </div>

              {/* Subject Mini Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                  <div className="text-[11px] text-slate-500 font-bold">إجمالي الدروس</div>
                  <div className="text-lg font-black text-slate-800">{totalLessons}</div>
                </div>
                <div className="bg-emerald-50/70 p-2.5 rounded-xl text-center border border-emerald-100">
                  <div className="text-[11px] text-emerald-800 font-bold">تمت دراسته</div>
                  <div className="text-lg font-black text-emerald-700">{studiedLessons}</div>
                </div>
                <div className="bg-teal-50/70 p-2.5 rounded-xl text-center border border-teal-100">
                  <div className="text-[11px] text-teal-800 font-bold">متقن (≥ 95%)</div>
                  <div className="text-lg font-black text-teal-700">{masteredLessons}</div>
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
            className="group relative bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 hover:border-blue-500 shadow-md hover:shadow-2xl hover:shadow-blue-600/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 transition-transform group-hover:scale-125 duration-300"></div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform">
                  <Calendar className="w-8 h-8" />
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
                  جدول المواعيد الأسبوعية، أسماء المدرسين، المراكز التعليمية، وإمكانية تعديل وإضافة الحصص.
                </p>
              </div>

              {/* Next Class Highlight */}
              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-blue-900">
                  <CalendarClock className="w-4 h-4 text-blue-600" />
                  <span>الحصة القادمة في الجدول:</span>
                </div>
                {nextClass ? (
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-extrabold text-slate-800">{nextClass.day}: {nextClass.teacher}</span>
                    <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                      {nextClass.time}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">لا توجد حصص مسجلة حالياً</div>
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

        </div>
      </div>

      {/* Snapshot Section: أين تقف يارا الآن في كل مادة؟ */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3.5 w-3.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">
              أين تقف يارا الآن؟ (الدروس المتوقف عندها حالياً 🟢)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            اضغطي على أي مادة للانتقال المباشر لفهرسها وتحديث مكان توقفكِ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                className="text-right p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-100/70 transition-all flex flex-col justify-between group hover:border-emerald-400 shadow-sm"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-200"></span>
                    <span className="font-extrabold text-slate-900 text-sm">{subject.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {subject.teacherName}
                  </span>
                </div>

                <div className="text-slate-800 font-extrabold text-xs sm:text-sm line-clamp-2 leading-relaxed my-1">
                  {currentLesson ? currentLesson.title : "لم يحدد بعد"}
                </div>

                <div className="text-[11px] text-emerald-800 font-bold mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between w-full">
                  <span>فتح المادة وتحديث التوقف</span>
                  <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}