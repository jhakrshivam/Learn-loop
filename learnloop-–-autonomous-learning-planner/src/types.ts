export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type SessionStatus = 'scheduled' | 'completed' | 'missed' | 'partial';

export interface Subject {
  id: string;
  name: string;
  performance: number; // 0 - 100
  gap: number;         // 100 - performance
  priority: PriorityLevel;
  assessment_mode?: 'marks' | 'self_assessment';
  confidence_level?: 'beginner' | 'moderate' | 'comfortable' | 'advanced';
  student_reason?: string; // Student's rationale: e.g. "1st semester — brand new subject, never did coding before"
  marks_obtained?: number;
  total_marks?: number;
}

export interface StudySession {
  id: string;
  date: string;        // YYYY-MM-DD
  time: string;        // e.g. "5:00 PM"
  subject: string;
  topic?: string;      // e.g. "Normalization & SQL"
  duration: number;    // hours, e.g. 1.0, 1.5
  duration_minutes: number; // e.g. 60, 90
  priority: PriorityLevel;
  status: SessionStatus;
  notes?: string;
}

export interface StudentProfile {
  university: string;
  course: string;      // B.Tech, BCA, BBA, B.Com, B.Sc, BA, MCA, MBA, Other
  branch: string;
  semester: string;
  exam_date: string;   // YYYY-MM-DD
  learning_goal: string;
  hours_per_day: number;
  preferred_start_time: string; // e.g. "17:00" or "5:00 PM"
}

export interface DeadlineReport {
  exam_date: string;
  remaining_days: number;
  completed_hours: number;
  remaining_required_hours: number;
  available_future_hours: number;
  is_feasible: boolean;
  status_label: '✓ Feasible' | '⚠ Not Feasible';
}

export interface WorkloadSnapshot {
  subject: string;
  hours_remaining: number;
}

export interface PlanDiff {
  previous_version: number;
  new_version: number;
  reason: string;
  details: string;
  timestamp: string;
  before_workload?: WorkloadSnapshot;
  after_workload?: WorkloadSnapshot;
}

export interface ActivityLogItem {
  id: string;
  tag: 'ANALYZER' | 'SCHEDULER' | 'TRACKER' | 'REPLANNER' | 'VERIFIER';
  message: string;
  timestamp: string;
}

export interface CoachMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface AppState {
  profile: StudentProfile;
  subjects: Subject[];
  sessions: StudySession[];
  plan_version: number;
  last_replan_reason: string;
  plan_diff: PlanDiff | null;
  activity_log: ActivityLogItem[];
  deadline_report: DeadlineReport;
  is_demo?: boolean;
}

export interface SystemTestResult {
  id: number;
  name: string;
  description: string;
  passed: boolean;
  details: string;
}

export interface TopicStepGuide {
  subject: string;
  topic: string;
  prerequisites: string[];
  starting_point: {
    first_step: string;
    first_30_mins: string;
    mental_model: string;
  };
  steps: {
    step_number: number;
    title: string;
    duration: string;
    what_to_do: string;
    key_concept: string;
    check_question: string;
  }[];
  practice_ladder: {
    level: 'Beginner' | 'Intermediate' | 'Exam Ready';
    problem_type: string;
    goal: string;
  }[];
  common_traps: string[];
  self_test_questions: string[];
}
