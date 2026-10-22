import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Layers, 
  BookOpen, 
  FileText, 
  Check, 
  UploadCloud,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function SyllabusEditorModal({ 
  isOpen, 
  onClose, 
  subject, 
  onUpdateSubject 
}) {
  if (!isOpen || !subject) return null;

  const [subjectData, setSubjectData] = useState(JSON.parse(JSON.stringify(subject)));
  const [bulkText, setBulkText] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState(subjectData.units[0]?.id || '');
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Update basic info
  const handleBasicChange = (field, value) => {
    setSubjectData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add unit
  const handleAddUnit = () => {
    if (!newUnitTitle.trim()) return;
    const newUnit = {
      id: `unit-${Date.now()}`,
      title: newUnitTitle.trim(),
      lessons: []
    };
    setSubjectData(prev => ({
      ...prev,
      units: [...prev.units, newUnit]
    }));
    setSelectedUnitId(newUnit.id);
    setNewUnitTitle('');
  };

  // Delete unit
  const handleDeleteUnit = (unitId) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الوحدة وجميع دروسها؟")) {
      setSubjectData(prev => ({
        ...prev,
        units: prev.units.filter(u => u.id !== unitId)
      }));
    }
  };

  // Add single lesson to unit
  const handleAddLesson = (unitId) => {
    const title = prompt("أدخل اسم أو عنوان الدرس الجديد:");
    if (!title || !title.trim()) return;

    const newLesson = {
      id: `les-${Date.now()}`,
      title: title.trim(),
      description: "تمت إضافته للفهرس",
      status: "not_started",
      quiz: null
    };

    setSubjectData(prev => ({
      ...prev,
      units: prev.units.map(u => {
        if (u.id === unitId) {
          return {
            ...u,
            lessons: [...u.lessons, newLesson]
          };
        }
        return u;
      })
    }));
  };

  // Delete lesson
  const handleDeleteLesson = (unitId, lessonId) => {
    setSubjectData(prev => ({
      ...prev,
      units: prev.units.map(u => {
        if (u.id === unitId) {
          return {
            ...u,
            lessons: u.lessons.filter(l => l.id !== lessonId)
          };
        }
        return u;
      })
    }));
  };

  // Bulk import lessons
  const handleBulkImport = () => {
    if (!bulkText.trim() || !selectedUnitId) return;

    const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const newLessons = lines.map((line, idx) => ({
      id: `les-bulk-${Date.now()}-${idx}`,
      title: line.replace(/^[-*•\d.]+\s*/, ''), // strip bullet numbers
      description: "درس مقرر",
      status: "not_started",
      quiz: null
    }));

    setSubjectData(prev => ({
      ...prev,
      units: prev.units.map(u => {
        if (u.id === selectedUnitId) {
          return {
            ...u,
            lessons: [...u.lessons, ...newLessons]
          };
        }
        return u;
      })
    }));

    setBulkText('');
    setShowBulkImport(false);
  };

  const handleSave = () => {
    onUpdateSubject(subjectData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              تعديل بيانات وفهرس مادة: {subjectData.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              يمكنك تحديث اسم المعلم ومكانه، وإضافة أو حذف الوحدات والدروس، أو نسخ ولصق الفهرس دفعة واحدة.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto py-4 space-y-5 text-xs pr-1">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم المادة</label>
              <input
                type="text"
                value={subjectData.name}
                onChange={(e) => handleBasicChange('name', e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم المعلم</label>
              <input
                type="text"
                value={subjectData.teacherName}
                onChange={(e) => handleBasicChange('teacherName', e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">مكان الدرس</label>
              <input
                type="text"
                value={subjectData.tutoringLocation}
                onChange={(e) => handleBasicChange('tutoringLocation', e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          {/* Quick Bulk Import Toggle */}
          <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-4">
            <button
              type="button"
              onClick={() => setShowBulkImport(!showBulkImport)}
              className="flex items-center justify-between w-full font-black text-emerald-900 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-700" />
                <span>نسخ ولصق فهرس كامل دفعة واحدة (Bulk Import)</span>
              </div>
              <span className="text-xs bg-emerald-200/70 px-2 py-0.5 rounded-lg text-emerald-900">
                {showBulkImport ? 'إخفاء' : 'فتح اللصق السريع'}
              </span>
            </button>

            {showBulkImport && (
              <div className="mt-3 space-y-3 pt-3 border-t border-emerald-200">
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  الصق أسماء الدروس هنا (كل درس في سطر جديد)، وسيتم تحويلها تلقائياً إلى دروس بالفهرس:
                </p>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">إضافة إلى الوحدة:</label>
                  <select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white outline-none"
                  >
                    {subjectData.units.map(u => (
                      <option key={u.id} value={u.id}>{u.title}</option>
                    ))}
                  </select>
                </div>

                <textarea
                  rows={4}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="الدرس الأول: مقدمة في المادة&#10;الدرس الثاني: القوانين الأساسية&#10;الدرس الثالث: التطبيقات العملية"
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none bg-white font-mono text-xs resize-none"
                />

                <button
                  type="button"
                  onClick={handleBulkImport}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>توليد وإدراج الدروس في الفهرس</span>
                </button>
              </div>
            )}
          </div>

          {/* Add Unit Field */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newUnitTitle}
              onChange={(e) => setNewUnitTitle(e.target.value)}
              placeholder="عنوان وحدة / فصل جديد (مثال: الوحدة الثالثة: الكيمياء العضوية)"
              className="flex-1 p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddUnit}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة وحدة</span>
            </button>
          </div>

          {/* Current Units List */}
          <div className="space-y-4">
            <div className="font-black text-slate-800 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>فهرس الوحدات والدروس الحالي:</span>
            </div>

            {subjectData.units.map((unit, uIdx) => (
              <div key={unit.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                      {uIdx + 1}
                    </span>
                    <span className="font-extrabold text-slate-800 text-sm">{unit.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddLesson(unit.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold text-[11px] flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة درس</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUnit(unit.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="حذف الوحدة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lessons in Unit */}
                <div className="space-y-1.5">
                  {unit.lessons.length === 0 ? (
                    <div className="text-slate-400 italic text-[11px] py-2">لا توجد دروس مضافة لهذه الوحدة بعد.</div>
                  ) : (
                    unit.lessons.map((les, lIdx) => (
                      <div 
                        key={les.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2 flex-1 truncate">
                          <span className="text-slate-400 font-bold text-[10px] w-5">
                            {lIdx + 1}.
                          </span>
                          <span className="font-bold text-slate-800 truncate">{les.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteLesson(unit.id, les.id)}
                          className="text-slate-300 hover:text-rose-600 p-1"
                          title="حذف الدرس"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md shadow-emerald-600/20"
          >
            حفظ التعديلات
          </button>
        </div>

      </div>
    </div>
  );
}
