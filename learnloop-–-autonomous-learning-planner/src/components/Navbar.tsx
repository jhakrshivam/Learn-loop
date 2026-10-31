import React from 'react';
import { RefreshCw, Sliders, CheckCircle2, AlertCircle, BookOpen, Clock, PlayCircle, Bot } from 'lucide-react';
import { AppState } from '../types';

export type AppTab = 'overview' | 'analysis' | 'plan' | 'tracker' | 'coach' | 'activity';

interface NavbarProps {
  state: AppState | null;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onLoadDemo: () => void;
  onOpenSetup: () => void;
  onOpenTests: () => void;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  activeTab,
  setActiveTab,
  onLoadDemo,
  onOpenSetup,
  onOpenTests,
  isLoading,
}) => {
  return (
    <header id="app-header" className="border-b border-[#E7E2D9] bg-[#FAF8F5] sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top Row: Brand & Global Actions */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0F172A] text-[#FAF8F5] flex items-center justify-center font-bold text-lg tracking-tight">
              L
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg text-[#0F172A] tracking-tight">LearnLoop</span>
                {state && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#EAE5DC] text-[#334155] font-medium border border-[#DDD6C8]">
                    Plan v{state.plan_version}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B] hidden sm:block">Autonomous Learning Planner</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-run-tests"
              onClick={onOpenTests}
              className="text-xs font-medium px-3 py-1.5 rounded-md border border-[#D5CFC3] text-[#334155] bg-white hover:bg-[#F3EFEA] transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Run 8 verification tests"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden md:inline">Run System Tests</span>
              <span className="md:hidden">Tests</span>
            </button>

            <button
              id="btn-load-demo"
              onClick={onLoadDemo}
              disabled={isLoading}
              className="text-xs font-medium px-3 py-1.5 rounded-md border border-[#0F172A] bg-[#0F172A] text-[#FAF8F5] hover:bg-[#1E293B] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Load Demo</span>
            </button>

            <button
              id="btn-open-setup"
              onClick={onOpenSetup}
              className="text-xs font-medium px-3 py-1.5 rounded-md border border-[#D5CFC3] text-[#334155] bg-white hover:bg-[#F3EFEA] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#475569]" />
              <span className="hidden sm:inline">Student Setup</span>
              <span className="sm:hidden">Setup</span>
            </button>
          </div>
        </div>

        {/* Bottom Navigation Tabs */}
        <nav id="nav-tabs" className="flex space-x-1 sm:space-x-6 overflow-x-auto no-scrollbar border-t border-[#EFECE6] pt-1">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'plan', label: 'Timetable & Plan' },
            { key: 'coach', label: 'Assistant Coach', icon: Bot },
            { key: 'analysis', label: 'Priorities & Context' },
            { key: 'tracker', label: 'Session Tracker' },
            { key: 'activity', label: 'Autonomous Logs' },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                id={`tab-${tab.key}`}
                onClick={() => setActiveTab(tab.key as AppTab)}
                className={`py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'border-[#0F172A] text-[#0F172A] font-bold'
                    : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1]'
                }`}
              >
                {TabIcon && <TabIcon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
