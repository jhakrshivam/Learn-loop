import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Target,
  BookOpen,
  GraduationCap,
  Compass,
  MessageSquare,
} from 'lucide-react';
import { AppState, CoachMessage } from '../types';
import { FormattedMarkdown } from './FormattedMarkdown';
import { TopicGuideViewer } from './TopicGuideViewer';

interface AICoachViewProps {
  state: AppState;
  onNavigateToTab?: (tab: 'overview' | 'analysis' | 'plan' | 'tracker' | 'activity') => void;
}

const QUICK_QUESTIONS = [
  '👉 What should I do right now?',
  '🧭 Step-by-step: How to study if a topic is weak?',
  '🌱 I am in 1st semester, how should I start?',
  '💡 How to start Pointers & Memory from scratch',
  '🪜 Guide me through Normalization step-by-step',
  '⏱️ Break down my study session today',
  '⚠️ What common exam traps should I avoid?',
];

export const AICoachView: React.FC<AICoachViewProps> = ({ state, onNavigateToTab }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'topic_guide'>('chat');
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm your LearnLoop Assistant Coach for **${state.profile.course} (${state.profile.semester})**. 

I am your personal pedagogical mentor:
- 🧭 **Step-by-Step Guidance:** If a topic feels weak or confusing, I'll give you an exact 4-phase roadmap—starting with what to read in the first 25 minutes, followed by worked examples and practice ladders.
- 🎯 **Daily Focus:** I'll tell you exactly what study block to open today and how to tackle it without feeling overwhelmed.
- 🌱 **1st Semester Friendly:** We never assume you are "weak" or criticize missing scores. Every subject is built step-by-step.

Ask me about any tricky topic (e.g. *"I'm weak in Normalization, how do I start?"* or *"What should I do right now?"*), or switch to the **Topic Diagnostic Roadmap** tab above!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isLoading, activeTab]);

  const handleSend = async (questionText?: string) => {
    const textToSend = (questionText || input).trim();
    if (!textToSend || isLoading) return;

    // Switch to chat tab if from topic guide
    setActiveTab('chat');

    const userMsg: CoachMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!res.ok) throw new Error('Failed to get coach response');

      const data = await res.json();
      const botMsg: CoachMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: data.answer,
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      // Local resilient fallback using current state
      const topSub = state.subjects.sort((a, b) => b.gap - a.gap)[0];
      const botMsg: CoachMessage = {
        id: `bot_err_${Date.now()}`,
        sender: 'assistant',
        text: `### 🧭 Step-by-Step Study Guidance\n\nFor **${topSub ? topSub.name : 'your top subject'}**:\n\n1. **First 25 Minutes:** Open Chapter 1 or lecture slides. Read foundational definitions without worrying about complex proofs.\n2. **Hand-Trace:** Draw 1 worked diagram or example on blank paper.\n3. **Practice:** Solve 1 basic problem, check your answer, and take a 5-minute break!\n4. **Timetable:** You have ${state.deadline_report.remaining_days} days until exams—steady daily practice beats last-minute cramming every time.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = state.sessions.filter((s) => s.date === todayStr);
  const ranked = [...state.subjects].sort((a, b) => b.gap - a.gap);
  const topFocus = ranked[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E6E1D8] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">Student Assistant Coach</h2>
                <span className="text-[11px] text-[#64748B] block">
                  Interactive pedagogical mentor • Step-by-step topic guidance & exam readiness
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#DDD6C8] text-[#334155] font-semibold">
              Plan v{state.plan_version}
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${
                state.deadline_report.is_feasible
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {state.deadline_report.status_label}
            </span>
          </div>
        </div>

        {/* Live Grounded Facts Strip */}
        <div className="mt-4 pt-3 border-t border-[#EFECE6] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EBE6DD]">
            <span className="text-[#64748B] block text-[11px] font-medium">Top Priority Subject</span>
            <strong className="text-[#0F172A] truncate block mt-0.5">{topFocus ? topFocus.name : 'None'}</strong>
            {topFocus?.student_reason && (
              <span className="text-[10px] text-[#94A3B8] truncate block">"{topFocus.student_reason}"</span>
            )}
          </div>
          <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EBE6DD]">
            <span className="text-[#64748B] block text-[11px] font-medium">Today's Schedule</span>
            <strong className="text-[#0F172A] block mt-0.5">{todaySessions.length} session block(s)</strong>
            <span className="text-[10px] text-[#64748B] block">Start: {state.profile.preferred_start_time || '5:00 PM'}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EBE6DD]">
            <span className="text-[#64748B] block text-[11px] font-medium">Daily Study Cap</span>
            <strong className="text-[#0F172A] block mt-0.5">{state.profile.hours_per_day} hours/day</strong>
            <span className="text-[10px] text-emerald-700 block font-medium">Burnout-safe limit</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EBE6DD]">
            <span className="text-[#64748B] block text-[11px] font-medium">Exam Countdown</span>
            <strong className="text-[#0F172A] block mt-0.5">{state.deadline_report.remaining_days} days left</strong>
            <span className="text-[10px] text-[#64748B] block">{state.profile.exam_date || 'Ongoing'}</span>
          </div>
        </div>

        {/* View Mode Toggle: Chat vs Weak Topic Diagnostic */}
        <div className="mt-4 pt-3 border-t border-[#EFECE6] flex items-center gap-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'bg-[#FAF8F5] border border-[#DDD6C8] text-[#475569] hover:bg-[#F1ECE4]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Coach Conversation</span>
          </button>
          <button
            onClick={() => setActiveTab('topic_guide')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'topic_guide'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'bg-[#FAF8F5] border border-[#DDD6C8] text-[#475569] hover:bg-[#F1ECE4]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>Weak Topic Diagnostic & Roadmap</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Topic Diagnostic Guide */}
      {activeTab === 'topic_guide' && (
        <TopicGuideViewer
          state={state}
          onAskCoachAboutTopic={(prompt) => {
            handleSend(prompt);
          }}
        />
      )}

      {/* Mode 2: Interactive Coaching Chat */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-[#E6E1D8] flex flex-col h-[580px] shadow-xs overflow-hidden">
          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#FAF9F7]/60">
            {messages.map((msg) => {
              const isBot = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-semibold shadow-xs ${
                      isBot ? 'bg-[#0F172A] text-white' : 'bg-[#EAE5DC] text-[#334155]'
                    }`}
                  >
                    {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                      isBot
                        ? 'bg-white border border-[#E6E1D8] text-[#0F172A] shadow-2xs'
                        : 'bg-[#0F172A] text-[#FAF8F5]'
                    }`}
                  >
                    {isBot ? (
                      <FormattedMarkdown content={msg.text} isBot={true} />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                    <span
                      className={`block text-[10px] mt-2 ${
                        isBot ? 'text-[#94A3B8]' : 'text-slate-400 text-right'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-white border border-[#E6E1D8] rounded-xl p-3.5 text-xs text-[#64748B] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0F172A] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#0F172A] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#0F172A] animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 font-medium">Assistant Coach is formulating your step-by-step guidance...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="p-3 bg-[#FAF8F5] border-t border-[#EAE5DC] overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#64748B] font-semibold shrink-0 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Actionable Prompts:
              </span>
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#D5CFC3] text-[#334155] hover:bg-[#F3EFEA] hover:border-[#0F172A] hover:text-[#0F172A] font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 disabled:opacity-50 shadow-2xs"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-3.5 bg-white border-t border-[#E6E1D8]">
            <div className="flex items-center gap-2">
              <input
                id="input-coach-question"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask: 'I am weak in Normalization, where do I start?', 'Step-by-step guide for Pointers', etc."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#D5CFC3] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0F172A] bg-[#FAF8F5] focus:bg-white"
              />
              <button
                id="btn-coach-send"
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] transition-colors disabled:opacity-40 flex items-center gap-2 text-xs font-bold cursor-pointer shrink-0 shadow-xs"
              >
                <span>Ask Coach</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
