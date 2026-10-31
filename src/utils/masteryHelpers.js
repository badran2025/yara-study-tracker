// Mastery and Unit-level Examination Helpers for Yara's Study Tracker

/**
 * Calculates comprehensive mastery metrics for a single unit/chapter
 * @param {Object} unit - The unit object containing lessons array and optional unit.quiz
 * @returns {Object} Calculated metrics
 */
export function calculateUnitMastery(unit) {
  if (!unit || !Array.isArray(unit.lessons)) {
    return {
      totalLessons: 0,
      studiedLessons: 0,
      studyPercentage: 0,
      testedCount: 0,
      lessonsAvg: null,
      hasUnitExam: false,
      unitExamPercentage: null,
      masteryScore: null,
      status: 'not_tested',
      isAllStudied: false,
      isFullyMastered: false
    };
  }

  const totalLessons = unit.lessons.length;
  const studiedLessons = unit.lessons.filter(l => l.isStudied === true).length;
  const studyPercentage = totalLessons > 0 ? Math.round((studiedLessons / totalLessons) * 100) : 0;

  // Filter lessons that have a recorded quiz
  const testedLessons = unit.lessons.filter(l => l.quiz && typeof l.quiz.percentage === 'number');
  const testedCount = testedLessons.length;
  
  let lessonsAvg = null;
  if (testedCount > 0) {
    const sum = testedLessons.reduce((acc, l) => acc + l.quiz.percentage, 0);
    lessonsAvg = Math.round(sum / testedCount);
  }

  // Check for comprehensive unit-level exam
  const hasUnitExam = Boolean(unit.quiz && typeof unit.quiz.percentage === 'number');
  const unitExamPercentage = hasUnitExam ? unit.quiz.percentage : null;

  // Calculate Weighted Mastery Score:
  // 50% average of lesson quizzes + 50% unit comprehensive exam
  let masteryScore = null;
  let status = 'not_tested'; // 'mastered' | 'needs_review' | 'partial' | 'not_tested'

  if (lessonsAvg !== null && hasUnitExam) {
    masteryScore = Math.round((lessonsAvg * 0.5) + (unitExamPercentage * 0.5));
    status = masteryScore >= 95 ? 'mastered' : 'needs_review';
  } else if (lessonsAvg !== null && !hasUnitExam) {
    masteryScore = lessonsAvg;
    status = 'partial'; // in progress, lessons tested but waiting for comprehensive exam
  } else if (lessonsAvg === null && hasUnitExam) {
    masteryScore = unitExamPercentage;
    status = unitExamPercentage >= 95 ? 'mastered' : 'needs_review';
  }

  return {
    totalLessons,
    studiedLessons,
    studyPercentage,
    testedCount,
    lessonsAvg,
    hasUnitExam,
    unitExamPercentage,
    masteryScore,
    status, // 'mastered' | 'needs_review' | 'partial' | 'not_tested'
    isAllStudied: totalLessons > 0 && studiedLessons === totalLessons,
    isFullyMastered: status === 'mastered' && hasUnitExam && masteryScore >= 95
  };
}

/**
 * Scans all subjects and units to gather untested items (studied but no test)
 * and items needing re-test (< 95%)
 */
export function getExamsAuditSummary(subjects) {
  const pendingLessons = [];
  const pendingUnits = [];
  const needsReviewLessons = [];
  const needsReviewUnits = [];
  const masteredItems = [];

  subjects.forEach(subject => {
    subject.units.forEach(unit => {
      const unitMetrics = calculateUnitMastery(unit);

      // Check lessons
      unit.lessons.forEach(lesson => {
        if (lesson.isStudied === true && !lesson.quiz) {
          pendingLessons.push({
            subjectId: subject.id,
            subjectName: subject.name,
            subjectIcon: subject.icon,
            unitId: unit.id,
            unitTitle: unit.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            type: 'lesson',
            item: lesson
          });
        }

        if (lesson.quiz && lesson.quiz.percentage < 95) {
          needsReviewLessons.push({
            subjectId: subject.id,
            subjectName: subject.name,
            subjectIcon: subject.icon,
            unitId: unit.id,
            unitTitle: unit.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            quiz: lesson.quiz,
            type: 'lesson',
            item: lesson
          });
        }

        if (lesson.quiz && lesson.quiz.percentage >= 95) {
          masteredItems.push({
            subjectId: subject.id,
            subjectName: subject.name,
            subjectIcon: subject.icon,
            title: lesson.title,
            subTitle: unit.title,
            quiz: lesson.quiz,
            type: 'lesson'
          });
        }
      });

      // Check unit comprehensive exam
      // If unit has lessons studied and no unit exam
      if (unitMetrics.studiedLessons > 0 && !unit.quiz) {
        pendingUnits.push({
          subjectId: subject.id,
          subjectName: subject.name,
          subjectIcon: subject.icon,
          unitId: unit.id,
          unitTitle: unit.title,
          type: 'unit',
          item: unit,
          metrics: unitMetrics
        });
      }

      if (unit.quiz && unit.quiz.percentage < 95) {
        needsReviewUnits.push({
          subjectId: subject.id,
          subjectName: subject.name,
          subjectIcon: subject.icon,
          unitId: unit.id,
          unitTitle: unit.title,
          quiz: unit.quiz,
          type: 'unit',
          item: unit,
          metrics: unitMetrics
        });
      }

      if (unit.quiz && unit.quiz.percentage >= 95) {
        masteredItems.push({
          subjectId: subject.id,
          subjectName: subject.name,
          subjectIcon: subject.icon,
          title: `الاختبار الشامل: ${unit.title}`,
          subTitle: subject.name,
          quiz: unit.quiz,
          type: 'unit'
        });
      }
    });
  });

  return {
    pendingLessons,
    pendingUnits,
    totalPending: pendingLessons.length + pendingUnits.length,
    needsReviewLessons,
    needsReviewUnits,
    totalNeedsReview: needsReviewLessons.length + needsReviewUnits.length,
    masteredItems,
    totalMastered: masteredItems.length
  };
}

/**
 * Calculates countdown string from a target date string (YYYY-MM-DD) and time (HH:MM)
 */
export function getExamCountdown(scheduledDate, scheduledTime = '18:00') {
  if (!scheduledDate) return null;

  try {
    const target = new Date(`${scheduledDate}T${scheduledTime}:00`);
    const now = new Date();
    const diffMs = target - now;

    if (diffMs <= 0) {
      return {
        isOverdue: true,
        text: 'حان موعد الاختبار الآن أو فات موعده 🔔',
        diffMs
      };
    }

    const diffSecs = Math.floor(diffMs / 1000);
    const days = Math.floor(diffSecs / (24 * 3600));
    const hours = Math.floor((diffSecs % (24 * 3600)) / 3600);
    const minutes = Math.floor((diffSecs % 3600) / 60);

    let parts = [];
    if (days > 0) parts.push(`${days} ${days === 1 ? 'يوم' : days === 2 ? 'يومان' : 'أيام'}`);
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`);
    parts.push(`${minutes} دقيقة`);

    return {
      isOverdue: false,
      days,
      hours,
      minutes,
      text: `متبقي ${parts.join(' و ')}`,
      diffMs
    };
  } catch {
    return null;
  }
}
