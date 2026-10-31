import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import HomePortal from './components/HomePortal';
import SubjectsHub from './components/SubjectsHub';
import SubjectView from './components/SubjectView';
import ScheduleView from './components/ScheduleView';
import ExamsCenterView from './components/ExamsCenterView';
import TestModal from './components/TestModal';
import SyllabusEditorModal from './components/SyllabusEditorModal';
import ScheduleExamModal from './components/ScheduleExamModal';
import RoleSelectModal from './components/RoleSelectModal';
import { initialSubjects, initialSchedule } from './data/defaultData';
import { onSnapshot } from 'firebase/firestore';
import { TRACKER_DOC_REF, saveStateToCloud } from './services/firebase';

export default function App() {
  // Load from localStorage or defaults with automatic cache migration for v7 (All 3 Arabic Books Complete)
  const [subjects, setSubjects] = useState(() => {
    try {
      const dataVersion = localStorage.getItem('study_tracker_data_version');
      const saved = localStorage.getItem('study_tracker_subjects');
      
      // If version is v7_arabic_all_three_books_complete and has Arabic reading & poetry units, use it
      if (saved && dataVersion === 'v7_arabic_all_three_books_complete') {
        const parsed = JSON.parse(saved);
        const arab = parsed.find(s => s.id === 'arabic');
        if (arab && arab.units.some(u => u.id === 'unit-ar-reading')) {
          return parsed;
        }
      }
      // Migrate and reset to clean initial subjects with all 3 Arabic books 100% complete
      localStorage.setItem('study_tracker_data_version', 'v7_arabic_all_three_books_complete');
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
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.some(c => c.subjectId === 'geology')) {
          return parsed;
        }
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

  // Scheduled Upcoming Exams state
  const [scheduledExams, setScheduledExams] = useState(() => {
    try {
      const saved = localStorage.getItem('study_tracker_scheduled_exams');
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  const [isScheduleExamModalOpen, setIsScheduleExamModalOpen] = useState(false);
  
  // Role Selection Modal on opening the site: Choose between Yara Mode 🌸 and Admin Mode 🛡️
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(() => {
    try {
      return !sessionStorage.getItem('yara_tracker_session_role_chosen');
    } catch {
      return true;
    }
  });

  const handleSelectRole = (role) => {
    setIsAdmin(role === 'admin');
    try {
      sessionStorage.setItem('yara_tracker_session_role_chosen', 'true');
    } catch (err) {
      console.error(err);
    }
    setIsRoleModalOpen(false);
  };

  // Modals state
  const [testModal, setTestModal] = useState({
    isOpen: false,
    subject: null,
    target: null
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

  useEffect(() => {
    try {
      localStorage.setItem('study_tracker_scheduled_exams', JSON.stringify(scheduledExams));
    } catch (err) {
      console.error("Failed to save scheduled exams to localStorage", err);
    }
  }, [scheduledExams]);

  // Real-time Cloud Firestore Sync status: 'synced' | 'saving' | 'pending_setup' | 'offline'
  const [syncStatus, setSyncStatus] = useState('synced');
  const isRemoteUpdateRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  // 1. Listen for real-time changes across all devices via Cloud Firestore
  useEffect(() => {
    let unsubscribe = () => {};

    try {
      unsubscribe = onSnapshot(
        TRACKER_DOC_REF,
        (docSnap) => {
          if (docSnap.exists()) {
            const cloudData = docSnap.data();

            // Mark this update as coming from the cloud so we don't bounce it back
            isRemoteUpdateRef.current = true;

            // Smart Merge for Subjects: ensure local studied lessons aren't lost if cloud had none
            if (cloudData.subjects && Array.isArray(cloudData.subjects)) {
              setSubjects(prevLocal => {
                let localStudied = 0;
                prevLocal.forEach(s => s.units.forEach(u => u.lessons.forEach(l => { if (l.isStudied) localStudied++; })));

                let cloudStudied = 0;
                cloudData.subjects.forEach(s => s.units.forEach(u => u.lessons.forEach(l => { if (l.isStudied) cloudStudied++; })));

                if (localStudied > cloudStudied) {
                  // Merge local studied marks into the cloud subjects
                  const merged = cloudData.subjects.map(cSub => {
                    const lSub = prevLocal.find(s => s.id === cSub.id);
                    if (!lSub) return cSub;
                    return {
                      ...cSub,
                      units: cSub.units.map(cUnit => {
                        const lUnit = lSub.units.find(u => u.id === cUnit.id);
                        if (!lUnit) return cUnit;
                        return {
                          ...cUnit,
                          lessons: cUnit.lessons.map(cLesson => {
                            const lLesson = lUnit.lessons.find(l => l.id === cLesson.id);
                            if (lLesson && lLesson.isStudied && !cLesson.isStudied) {
                              return { ...cLesson, isStudied: true, quiz: lLesson.quiz || cLesson.quiz, status: lLesson.status || cLesson.status };
                            }
                            return cLesson;
                          })
                        };
                      })
                    };
                  });
                  // Immediately seed cloud with the merged progress
                  saveStateToCloud(merged, cloudData.schedule || schedule, cloudData.scheduledExams || scheduledExams).catch(() => {});
                  return merged;
                }

                return cloudData.subjects;
              });
            }

            if (cloudData.schedule && Array.isArray(cloudData.schedule)) {
              setSchedule(cloudData.schedule);
            }

            if (cloudData.scheduledExams && Array.isArray(cloudData.scheduledExams)) {
              setScheduledExams(cloudData.scheduledExams);
            }

            setSyncStatus('synced');
          } else {
            // First time: Cloud document doesn't exist yet, seed with local data
            saveStateToCloud(subjects, schedule, scheduledExams)
              .then(() => setSyncStatus('synced'))
              .catch(err => {
                if (err?.code === 'permission-denied' || err?.message?.includes('Cloud Firestore API')) {
                  setSyncStatus('pending_setup');
                } else {
                  setSyncStatus('offline');
                }
              });
          }
        },
        (error) => {
          console.warn("Firestore onSnapshot error:", error);
          if (error?.code === 'permission-denied' || error?.message?.includes('Cloud Firestore API')) {
            setSyncStatus('pending_setup');
          } else {
            setSyncStatus('offline');
          }
        }
      );
    } catch (err) {
      console.warn("Failed to subscribe to Firestore:", err);
      setSyncStatus('offline');
    }

    return () => unsubscribe();
  }, []);

  // 2. Debounced auto-save to Cloud whenever user makes local modifications
  useEffect(() => {
    // Skip on initial component mount
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    // Skip if change originated from a remote Firestore snapshot
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    setSyncStatus('saving');
    const timer = setTimeout(() => {
      saveStateToCloud(subjects, schedule, scheduledExams)
        .then(() => {
          setSyncStatus('synced');
        })
        .catch(err => {
          if (err?.code === 'permission-denied' || err?.message?.includes('Cloud Firestore API')) {
            setSyncStatus('pending_setup');
          } else {
            setSyncStatus('offline');
          }
        });
    }, 600);

    return () => clearTimeout(timer);
  }, [subjects, schedule, scheduledExams]);

  const handleSaveScheduledExam = (examData) => {
    setScheduledExams(prev => [...prev, { id: `exam-${Date.now()}`, ...examData }]);
  };

  const handleDeleteScheduledExam = (examId) => {
    if (window.confirm("هل تريد بالتأكيد إلغاء موعد هذا الاختبار المجدول؟")) {
      setScheduledExams(prev => prev.filter(e => e.id !== examId));
    }
  };

  const handleOpenTestModal = (subj, targetOrLesson, unit = null) => {
    let finalTarget = targetOrLesson;
    if (unit && !targetOrLesson) {
      finalTarget = { id: unit.id, title: `الاختبار النهائي الشامل: ${unit.title}`, quiz: unit.quiz, type: 'unit' };
    } else if (targetOrLesson && !targetOrLesson.type) {
      finalTarget = { id: targetOrLesson.id, title: targetOrLesson.title, quiz: targetOrLesson.quiz, type: 'lesson' };
    }
    setTestModal({
      isOpen: true,
      subject: subj,
      target: finalTarget
    });
  };

  // Handler: Set current lesson (where they stopped) - Supports independent stopping point per unit / branch
  const handleSetCurrentLesson = (subjectId, lessonId, unitId) => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id !== subjectId) return sub;

      // Find unit containing this lesson if unitId not explicitly provided
      let targetUnitId = unitId;
      if (!targetUnitId) {
        const foundUnit = sub.units.find(u => u.lessons.some(l => l.id === lessonId));
        if (foundUnit) targetUnitId = foundUnit.id;
      }

      const currentLessonIdsByUnit = {
        ...(sub.currentLessonIdsByUnit || {}),
        ...(targetUnitId ? { [targetUnitId]: lessonId } : {})
      };

      const updatedUnits = sub.units.map(unit => {
        // Only reset current status within the SAME unit!
        // Other units (e.g. story vs grammar vs reading) preserve their own stopping point!
        if (targetUnitId && unit.id !== targetUnitId) {
          return unit;
        }

        return {
          ...unit,
          currentLessonId: lessonId,
          lessons: unit.lessons.map(lesson => {
            if (lesson.id === lessonId) {
              return {
                ...lesson,
                status: lesson.quiz 
                  ? (lesson.quiz.percentage >= 95 ? 'mastered' : 'needs_review')
                  : 'current'
              };
            }
            // If was 'current' and not tested, set back to not_started within this unit only
            if (lesson.status === 'current' && !lesson.quiz) {
              return { ...lesson, status: 'not_started' };
            }
            return lesson;
          })
        };
      });

      return {
        ...sub,
        currentLessonId: lessonId,
        currentLessonIdsByUnit,
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

  // Handler: Save Quiz result from Gemini (for Lesson or Unit Comprehensive Exam)
  const handleSaveQuiz = (subjectId, targetId, quizData, targetType = 'lesson') => {
    const isPassed = quizData.percentage >= 95;

    setSubjects(prev => prev.map(sub => {
      if (sub.id !== subjectId) return sub;

      // Unit-level comprehensive exam
      if (targetType === 'unit') {
        const updatedUnits = sub.units.map(unit => {
          if (unit.id === targetId) {
            return {
              ...unit,
              quiz: quizData
            };
          }
          return unit;
        });
        return {
          ...sub,
          units: updatedUnits
        };
      }

      // Lesson-level exam
      const updatedUnits = sub.units.map(unit => ({
        ...unit,
        lessons: unit.lessons.map(lesson => {
          if (lesson.id === targetId) {
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

  // Handler: Delete / Reset Quiz result (for Lesson or Unit)
  const handleDeleteQuiz = (subjectId, targetId, targetType = 'lesson') => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id !== subjectId) return sub;

      // Unit-level comprehensive exam delete
      if (targetType === 'unit') {
        const updatedUnits = sub.units.map(unit => {
          if (unit.id === targetId) {
            return {
              ...unit,
              quiz: null
            };
          }
          return unit;
        });
        return {
          ...sub,
          units: updatedUnits
        };
      }

      // Lesson-level exam delete
      const updatedUnits = sub.units.map(unit => ({
        ...unit,
        lessons: unit.lessons.map(lesson => {
          if (lesson.id === targetId) {
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
    if (updatedSubject.teacherName) {
      setSchedule(prev => prev.map(c => {
        if (c.subjectId === updatedSubject.id) {
          return {
            ...c,
            teacher: updatedSubject.teacherName,
            ...(updatedSubject.tutoringLocation ? { location: updatedSubject.tutoringLocation } : {})
          };
        }
        return c;
      }));
    }
  };

  // Handler: Update Subject Teacher & Location across platform and sync with schedule
  const handleUpdateSubjectTeacher = (subjectId, newTeacherName, newLocation) => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id === subjectId) {
        return {
          ...sub,
          teacherName: newTeacherName !== undefined ? newTeacherName : sub.teacherName,
          tutoringLocation: newLocation !== undefined ? newLocation : sub.tutoringLocation
        };
      }
      return sub;
    }));

    if (newTeacherName) {
      setSchedule(prev => prev.map(item => {
        if (item.subjectId === subjectId) {
          return {
            ...item,
            teacher: newTeacherName,
            ...(newLocation ? { location: newLocation } : {})
          };
        }
        return item;
      }));
    }
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

  // Apply Cross-Device Sync Data (from WhatsApp Code or JSON file)
  const handleApplyImportedData = ({ subjects: newSubjects, schedule: newSchedule, scheduledExams: newExams }) => {
    if (newSubjects && Array.isArray(newSubjects)) {
      setSubjects(newSubjects);
      try {
        localStorage.setItem('study_tracker_subjects', JSON.stringify(newSubjects));
      } catch (err) {
        console.error(err);
      }
    }
    if (newSchedule && Array.isArray(newSchedule)) {
      setSchedule(newSchedule);
      try {
        localStorage.setItem('study_tracker_schedule', JSON.stringify(newSchedule));
      } catch (err) {
        console.error(err);
      }
    }
    if (newExams && Array.isArray(newExams)) {
      setScheduledExams(newExams);
      try {
        localStorage.setItem('study_tracker_scheduled_exams', JSON.stringify(newExams));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Reset to default data
  const handleResetData = () => {
    if (window.confirm("هل تريد استعادة البيانات الأصلية النظيفة؟ سيتم تصفير أي تعديلات.")) {
      setSubjects(initialSubjects);
      setSchedule(initialSchedule);
      localStorage.setItem('study_tracker_data_version', 'v7_arabic_all_three_books_complete');
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
        syncStatus={syncStatus}
        onGoHome={() => setCurrentScreen('home')}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />

      {/* Main Container - Extended to 1720px widescreen */}
      <main className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        
        {/* 1. SCREEN: HOME LANDING PAGE */}
        {currentScreen === 'home' && (
          <HomePortal
            subjects={subjects}
            schedule={schedule}
            scheduledExams={scheduledExams}
            isAdmin={isAdmin}
            onNavigateToSubjects={() => setCurrentScreen('subjects_hub')}
            onNavigateToSchedule={() => setCurrentScreen('schedule')}
            onNavigateToExams={() => setCurrentScreen('exams')}
            onSelectSubject={(subjectId) => {
              setActiveSubjectId(subjectId);
              setCurrentScreen('subject_detail');
            }}
            onOpenScheduleExamModal={() => setIsScheduleExamModalOpen(true)}
            onDeleteScheduledExam={handleDeleteScheduledExam}
            onOpenTestModal={handleOpenTestModal}
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
            onOpenTestModal={handleOpenTestModal}
            onOpenSyllabusEditor={(subj) => setSyllabusModal({ isOpen: true, subject: subj })}
            onDeleteQuiz={handleDeleteQuiz}
            onUpdateSubjectTeacher={handleUpdateSubjectTeacher}
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
            onUpdateSubjectTeacher={handleUpdateSubjectTeacher}
            onBackToHome={() => setCurrentScreen('home')}
          />
        )}

        {/* 5. SCREEN: EXAMS CENTER & AUDIT MIRROR (مركز الاختبارات ومراية المتابعة والتدقيق) */}
        {currentScreen === 'exams' && (
          <ExamsCenterView
            subjects={subjects}
            scheduledExams={scheduledExams}
            onOpenScheduleExamModal={() => setIsScheduleExamModalOpen(true)}
            onDeleteScheduledExam={handleDeleteScheduledExam}
            onOpenTestModal={handleOpenTestModal}
            onBackToHome={() => setCurrentScreen('home')}
          />
        )}

      </main>

      {/* Test Recording Modal (Supports Lesson Quiz & Unit Comprehensive Exam) */}
      <TestModal
        isOpen={testModal.isOpen}
        subject={testModal.subject}
        target={testModal.target}
        onClose={() => setTestModal({ isOpen: false, subject: null, target: null })}
        onSaveQuiz={handleSaveQuiz}
        onDeleteQuiz={handleDeleteQuiz}
      />

      {/* Schedule Exam Modal */}
      <ScheduleExamModal
        isOpen={isScheduleExamModalOpen}
        onClose={() => setIsScheduleExamModalOpen(false)}
        subjects={subjects}
        onSaveScheduledExam={handleSaveScheduledExam}
      />

      {/* Syllabus & Content Editor Modal */}
      <SyllabusEditorModal
        isOpen={syllabusModal.isOpen}
        subject={syllabusModal.subject}
        onClose={() => setSyllabusModal({ isOpen: false, subject: null })}
        onUpdateSubject={handleUpdateSubject}
      />

      {/* Role Selection Modal on Opening Website */}
      <RoleSelectModal
        isOpen={isRoleModalOpen}
        onSelectRole={handleSelectRole}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div className="max-w-[1720px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
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