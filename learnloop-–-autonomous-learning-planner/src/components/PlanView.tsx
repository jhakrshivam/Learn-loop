import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  ArrowRight,
  BookOpen,
  Printer,
  Filter,
  Layers,
  Sparkles,
  Coffee,
} from 'lucide-react';
import { AppState, StudySession } from '../types';

interface PlanViewProps {
  state: AppState;
  onUpdateAvailability: (hours: number) => void;
  onTrackSession: (sessionId: string, status: 'completed' | 'missed' | 'partial') => void;
}

function formatDateHeading(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    return `${weekday}, ${day} ${month}`;
  } catch {
    return dateStr;
  }
}

function formatDayOfWeek(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  } catch {
    return 'Day';
  }
}

export const PlanView: React.FC<PlanViewProps> = ({ state, onUpdateAvailability, onTrackSession }) => {
  const { profile, sessions, plan_version, last_replan_reason, plan_diff, deadline_report, subjects } = state;

  const [viewMode, setViewMode] = useState<'timetable' | 'agenda'>('timetable');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    if (selectedSubjectFilter !== 'all' && s.subject !== selectedSubjectFilter) return false;
    if (selectedStatusFilter !== 'all' && s.status !== selectedStatusFilter) return false;
    return true;
  });

  // Group sessions by date
  const sessionsByDate: Record<string, StudySession[]> = {};
  for (const session of filteredSessions) {
    if (!sessionsByDate[session.date]) {
      sessionsByDate[session.date] = [];
    }
    sessionsByDate[session.date].push(session);
  }

  const sortedDates = Object.keys(sessionsByDate).sort();

  const totalScheduledHours = sessions
    .filter((s) => s.status === 'scheduled')
    .reduce((sum, s) => sum + s.duration, 0);

  const completedHours = sessions
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + s.duration, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Plan Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#E6E1D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-[#0F172A]">Student Study Timetable & Plan</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#0F172A] text-[#FAF8F5] font-semibold">
              Plan v{plan_version}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1.5 flex flex-wrap items-center gap-2">
            <span>
              Target Exam: <strong className="text-[#0F172A]">{profile.exam_date || 'Not set'}</strong>
            </span>
            <span>•</span>
            <span>
              Daily Study Cap: <strong className="text-[#0F172A]">{profile.hours_per_day}h/day</strong>
            </span>
            <span>•</span>
            <span>
              Start Time: <strong className="text-[#0F172A]">{profile.preferred_start_time || '5:00 PM'}</strong>
            </span>
          </p>
        </div>

        {/* View Switcher and Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Timetable vs Agenda View Toggle */}
          <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#E6E1D8]">
            <button
              onClick={() => setViewMode('timetable')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'timetable'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Timetable Grid</span>
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'agenda'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Agenda Timeline</span>
            </button>
          </div>

          {/* Quick Availability Adjuster */}
          <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E6E1D8] text-xs">
            <span className="text-[#64748B] px-1 text-[11px] font-medium hidden sm:inline">Daily Cap:</span>
            {[3.0, 4.0, 5.0].map((h) => (
              <button
                key={h}
                onClick={() => onUpdateAvailability(h)}
                className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                  profile.hours_per_day === h
                    ? 'bg-[#0F172A] text-white font-bold'
                    : 'text-[#475569] hover:bg-[#EFECE6]'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            title="Print Timetable"
            className="p-2 rounded-xl border border-[#E6E1D8] bg-white text-[#475569] hover:text-[#0F172A] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Plan Adaptation Notification Banner */}
      {plan_diff && (
        <div className="p-4 rounded-xl bg-[#FAF3E7] border border-[#E9D7BA] text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-[#B45309] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Autonomous Timetable Rebalancing
            </span>
            <span className="text-[#78350F] font-mono">Plan v{plan_diff.previous_version} → v{plan_diff.new_version}</span>
          </div>
          <p className="text-[#1E293B] font-medium">
            <strong>Reason:</strong> {plan_diff.reason}
          </p>
          <p className="text-[#475569]">{plan_diff.details}</p>
        </div>
      )}

      {/* Filter and Overview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#E6E1D8] text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-[#64748B] font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="p-1.5 rounded-lg border border-[#D5CFC3] bg-[#FAF8F5] text-xs focus:outline-none"
          >
            <option value="all">All Subjects ({subjects.length})</option>
            {subjects.map((sub) => (
              <option key={sub.name} value={sub.name}>
                {sub.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="p-1.5 rounded-lg border border-[#D5CFC3] bg-[#FAF8F5] text-xs focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
            <option value="partial">Partial</option>
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#64748B]">
          <span>
            Showing <strong className="text-[#0F172A]">{filteredSessions.length}</strong> sessions
          </span>
          <span>•</span>
          <span>
            Completed: <strong className="text-emerald-700">{completedHours}h</strong>
          </span>
          <span>•</span>
          <span>
            Pending: <strong className="text-[#0F172A]">{totalScheduledHours}h</strong>
          </span>
        </div>
      </div>

      {/* TIMETABLE GRID VIEW */}
      {viewMode === 'timetable' ? (
        <div className="space-y-4">
          {sortedDates.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#E6E1D8]">
              <p className="text-[#64748B] text-sm">No study sessions match your current filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedDates.map((dateStr) => {
                const daySessions = sessionsByDate[dateStr];
                const dailyTotalHours = daySessions.reduce((sum, s) => sum + s.duration, 0);
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const headingLabel = formatDateHeading(dateStr);
                const dayName = formatDayOfWeek(dateStr);

                return (
                  <div
                    key={dateStr}
                    className={`bg-white rounded-2xl border overflow-hidden shadow-xs flex flex-col transition-all ${
                      isToday
                        ? 'border-[#0F172A] ring-1 ring-[#0F172A]/20'
                        : 'border-[#E6E1D8] hover:border-[#CBD5E1]'
                    }`}
                  >
                    {/* Day Card Header */}
                    <div
                      className={`px-4 py-3 border-b flex items-center justify-between ${
                        isToday ? 'bg-[#0F172A] text-white' : 'bg-[#FAF8F5] text-[#0F172A] border-[#E6E1D8]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{dayName}</span>
                          {isToday && (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white text-[#0F172A]">
                              Today
                            </span>
                          )}
                        </div>
                        <span className={`text-xs block ${isToday ? 'text-slate-300' : 'text-[#64748B]'}`}>
                          {headingLabel}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono">
                          {dailyTotalHours}h / {profile.hours_per_day}h
                        </span>
                        <span className={`block text-[10px] ${isToday ? 'text-slate-300' : 'text-[#64748B]'}`}>
                          {daySessions.length} {daySessions.length === 1 ? 'block' : 'blocks'}
                        </span>
                      </div>
                    </div>

                    {/* Sessions In This Day */}
                    <div className="p-3.5 space-y-3 flex-1">
                      {daySessions.map((session, idx) => {
                        const subObj = subjects.find((s) => s.name === session.subject);
                        const durationMins = session.duration_minutes || Math.round(session.duration * 60);

                        return (
                          <div key={session.id} className="space-y-1.5">
                            {/* Coffee Break separator between multi-sessions */}
                            {idx > 0 && (
                              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#94A3B8] py-1 bg-[#F8F6F0] rounded-md border border-dashed border-[#E5DFD5]">
                                <Coffee className="w-3 h-3 text-amber-700" />
                                <span>15m Rest & Refresh Break</span>
                              </div>
                            )}

                            {/* Session Block Card */}
                            <div
                              id={`session-card-${session.id}`}
                              className={`p-3 rounded-xl border transition-all ${
                                session.status === 'completed'
                                  ? 'bg-emerald-50/60 border-emerald-200'
                                  : session.status === 'missed'
                                  ? 'bg-rose-50/60 border-rose-200'
                                  : session.status === 'partial'
                                  ? 'bg-amber-50/60 border-amber-200'
                                  : 'bg-[#FAF9F7] border-[#E6E1D8]'
                              }`}
                            >
                              {/* Time & Duration */}
                              <div className="flex items-center justify-between text-[11px] mb-1">
                                <span className="font-bold text-[#0F172A] flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#64748B]" />
                                  {session.time || '5:00 PM'}
                                </span>
                                <span className="font-mono text-[#64748B]">
                                  {durationMins} mins ({session.duration}h)
                                </span>
                              </div>

                              {/* Subject & Topic */}
                              <div className="mb-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold text-[#0F172A]">{session.subject}</span>
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                      session.priority === 'Critical'
                                        ? 'bg-rose-100 text-rose-800'
                                        : session.priority === 'High'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {session.priority}
                                  </span>
                                </div>
                                {session.topic && (
                                  <p className="text-xs text-[#475569] mt-0.5 line-clamp-1">
                                    📖 {session.topic}
                                  </p>
                                )}
                              </div>

                              {/* Action Tracker Buttons */}
                              <div className="flex items-center gap-1 pt-1.5 border-t border-black/5">
                                <button
                                  onClick={() => onTrackSession(session.id, 'completed')}
                                  className={`flex-1 py-1 text-[11px] rounded font-semibold transition-colors cursor-pointer ${
                                    session.status === 'completed'
                                      ? 'bg-emerald-700 text-white'
                                      : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
                                  }`}
                                >
                                  ✓ Done
                                </button>
                                <button
                                  onClick={() => onTrackSession(session.id, 'missed')}
                                  className={`flex-1 py-1 text-[11px] rounded font-semibold transition-colors cursor-pointer ${
                                    session.status === 'missed'
                                      ? 'bg-rose-700 text-white'
                                      : 'bg-white text-rose-800 border border-rose-200 hover:bg-rose-50'
                                  }`}
                                >
                                  ✕ Miss
                                </button>
                                <button
                                  onClick={() => onTrackSession(session.id, 'partial')}
                                  className={`flex-1 py-1 text-[11px] rounded font-semibold transition-colors cursor-pointer ${
                                    session.status === 'partial'
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
                                  }`}
                                >
                                  ↻ Half
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* AGENDA TIMELINE VIEW */
        <div className="space-y-6">
          {sortedDates.map((dateStr) => {
            const daySessions = sessionsByDate[dateStr];
            const dailyTotalHours = daySessions.reduce((sum, s) => sum + s.duration, 0);
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const headingLabel = formatDateHeading(dateStr);

            return (
              <div key={dateStr} className="bg-white rounded-2xl border border-[#E6E1D8] overflow-hidden shadow-xs">
                {/* Date Header */}
                <div className="bg-[#FAF8F5] px-5 py-3 border-b border-[#E6E1D8] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm tracking-wide text-[#0F172A] uppercase">
                      {headingLabel}
                    </span>
                    {isToday && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#0F172A] text-white uppercase font-bold tracking-wider">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    Scheduled: <strong className="text-[#0F172A]">{dailyTotalHours}h</strong> / {profile.hours_per_day}h max
                  </div>
                </div>

                {/* Timeline appearance */}
                <div className="p-5 space-y-4">
                  {daySessions.map((session) => {
                    const subObj = subjects.find((s) => s.name === session.subject);
                    const priority = subObj?.priority || session.priority || 'Medium';
                    const durationMins = session.duration_minutes || Math.round(session.duration * 60);

                    return (
                      <div
                        key={session.id}
                        id={`session-card-${session.id}`}
                        className="relative pl-0 sm:pl-4 border-l-2 border-[#CBD5E1] ml-1 sm:ml-2 pb-2 last:pb-0"
                      >
                        {/* Dot on timeline */}
                        <div
                          className={`hidden sm:block absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${
                            session.status === 'completed'
                              ? 'bg-emerald-600'
                              : session.status === 'missed'
                              ? 'bg-rose-600'
                              : session.status === 'partial'
                              ? 'bg-amber-500'
                              : 'bg-[#0F172A]'
                          }`}
                        />

                        {/* Session Time Header */}
                        <div className="text-xs font-semibold text-[#475569] mb-1 tracking-wide">
                          {session.time || '5:00 PM'}
                        </div>

                        {/* Session Body Card */}
                        <div className="p-4 rounded-xl bg-[#FAF9F7] border border-[#E6E1D8] hover:border-[#CBD5E1] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold text-[#0F172A]">{session.subject}</span>
                              <span className="text-xs text-[#94A3B8] font-mono">[{session.id}]</span>
                            </div>

                            {session.topic && (
                              <p className="text-xs text-[#334155] font-medium flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-[#64748B]" />
                                <span>{session.topic}</span>
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] pt-0.5">
                              <span>
                                <strong className="text-[#0F172A]">{durationMins} min</strong> ({session.duration}h)
                              </span>
                              <span>•</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  priority === 'Critical'
                                    ? 'bg-rose-100 text-rose-800'
                                    : priority === 'High'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {priority}
                              </span>
                              <span>•</span>
                              <span>
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
                              </span>
                            </div>
                          </div>

                          {/* Interactive Status Actions */}
                          <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EFECE6]">
                            <button
                              onClick={() => onTrackSession(session.id, 'completed')}
                              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                                session.status === 'completed'
                                  ? 'bg-emerald-700 text-white border-emerald-700 font-semibold'
                                  : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                              }`}
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => onTrackSession(session.id, 'missed')}
                              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                                session.status === 'missed'
                                  ? 'bg-rose-700 text-white border-rose-700 font-semibold'
                                  : 'bg-white text-rose-800 border-rose-300 hover:bg-rose-50'
                              }`}
                            >
                              Missed
                            </button>
                            <button
                              onClick={() => onTrackSession(session.id, 'partial')}
                              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                                session.status === 'partial'
                                  ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                                  : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
                              }`}
                            >
                              Partial (50%)
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
