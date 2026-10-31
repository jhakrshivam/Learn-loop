"""
LearnLoop – Autonomous Learning Planner
Core Python implementation for Agentic AI Education Hackathon.
Provides Analyzer, Planner, Tracker, Replanner, and Verifier.
"""

from datetime import datetime, date, timedelta
import math
import uuid
from typing import List, Dict, Any, Optional

def calculate_gap(performance: float) -> float:
    """Calculates learning gap: gap = 100 - performance."""
    return max(0.0, min(100.0, 100.0 - float(performance)))

def calculate_priority(performance: float) -> str:
    """
    Determines subject priority:
    - below 50: Critical
    - 50-64: High
    - 65-79: Medium
    - 80+: Low
    """
    perf = float(performance)
    if perf < 50.0:
        return "Critical"
    elif perf <= 64.0:
        return "High"
    elif perf <= 79.0:
        return "Medium"
    else:
        return "Low"

class Subject:
    def __init__(self, name: str, performance: float):
        self.name = name
        self.performance = float(performance)
        self.gap = calculate_gap(self.performance)
        self.priority = calculate_priority(self.performance)

    def update_performance(self, new_performance: float):
        self.performance = float(new_performance)
        self.gap = calculate_gap(self.performance)
        self.priority = calculate_priority(self.performance)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "performance": self.performance,
            "gap": self.gap,
            "priority": self.priority
        }

class Session:
    def __init__(self, session_id: str, session_date: str, subject: str, duration: float, status: str = "scheduled"):
        self.id = session_id
        self.date = session_date  # YYYY-MM-DD
        self.subject = subject
        self.duration = float(duration)
        self.status = status  # scheduled, completed, missed, partial

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "date": self.date,
            "subject": self.subject,
            "duration": self.duration,
            "status": self.status
        }

class DeadlineReport:
    def __init__(self, exam_date: str, remaining_days: int, completed_hours: float,
                 remaining_required_hours: float, available_future_hours: float, is_feasible: bool):
        self.exam_date = exam_date
        self.remaining_days = remaining_days
        self.completed_hours = round(completed_hours, 1)
        self.remaining_required_hours = round(remaining_required_hours, 1)
        self.available_future_hours = round(available_future_hours, 1)
        self.is_feasible = is_feasible
        self.status_label = "✓ Feasible" if self.is_feasible else "⚠ Not Feasible"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "exam_date": self.exam_date,
            "remaining_days": self.remaining_days,
            "completed_hours": self.completed_hours,
            "remaining_required_hours": self.remaining_required_hours,
            "available_future_hours": self.available_future_hours,
            "is_feasible": self.is_feasible,
            "status_label": "✓ Feasible" if self.is_feasible else "⚠ Not Feasible"
        }

class LearnLoopPlanner:
    def __init__(self, course: str = "", semester: str = "", exam_date: str = "",
                 learning_goal: str = "", hours_per_day: float = 4.0):
        self.course = course
        self.semester = semester
        self.exam_date = exam_date
        self.learning_goal = learning_goal
        self.hours_per_day = float(hours_per_day)
        self.subjects: List[Subject] = []
        self.sessions: List[Session] = []
        self.plan_version: int = 1
        self.last_replan_reason: str = "Initial plan"
        self.activity_log: List[str] = []

    def log(self, message: str):
        self.activity_log.append(message)

    def add_subject(self, name: str, performance: float):
        subject = Subject(name, performance)
        self.subjects.append(subject)
        self.log(f"[ANALYZER] Performance analyzed for {name} ({performance}%, Gap: {subject.gap}%, Priority: {subject.priority})")

    def get_ranked_subjects(self) -> List[Subject]:
        """Rank subjects by learning need (highest gap first)."""
        return sorted(self.subjects, key=lambda s: s.gap, reverse=True)

    def calculate_workload_hours(self) -> Dict[str, float]:
        """Calculates needed hours per subject based on gap and priority weighting."""
        ranked = self.get_ranked_subjects()
        total_gap = sum(s.gap for s in ranked) or 1.0
        # Baseline total needed study hours proportional to gap (minimum 4 hours per subject, scaled up)
        workloads = {}
        for s in ranked:
            # Base hours proportional to gap: gap of 50 => ~8h, gap of 80 => ~14h
            weight = max(0.15, s.gap / 100.0)
            base_hours = max(2.0, round(weight * 16.0, 1))
            workloads[s.name] = base_hours
        return workloads

    def generate_plan(self, start_date_str: Optional[str] = None):
        """
        Creates study sessions respecting:
        - daily availability (never > hours_per_day)
        - exam date (never schedule on or after exam date)
        - dynamic session IDs
        """
        if not self.exam_date or not self.subjects:
            return

        today = datetime.strptime(start_date_str, "%Y-%m-%d").date() if start_date_str else date.today()
        exam_d = datetime.strptime(self.exam_date, "%Y-%m-%d").date()

        days_available = (exam_d - today).days
        if days_available <= 0:
            return

        # Keep existing completed/partial/missed sessions
        past_sessions = [s for s in self.sessions if s.status in ["completed", "missed", "partial"]]
        new_sessions = list(past_sessions)

        # Workload hours needed per subject
        workloads = self.calculate_workload_hours()

        # Deduct already completed hours
        for s in past_sessions:
            if s.status == "completed" and s.subject in workloads:
                workloads[s.subject] = max(0.0, workloads[s.subject] - s.duration)

        ranked_subjects = self.get_ranked_subjects()
        current_day = today
        sess_counter = len(new_sessions) + 1

        # Slot duration: standard 1.5h or 2.0h based on hours_per_day
        slot_duration = min(2.0, round(self.hours_per_day / 2, 1)) if self.hours_per_day >= 2.0 else self.hours_per_day
        if slot_duration <= 0:
            slot_duration = 1.0

        day_idx = 0
        while any(hrs > 0.5 for hrs in workloads.values()) and day_idx < days_available:
            sched_date = today + timedelta(days=day_idx)
            day_idx += 1
            if sched_date >= exam_d:
                break

            day_hours = 0.0
            # Allocate to subjects in need
            for subject in ranked_subjects:
                if day_hours + slot_duration <= self.hours_per_day and workloads[subject.name] > 0.0:
                    dur = min(slot_duration, workloads[subject.name], self.hours_per_day - day_hours)
                    if dur >= 0.5:
                        sess_id = f"sess_{sess_counter}_{uuid.uuid4().hex[:6]}"
                        sess_counter += 1
                        new_sessions.append(Session(sess_id, sched_date.strftime("%Y-%m-%d"), subject.name, dur, "scheduled"))
                        workloads[subject.name] -= dur
                        day_hours += dur

        self.sessions = new_sessions
        self.log("[SCHEDULER] Plan created")
        self.verify_deadline()

    def mark_session(self, session_id: str, new_status: str, start_date_str: Optional[str] = None):
        """
        Track session: complete | miss | partial.
        When marked Miss:
        1. Persist status as 'missed'.
        2. Keep the same session ID.
        3. Recalculate remaining workload.
        4. Automatically change future sessions.
        5. Increase the affected subject's future allocation when possible.
        6. Recheck the deadline.
        """
        target = next((s for s in self.sessions if s.id == session_id), None)
        if not target:
            return False

        target.status = new_status

        if new_status == "missed":
            self.log(f"[TRACKER] Session marked missed for {target.subject}")
            self.plan_version += 1
            self.last_replan_reason = f"Missed session ({target.subject})"
            # Replan future sessions and increase allocation for target.subject
            self._replan_after_miss(target.subject, target.duration, start_date_str)
            self.log("[REPLANNER] Future plan updated")
            self.verify_deadline()
        elif new_status == "completed":
            self.log(f"[TRACKER] Session marked completed for {target.subject}")
            self.verify_deadline()
        elif new_status == "partial":
            self.log(f"[TRACKER] Session marked partial for {target.subject}")
            self.verify_deadline()

        return True

    def _replan_after_miss(self, missed_subject: str, missed_duration: float, start_date_str: Optional[str] = None):
        """Adjusts future sessions to recover missed hours while respecting daily availability."""
        today = datetime.strptime(start_date_str, "%Y-%m-%d").date() if start_date_str else date.today()
        exam_d = datetime.strptime(self.exam_date, "%Y-%m-%d").date()

        fixed_sessions = [s for s in self.sessions if s.status != "scheduled"]
        future_scheduled = [s for s in self.sessions if s.status == "scheduled"]

        # Recalculate workload needed
        workloads = self.calculate_workload_hours()
        # Add compensatory hours for missed session
        workloads[missed_subject] = workloads.get(missed_subject, 0.0) + missed_duration

        for s in fixed_sessions:
            if s.status == "completed" and s.subject in workloads:
                workloads[s.subject] = max(0.0, workloads[s.subject] - s.duration)

        # Regenerate future sessions starting from tomorrow (or next day)
        new_future: List[Session] = []
        sess_counter = len(fixed_sessions) + 1
        days_available = (exam_d - today).days

        ranked_subjects = self.get_ranked_subjects()
        # Ensure missed subject is given higher priority
        ranked_subjects = sorted(ranked_subjects, key=lambda s: (s.name == missed_subject, s.gap), reverse=True)

        slot_duration = min(2.0, round(self.hours_per_day / 2, 1)) if self.hours_per_day >= 2.0 else self.hours_per_day
        if slot_duration <= 0:
            slot_duration = 1.0

        for day_idx in range(1, days_available):
            sched_date = today + timedelta(days=day_idx)
            if sched_date >= exam_d:
                break
            day_hours = 0.0
            for subject in ranked_subjects:
                if day_hours + slot_duration <= self.hours_per_day and workloads[subject.name] > 0.0:
                    dur = min(slot_duration, workloads[subject.name], self.hours_per_day - day_hours)
                    if dur >= 0.5:
                        sess_id = f"sess_{sess_counter}_{uuid.uuid4().hex[:6]}"
                        sess_counter += 1
                        new_future.append(Session(sess_id, sched_date.strftime("%Y-%m-%d"), subject.name, dur, "scheduled"))
                        workloads[subject.name] -= dur
                        day_hours += dur

        self.sessions = fixed_sessions + new_future

    def update_quiz_performance(self, subject_name: str, new_score: float, start_date_str: Optional[str] = None):
        """
        Updates subject performance, recalculates gap/priority, replans future allocations.
        """
        sub = next((s for s in self.subjects if s.name == subject_name), None)
        if not sub:
            return False

        old_score = sub.performance
        old_priority = sub.priority
        sub.update_performance(new_score)

        self.log(f"[ANALYZER] Performance analyzed for {subject_name} ({old_score}% → {new_score}%, {old_priority} → {sub.priority})")
        self.plan_version += 1
        self.last_replan_reason = f"Quiz performance changed: {subject_name} ({old_score}% → {new_score}%)"

        # Replan future scheduled sessions with new priorities
        self._replan_future_sessions(start_date_str)
        self.log("[REPLANNER] Future plan updated")
        self.verify_deadline()
        return True

    def update_availability(self, new_hours_per_day: float, start_date_str: Optional[str] = None):
        """
        Updates daily available study hours and replans.
        """
        old_hours = self.hours_per_day
        self.hours_per_day = float(new_hours_per_day)
        self.plan_version += 1
        self.last_replan_reason = f"Availability updated ({old_hours}h/day → {self.hours_per_day}h/day)"
        self.log(f"[SCHEDULER] Plan created with new availability: {self.hours_per_day} hours/day")
        self._replan_future_sessions(start_date_str)
        self.verify_deadline()

    def _replan_future_sessions(self, start_date_str: Optional[str] = None):
        today = datetime.strptime(start_date_str, "%Y-%m-%d").date() if start_date_str else date.today()
        exam_d = datetime.strptime(self.exam_date, "%Y-%m-%d").date()
        days_available = (exam_d - today).days

        fixed_sessions = [s for s in self.sessions if s.status != "scheduled"]
        workloads = self.calculate_workload_hours()

        for s in fixed_sessions:
            if s.status == "completed" and s.subject in workloads:
                workloads[s.subject] = max(0.0, workloads[s.subject] - s.duration)

        ranked_subjects = self.get_ranked_subjects()
        new_future: List[Session] = []
        sess_counter = len(fixed_sessions) + 1

        slot_duration = min(2.0, round(self.hours_per_day / 2, 1)) if self.hours_per_day >= 2.0 else self.hours_per_day
        if slot_duration <= 0:
            slot_duration = 1.0

        for day_idx in range(0, days_available):
            sched_date = today + timedelta(days=day_idx)
            if sched_date >= exam_d:
                break
            day_hours = 0.0
            for subject in ranked_subjects:
                if day_hours + slot_duration <= self.hours_per_day and workloads[subject.name] > 0.0:
                    dur = min(slot_duration, workloads[subject.name], self.hours_per_day - day_hours)
                    if dur >= 0.5:
                        sess_id = f"sess_{sess_counter}_{uuid.uuid4().hex[:6]}"
                        sess_counter += 1
                        new_future.append(Session(sess_id, sched_date.strftime("%Y-%m-%d"), subject.name, dur, "scheduled"))
                        workloads[subject.name] -= dur
                        day_hours += dur

        self.sessions = fixed_sessions + new_future

    def verify_deadline(self, start_date_str: Optional[str] = None) -> DeadlineReport:
        """
        Dynamically calculates:
        - exam date
        - remaining days
        - completed hours
        - remaining required hours
        - available future hours
        - feasibility: available future hours >= remaining required hours
        """
        today = datetime.strptime(start_date_str, "%Y-%m-%d").date() if start_date_str else date.today()
        exam_d = datetime.strptime(self.exam_date, "%Y-%m-%d").date() if self.exam_date else today

        remaining_days = max(0, (exam_d - today).days)
        completed_hours = sum(s.duration for s in self.sessions if s.status == "completed")

        # Required hours are the remaining workload from subjects
        workloads = self.calculate_workload_hours()
        for s in self.sessions:
            if s.status == "completed" and s.subject in workloads:
                workloads[s.subject] = max(0.0, workloads[s.subject] - s.duration)

        remaining_required_hours = sum(workloads.values())
        available_future_hours = remaining_days * self.hours_per_day
        is_feasible = (available_future_hours >= remaining_required_hours) and (remaining_days > 0)

        report = DeadlineReport(
            exam_date=self.exam_date,
            remaining_days=remaining_days,
            completed_hours=completed_hours,
            remaining_required_hours=remaining_required_hours,
            available_future_hours=available_future_hours,
            is_feasible=is_feasible
        )

        self.log("[VERIFIER] Deadline checked")
        return report
