import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Bot,
  Sparkles,
  Edit3,
  SlidersHorizontal,
} from 'lucide-react';
import { AppState, StudySession } from '../types';

interface OverviewViewProps {
  state: AppState;
  onTrackSession: (sessionId: string, status: 'completed' | 'missed' | 'partial') => void;
  onNavigateToTab: (tab: 'overview' | 'analysis' | 'plan' | 'tracker' | 'coach' | 'activity') => void;
  onOpenQuizModal: (subjectName?: string) => void;
  onUpdateAvailability: (hours: number) => void;
  onOpenSetup?: () => void;
}

function getDynamicGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning 👋';
  if (hour < 17) return 'Good afternoon 👋';
  return 'Good evening 👋';
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  state,
  onTrackSession,
  onNavigateToTab,
  onOpenQuizModal,
  onUpdateAvailability,
  onOpenSetup,
}) => {
  const { profile, subjects, sessions, deadline_report, plan_version, plan_diff, is_demo } = state;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions
    .filter((s) => s.date === todayStr)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const missedSessions = sessions.filter((s) => s.status === 'missed');
  const totalHours = Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) * 10) / 10;
  const completedHours = Math.round(completedSessions.reduce((sum, s) => sum + s.duration, 0) * 10) / 10;
  const progressPercent = totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0;

  // Top focus subject by highest gap
  const rankedSubjects = [...subjects].sort((a, b) => b.gap - a.gap);
  const topFocus = rankedSubjects[0];

  const greeting = getDynamicGreeting();
  const savedCourse = profile?.course?.trim();
  const courseSubtitle = savedCourse
    ? `Let's continue your ${savedCourse} learning journey.`
    : "Let's build your learning plan.";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#E6E1D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 id="overview-greeting" className="text-2xl font-bold text-[#0F172A] tracking-tight">{greeting}</h1>
            {is_demo && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium border border-amber-200">
                Demo Data Active
              </span>
            )}
          </div>
          <p id="overview-course-subtitle" className="text-sm text-[#64748B] mt-1">{courseSubtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded bg-[#FAF8F5] border border-[#D5CFC3] text-[#334155] font-semibold">
            Plan v{plan_version}
          </span>
          <span className="text-xs text-[#64748B]">
            {savedCourse ? savedCourse : 'No course selected'}
            {profile.semester ? ` • ${profile.semester}` : ''}
          </span>
          {onOpenSetup && (
            <button
              id="btn-edit-course-overview"
              onClick={onOpenSetup}
              className="text-xs font-semibold px-2.5 py-1 rounded border border-[#D5CFC3] text-[#334155] bg-white hover:bg-[#FAF8F5] flex items-center gap-1 transition-colors cursor-pointer"
              title="Edit degree & subjects in Student Setup"
            >
              <Edit3 className="w-3 h-3 text-[#475569]" />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Plan Adaptation Notification Banner */}
      {plan_diff && (
        <div
          id="banner-plan-adapted"
          className="p-4 rounded-xl bg-[#FAF3E7] border border-[#E9D7BA] text-[#1E293B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#D97706] text-white">
                Plan Adapted
              </span>
              <span className="text-sm font-semibold text-[#0F172A]">
                Plan v{plan_diff.previous_version} → Plan v{plan_diff.new_version}
              </span>
              <span className="text-xs text-[#78350F]">({plan_diff.timestamp})</span>
            </div>
            <p className="text-xs text-[#334155]">
              <strong className="text-[#0F172A]">Reason:</strong> {plan_diff.reason} — {plan_diff.details}
            </p>
            {plan_diff.before_workload && plan_diff.after_workload && (
              <div className="mt-1 text-xs text-[#475569] font-medium flex items-center gap-3">
                <span>
                  <strong>Before:</strong> {plan_diff.before_workload.subject} — {plan_diff.before_workload.hours_remaining}h remaining
                </span>
                <span>→</span>
                <span>
                  <strong>After:</strong> {plan_diff.after_workload.subject} — {plan_diff.after_workload.hours_remaining}h remaining
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => onNavigateToTab('plan')}
            className="text-xs font-medium text-[#0F172A] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
          >
            View Study Plan <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Compact Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Exam */}
        <div id="card-exam-countdown" className="bg-white p-4 rounded-xl border border-[#E6E1D8] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Exam</span>
            <Calendar className="w-4 h-4 text-[#0F172A]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#0F172A]">{deadline_report.remaining_days}</span>
            <span className="text-sm font-medium text-[#64748B]">days</span>
          </div>
          <p className="text-xs text-[#64748B] mt-1 truncate">Exam date: {deadline_report.exam_date || 'Not set'}</p>
        </div>

        {/* 2. Progress */}
        <div id="card-study-progress" className="bg-white p-4 rounded-xl border border-[#E6E1D8] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Progress</span>
            <Clock className="w-4 h-4 text-[#0F172A]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#0F172A]">{completedHours}</span>
            <span className="text-sm text-[#64748B]">/ {totalHours}h</span>
          </div>
          <div className="w-full bg-[#EAE5DC] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-700 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
          <p className="text-[11px] text-[#64748B] mt-1.5">
            {completedSessions.length} done • {missedSessions.length} missed ({progressPercent}%)
          </p>
        </div>

        {/* 3. Today's Focus */}
        <div id="card-todays-focus" className="bg-white p-4 rounded-xl border border-[#E6E1D8] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Today's Focus</span>
            <Target className="w-4 h-4 text-[#0F172A]" />
          </div>
          {topFocus ? (
            <div>
              <div className="text-xl font-bold text-[#0F172A] truncate">{topFocus.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                    topFocus.priority === 'Critical'
                      ? 'bg-rose-100 text-rose-800'
                      : topFocus.priority === 'High'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {topFocus.priority} ({topFocus.gap}% gap)
                </span>
                <span className="text-xs text-[#64748B]">{topFocus.performance}% score</span>
              </div>
            </div>
          ) : subjects.length === 0 ? (
            <p className="text-sm text-[#64748B] font-medium">No subjects added</p>
          ) : (
            <p className="text-sm text-emerald-700 font-medium">All subjects on track!</p>
          )}
        </div>

        {/* 4. Deadline Verifier */}
        <div
          id="card-deadline-status"
          className={`p-4 rounded-xl border shadow-xs ${
            deadline_report.is_feasible
              ? 'bg-[#F2F8F4] border-[#CDE5D4]'
              : 'bg-[#FEF2F2] border-[#FCA5A5]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Deadline</span>
            {deadline_report.is_feasible ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-bold ${
                deadline_report.is_feasible ? 'text-emerald-800' : 'text-rose-700'
              }`}
            >
              {deadline_report.status_label}
            </span>
          </div>
          <p className="text-[11px] text-[#475569] mt-1 truncate">
            {deadline_report.available_future_hours}h cap vs {deadline_report.remaining_required_hours}h needed
          </p>
        </div>
      </div>

      {/* Autonomous Loop Progress Indicator */}
      <div className="p-4 rounded-xl bg-white border border-[#E6E1D8]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#0F172A]" />
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Autonomous Learning Loop
            </h3>
          </div>
          <span className="text-xs text-[#64748B]">Analyze → Plan → Track → Replan → Verify</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE5DC]">
            <strong className="block text-[#0F172A]">1. Analyze</strong>
            <span className="text-[#64748B] text-[11px]">{subjects.length} subject gaps</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE5DC]">
            <strong className="block text-[#0F172A]">2. Plan</strong>
            <span className="text-[#64748B] text-[11px]">{profile.hours_per_day}h/day cap</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE5DC]">
            <strong className="block text-[#0F172A]">3. Track</strong>
            <span className="text-[#64748B] text-[11px]">Complete / Miss / Partial</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAF3E7] border border-[#E8D6B8]">
            <strong className="block text-[#B45309]">4. Replan</strong>
            <span className="text-[#B45309] text-[11px]">Auto-adapts on miss</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#F0F7F2] border border-[#CCE4D3]">
            <strong className="block text-emerald-800">5. Verify</strong>
            <span className="text-emerald-800 text-[11px]">{deadline_report.status_label}</span>
          </div>
        </div>
      </div>

      {/* TODAY'S SCHEDULE (VERTICAL TIMELINE) */}
      <div className="bg-white p-5 rounded-xl border border-[#E6E1D8]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Today's Schedule</h3>
            <p className="text-xs text-[#64748B]">Date: {todayStr} • Daily availability: {profile.hours_per_day}h/day</p>
          </div>
          <button
            onClick={() => onNavigateToTab('tracker')}
            className="text-xs font-semibold text-[#0F172A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            All Sessions Tracker <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todaySessions.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#FAF8F5] border border-dashed border-[#DDD7CC]">
            <p className="text-sm font-medium text-[#475569]">No sessions scheduled for today ({todayStr}).</p>
            <p className="text-xs text-[#64748B] mt-1">
              Your exam is on {profile.exam_date}. You can explore the full timetable in the Adaptive Study Plan.
            </p>
            <button
              onClick={() => onNavigateToTab('plan')}
              className="mt-3 text-xs font-semibold px-4 py-2 rounded-md bg-[#0F172A] text-white hover:bg-[#1E293B] cursor-pointer"
            >
              Open Adaptive Study Plan
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {todaySessions.map((session) => {
              const subObj = subjects.find((s) => s.name === session.subject);
              const priority = subObj?.priority || session.priority || 'Medium';
              const durationMins = session.duration_minutes || Math.round(session.duration * 60);

              return (
                <div
                  key={session.id}
                  id={`today-timeline-${session.id}`}
                  className="relative pl-4 sm:pl-6 border-l-2 border-[#CBD5E1] ml-2 pb-2 last:pb-0"
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${
                      session.status === 'completed'
                        ? 'bg-emerald-600'
                        : session.status === 'missed'
                        ? 'bg-rose-600'
                        : session.status === 'partial'
                        ? 'bg-amber-500'
                        : 'bg-[#0F172A]'
                    }`}
                  />

                  {/* Start time label */}
                  <div className="text-xs font-bold text-[#475569] mb-1 tracking-wide">
                    {session.time || '5:00 PM'}
                  </div>

                  {/* Card content */}
                  <div className="p-4 rounded-lg bg-[#FAF9F7] border border-[#E6E1D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0F172A]">
                          {session.subject} — {durationMins} min
                        </span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                            priority === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {priority}
                        </span>
                      </div>

                      {session.topic && (
                        <p className="text-xs text-[#475569]">{session.topic}</p>
                      )}

                      <div className="text-xs text-[#64748B]">
                        Status:{' '}
                        <strong
                          className={
                            session.status === 'completed'
                              ? 'text-emerald-700'
                              : session.status === 'missed'
                              ? 'text-rose-700'
                              : session.status === 'partial'
                              ? 'text-amber-700'
                              : 'text-[#0F172A]'
                          }
                        >
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </strong>
                      </div>
                    </div>

                    {/* Quick interactive status buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onTrackSession(session.id, 'completed')}
                        className={`text-xs px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                          session.status === 'completed'
                            ? 'bg-emerald-700 text-white border-emerald-700 font-semibold'
                            : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                        }`}
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => onTrackSession(session.id, 'missed')}
                        className={`text-xs px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                          session.status === 'missed'
                            ? 'bg-rose-700 text-white border-rose-700 font-semibold'
                            : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
                        }`}
                      >
                        Miss
                      </button>
                      <button
                        onClick={() => onTrackSession(session.id, 'partial')}
                        className={`text-xs px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                          session.status === 'partial'
                            ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                            : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'
                        }`}
                      >
                        Partial
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* LEARNING FOCUS (SUBJECTS & PROGRESS BARS) */}
      <div className="bg-white p-5 rounded-xl border border-[#E6E1D8]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Learning Focus</h3>
            <p className="text-xs text-[#64748B]">Ranked by learning gap (gap = 100 - performance)</p>
          </div>
          <button
            onClick={() => onOpenQuizModal()}
            className="text-xs font-semibold px-3 py-1.5 rounded-md border border-[#D5CFC3] text-[#0F172A] bg-[#FAF8F5] hover:bg-[#EFECE6] flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update Score</span>
          </button>
        </div>

        <div className="space-y-3">
          {rankedSubjects.length === 0 ? (
            <div className="p-8 text-center rounded-lg bg-[#FAF8F5] border border-dashed border-[#DDD7CC]">
              <p className="text-sm text-[#475569] font-medium">No subjects enrolled yet.</p>
              <p className="text-xs text-[#64748B] mt-1">
                Add your semester subjects to generate your personalized learning plan.
              </p>
              {onOpenSetup && (
                <button
                  onClick={onOpenSetup}
                  className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-md bg-[#0F172A] text-white hover:bg-[#1E293B] cursor-pointer"
                >
                  Add Subjects
                </button>
              )}
            </div>
          ) : (
            rankedSubjects.map((sub, idx) => (
              <div
                key={sub.id || sub.name}
                className="p-3.5 rounded-lg bg-[#FAF9F7] border border-[#E6E1D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#94A3B8] font-mono">{idx + 1}.</span>
                    <span className="font-bold text-sm text-[#0F172A]">{sub.name}</span>
                    <span
                      className={`text-[11px] px-2 py-0.2 rounded font-semibold ${
                        sub.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : sub.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : sub.priority === 'Medium'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {sub.priority}
                    </span>
                    {sub.assessment_mode === 'self_assessment' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        🌱 1st Sem
                      </span>
                    )}
                  </div>

                  {sub.student_reason && (
                    <p className="text-[11px] text-[#64748B] italic line-clamp-1">
                      "{sub.student_reason}"
                    </p>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-md bg-[#EAE5DC] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          sub.performance < 50
                            ? 'bg-rose-600'
                            : sub.performance <= 64
                            ? 'bg-amber-500'
                            : sub.performance <= 79
                            ? 'bg-blue-600'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${sub.performance}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#0F172A] w-12">{sub.performance}%</span>
                    <span className="text-xs text-[#B45309] font-medium">Gap: {sub.gap}%</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenQuizModal(sub.name)}
                  className="text-xs font-medium px-3 py-1 rounded border border-[#D5CFC3] text-[#334155] bg-white hover:bg-[#FAF8F5] cursor-pointer self-start sm:self-auto"
                >
                  Reassess
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* QUICK AVAILABILITY ADAPTATION CONTROL */}
      <div className="bg-white p-5 rounded-xl border border-[#E6E1D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#0F172A]" />
            <h4 className="text-sm font-bold text-[#0F172A]">Update Availability</h4>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Current study time: <strong>{profile.hours_per_day} hours/day</strong>. Change availability to trigger autonomous replanning:
          </p>
        </div>

        <div className="flex items-center gap-2">
          {[2.0, 3.0, 4.0, 5.0].map((h) => (
            <button
              key={h}
              id={`btn-overview-avail-${h}`}
              onClick={() => onUpdateAvailability(h)}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                profile.hours_per_day === h
                  ? 'bg-[#0F172A] text-white border-[#0F172A] font-semibold'
                  : 'bg-[#FAF8F5] text-[#334155] border-[#D5CFC3] hover:bg-[#EFECE6]'
              }`}
            >
              {h}h / day
            </button>
          ))}
        </div>
      </div>

      {/* SMALL AI COACH SECTION */}
      <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#E6E1D8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0F172A] text-white flex items-center justify-center shrink-0 mt-0.5">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0F172A]">LearnLoop AI Coach</h4>
            <p className="text-xs text-[#64748B] mt-0.5">
              Have questions about your schedule, progress or missed sessions? Ask your live AI Coach.
            </p>
          </div>
        </div>

        <button
          id="btn-open-coach-from-overview"
          onClick={() => onNavigateToTab('coach')}
          className="text-xs font-semibold px-4 py-2 rounded-md bg-[#0F172A] text-white hover:bg-[#1E293B] transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>Open Coach</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
