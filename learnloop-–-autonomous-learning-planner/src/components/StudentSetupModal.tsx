import React, { useState } from 'react';
import { AppState, PriorityLevel } from '../types';
import {
  X,
  Plus,
  Trash2,
  ArrowRight,
  RefreshCw,
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SubjectInputItem {
  name: string;
  performance: number;
  assessment_mode: 'marks' | 'self_assessment';
  confidence_level?: 'beginner' | 'moderate' | 'comfortable' | 'advanced';
  student_reason: string;
}

interface StudentSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: AppState | null;
  onSaveSetup: (setupData: {
    university: string;
    course: string;
    branch: string;
    semester: string;
    exam_date: string;
    learning_goal: string;
    hours_per_day: number;
    preferred_start_time: string;
    raw_subjects: SubjectInputItem[];
  }) => Promise<void>;
  onLoadDemo: () => void;
}

const COURSE_OPTIONS = [
  'B.Tech',
  'BCA',
  'BBA',
  'B.Com',
  'B.Sc',
  'BA',
  'MCA',
  'MBA',
  'Other',
];

const CONFIDENCE_LEVELS = [
  {
    key: 'beginner' as const,
    label: 'Starting Fresh / Unfamiliar',
    score: 45,
    desc: 'Brand new subject or 1st semester foundation (allocated extra study hours)',
    color: 'border-rose-300 bg-rose-50/60 text-rose-900',
  },
  {
    key: 'moderate' as const,
    label: 'Basic Concept / Needs Practice',
    score: 60,
    desc: 'Understand the core concepts, but need regular problem-solving and practice',
    color: 'border-amber-300 bg-amber-50/60 text-amber-900',
  },
  {
    key: 'comfortable' as const,
    label: 'Comfortable / Good Foundation',
    score: 75,
    desc: 'Comfortable with most chapters, need periodic revision and past questions',
    color: 'border-blue-300 bg-blue-50/60 text-blue-900',
  },
  {
    key: 'advanced' as const,
    label: 'Strong / Confident',
    score: 90,
    desc: 'High confidence, strong prior background, light maintenance schedule',
    color: 'border-emerald-300 bg-emerald-50/60 text-emerald-900',
  },
];

const REASON_SUGGESTIONS = [
  '1st semester — brand new subject, never studied before',
  'Formula-heavy & numerical problems require practice',
  'Theory is dense with many definitions & diagrams',
  'Missed early lectures, need to catch up on syllabus',
  'Strong high-school / prior background in this topic',
  'Practical coding / lab exercises feel intuitive',
];

export const StudentSetupModal: React.FC<StudentSetupModalProps> = ({
  isOpen,
  onClose,
  currentState,
  onSaveSetup,
  onLoadDemo,
}) => {
  if (!isOpen) return null;

  const defaultExam = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  const [university, setUniversity] = useState(currentState?.profile.university || 'Apex Institute of Technology');
  const currentCourseVal = currentState?.profile?.course?.trim() || '';
  const isStandardCourse = COURSE_OPTIONS.includes(currentCourseVal);
  const [course, setCourse] = useState(
    isStandardCourse
      ? currentCourseVal
      : currentCourseVal
      ? 'Other'
      : (currentState?.profile?.course !== undefined ? '' : 'B.Tech')
  );
  const [customCourse, setCustomCourse] = useState(
    !isStandardCourse && currentCourseVal ? currentCourseVal : ''
  );
  const [branch, setBranch] = useState(currentState?.profile.branch || 'Computer Science');
  const [semester, setSemester] = useState(currentState?.profile.semester || 'Semester 1');
  const [examDate, setExamDate] = useState(currentState?.profile.exam_date || defaultExam());
  const [learningGoal, setLearningGoal] = useState(
    currentState?.profile.learning_goal || 'Master core semester subjects to score 85%+ on final exams'
  );
  const [hoursPerDay, setHoursPerDay] = useState<number>(currentState?.profile.hours_per_day || 4.0);
  const [preferredStartTime, setPreferredStartTime] = useState(currentState?.profile.preferred_start_time || '17:00');

  // Populate initial subjects with reasons and modes
  const initialRawSubjects: SubjectInputItem[] = currentState?.subjects.length
    ? currentState.subjects.map((s) => ({
        name: s.name,
        performance: s.performance,
        assessment_mode: s.assessment_mode || (s.performance < 60 ? 'self_assessment' : 'marks'),
        confidence_level: s.confidence_level || (s.performance < 50 ? 'beginner' : s.performance < 65 ? 'moderate' : s.performance < 80 ? 'comfortable' : 'advanced'),
        student_reason: s.student_reason || (s.performance < 50 ? 'Brand new semester topic requiring structured foundational practice' : 'Comfortable with fundamentals, regular practice'),
      }))
    : [
        {
          name: 'DBMS',
          performance: 68,
          assessment_mode: 'marks',
          confidence_level: 'comfortable',
          student_reason: 'Scored 68% on quiz; comfortable with ER models, need SQL query & normalization practice.',
        },
        {
          name: 'Mathematics',
          performance: 45,
          assessment_mode: 'self_assessment',
          confidence_level: 'beginner',
          student_reason: '1st semester — differential equations & linear algebra are new; formulas need step-by-step practice.',
        },
        {
          name: 'Operating Systems',
          performance: 42,
          assessment_mode: 'marks',
          confidence_level: 'beginner',
          student_reason: 'Got 42% on midterm; struggled with CPU scheduling and deadlock algorithms.',
        },
        {
          name: 'English',
          performance: 82,
          assessment_mode: 'self_assessment',
          confidence_level: 'advanced',
          student_reason: 'Strong communication background; need light review of technical writing format.',
        },
      ];

  const [subjectsList, setSubjectsList] = useState<SubjectInputItem[]>(initialRawSubjects);
  
  // New Subject Input state
  const [newSubName, setNewSubName] = useState('');
  const [newSubMode, setNewSubMode] = useState<'marks' | 'self_assessment'>('self_assessment');
  const [newSubConfidence, setNewSubConfidence] = useState<'beginner' | 'moderate' | 'comfortable' | 'advanced'>('moderate');
  const [newSubPerf, setNewSubPerf] = useState<number>(65);
  const [newSubReason, setNewSubReason] = useState<string>('1st semester — brand new subject, never studied before');
  const [isAddFormExpanded, setIsAddFormExpanded] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddSubject = () => {
    const trimmed = newSubName.trim();
    if (!trimmed) {
      setError('Please enter a subject name.');
      return;
    }
    if (subjectsList.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('Subject already exists in your list.');
      return;
    }
    setError(null);

    let finalScore = newSubPerf;
    if (newSubMode === 'self_assessment') {
      const match = CONFIDENCE_LEVELS.find((c) => c.key === newSubConfidence);
      finalScore = match ? match.score : 60;
    }

    setSubjectsList([
      ...subjectsList,
      {
        name: trimmed,
        performance: Math.max(0, Math.min(100, Number(finalScore) || 0)),
        assessment_mode: newSubMode,
        confidence_level: newSubConfidence,
        student_reason: newSubReason.trim() || 'Studying consistently with personalized pace',
      },
    ]);

    setNewSubName('');
    setNewSubReason('1st semester — brand new subject, never studied before');
    setNewSubPerf(65);
    setIsAddFormExpanded(false);
  };

  const handleRemoveSubject = (index: number) => {
    if (subjectsList.length <= 1) {
      setError('At least one subject is required.');
      return;
    }
    setError(null);
    setSubjectsList(subjectsList.filter((_, i) => i !== index));
  };

  const handleUpdateSubjectName = (index: number, newName: string) => {
    const copy = [...subjectsList];
    copy[index].name = newName;
    setSubjectsList(copy);
  };

  const handleUpdateSubjectPerf = (index: number, newPerf: number) => {
    const copy = [...subjectsList];
    copy[index].performance = Math.max(0, Math.min(100, newPerf));
    setSubjectsList(copy);
  };

  const handleUpdateSubjectReason = (index: number, reason: string) => {
    const copy = [...subjectsList];
    copy[index].student_reason = reason;
    setSubjectsList(copy);
  };

  const handleUpdateSubjectConfidence = (
    index: number,
    level: 'beginner' | 'moderate' | 'comfortable' | 'advanced'
  ) => {
    const copy = [...subjectsList];
    copy[index].confidence_level = level;
    const match = CONFIDENCE_LEVELS.find((c) => c.key === level);
    if (match) copy[index].performance = match.score;
    setSubjectsList(copy);
  };

  const handleToggleSubjectMode = (index: number, mode: 'marks' | 'self_assessment') => {
    const copy = [...subjectsList];
    copy[index].assessment_mode = mode;
    if (mode === 'self_assessment') {
      const match = CONFIDENCE_LEVELS.find((c) => c.key === copy[index].confidence_level);
      if (match) copy[index].performance = match.score;
    }
    setSubjectsList(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validSubjects = subjectsList.filter((s) => s.name.trim().length > 0);
    if (validSubjects.length === 0) {
      setError('At least one subject is required with a non-empty name.');
      return;
    }

    const finalCourse = course === 'Other' ? customCourse.trim() : course.trim();

    setIsSaving(true);
    try {
      await onSaveSetup({
        university: university.trim() || 'University',
        course: finalCourse,
        branch: branch.trim() || 'General',
        semester: semester.trim() || 'Semester 1',
        exam_date: examDate,
        learning_goal: learningGoal.trim(),
        hours_per_day: Number(hoursPerDay) || 4.0,
        preferred_start_time: preferredStartTime || '17:00',
        raw_subjects: validSubjects,
      });
      onClose();
    } catch (err) {
      setError('Failed to save student profile. Please verify your inputs.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-[#E6E1D8] shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="p-5 bg-[#FAF8F5] border-b border-[#E6E1D8] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm">
                L
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">Create Your Learning Plan</h3>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Personalized for your university, course subjects, and study schedule.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#EFECE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* SECTION 1: ACADEMIC DETAILS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#EFECE6] pb-2">
              <GraduationCap className="w-4 h-4 text-[#0F172A]" />
              <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                1. Academic Details
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#475569] mb-1">
                  College / University
                </label>
                <input
                  id="setup-university"
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. Apex Institute of Technology"
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-[#D5CFC3] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">
                  Course / Degree
                </label>
                <select
                  id="setup-course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-[#D5CFC3] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                >
                  {COURSE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {course === 'Other' && (
                  <input
                    type="text"
                    value={customCourse}
                    onChange={(e) => setCustomCourse(e.target.value)}
                    placeholder="Enter degree name"
                    className="w-full text-xs sm:text-sm mt-2 p-2 rounded-lg border border-[#D5CFC3] bg-white"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">
                  Branch / Stream
                </label>
                <input
                  id="setup-branch"
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Computer Science, Finance, Arts"
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-[#D5CFC3] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#475569] mb-1">
                  Semester / Year
                </label>
                <input
                  id="setup-semester"
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="e.g. Semester 1 (Freshman), Semester 4, Year 2"
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-[#D5CFC3] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: EXAM & GOAL */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#EFECE6] pb-2">
              <Calendar className="w-4 h-4 text-[#0F172A]" />
              <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                2. Exam & Goal
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">
                  Exam Date
                </label>
                <input
                  id="setup-exam-date"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-[#D5CFC3] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">
                  Learning Goal
                </label>
                <input
                  id="setup-goal"
                  type="text"
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  placeholder="e.g. Master core modules to score 85%+"
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-[#D5CFC3] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: AVAILABILITY */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#EFECE6] pb-2">
              <Clock className="w-4 h-4 text-[#0F172A]" />
              <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                3. Availability & Timetable Routine
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">
                  Study Hours Per Day
                </label>
                <input
                  id="setup-hours-per-day"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="16"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Math.max(0.5, Number(e.target.value)))}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-[#D5CFC3] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                  required
                />
                <span className="text-[11px] text-[#64748B] mt-1 block">Maximum study hours scheduled per day</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#475569] mb-1">
                  Preferred Daily Study Start Time
                </label>
                <input
                  id="setup-start-time"
                  type="time"
                  value={preferredStartTime}
                  onChange={(e) => setPreferredStartTime(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-[#D5CFC3] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                  required
                />
                <span className="text-[11px] text-[#64748B] mt-1 block">When your study blocks start (e.g. 5:00 PM)</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: YOUR SUBJECTS (NO WEAK ASSUMPTIONS) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-[#EFECE6] pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0F172A]" />
                <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                  4. Your Subjects & Preparation Context ({subjectsList.length})
                </h4>
              </div>
            </div>

            {/* Student Empathy Note Banner */}
            <div className="p-3.5 rounded-xl bg-[#F4EFE6] border border-[#E4DCCF] text-xs text-[#334155] space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>No test marks yet? That's completely normal in 1st Semester!</span>
              </div>
              <p className="text-[11px] text-[#475569] leading-relaxed">
                We never assume a student is "weak". If you don't have previous exam marks, choose <strong>Self-Assessment</strong> and tell us why you feel comfortable or need extra time. LearnLoop will schedule foundational study blocks without any unfair categorization!
              </p>
            </div>

            {/* List of Subjects */}
            <div className="space-y-3">
              {subjectsList.map((sub, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] space-y-3"
                >
                  {/* Subject Name and Mode Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={sub.name}
                        onChange={(e) => handleUpdateSubjectName(idx, e.target.value)}
                        placeholder="Subject name (e.g. Calculus, DBMS, Law)"
                        className="w-full p-2 text-sm font-semibold text-[#0F172A] bg-white border border-[#D5CFC3] rounded-lg focus:outline-none"
                        required
                      />
                    </div>

                    {/* Mode Toggle: Self Assessment vs Marks */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#D5CFC3] shrink-0 text-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleSubjectMode(idx, 'self_assessment')}
                        className={`px-2 py-1 rounded font-medium cursor-pointer transition-colors ${
                          sub.assessment_mode === 'self_assessment'
                            ? 'bg-[#0F172A] text-white'
                            : 'text-[#64748B] hover:text-[#0F172A]'
                        }`}
                      >
                        🌱 1st Sem / Self-Assessment
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleSubjectMode(idx, 'marks')}
                        className={`px-2 py-1 rounded font-medium cursor-pointer transition-colors ${
                          sub.assessment_mode === 'marks'
                            ? 'bg-[#0F172A] text-white'
                            : 'text-[#64748B] hover:text-[#0F172A]'
                        }`}
                      >
                        📝 Marks %
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(idx)}
                      className="text-rose-600 hover:text-rose-800 p-1.5 rounded-md hover:bg-rose-50 cursor-pointer self-end sm:self-center"
                      title="Remove subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Assessment Details */}
                  {sub.assessment_mode === 'self_assessment' ? (
                    <div>
                      <span className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider block mb-1.5">
                        Comfort Level:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {CONFIDENCE_LEVELS.map((conf) => {
                          const isSelected = sub.confidence_level === conf.key;
                          return (
                            <button
                              key={conf.key}
                              type="button"
                              onClick={() => handleUpdateSubjectConfidence(idx, conf.key)}
                              className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                                isSelected
                                  ? `${conf.color} ring-1 ring-offset-1 font-semibold`
                                  : 'border-[#D5CFC3] bg-white text-[#475569] hover:bg-[#F3EFEA]'
                              }`}
                            >
                              <div className="text-xs font-semibold leading-tight">{conf.label}</div>
                              <span className="text-[10px] opacity-75 mt-0.5 block">Baseline: {conf.score}%</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-[#D5CFC3]">
                      <span className="text-xs text-[#475569] font-medium">Test / Quiz Score:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={sub.performance}
                          onChange={(e) => handleUpdateSubjectPerf(idx, Number(e.target.value))}
                          className="w-16 p-1.5 text-center font-bold text-[#0F172A] bg-[#FAF8F5] border border-[#D5CFC3] rounded focus:outline-none text-xs"
                          required
                        />
                        <span className="text-xs font-semibold text-[#64748B]">%</span>
                      </div>
                      <span className="text-[11px] text-[#64748B]">
                        (Learning gap: {100 - sub.performance}%)
                      </span>
                    </div>
                  )}

                  {/* Why do you feel weak or strong in this subject? */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Why do you feel this way? (Reason / Student Note):
                    </label>
                    <input
                      type="text"
                      value={sub.student_reason}
                      onChange={(e) => handleUpdateSubjectReason(idx, e.target.value)}
                      placeholder="e.g. 1st semester — brand new subject, formulas are confusing, etc."
                      className="w-full p-2 text-xs text-[#1E293B] bg-white border border-[#D5CFC3] rounded-lg focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {REASON_SUGGESTIONS.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handleUpdateSubjectReason(idx, sug)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#D5CFC3] text-[#475569] hover:bg-[#F3EFEA] hover:text-[#0F172A] cursor-pointer"
                        >
                          + {sug.split('—')[0].split(',')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Subject Collapsible Box */}
            <div className="p-3.5 rounded-xl border border-dashed border-[#CBD5E1] bg-[#FDFCFB] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#0F172A]">Add Another Subject</span>
                <button
                  type="button"
                  onClick={() => setIsAddFormExpanded(!isAddFormExpanded)}
                  className="text-xs text-[#64748B] hover:text-[#0F172A] flex items-center gap-1 cursor-pointer"
                >
                  {isAddFormExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>{isAddFormExpanded ? 'Collapse' : 'Expand Options'}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  placeholder="Subject name (e.g. Data Structures, Economics, Chemistry...)"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full sm:flex-1 text-xs p-2.5 rounded-lg border border-[#D5CFC3] bg-white focus:outline-none"
                />
                <button
                  type="button"
                  id="btn-add-subject"
                  onClick={handleAddSubject}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-lg bg-[#0F172A] text-white hover:bg-[#1E293B] flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Subject</span>
                </button>
              </div>

              {isAddFormExpanded && (
                <div className="space-y-2 pt-2 border-t border-[#EFECE6] animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-[#64748B]">Mode:</span>
                    <button
                      type="button"
                      onClick={() => setNewSubMode('self_assessment')}
                      className={`text-xs px-2.5 py-1 rounded ${
                        newSubMode === 'self_assessment' ? 'bg-[#0F172A] text-white' : 'bg-white border text-[#475569]'
                      }`}
                    >
                      🌱 1st Sem / Self-Assessment
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewSubMode('marks')}
                      className={`text-xs px-2.5 py-1 rounded ${
                        newSubMode === 'marks' ? 'bg-[#0F172A] text-white' : 'bg-white border text-[#475569]'
                      }`}
                    >
                      📝 Marks %
                    </button>
                  </div>

                  {newSubMode === 'self_assessment' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {CONFIDENCE_LEVELS.map((conf) => (
                        <button
                          key={conf.key}
                          type="button"
                          onClick={() => setNewSubConfidence(conf.key)}
                          className={`p-1.5 rounded border text-left text-xs ${
                            newSubConfidence === conf.key ? conf.color : 'bg-white border-[#D5CFC3]'
                          }`}
                        >
                          <div className="font-semibold">{conf.label.split('/')[0]}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#64748B]">Score:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newSubPerf}
                        onChange={(e) => setNewSubPerf(Number(e.target.value))}
                        className="w-16 p-1.5 text-xs text-center border rounded bg-white font-bold"
                      />
                      <span className="text-xs text-[#64748B]">%</span>
                    </div>
                  )}

                  <div>
                    <input
                      type="text"
                      value={newSubReason}
                      onChange={(e) => setNewSubReason(e.target.value)}
                      placeholder="Why do you feel weak/strong in this subject?"
                      className="w-full text-xs p-2 border rounded bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#EFECE6]">
            <button
              type="button"
              id="btn-load-demo-in-setup"
              onClick={() => {
                onLoadDemo();
                onClose();
              }}
              className="text-xs font-medium px-3 py-2 rounded-lg border border-[#D5CFC3] text-[#334155] bg-[#FAF8F5] hover:bg-[#EDE8E0] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Load B.Tech Demo Data</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F3EFEA] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-build-my-plan"
                disabled={isSaving}
                className="px-5 py-2.5 text-xs font-bold rounded-lg bg-[#0F172A] text-white hover:bg-[#1E293B] transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Building Plan...</span>
                  </>
                ) : (
                  <>
                    <span>Build My Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
