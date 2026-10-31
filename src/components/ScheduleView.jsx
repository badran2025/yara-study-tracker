import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  BookOpen, 
  X, 
  Check, 
  Home, 
  ArrowRight,
  CalendarClock,
  LayoutGrid,
  Filter,
  ListOrdered,
  Bell
} from 'lucide-react';
import { 
  DAYS_OF_WEEK, 
  JS_DAY_TO_NAME, 
  splitTimeRange, 
  sortClassesChronologically, 
  getNextUpcomingClass 
} from '../utils/scheduleHelpers';

const commonTimePresets = [
  { start: "09:00 ص", end: "10:00 ص" },
  { start: "10:00 ص", end: "11:00 ص" },
  { start: "11:00 ص", end: "12:00 م" },
  { start: "12:00 م", end: "01:00 م" },
  { start: "01:00 م", end: "02:00 م" },
  { start: "02:00 م", end: "03:00 م" },
  { start: "03:00 م", end: "04:00 م" },
  { start: "04:00 م", end: "05:00 م" },
  { start: "05:00 م", end: "06:00 م" },
  { start: "06:00 م", end: "07:00 م" }
];

export default function ScheduleView({ 
  schedule, 
  setSchedule, 
  subjects, 
  isAdmin,
  onBackToHome,
  onUpdateSubjectTeacher
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = Add, string = Edit
  const [syncTeacherWithSubject, setSyncTeacherWithSubject] = useState(true);
  const [viewFilter, setViewFilter] = useState('all'); // 'all' | 'active_only' | 'timeline'

  // Time start & end for clean input
  const [timeStart, setTimeStart] = useState('10:00 ص');
  const [timeEnd, setTimeEnd] = useState('11:00 ص');

  const [formData, setFormData] = useState({
    subjectId: subjects[0]?.id || 'physics',
    day: 'السبت',
    time: '10:00 ص - 11:00 ص',
    teacher: '',
    location: 'سنتر تعليمي',
    notes: ''
  });

  // Calculate real-time Next Class
  const nextUpcoming = getNextUpcomingClass(schedule, subjects);
  const todayName = JS_DAY_TO_NAME[new Date().getDay()];

  // Open modal for Adding
  const handleOpenAdd = () => {
    const defaultSub = subjects[0];
    setEditingId(null);
    setTimeStart('10:00 ص');
    setTimeEnd('11:00 ص');
    setFormData({
      subjectId: defaultSub?.id || 'physics',
      day: 'السبت',
      time: '10:00 ص - 11:00 ص',
      teacher: defaultSub?.teacherName || '',
      location: defaultSub?.tutoringLocation || 'سنتر تعليمي',
      notes: ''
    });
    setSyncTeacherWithSubject(true);
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (cls) => {
    setEditingId(cls.id);
    const sub = subjects.find(s => s.id === cls.subjectId);
    const { start, end } = splitTimeRange(cls.time);
    setTimeStart(start || '10:00 ص');
    setTimeEnd(end || '11:00 ص');
    setFormData({
      subjectId: cls.subjectId,
      day: cls.day,
      time: cls.time,
      teacher: cls.teacher || sub?.teacherName || '',
      location: cls.location || sub?.tutoringLocation || 'سنتر تعليمي',
      notes: cls.notes || ''
    });
    setSyncTeacherWithSubject(true);
    setIsModalOpen(true);
  };

  // Save (Add or Update)
  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = subjects.find(s => s.id === formData.subjectId);
    const finalTeacher = formData.teacher.trim() || subject?.teacherName || 'معلم المادة';
    
    // Construct clean standard time string
    const finalTime = timeEnd.trim() 
      ? `${timeStart.trim()} - ${timeEnd.trim()}` 
      : timeStart.trim();

    const dataToSave = {
      ...formData,
      time: finalTime,
      teacher: finalTeacher
    };

    if (editingId) {
      setSchedule(prev => prev.map(item => item.id === editingId ? { ...item, ...dataToSave } : item));
    } else {
      const newItem = {
        id: `sch-${Date.now()}`,
        ...dataToSave
      };
      setSchedule(prev => [...prev, newItem]);
    }

    if (syncTeacherWithSubject && onUpdateSubjectTeacher && formData.subjectId) {
      onUpdateSubjectTeacher(formData.subjectId, finalTeacher, formData.location);
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  // Delete
  const handleDeleteClass = (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الحصة من جدول يارا؟")) {
      setSchedule(prev => prev.filter(c => c.id !== id));
    }
  };

  // Determine which days to display based on filter
  const displayedDays = DAYS_OF_WEEK.filter(dayName => {
    if (viewFilter === 'active_only') {
      return schedule.some(c => c.day === dayName);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600">
          <button 
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-slate-500 hover:text-blue-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <Home className="w-4 h-4 text-blue-600" />
            <span>الرئيسية</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-blue-800 font-extrabold flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>جدول الدروس والحصص الأسبوعية</span>
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

      {/* Real-time Next Class Spotlight Banner */}
      {nextUpcoming && (
        <div className="relative overflow-hidden bg-gradient-to-l from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-blue-700/15 border border-blue-500/30">
          <div className="absolute left-0 bottom-0 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-yellow-300 border border-white/20 shrink-0 shadow-inner">
                <CalendarClock className="w-7 h-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-yellow-400 text-yellow-950 shadow-sm animate-pulse">
                    🔔 {nextUpcoming.relativeDay}
                  </span>
                  <span className="text-xs text-blue-200 font-bold">
                    الحصة القادمة المستحقة في جدول يارا
                  </span>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
                  <span>{nextUpcoming.subjectName}</span>
                  <span className="text-blue-200 font-bold text-sm sm:text-base">
                    ({nextUpcoming.teacher})
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
              <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-xs sm:text-sm font-black text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-300" />
                <span>{nextUpcoming.formattedTime}</span>
              </div>

              {nextUpcoming.location && (
                <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold text-blue-100 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-300" />
                  <span>{nextUpcoming.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Controls Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-800">
              جدول الحصص الأسبوعية مرتباً بالأيام 📅
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              {schedule.length} حصص مسجلة
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            اليوم الحالي: <strong className="text-blue-700">{todayName}</strong> | الحصص مرتبة زمنياً من الصباح للمساء لمنع أي تداخل.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Filter Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewFilter === 'all' 
                  ? 'bg-white text-blue-800 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كل أيام الأسبوع
            </button>
            <button
              onClick={() => setViewFilter('active_only')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewFilter === 'active_only' 
                  ? 'bg-white text-blue-800 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              أيام الحصص فقط
            </button>
            <button
              onClick={() => setViewFilter('timeline')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewFilter === 'timeline' 
                  ? 'bg-white text-blue-800 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الجدول الزمني (Timeline)
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حصة</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-800">
                  {editingId ? 'تعديل موعد الحصة المسجلة' : 'إضافة موعد حصة جديد لجدول يارا'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">المادة الدراسية</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => {
                    const selectedSub = subjects.find(s => s.id === e.target.value);
                    setFormData(prev => ({ 
                      ...prev, 
                      subjectId: e.target.value,
                      teacher: selectedSub?.teacherName || prev.teacher,
                      location: selectedSub?.tutoringLocation || prev.location
                    }));
                  }}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 font-bold"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">يوم الحصة</label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 font-bold"
                >
                  {DAYS_OF_WEEK.map(d => (
                    <option key={d} value={d}>
                      {d} {d === todayName ? '(اليوم)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Precise Time Inputs (Start and End) */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                <label className="block font-black text-slate-800">
                  ⏰ توقيت الحصة (من البداية حتى النهاية):
                </label>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 mb-1 block">وقت البدء (من):</span>
                    <input
                      type="text"
                      value={timeStart}
                      onChange={(e) => setTimeStart(e.target.value)}
                      placeholder="مثال: 10:00 ص"
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-bold text-center"
                      required
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-600 mb-1 block">وقت الانتهاء (إلى):</span>
                    <input
                      type="text"
                      value={timeEnd}
                      onChange={(e) => setTimeEnd(e.target.value)}
                      placeholder="مثال: 11:00 ص"
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-bold text-center"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">
                    اختيار سريع لمواعيد الحصص الشائعة:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {commonTimePresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setTimeStart(preset.start);
                          setTimeEnd(preset.end);
                        }}
                        className="text-[11px] font-bold px-2 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 rounded-lg transition-colors text-slate-700"
                      >
                        {preset.start} - {preset.end}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم المعلم</label>
                  <input
                    type="text"
                    value={formData.teacher}
                    onChange={(e) => setFormData(prev => ({ ...prev, teacher: e.target.value }))}
                    placeholder="اسم المدرس (مثال: أ/ محمد)"
                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">مكان الحصة / السنتر</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="مثال: سنتر تعليمي أو أونلاين"
                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 font-bold"
                  />
                </div>
              </div>

              {/* Sync teacher with subject profile */}
              <label className="flex items-center gap-2.5 p-3 bg-blue-50/70 border border-blue-200 rounded-xl cursor-pointer text-xs font-bold text-blue-900 select-none">
                <input
                  type="checkbox"
                  checked={syncTeacherWithSubject}
                  onChange={(e) => setSyncTeacherWithSubject(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span>تحديث اسم المعلم والمكان في بطاقة المادة أيضاً (ليظهر بالرئيسية وفهرس المادة)</span>
              </label>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات إضافية (اختياري)</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="مثال: تسميع كلمات، حل تدريبات كتاب التفوق..."
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'حفظ التعديلات' : 'إضافة الحصة للجدول'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODE 1: CHRONOLOGICAL TIMELINE AGENDA */}
      {viewFilter === 'timeline' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-base">
              الجدول الزمني المرتب لجميع الحصص حسب الأيام والساعات 🕒
            </h3>
            <span className="text-xs text-slate-500">
              إجمالي {schedule.length} حصص
            </span>
          </div>

          <div className="space-y-6">
            {DAYS_OF_WEEK.map(dayName => {
              const classesThisDay = sortClassesChronologically(schedule.filter(c => c.day === dayName));
              if (classesThisDay.length === 0) return null;
              const isToday = dayName === todayName;

              return (
                <div key={dayName} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                      isToday ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800 text-white'
                    }`}>
                      {dayName} {isToday ? '(اليوم الحالي 📍)' : ''}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">
                      {classesThisDay.length} {classesThisDay.length === 1 ? 'حصة' : 'حصص'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {classesThisDay.map(cls => {
                      const sub = subjects.find(s => s.id === cls.subjectId);
                      const { start, end } = splitTimeRange(cls.time);
                      const isThisNext = nextUpcoming && nextUpcoming.id === cls.id;

                      return (
                        <div 
                          key={cls.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isThisNext 
                              ? 'bg-emerald-50/60 border-emerald-400 shadow-md ring-2 ring-emerald-300' 
                              : 'bg-slate-50/70 border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-black text-slate-900 text-sm">
                                {sub?.name || cls.subjectId}
                              </div>
                              <div className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                                <User className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{cls.teacher || sub?.teacherName}</span>
                              </div>
                            </div>

                            {isThisNext && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white animate-pulse">
                                الحصة القادمة 🔔
                              </span>
                            )}
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                            <span className="font-extrabold text-blue-900 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
                              {end ? `من ${start} إلى ${end}` : start}
                            </span>
                            {cls.location && (
                              <span className="text-slate-500 text-[11px] font-semibold">
                                📍 {cls.location}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: WEEK GRID (ALL OR ACTIVE ONLY) */}
      {viewFilter !== 'timeline' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedDays.map(dayName => {
            // Sort classes chronologically within this day!
            const classesThisDay = sortClassesChronologically(schedule.filter(c => c.day === dayName));
            const isToday = dayName === todayName;

            return (
              <div 
                key={dayName}
                className={`rounded-3xl border p-4 transition-all ${
                  isToday 
                    ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-300/70' 
                    : classesThisDay.length > 0 
                      ? 'bg-white border-slate-200 shadow-sm' 
                      : 'bg-slate-50/70 border-dashed border-slate-200'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      isToday 
                        ? 'bg-emerald-500 ring-4 ring-emerald-200 animate-pulse' 
                        : classesThisDay.length > 0 
                          ? 'bg-blue-500 ring-2 ring-blue-200' 
                          : 'bg-slate-300'
                    }`} />
                    <h3 className="font-black text-slate-800 text-sm sm:text-base">
                      {dayName}
                    </h3>
                    {isToday && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        اليوم الحالي 📍
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    {classesThisDay.length} {classesThisDay.length === 1 ? 'حصة' : 'حصص'}
                  </span>
                </div>

                {/* Classes in this Day */}
                {classesThisDay.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-semibold">
                    لا توجد حصص في هذا اليوم 🌴
                  </div>
                ) : (
                  <div className="space-y-3">
                    {classesThisDay.map(cls => {
                      const sub = subjects.find(s => s.id === cls.subjectId);
                      const { start, end } = splitTimeRange(cls.time);
                      const isThisNext = nextUpcoming && nextUpcoming.id === cls.id;

                      return (
                        <div 
                          key={cls.id}
                          className={`p-3.5 rounded-2xl border transition-all group ${
                            isThisNext 
                              ? 'bg-emerald-50/70 border-emerald-400 shadow-md ring-2 ring-emerald-300/80' 
                              : 'bg-slate-50 hover:bg-blue-50/40 border-slate-200/80 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-sm">
                                  {sub?.name || cls.subjectId}
                                </span>
                                {isThisNext && (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs animate-pulse">
                                    الحصة القادمة 🔔
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                                <User className="w-3 h-3 text-emerald-600" />
                                <span>{cls.teacher || sub?.teacherName}</span>
                              </div>
                            </div>

                            {/* Edit / Delete Buttons */}
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenEdit(cls)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="تعديل موعد الحصة"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClass(cls.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                title="حذف الحصة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Time & Location Display - BiDi-safe & Clean */}
                          <div className="mt-2.5 text-xs text-slate-600 space-y-1.5">
                            <div className="flex items-center gap-1.5 font-extrabold text-blue-900 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              {end ? (
                                <span className="flex items-center gap-1.5 text-xs" dir="rtl">
                                  <span>من <strong className="text-blue-950 font-black">{start}</strong></span>
                                  <span className="text-slate-400 font-normal">←</span>
                                  <span>إلى <strong className="text-blue-950 font-black">{end}</strong></span>
                                </span>
                              ) : (
                                <span>الساعة: {start}</span>
                              )}
                            </div>

                            {cls.location && (
                              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] px-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{cls.location}</span>
                              </div>
                            )}
                          </div>

                          {cls.notes && (
                            <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                              📌 {cls.notes}
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
      )}

    </div>
  );
}
