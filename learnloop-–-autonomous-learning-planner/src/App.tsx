import React, { useState, useEffect } from 'react';
import { Navbar, AppTab } from './components/Navbar';
import { OverviewView } from './components/OverviewView';
import { AnalysisView } from './components/AnalysisView';
import { PlanView } from './components/PlanView';
import { TrackerView } from './components/TrackerView';
import { ActivityView } from './components/ActivityView';
import { AICoachView } from './components/AICoachView';
import { StudentSetupModal } from './components/StudentSetupModal';
import { QuizModal } from './components/QuizModal';
import { SystemTestsModal } from './components/SystemTestsModal';
import { AppState } from './types';
import { initializeDemoState } from '../server/plannerCore';
import { AlertCircle, CheckCircle, Info, Bot } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizSubjectName, setQuizSubjectName] = useState<string | undefined>(undefined);
  const [isTestsOpen, setIsTestsOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  // Fetch initial state from server
  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setState(data);
      } else {
        // Fallback to local demo if backend is cold starting
        setState(initializeDemoState());
      }
    } catch (err) {
      console.warn('Backend loading, utilizing offline initial state:', err);
      setState(initializeDemoState());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Handlers
  const handleLoadDemo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/load-demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setState(data);
        showToast('Demo data loaded successfully. Explore the study plan and tracker.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSetup = async (setupData: any) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setupData),
      });
      if (res.ok) {
        const data = await res.json();
        setState(data);
        showToast('Student profile saved and initial study plan generated.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSession = async (sessionId: string, status: 'completed' | 'missed' | 'partial') => {
    try {
      const res = await fetch('/api/track-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, status }),
      });
      if (res.ok) {
        const data = await res.json();
        setState(data);
        if (status === 'missed') {
          showToast(`Session marked missed. Plan adapted: Plan v${data.plan_version - 1} → Plan v${data.plan_version}`);
        } else if (status === 'completed') {
          showToast('Session marked completed! Workload updated.');
        } else {
          showToast('Session marked partial attendance.');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitQuizScore = async (
    subjectName: string,
    newScore: number,
    options?: { studentReason?: string; assessmentMode?: 'marks' | 'self_assessment'; confidenceLevel?: string }
  ) => {
    try {
      const res = await fetch('/api/update-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName,
          newScore,
          studentReason: options?.studentReason,
          assessmentMode: options?.assessmentMode,
          confidenceLevel: options?.confidenceLevel,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setState(data);
        showToast('Plan updated because your performance changed.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAvailability = async (hours: number) => {
    try {
      const res = await fetch('/api/update-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hoursPerDay: hours }),
      });
      if (res.ok) {
        const data = await res.json();
        setState(data);
        showToast(`Availability updated to ${hours} hours/day. Future sessions replanned.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenQuizModal = (subjectName?: string) => {
    setQuizSubjectName(subjectName);
    setIsQuizOpen(true);
  };

  if (!state && isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-[#0F172A] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-medium text-[#0F172A]">Initializing LearnLoop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F172A] flex flex-col font-sans selection:bg-[#EAE5DC]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-[#0F172A] text-white text-xs px-4 py-3 rounded-lg shadow-lg border border-[#334155] flex items-start gap-2.5 animate-in slide-in-from-bottom-2 duration-200">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">{toastMessage}</div>
        </div>
      )}

      {/* Top Navbar with Navigation Tabs */}
      <Navbar
        state={state}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLoadDemo={handleLoadDemo}
        onOpenSetup={() => setIsSetupOpen(true)}
        onOpenTests={() => setIsTestsOpen(true)}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {state && (
          <>
            {activeTab === 'overview' && (
              <OverviewView
                state={state}
                onTrackSession={handleTrackSession}
                onNavigateToTab={setActiveTab}
                onOpenQuizModal={handleOpenQuizModal}
                onUpdateAvailability={handleUpdateAvailability}
                onOpenSetup={() => setIsSetupOpen(true)}
              />
            )}

            {activeTab === 'analysis' && (
              <AnalysisView subjects={state.subjects} onOpenQuizModal={handleOpenQuizModal} />
            )}

            {activeTab === 'plan' && (
              <PlanView
                state={state}
                onUpdateAvailability={handleUpdateAvailability}
                onTrackSession={handleTrackSession}
              />
            )}

            {activeTab === 'tracker' && (
              <TrackerView state={state} onTrackSession={handleTrackSession} />
            )}

            {activeTab === 'coach' && (
              <AICoachView state={state} onNavigateToTab={setActiveTab} />
            )}

            {activeTab === 'activity' && <ActivityView logs={state.activity_log} />}
          </>
        )}
      </main>

      {/* Floating Assistant Coach Trigger Button */}
      {activeTab !== 'coach' && state && (
        <div className="fixed bottom-5 right-5 z-40">
          <button
            id="floating-coach-btn"
            onClick={() => setActiveTab('coach')}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0F172A] text-white shadow-xl hover:bg-[#1E293B] hover:scale-105 transition-all cursor-pointer border border-white/20 group"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold block leading-tight">Ask Assistant Coach</span>
              <span className="text-[10px] text-slate-300 block leading-tight">"What should I do right now?"</span>
            </div>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#E7E2D9] bg-[#FAF8F5] py-4 text-center text-xs text-[#64748B]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LearnLoop • Autonomous Learning Planner (Hackathon MVP)</span>
          <div className="flex items-center gap-3">
            <span>Analyze → Plan → Track → Replan → Verify</span>
            <span>•</span>
            <button
              onClick={() => setIsTestsOpen(true)}
              className="text-[#0F172A] font-semibold hover:underline cursor-pointer"
            >
              8 Tests Report
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <StudentSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        currentState={state}
        onSaveSetup={handleSaveSetup}
        onLoadDemo={handleLoadDemo}
      />

      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        subjects={state?.subjects || []}
        initialSubjectName={quizSubjectName}
        onSubmitQuizScore={handleSubmitQuizScore}
      />

      <SystemTestsModal isOpen={isTestsOpen} onClose={() => setIsTestsOpen(false)} />
    </div>
  );
}
