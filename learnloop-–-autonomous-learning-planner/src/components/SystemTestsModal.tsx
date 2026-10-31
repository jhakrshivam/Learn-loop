import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, RefreshCw, Terminal, ShieldCheck } from 'lucide-react';
import { SystemTestResult } from '../types';

interface SystemTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemTestsModal: React.FC<SystemTestsModalProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<SystemTestResult[]>([]);
  const [allPassed, setAllPassed] = useState<boolean | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/run-tests');
      if (res.ok) {
        const data = await res.json();
        setTestResults(data.results);
        setAllPassed(data.all_passed);
      }
    } catch (err) {
      console.error('Failed to run system tests', err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-xl border border-[#E6E1D8] shadow-xl overflow-hidden my-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 bg-[#FAF8F5] border-b border-[#E6E1D8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#0F172A]">Automated System Verification Tests</h3>
              <p className="text-xs text-[#64748B]">8 Core Test Suites matching Hackathon specifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#EFECE6] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Summary Status Bar */}
          <div
            className={`p-3.5 rounded-lg border flex items-center justify-between ${
              allPassed === true
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : allPassed === false
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-[#FAF8F5] border-[#E6E1D8] text-[#0F172A]'
            }`}
          >
            <div className="flex items-center gap-2 font-medium text-xs sm:text-sm">
              {allPassed === true ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>All 8 Core System Tests PASSED successfully.</span>
                </>
              ) : allPassed === false ? (
                <>
                  <XCircle className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>Some test suites encountered issues.</span>
                </>
              ) : (
                <span>Executing test runner...</span>
              )}
            </div>
            <button
              onClick={runTests}
              disabled={isRunning}
              className="text-xs px-2.5 py-1 rounded bg-white border border-[#D5CFC3] hover:bg-[#F3EFEA] flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
              <span>Rerun</span>
            </button>
          </div>

          {/* CLI instructions reference */}
          <div className="p-3 bg-[#FAF8F5] rounded-md border border-[#E6E1D8] text-xs font-mono text-[#475569]">
            <div className="flex items-center gap-1.5 text-[#0F172A] font-semibold mb-1 font-sans">
              <Terminal className="w-3.5 h-3.5 text-[#0F172A]" /> Python CLI Test Command:
            </div>
            <code className="text-[#0F172A] bg-white px-2 py-1 rounded border border-[#DDD7CC] inline-block">
              python3 -m unittest test_learnloop.py -v
            </code>
          </div>

          {/* Test items list */}
          <div className="space-y-2">
            {testResults.map((test) => (
              <div
                key={test.id}
                id={`test-item-${test.id}`}
                className="p-3 rounded-lg border border-[#E6E1D8] bg-white flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-semibold text-sm text-[#0F172A]">
                    <span>Test {test.id}: {test.name}</span>
                  </div>
                  <p className="text-[#475569]">{test.description}</p>
                  <p className="text-[11px] text-[#64748B] font-mono mt-1 bg-[#FAF8F5] p-1.5 rounded border border-[#EFECE6]">
                    {test.details}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                    test.passed
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {test.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#E6E1D8] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-md bg-[#0F172A] text-white hover:bg-[#1E293B] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
