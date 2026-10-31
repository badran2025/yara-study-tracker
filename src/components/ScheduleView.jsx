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
  ArrowRight
} from 'lucide-react';

const daysOfWeek = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

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
  
  const [formData, setFormData] = useState({
    subjectId: subjects[0]?.id || 'physics',
    day: 'السبت',
    time: '10:00 ص - 11:00 ص',
    teacher: '',
    location: 'سنتر تعليمي',
    notes: ''
  });

  // Open modal for Adding
  const handleOpenAdd = () => {
    const defaultSub = subjects[0];
    setEditingId(null);
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

    if (editingId) {
      // Update existing
      setSchedule(prev => prev.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            ...formData,
            teacher: finalTeacher
          };
        }
        return item;
      }));
    } else {
      // Add new
      const newItem = {
        id: `sch-${Date.now()}`,
        ...formData,
        teacher: finalTeacher
      };
      setSchedule(prev => [...prev, newItem]);
    }

    // If sync with subject profile is enabled
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
            <span>جدول الدروس والحصص الخصوصية</span>
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

      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                مواعيد دروس يارا الأسبوعية 📅
              </h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {schedule.length} حصص مسجلة
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              جدول الحصص الخاصة، توقيتها، أماكن الحضور، وأسماء المدرسين لكل مادة مع إمكانية التعديل والإضافة المباشرة.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md shadow-blue-600/20 self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة موعد حصة جديد</span>
        </button>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">يوم الحصة</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 font-bold"
                  >
                    {daysOfWeek.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">توقيت الحصة</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    placeholder="مثال: 10:00 ص - 11:00 ص"
                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 font-bold"
                    required
                  />
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

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {daysOfWeek.map(dayName => {
          const classesThisDay = schedule.filter(c => c.day === dayName);

          return (
            <div 
              key={dayName}
              className={`rounded-3xl border p-4 transition-all ${
                classesThisDay.length > 0 
                  ? 'bg-white border-slate-200 shadow-sm' 
                  : 'bg-slate-50/70 border-dashed border-slate-200'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    classesThisDay.length > 0 ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-300'
                  }`} />
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    {dayName}
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-slate-400">
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

                    return (
                      <div 
                        key={cls.id}
                        className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/40 border border-slate-200/80 hover:border-blue-300 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                              <span>{sub?.name || cls.subjectId}</span>
                            </div>
                            <div className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                              <User className="w-3 h-3 text-emerald-600" />
                              <span>{cls.teacher || sub?.teacherName}</span>
                            </div>
                          </div>

                          {/* Edit / Delete Buttons available directly */}
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

                        <div className="mt-2.5 text-xs text-slate-600 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span dir="ltr" className="text-right">{cls.time}</span>
                          </div>
                          {cls.location && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
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

    </div>
  );
}