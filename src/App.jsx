import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePortal from './components/HomePortal';
import SubjectsHub from './components/SubjectsHub';
import SubjectView from './components/SubjectView';
import ScheduleView from './components/ScheduleView';
import TestModal from './components/TestModal';
import SyllabusEditorModal from './components/SyllabusEditorModal';
import { initialSubjects, initialSchedule } from './data/defaultData';

export default function App() {
  // Load from localStorage or defaults with automatic cache cleaning for v4
  const [subjects, setSubjects] = useState(() => {
    try {
      const dataVersion = localStorage.getItem('study_tracker_data_version');
      const saved = localStorage.getItem('study_tracker_subjects');
      
      // If version is v4_clean and has no old dummy mock dates, use it
      if (saved && dataVersion === 'v4_clean') {
        const parsed = JSON.parse(saved);
        const hasDummyDate = parsed.some(s => 
          s.units.some(u => 
            u.lessons.some(l => l.quiz?.date === '2026-10-12' || l.quiz?.date === '2026-10-18' || l.quiz?.date === '2026-10-14')
          )
        );
        if (!hasDummyDate) {
          return parsed;
        }
      }
      // Migrate and reset to clean initial subjects
      localStorage.setItem('study_tracker_data_version', 'v4_clean');
      localStorage.setItem('study_tracker_subjects', JSON.stringify(initialSubjects));
      return initialSubjects;
    } catch {
      return initialSubjects;
    }
  });

  const [schedule, setSchedule] = useState(() => {
    try {
      const saved = localStorage.getItem('study_tracker_schedule');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.some(c => c.subjectId === 'geology') || !parsed.some(c => c.teacher?.includes('محمد طارق'))) {
          localStorage.setItem('study_tracker_schedule', JSON.stringify(initialSchedule));
          return initialSchedule;
        }
        return parsed;
      }
      return initialSchedule;
    } catch {
      return initialSchedule;
    }
  });

  // Default mode: Yara's Mode (isAdmin = false) as explicitly requested!
  const [isAdmin, setIsAdmin] = useState(false);

  // Screen Navigation: 'home' | 'subjects_hub' | 'subject_detail' | 'schedule'
  // Starts on 'home' when the website opens!
  const [currentScreen, setCurrentScreen] = useState('home');
  const [activeSubjectId, setActiveSubjectId] = useState('physics');

  // Modals state
  const [testModal, setTestModal] = useState({
    isOpen: false,
    subject: null,
    lesson: null
  });

  const [syllabusModal, setSyllabusModal] = useState({
    isOpen: false,
    subject: null
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('study_tracker_subjects', JSON.stringify(subjects));
    } catch (err) {
      console.error("Failed to save subjects to localStorage", err);
    }
  }, [subjects]);

  useEffect(() => {
    try {
      localStorage.setItem('study_tracker_schedule', JSON.stringify(schedule));
    } catch (err) {
      console.error("Failed to save schedule to localStorage", err);
    }
  }, [schedule]);

  // Handler: Set current lesson (where they stopped)
  const handleSetCurrentLesson = (subjectId, lessonId) => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id !== subjectId) return sub;

      const updatedUnits = sub.units.map(unit => ({
        ...unit,
        lessons: unit.lessons.map(lesson => {
          if (lesson.id === lessonId) {
            return {
              ...lesson,
              status: lesson.quiz 
                ? (lesson.quiz.percentage >= 95 ? 'mastered' : 'needs_review')
                : 'current'
            };
          }
          // If was 'current' and not tested, set back to not_started
          if (lesson.status === 'current' && !lesson.quiz) {
            return { ...lesson, status: 'not_started' };
          }
          return lesson;
        })
      }));

      return {
        ...sub,
        currentLessonId: lessonId,
        units: updatedUnits
      };
    }));
  };

  // Handler: Toggle Studied Status independently of order
  const handleToggleStudiedLesson = (subjectId, lessonId) => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id !== subjectId) return sub;

      const updatedUnits = sub.units.map(unit => ({
        ...unit,
        lessons: unit.lessons.map(lesson => {
          if (lesson.id === lessonId) {
            const currentlyStudied = lesson.isStudied === true;
            return {
              ...lesson,
              isStudied: !currentlyStudied
            };
          }
          return lesson;
        })
      }));

      return {
        ...sub,
        units: updatedUnits
      };
    }));
  };

  // Handler: Save Quiz result from Gemini
  const handleSaveQuiz = (subjectId, lessonId, quizData) => {
    const isPassed = quizData.percentage >= 95;

    setSubjects(prev => prev.map(sub => {
      if (sub.id !== subjectId) return sub;

      const updatedUnits = sub.units.map(unit => ({
        ...unit,
        lessons: unit.lessons.map(lesson => {
          if (lesson.id === lessonId) {
            return {
              ...lesson,
              isStudied: true,
              quiz: quizData,
              status: isPassed ? 'mastered' : 'needs_review'
            };
          }
          return lesson;
        })
      }));

      return {
        ...sub,
        units: updatedUnits
      };
    }));
  };

  // Handler: Delete / Reset Quiz result
  const handleDeleteQuiz = (subjectId, lessonId) => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id !== subjectId) return sub;

      const updatedUnits = sub.units.map(unit => ({
        ...unit,
        lessons: unit.lessons.map(lesson => {
          if (lesson.id === lessonId) {
            return {
              ...lesson,
              quiz: null,
              status: lesson.id === sub.currentLessonId ? 'current' : 'not_started'
            };
          }
          return lesson;
        })
      }));

      return {
        ...sub,
        units: updatedUnits
      };
    }));
  };

  // Handler: Update Subject Syllabus
  const handleUpdateSubject = (updatedSubject) => {
    setSubjects(prev => prev.map(sub => sub.id === updatedSubject.id ? updatedSubject : sub));
  };

  // Backup / Export
  const handleExportData = () => {
    const data = {
      subjects,
      schedule,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yara-study-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Backup / Import
  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.subjects && parsed.schedule) {
          setSubjects(parsed.subjects);
          setSchedule(parsed.schedule);
          alert("تمت استعادة البيانات بنجاح! 🌸");
        } else {
          alert("الملف غير صالح أو لا يحتوي على بنية البيانات المطلوبة.");
        }
      } catch (err) {
        alert("حدث خطأ أثناء قراءة ملف النسخة الاحتياطية.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to default data
  const handleResetData = () => {
    if (window.confirm("هل تريد استعادة البيانات الأصلية النظيفة؟ سيتم تصفير أي تعديلات.")) {
      setSubjects(initialSubjects);
      setSchedule(initialSchedule);
      localStorage.setItem('study_tracker_data_version', 'v4_clean');
      localStorage.setItem('study_tracker_subjects', JSON.stringify(initialSubjects));
      localStorage.removeItem('study_tracker_schedule');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-cairo">
      
      {/* Top Header */}
      <Header
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        onGoHome={() => setCurrentScreen('home')}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        
        {/* 1. SCREEN: HOME LANDING PAGE */}
        {currentScreen === 'home' && (
          <HomePortal
            subjects={subjects}
            schedule={schedule}
            isAdmin={isAdmin}
            onNavigateToSubjects={() => setCurrentScreen('subjects_hub')}
            onNavigateToSchedule={() => setCurrentScreen('schedule')}
            onSelectSubject={(subjectId) => {
              setActiveSubjectId(subjectId);
              setCurrentScreen('subject_detail');
            }}
          />
        )}

        {/* 2. SCREEN: SUBJECTS DIRECTORY HUB (المواد الدراسية) */}
        {currentScreen === 'subjects_hub' && (
          <SubjectsHub
            subjects={subjects}
            schedule={schedule}
            onSelectSubject={(subjectId) => {
              setActiveSubjectId(subjectId);
              setCurrentScreen('subject_detail');
            }}
            onBackToHome={() => setCurrentScreen('home')}
          />
        )}

        {/* 3. SCREEN: SUBJECT DETAIL (مادة معينة كـ الفيزياء مثلاً مع كافة مؤشراتها وفهرسها ومراجعاتها) */}
        {currentScreen === 'subject_detail' && (
          <SubjectView
            subjects={subjects}
            activeSubjectId={activeSubjectId}
            setActiveSubjectId={setActiveSubjectId}
            schedule={schedule}
            isAdmin={isAdmin}
            onSetCurrentLesson={handleSetCurrentLesson}
            onToggleStudiedLesson={handleToggleStudiedLesson}
            onOpenTestModal={(subj, less) => setTestModal({ isOpen: true, subject: subj, lesson: less })}
            onOpenSyllabusEditor={(subj) => setSyllabusModal({ isOpen: true, subject: subj })}
            onDeleteQuiz={handleDeleteQuiz}
            onBackToHub={() => setCurrentScreen('subjects_hub')}
            onBackToHome={() => setCurrentScreen('home')}
          />
        )}

        {/* 4. SCREEN: TUTORING SCHEDULE (الدروس الخصوصية) */}
        {currentScreen === 'schedule' && (
          <ScheduleView
            schedule={schedule}
            setSchedule={setSchedule}
            subjects={subjects}
            isAdmin={isAdmin}
            onBackToHome={() => setCurrentScreen('home')}
          />
        )}

      </main>

      {/* Test Recording Modal */}
      <TestModal
        isOpen={testModal.isOpen}
        subject={testModal.subject}
        lesson={testModal.lesson}
        onClose={() => setTestModal({ isOpen: false, subject: null, lesson: null })}
        onSaveQuiz={handleSaveQuiz}
        onDeleteQuiz={handleDeleteQuiz}
      />

      {/* Syllabus & Content Editor Modal */}
      <SyllabusEditorModal
        isOpen={syllabusModal.isOpen}
        subject={syllabusModal.subject}
        onClose={() => setSyllabusModal({ isOpen: false, subject: null })}
        onUpdateSubject={handleUpdateSubject}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            🎓 منصة إنجاز للمتابعة المدرسية الذكية — صُممت خصيصاً لدعم وتفوق يارا في الثانوية العامة 🌸
          </p>
          <p className="text-slate-500 font-semibold">
            معيار التفوق: <span className="text-emerald-600 font-bold">95%</span> فأعلى | حفظ فوري بالمتصفح
          </p>
        </div>
      </footer>

    </div>
  );
}