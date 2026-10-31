import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Target,
  ArrowRight,
  Layers,
  ChevronDown,
  HelpCircle,
  PlayCircle,
} from 'lucide-react';
import { AppState, Subject, TopicStepGuide } from '../types';

interface TopicGuideViewerProps {
  state: AppState;
  onAskCoachAboutTopic: (prompt: string) => void;
  onScheduleTopic?: (subject: string, topic: string) => void;
}

const COMMON_TOPICS_BY_SUBJECT: Record<string, string[]> = {
  database: [
    'Normalization (1NF, 2NF, 3NF, BCNF)',
    'SQL Complex Joins & Subqueries',
    'Transactions & ACID Properties',
    'Indexing & B+ Trees',
  ],
  data: [
    'Pointers & Dynamic Memory Management',
    'Recursion & Dynamic Programming (DP)',
    'Binary Search Trees (BST)',
    'Graph Traversals (BFS & DFS)',
  ],
  operating: [
    'Deadlocks & The Banker\'s Algorithm',
    'Paging, Virtual Memory & Page Replacement',
    'CPU Scheduling (Round Robin, SJF)',
    'Semaphores & Mutex Locks',
  ],
  network: [
    'TCP 3-Way Handshake & Congestion Control',
    'OSI vs TCP/IP Layers',
    'IP Subnetting (CIDR)',
    'DNS Resolution & HTTP/HTTPS',
  ],
  math: [
    'Integration Techniques & Calculus',
    'Eigenvalues & Matrix Transformations',
    'Mathematical Induction & Proofs',
    'Probability Distributions',
  ],
};

export const TopicGuideViewer: React.FC<TopicGuideViewerProps> = ({
  state,
  onAskCoachAboutTopic,
  onScheduleTopic,
}) => {
  const defaultSub = state.subjects.sort((a, b) => b.gap - a.gap)[0] || state.subjects[0];
  const [selectedSubject, setSelectedSubject] = useState<string>(defaultSub ? defaultSub.name : '');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [activeGuide, setActiveGuide] = useState<TopicStepGuide | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  // Get common topic suggestions based on selected subject name
  const getSubjectSuggestions = (subName: string): string[] => {
    const lower = subName.toLowerCase();
    for (const [key, topics] of Object.entries(COMMON_TOPICS_BY_SUBJECT)) {
      if (lower.includes(key)) return topics;
    }
    return [
      `${subName} Chapter 1 Fundamentals`,
      'Core Theoretical Proofs',
      'High-Yield Midterm Topics',
      'Common Past Exam Problems',
    ];
  };

  const handleGenerateGuide = async (topicToUse?: string) => {
    const targetTopic = topicToUse || customTopic.trim() || `${selectedSubject} Core Concepts`;
    setIsLoading(true);
    setCheckedItems({});

    try {
      const res = await fetch('/api/topic-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: selectedSubject, topic: targetTopic }),
      });

      if (!res.ok) throw new Error('Failed to fetch guide');
      const data: TopicStepGuide = await res.json();
      setActiveGuide(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const suggestions = getSubjectSuggestions(selectedSubject);

  return (
    <div className="bg-white rounded-2xl border border-[#E6E1D8] p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EFECE6]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center font-bold text-sm">
              <Compass className="w-4 h-4 text-amber-700" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Weak Topic Diagnostic & Step-by-Step Starter</h3>
              <p className="text-xs text-[#64748B]">
                Struggling with a difficult chapter or don't know where to begin? Get an exact 4-phase pedagogical breakdown.
              </p>
            </div>
          </div>
        </div>
        {activeGuide && (
          <button
            onClick={() => {
              onAskCoachAboutTopic(
                `Can you coach me step-by-step through "${activeGuide.topic}" in ${activeGuide.subject}? I want to start from absolute scratch.`
              );
            }}
            className="text-xs px-3.5 py-1.5 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs cursor-pointer"
          >
            <span>Ask Coach in Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Controls: Subject & Topic Selection */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-[#475569] mb-1">Select Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setActiveGuide(null);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFC3] bg-[#FAF8F5] text-[#0F172A] font-medium focus:outline-none focus:border-[#0F172A]"
          >
            {state.subjects.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name} ({s.performance}% - {s.priority} priority)
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-[#475569] mb-1">
            Weak Topic / Chapter Name
          </label>
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="e.g. Normalization, Pointers, Deadlocks, etc."
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5CFC3] bg-[#FAF8F5] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0F172A]"
          />
        </div>

        <div className="md:col-span-3">
          <button
            onClick={() => handleGenerateGuide()}
            disabled={isLoading}
            className="w-full px-4 py-2 text-xs font-bold rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            {isLoading ? (
              <span>Preparing Guide...</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Get Step-by-Step Guide</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div>
        <span className="text-[11px] text-[#64748B] font-semibold block mb-1.5">
          High-Yield Tricky Topics for {selectedSubject}:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((topic) => (
            <button
              key={topic}
              onClick={() => {
                setCustomTopic(topic);
                handleGenerateGuide(topic);
              }}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E0DBD1] text-[#334155] hover:border-[#0F172A] hover:text-[#0F172A] font-medium transition-colors cursor-pointer"
            >
              + {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Active Guide Card */}
      {activeGuide && (
        <div className="mt-4 p-5 rounded-2xl bg-[#FAF9F7] border border-[#E2DDD3] space-y-6">
          {/* Guide Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6E1D8]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                Topic Mastery Roadmap
              </span>
              <h4 className="text-lg font-bold text-[#0F172A] mt-1">{activeGuide.topic}</h4>
              <p className="text-xs text-[#64748B]">
                Subject: <strong className="text-[#334155]">{activeGuide.subject}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  onAskCoachAboutTopic(
                    `I'm starting ${activeGuide.topic} right now. Can you quiz me on Step 1: ${activeGuide.steps[0]?.title}?`
                  )
                }
                className="text-xs px-3 py-1.5 rounded-xl bg-white border border-[#D5CFC3] text-[#0F172A] hover:bg-[#F3EFEA] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Quiz Me on Step 1</span>
              </button>
            </div>
          </div>

          {/* 1. How to Start from Scratch */}
          <div className="bg-white p-4 rounded-xl border border-[#E5E0D6] shadow-2xs">
            <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
              <PlayCircle className="w-4 h-4 text-emerald-700" />
              <span>Phase 1: How to Start from Scratch (First 30 Mins)</span>
            </h5>
            <div className="mt-3 space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
                <span className="font-bold text-emerald-900 block mb-0.5">🌱 First Immediate Step:</span>
                <p className="text-emerald-950">{activeGuide.starting_point.first_step}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#EBE6DD]">
                <span className="font-bold text-[#0F172A] block mb-0.5">⏱️ Your First 30 Minutes:</span>
                <p className="text-[#334155]">{activeGuide.starting_point.first_30_mins}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200">
                <span className="font-bold text-amber-950 block mb-0.5">💡 Mental Model / Everyday Analogy:</span>
                <p className="text-amber-900 italic">"{activeGuide.starting_point.mental_model}"</p>
              </div>
            </div>
          </div>

          {/* 2. The 4-Phase Step-by-Step Breakdown */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#0F172A]" />
              <span>Phase 2: 4-Phase Learning Ladder</span>
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeGuide.steps.map((s) => (
                <div
                  key={s.step_number}
                  className="bg-white p-4 rounded-xl border border-[#E5E0D6] flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-[#0F172A] text-white text-xs font-bold flex items-center justify-center">
                        {s.step_number}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {s.duration}
                      </span>
                    </div>
                    <h6 className="text-xs font-bold text-[#0F172A] mb-1">{s.title}</h6>
                    <p className="text-xs text-[#334155] leading-relaxed mb-2.5">{s.what_to_do}</p>
                    <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EFECE6] text-[11px] text-[#475569] mb-2">
                      <strong className="text-[#0F172A] block text-[10px] uppercase font-bold">Key Concept:</strong>
                      {s.key_concept}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#F1EEE8] text-[11px] text-slate-600 italic">
                    <span className="font-semibold not-italic text-[#0F172A]">Check question:</span>{' '}
                    "{s.check_question}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Practice Problem Ladder */}
          <div className="bg-white p-4 rounded-xl border border-[#E5E0D6] shadow-2xs">
            <h5 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide flex items-center gap-1.5 mb-3">
              <Target className="w-4 h-4 text-rose-600" />
              <span>Phase 3: 3-Tier Practice Ladder</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeGuide.practice_ladder.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#FAF8F5] border border-[#EBE6DD] text-xs">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider block w-fit mb-1.5 ${
                      item.level === 'Beginner'
                        ? 'bg-blue-100 text-blue-900'
                        : item.level === 'Intermediate'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {item.level}
                  </span>
                  <strong className="text-[#0F172A] block mb-1">{item.problem_type}</strong>
                  <p className="text-[#475569] text-[11px] leading-relaxed">{item.goal}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Common Traps & Self-Test Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Traps */}
            <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs">
              <h5 className="text-xs font-bold text-rose-900 uppercase tracking-wide flex items-center gap-1.5 mb-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Common Exam Traps</span>
              </h5>
              <ul className="space-y-2 text-xs text-[#334155]">
                {activeGuide.common_traps.map((trap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{trap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Checklist */}
            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs">
              <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5 mb-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Self-Test Mastery Checklist</span>
              </h5>
              <div className="space-y-2 text-xs">
                {activeGuide.self_test_questions.map((q, idx) => (
                  <label
                    key={idx}
                    className="flex items-start gap-2 p-1.5 rounded hover:bg-emerald-50/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedItems[idx]}
                      onChange={() => toggleCheck(idx)}
                      className="mt-0.5 rounded text-emerald-700 focus:ring-0 cursor-pointer"
                    />
                    <span
                      className={`text-[11px] leading-snug ${
                        checkedItems[idx]
                          ? 'line-through text-[#94A3B8]'
                          : 'text-[#334155] font-medium'
                      }`}
                    >
                      {q}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
