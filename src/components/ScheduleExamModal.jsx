import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  BookOpen, 
  Check, 
  Award, 
  FileText, 
  Sparkles,
  Layers
} from 'lucide-react';

export default function ScheduleExamModal({ 
  isOpen, 
  onClose, 
  subjects, 
  onSaveScheduledExam 
}) {
  if (!isOpen) return null;

  const defaultSubject = subjects[0] || {};
  const [selectedSubjectId, setSelectedSubjectId] = useState(defaultSubject.id || 'physics');
  const [targetType, setTargetType] = useState('unit'); // 'unit' | 'lesson'
  
  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || defaultSubject;
  const currentUnits = currentSubject.units || [];
  
  const [selectedUnitId, setSelectedUnitId] = useState(currentUnits[0]?.id || '');
  const currentUnit = currentUnits.find(u => u.id === selectedUnitId) || currentUnits[0] || {};
  const currentLessons = currentUnit.lessons || [];

  const [selectedLessonId, setSelectedLessonId] = useState(currentLessons[0]?.id || '');

  // Calculate default date tomorrow at 18:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [scheduledDate, setScheduledDate] = useState(defaultDateStr);
  const [scheduledTime, setScheduledTime] = useState('18:00');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    let targetTitle = '';
    let targetId = '';

    if (targetType === 'unit') {
      const unit = currentUnits.find(u => u.id === selectedUnitId);
      targetTitle = unit ? `الاختبار الشامل: ${unit.title}` : 'اختبار شامل للفصل';
      targetId = selectedUnitId;
    } else {
      const lesson = currentLessons.find(l => l.id === selectedLessonId);
      targetTitle = lesson ? lesson.title : 'اختبار الدرس';
      targetId = selectedLessonId;
    }

    const examData = {
      subjectId: selectedSubjectId,
      subjectName: currentSubject.name,
      targetType,
      targetId,
      targetTitle,
      unitId: selectedUnitId,
      unitTitle: currentUnit.title,
      scheduledDate,
      scheduledTime,
      notes: notes.trim()
    };

    onSaveScheduledExam(examData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Calendar className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">
                جدولة موعد اختبار جديد ليارا 📅
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                تحديد موعد الاختبار القادم ليظهر بعد تنازلي حي في الشاشة الرئيسية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          
          {/* Select Subject */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">المادة الدراسية:</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                const subId = e.target.value;
                setSelectedSubjectId(subId);
                const sub = subjects.find(s => s.id === subId);
                const firstUnit = sub?.units?.[0];
                setSelectedUnitId(firstUnit?.id || '');
                setSelectedLessonId(firstUnit?.lessons?.[0]?.id || '');
              }}
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Target Type: Unit Comprehensive vs Single Lesson */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">نوع الاختبار والمستوى:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetType('unit')}
                className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                  targetType === 'unit'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>اختبار شامل لفصل كامل</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('lesson')}
                className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                  targetType === 'lesson'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>اختبار لدرس محدد</span>
              </button>
            </div>
          </div>

          {/* Select Unit */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">الفصل / الباب المقرر:</label>
            <select
              value={selectedUnitId}
              onChange={(e) => {
                const uId = e.target.value;
                setSelectedUnitId(uId);
                const unit = currentUnits.find(u => u.id === uId);
                setSelectedLessonId(unit?.lessons?.[0]?.id || '');
              }}
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold"
            >
              {currentUnits.map(u => (
                <option key={u.id} value={u.id}>{u.title}</option>
              ))}
            </select>
          </div>

          {/* If Lesson Type: Select Lesson */}
          {targetType === 'lesson' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم الدرس المستهدف للاختبار:</label>
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold"
              >
                {currentLessons.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">تاريخ الاختبار:</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">وقت الاختبار (الساعة):</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold text-center"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">تعليمات وملاحظات الاختبار (اختياري):</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: التركيز على أسئلة الامتحانات السابقة وحل تدريبات كتاب التفوق..."
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Check className="w-4 h-4" />
              <span>تأكيد وجدولة الاختبار</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
