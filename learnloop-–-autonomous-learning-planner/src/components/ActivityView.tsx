import React from 'react';
import { ActivityLogItem } from '../types';
import { ListFilter, Terminal } from 'lucide-react';

interface ActivityViewProps {
  logs: ActivityLogItem[];
}

export const ActivityView: React.FC<ActivityViewProps> = ({ logs }) => {
  const getTagBadgeClass = (tag: ActivityLogItem['tag']) => {
    switch (tag) {
      case 'ANALYZER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SCHEDULER':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'TRACKER':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'REPLANNER':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'VERIFIER':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg border border-[#E6E1D8]">
        <div className="flex items-center gap-2 mb-1">
          <Terminal className="w-4 h-4 text-[#0F172A]" />
          <h2 className="text-lg font-semibold text-[#0F172A]">Autonomous Activity Log</h2>
        </div>
        <p className="text-xs text-[#64748B]">
          Direct feedback from autonomous learning planner steps: Analyze → Plan → Track → Replan → Verify.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-[#E6E1D8] shadow-xs overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#64748B]">
            No activity logged yet.
          </div>
        ) : (
          <div className="divide-y divide-[#EFECE6] font-mono text-xs">
            {logs.map((item) => (
              <div
                key={item.id}
                id={`activity-${item.id}`}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#FAF9F7] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getTagBadgeClass(
                      item.tag
                    )}`}
                  >
                    [{item.tag}]
                  </span>
                  <span className="text-[#0F172A] font-medium font-sans text-sm">
                    {item.message}
                  </span>
                </div>
                <span className="text-[#94A3B8] text-[11px] shrink-0 sm:ml-4">
                  {item.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
