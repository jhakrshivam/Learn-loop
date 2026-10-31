import {
  Subject,
  StudySession,
  StudentProfile,
  DeadlineReport,
  PriorityLevel,
  AppState,
  ActivityLogItem,
  PlanDiff,
  WorkloadSnapshot,
} from '../src/types';

export function calculateGap(performance: number): number {
  return Math.max(0, Math.min(100, Math.round((100 - performance) * 10) / 10));
}

export function calculatePriority(performance: number): PriorityLevel {
  const perf = Number(performance);
  if (perf < 50) return 'Critical';
  if (perf <= 64) return 'High';
  if (perf <= 79) return 'Medium';
  return 'Low';
}

export function createSubject(
  name: string,
  performance: number,
  options?: {
    assessment_mode?: 'marks' | 'self_assessment';
    confidence_level?: 'beginner' | 'moderate' | 'comfortable' | 'advanced';
    student_reason?: string;
    marks_obtained?: number;
    total_marks?: number;
  }
): Subject {
  const perf = Math.max(0, Math.min(100, Number(performance)));
  return {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    performance: perf,
    gap: calculateGap(perf),
    priority: calculatePriority(perf),
    assessment_mode: options?.assessment_mode || 'marks',
    confidence_level: options?.confidence_level,
    student_reason: options?.student_reason || '',
    marks_obtained: options?.marks_obtained,
    total_marks: options?.total_marks,
  };
}

export function rankSubjects(subjects: Subject[]): Subject[] {
  return [...subjects].sort((a, b) => b.gap - a.gap);
}

// Subject topics mapping to give realistic academic topics
const TOPIC_SUGGESTIONS: Record<string, string[]> = {
  dbms: [
    'Normalization & Dependency Theory',
    'ER Models & Relational Schema',
    'Transactions & ACID Properties',
    'SQL Joins & Complex Queries',
    'Indexing & B+ Trees',
  ],
  'database systems': [
    'Normalization & 3NF / BCNF',
    'ER Diagram Design',
    'Transactions & Concurrency',
    'Query Optimization',
  ],
  mathematics: [
    'Differential Calculus & Optimization',
    'Integration by Parts & Substitution',
    'Matrix Algebra & Eigenvalues',
    'Discrete Probability & Bayes Theorem',
    'Differential Equations',
  ],
  'operating systems': [
    'CPU Scheduling & Preemption',
    'Process Synchronization & Semaphores',
    'Virtual Memory & Page Replacement',
    'Deadlock Prevention & Recovery',
    'File Systems & I/O Management',
  ],
  english: [
    'Reading Practice & Critical Comprehension',
    'Technical Writing & Syntax',
    'Vocabulary & Contextual Phrases',
    'Essay Structuring & Summaries',
  ],
  'computer networks': [
    'OSI & TCP/IP Layer Architecture',
    'Subnetting & IP Routing',
    'TCP Flow Control & Handshake',
    'DNS & Application Protocols',
  ],
};

export function getTopicForSubject(subjectName: string, sessionIndex: number): string {
  const key = subjectName.toLowerCase().trim();
  for (const [subKey, topics] of Object.entries(TOPIC_SUGGESTIONS)) {
    if (key.includes(subKey) || subKey.includes(key)) {
      return topics[sessionIndex % topics.length];
    }
  }
  const defaultTopics = [
    'Foundations & Core Principles',
    'Analytical Problem Solving',
    'Applied Methodologies & Case Studies',
    'Comprehensive Exam Review & Practice',
  ];
  return defaultTopics[sessionIndex % defaultTopics.length];
}

export function calculateSubjectWorkloads(subjects: Subject[]): Record<string, number> {
  const ranked = rankSubjects(subjects);
  const workloads: Record<string, number> = {};
  for (const s of ranked) {
    // Gap 18% -> ~4.0h, Gap 32% -> ~7.5h, Gap 55% -> ~11.0h, Gap 80% -> ~15.0h
    const weight = Math.max(0.2, s.gap / 100);
    const baseHours = Math.max(3.0, Math.round(weight * 18 * 10) / 10);
    workloads[s.name] = baseHours;
  }
  return workloads;
}

export function calculateRemainingSubjectHours(
  subjectName: string,
  subjects: Subject[],
  sessions: StudySession[]
): number {
  const workloads = calculateSubjectWorkloads(subjects);
  const totalNeeded = workloads[subjectName] || 4.0;
  const completed = sessions
    .filter((s) => s.subject === subjectName && s.status === 'completed')
    .reduce((sum, s) => sum + s.duration, 0);
  return Math.max(0, Math.round((totalNeeded - completed) * 10) / 10);
}

export function createActivityLogItem(
  tag: ActivityLogItem['tag'],
  message: string
): ActivityLogItem {
  return {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    tag,
    message,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

export function verifyDeadline(
  profile: StudentProfile,
  subjects: Subject[],
  sessions: StudySession[],
  baseDateStr?: string
): DeadlineReport {
  const today = baseDateStr ? new Date(baseDateStr) : new Date();
  today.setHours(0, 0, 0, 0);

  const examDate = profile.exam_date ? new Date(profile.exam_date) : new Date(today.getTime() + 14 * 86400000);
  examDate.setHours(0, 0, 0, 0);

  const diffTime = examDate.getTime() - today.getTime();
  const remainingDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const completedHours = sessions
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + s.duration, 0);

  const workloads = calculateSubjectWorkloads(subjects);
  for (const s of sessions) {
    if (s.status === 'completed' && workloads[s.subject] !== undefined) {
      workloads[s.subject] = Math.max(0, workloads[s.subject] - s.duration);
    }
  }

  const remainingRequiredHours = Math.round(Object.values(workloads).reduce((a, b) => a + b, 0) * 10) / 10;
  const availableFutureHours = Math.round(remainingDays * profile.hours_per_day * 10) / 10;
  const isFeasible = remainingDays > 0 && availableFutureHours >= remainingRequiredHours;

  return {
    exam_date: profile.exam_date,
    remaining_days: remainingDays,
    completed_hours: Math.round(completedHours * 10) / 10,
    remaining_required_hours: remainingRequiredHours,
    available_future_hours: availableFutureHours,
    is_feasible: isFeasible,
    status_label: isFeasible ? '✓ Feasible' : '⚠ Not Feasible',
  };
}

function parseStartTimeToMinutes(timeStr?: string): number {
  if (!timeStr) return 17 * 60; // default 5:00 PM (17:00)
  const trimmed = timeStr.trim().toLowerCase();
  
  // Format "17:00" or "05:00"
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':');
    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) || 0;
    if (trimmed.includes('pm') && h < 12) h += 12;
    if (trimmed.includes('am') && h === 12) h = 0;
    return (isNaN(h) ? 17 : h) * 60 + (isNaN(m) ? 0 : m);
  }

  return 17 * 60;
}

function formatMinutesToTime(totalMinutes: number): string {
  const normalized = totalMinutes % (24 * 60);
  let hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minsStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${minsStr} ${ampm}`;
}

export function generatePlanSessions(
  profile: StudentProfile,
  subjects: Subject[],
  existingSessions: StudySession[] = [],
  baseDateStr?: string
): StudySession[] {
  if (!profile.exam_date || subjects.length === 0) return [];

  const today = baseDateStr ? new Date(baseDateStr) : new Date();
  today.setHours(0, 0, 0, 0);

  const examDate = new Date(profile.exam_date);
  examDate.setHours(0, 0, 0, 0);

  const daysAvailable = Math.max(0, Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  if (daysAvailable <= 0) return existingSessions;

  // Preserve locked/historic sessions (completed, missed, partial)
  const lockedSessions = existingSessions.filter((s) => s.status !== 'scheduled');
  const resultSessions: StudySession[] = [...lockedSessions];

  const workloads = calculateSubjectWorkloads(subjects);
  for (const s of lockedSessions) {
    if (s.status === 'completed' && workloads[s.subject] !== undefined) {
      workloads[s.subject] = Math.max(0, workloads[s.subject] - s.duration);
    }
  }

  const ranked = rankSubjects(subjects);
  // Default session slot duration: 1.0 hour (60 min) or 0.75 hour (45 min)
  const slotDuration = profile.hours_per_day >= 3.0 ? 1.0 : Math.min(1.0, profile.hours_per_day);
  let sessionSeq = lockedSessions.length + 1;

  const startBaseMinutes = parseStartTimeToMinutes(profile.preferred_start_time);

  for (let dayOffset = 0; dayOffset < daysAvailable; dayOffset++) {
    const dayDate = new Date(today.getTime() + dayOffset * 86400000);
    if (dayDate.getTime() >= examDate.getTime()) break;

    const dateStr = dayDate.toISOString().split('T')[0];

    // Check existing hours already committed on this day from locked sessions
    const committedHours = lockedSessions
      .filter((s) => s.date === dateStr)
      .reduce((sum, s) => sum + s.duration, 0);

    let dayHours = committedHours;
    let daySessionIdx = lockedSessions.filter((s) => s.date === dateStr).length;

    for (const sub of ranked) {
      const needed = workloads[sub.name] || 0;
      if (needed <= 0.2) continue;

      const remainingDayCapacity = profile.hours_per_day - dayHours;
      if (remainingDayCapacity < 0.5) break;

      const dur = Math.round(Math.min(slotDuration, needed, remainingDayCapacity) * 10) / 10;
      if (dur >= 0.5) {
        const id = `sess_${sessionSeq++}_${Math.random().toString(36).substring(2, 7)}`;
        // Calculate start time: each session starts startBaseMinutes + (daySessionIdx * 75min)
        const sessionStartMinutes = startBaseMinutes + daySessionIdx * 75;
        const timeStr = formatMinutesToTime(sessionStartMinutes);
        const duration_minutes = Math.round(dur * 60);
        const topic = getTopicForSubject(sub.name, sessionSeq);

        resultSessions.push({
          id,
          date: dateStr,
          time: timeStr,
          subject: sub.name,
          topic,
          duration: dur,
          duration_minutes,
          priority: sub.priority,
          status: 'scheduled',
        });

        workloads[sub.name] = Math.max(0, Math.round((needed - dur) * 10) / 10);
        dayHours += dur;
        daySessionIdx++;
      }
    }

    // If all workloads covered, break early
    const totalRemaining = Object.values(workloads).reduce((a, b) => a + b, 0);
    if (totalRemaining <= 0.2) break;
  }

  return resultSessions;
}

export function initializeDemoState(): AppState {
  const today = new Date();
  const examDate = new Date(today.getTime() + 14 * 86400000); // 14 days in future
  const examDateStr = examDate.toISOString().split('T')[0];

  const profile: StudentProfile = {
    university: 'Apex Institute of Technology',
    course: 'B.Tech',
    branch: 'Computer Science',
    semester: 'Semester 4',
    exam_date: examDateStr,
    learning_goal: 'Master core semester subjects to score 85%+ on final exams',
    hours_per_day: 4.0,
    preferred_start_time: '17:00',
  };

  // B.Tech Computer Science demo subjects with student reasons & assessment contexts
  const subjects: Subject[] = [
    createSubject('DBMS', 68, {
      assessment_mode: 'marks',
      student_reason: 'Scored 68% in quiz 1; comfortable with ER models, but need practice on SQL joins & normalization.',
    }),
    createSubject('Mathematics', 45, {
      assessment_mode: 'self_assessment',
      confidence_level: 'beginner',
      student_reason: 'Brand new semester topic — calculus & matrices formulas feel overwhelming without stepwise numerical practice.',
    }),
    createSubject('Operating Systems', 42, {
      assessment_mode: 'marks',
      student_reason: 'Recent mid-term was 42%; struggled with CPU scheduling & deadlock synchronization algorithms.',
    }),
    createSubject('English', 82, {
      assessment_mode: 'self_assessment',
      confidence_level: 'advanced',
      student_reason: 'Strong communication background; mostly need quick revision of technical writing syntax.',
    }),
  ];
  const sessions = generatePlanSessions(profile, subjects);
  const deadline_report = verifyDeadline(profile, subjects, sessions);

  const activity_log: ActivityLogItem[] = [
    createActivityLogItem('ANALYZER', 'Performance analyzed for 4 subjects'),
    createActivityLogItem('SCHEDULER', `Plan created with ${sessions.length} sessions`),
    createActivityLogItem('VERIFIER', 'Deadline checked'),
  ];

  return {
    profile,
    subjects,
    sessions,
    plan_version: 1,
    last_replan_reason: 'Initial demo plan created',
    plan_diff: null,
    activity_log,
    deadline_report,
    is_demo: true,
  };
}

