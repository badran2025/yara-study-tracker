import React from 'react';
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
  MapPin, 
  User, 
  CalendarClock,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  BookCheck,
  Home
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

export default function SubjectsHub({ 
  subjects, 
  schedule, 
  onSelectSubject, 
  onBackToHome 
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600">
          <button 
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <Home className="w-4 h-4 text-emerald-600" />
            <span>الرئيسية</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-emerald-800 font-extrabold flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>المواد الدراسية المقررة</span>
          </span>
        </div>

        <button
          onClick={onBackToHome}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </button>
      </div>

      {/* Hub Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>متابعة تفصيلية لكل مادة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              المواد الدراسية ومؤشرات الإنجاز 📚
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              اختاري المادة للاطلاع على فهرسها بالكامل، تحديد الدروس التي تمت دراستها، الدرس المتوقف عنده حالياً، ومراجعات جيمناي الذكية.
            </p>
          </div>

          <div className="text-xs bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-emerald-100 font-bold self-start md:self-auto shrink-0">
            معيار التفوق: <span className="text-yellow-300 font-black">95% فأعلى</span>
          </div>
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          const SubIcon = iconMap[subject.icon] || BookOpen;

          // Compute metrics for this specific subject
          let subjectTotal = 0;
          let subjectStudied = 0;
          let subjectMastered = 0;
          let subjectNeedsReview = 0;
          let currentLessonTitle = "لم يتم تحديده بعد";

          subject.units.forEach(u => {
            u.lessons.forEach(l => {
              subjectTotal++;
              if (l.isStudied || l.status === 'mastered' || l.status === 'current') {
                subjectStudied++;
              }
              if (l.status === 'mastered' || (l.quiz && l.quiz.percentage >= 95)) {
                subjectMastered++;
              }
              if (l.status === 'needs_review' || (l.quiz && l.quiz.percentage < 95)) {
                subjectNeedsReview++;
              }
              if (l.id === subject.currentLessonId) {
                currentLessonTitle = l.title;
              }
            });
          });

          const studiedPercent = subjectTotal > 0 
            ? Math.round((subjectStudied / subjectTotal) * 100) 
            : 0;

          // Find schedule classes for this subject specifically
          const subjectClasses = schedule.filter(c => c.subjectId === subject.id);
          const nextClass = subjectClasses[0];

          return (
            <div
              key={subject.id}
              onClick={() => onSelectSubject(subject.id)}
              className="bg-white rounded-3xl border-2 border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-xl hover:shadow-emerald-600/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between group"
            >
              <div>
                
                {/* Card Header with Subject Color Theme */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/70 group-hover:bg-emerald-50/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-13 h-13 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <SubIcon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {subject.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mt-0.5">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-emerald-600" />
                            {subject.teacherName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-2xs shrink-0">
                      {subject.units.length} فصول
                    </span>
                  </div>
                </div>

                {/* Card Content & Metrics */}
                <div className="p-5 space-y-4">
                  
                  {/* Current Lesson Spotlight */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-300/80 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-900">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span>الدرس المتوقفين عنده حالياً:</span>
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-800 line-clamp-2 leading-snug pr-4">
                      {currentLessonTitle}
                    </div>
                  </div>

                  {/* 4 Main KPIs for this Subject */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    
                    {/* Total Lessons */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-500 font-bold">إجمالي الدروس:</span>
                      <span className="font-black text-slate-900">{subjectTotal}</span>
                    </div>

                    {/* Studied Lessons */}
                    <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between">
                      <span className="text-emerald-800 font-bold">تمت دراسته:</span>
                      <span className="font-black text-emerald-700">{subjectStudied}</span>
                    </div>

                    {/* Mastered (>= 95%) */}
                    <div className="bg-teal-50/50 p-2.5 rounded-xl border border-teal-100 flex items-center justify-between">
                      <span className="text-teal-800 font-bold">متقن بتفوق:</span>
                      <span className="font-black text-teal-700">{subjectMastered}</span>
                    </div>

                    {/* Needs Review (< 95%) */}
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      subjectNeedsReview > 0 
                        ? 'bg-amber-50 border-amber-200 text-amber-900' 
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}>
                      <span className="font-bold">يحتاج مراجعة:</span>
                      <span className={`font-black ${subjectNeedsReview > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                        {subjectNeedsReview}
                      </span>
                    </div>

                  </div>

                  {/* Next Class for THIS Subject specifically */}
                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-blue-900">
                      <CalendarClock className="w-3.5 h-3.5 text-blue-600" />
                      <span>موعد الحصة في الجدول:</span>
                    </div>
                    {nextClass ? (
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800 pr-4">
                        <span>{nextClass.day}: {nextClass.time}</span>
                        <span className="text-[10px] text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                          {nextClass.location}
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 pr-4">لا توجد حصة مسجلة في الجدول</div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                      <span>نسبة دراسة المنهج</span>
                      <span className="text-emerald-700 font-extrabold">{studiedPercent}% ({subjectStudied}/{subjectTotal})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${studiedPercent}%` }}
                      ></div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Button at Bottom */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs font-black text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <span>فتح فهرس ومراجعات المادة</span>
                <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}