"""
Unit tests for LearnLoop – Autonomous Learning Planner.
Tests:
1. Analyzer gap calculation.
2. Priority calculation.
3. Schedule respects daily hours.
4. Missed session persists as "missed".
5. Missed session changes future plan.
6. Availability 5 → 3 persists.
7. Quiz score changes priority.
8. Deadline verifier calculates feasibility.
"""

import unittest
from datetime import date, timedelta
from learnloop import calculate_gap, calculate_priority, LearnLoopPlanner, Subject

class TestLearnLoop(unittest.TestCase):

    def test_1_analyzer_gap_calculation(self):
        """Test 1: Analyzer gap calculation (gap = 100 - performance)."""
        self.assertEqual(calculate_gap(100), 0.0)
        self.assertEqual(calculate_gap(75), 25.0)
        self.assertEqual(calculate_gap(45), 55.0)
        self.assertEqual(calculate_gap(0), 100.0)
        self.assertEqual(calculate_gap(68), 32.0)

    def test_2_priority_calculation(self):
        """
        Test 2: Priority calculation:
        - below 50 = Critical
        - 50–64 = High
        - 65–79 = Medium
        - 80+ = Low
        """
        self.assertEqual(calculate_priority(49), "Critical")
        self.assertEqual(calculate_priority(30), "Critical")
        self.assertEqual(calculate_priority(50), "High")
        self.assertEqual(calculate_priority(64), "High")
        self.assertEqual(calculate_priority(65), "Medium")
        self.assertEqual(calculate_priority(79), "Medium")
        self.assertEqual(calculate_priority(80), "Low")
        self.assertEqual(calculate_priority(95), "Low")

    def test_3_schedule_respects_daily_hours(self):
        """Test 3: Schedule respects daily hours (never schedule more hours than availability)."""
        planner = LearnLoopPlanner(
            course="B.S. Computer Science",
            semester="Semester 4",
            exam_date=(date.today() + timedelta(days=10)).strftime("%Y-%m-%d"),
            learning_goal="Ace exams",
            hours_per_day=3.5
        )
        planner.add_subject("Operating Systems", 40)
        planner.add_subject("Computer Networks", 60)
        planner.add_subject("Algorithms", 70)
        planner.generate_plan()

        # Group sessions by date and check total hours per day
        daily_totals = {}
        for s in planner.sessions:
            daily_totals[s.date] = daily_totals.get(s.date, 0.0) + s.duration

        for day, total in daily_totals.items():
            self.assertLessEqual(round(total, 2), 3.5, f"Day {day} exceeded daily limit with {total} hours")

    def test_4_missed_session_persists_as_missed(self):
        """Test 4: Missed session persists as 'missed' and keeps the same session ID."""
        planner = LearnLoopPlanner(
            course="B.S. Computer Science",
            exam_date=(date.today() + timedelta(days=10)).strftime("%Y-%m-%d"),
            hours_per_day=4.0
        )
        planner.add_subject("Database Systems", 50)
        planner.generate_plan()

        self.assertGreater(len(planner.sessions), 0)
        target_session = planner.sessions[0]
        original_id = target_session.id

        # Mark session as missed
        planner.mark_session(original_id, "missed")

        # Find the session again by original ID
        session_after = next((s for s in planner.sessions if s.id == original_id), None)
        self.assertIsNotNone(session_after)
        self.assertEqual(session_after.status, "missed")
        self.assertEqual(session_after.id, original_id)

    def test_5_missed_session_changes_future_plan(self):
        """Test 5: Missed session automatically updates future plan and bumps plan version."""
        planner = LearnLoopPlanner(
            course="B.S. Software Engineering",
            exam_date=(date.today() + timedelta(days=14)).strftime("%Y-%m-%d"),
            hours_per_day=4.0
        )
        planner.add_subject("Operating Systems", 45)
        planner.add_subject("Linear Algebra", 70)
        planner.generate_plan()

        initial_version = planner.plan_version
        target_session = planner.sessions[0]
        initial_future_count = len([s for s in planner.sessions if s.status == "scheduled"])

        # Mark missed
        planner.mark_session(target_session.id, "missed")

        self.assertEqual(planner.plan_version, initial_version + 1)
        self.assertIn("Missed session", planner.last_replan_reason)
        # Check that activity log recorded replanning
        self.assertTrue(any("[REPLANNER]" in msg for msg in planner.activity_log))

    def test_6_availability_5_to_3_persists(self):
        """Test 6: Availability 5 -> 3 persists and is respected in future scheduling."""
        planner = LearnLoopPlanner(
            course="B.S. Data Science",
            exam_date=(date.today() + timedelta(days=12)).strftime("%Y-%m-%d"),
            hours_per_day=5.0
        )
        planner.add_subject("Machine Learning", 55)
        planner.generate_plan()

        self.assertEqual(planner.hours_per_day, 5.0)

        # Update availability to 3.0
        planner.update_availability(3.0)
        self.assertEqual(planner.hours_per_day, 3.0)

        # Verify all future days now do not exceed 3.0 hours
        daily_totals = {}
        for s in planner.sessions:
            if s.status == "scheduled":
                daily_totals[s.date] = daily_totals.get(s.date, 0.0) + s.duration

        for day, total in daily_totals.items():
            self.assertLessEqual(round(total, 2), 3.0, f"Future day {day} exceeded new 3.0 limit with {total} hours")

    def test_7_quiz_score_changes_priority(self):
        """Test 7: Quiz score change (e.g. 68% -> 45%) updates gap, priority (Medium -> Critical)."""
        planner = LearnLoopPlanner(
            course="B.S. Computer Science",
            exam_date=(date.today() + timedelta(days=10)).strftime("%Y-%m-%d"),
            hours_per_day=4.0
        )
        planner.add_subject("Algorithms", 68.0)
        subj = planner.subjects[0]

        self.assertEqual(subj.gap, 32.0)
        self.assertEqual(subj.priority, "Medium")

        # Update quiz score to 45%
        planner.update_quiz_performance("Algorithms", 45.0)

        self.assertEqual(subj.performance, 45.0)
        self.assertEqual(subj.gap, 55.0)
        self.assertEqual(subj.priority, "Critical")
        self.assertTrue(any("[REPLANNER]" in msg for msg in planner.activity_log))

    def test_8_deadline_verifier_calculates_feasibility(self):
        """Test 8: Deadline verifier calculates feasibility dynamically."""
        # Case A: Feasible (15 days * 4 hours = 60 available hours, workload ~ 15 hours)
        planner_feasible = LearnLoopPlanner(
            course="B.S. Engineering",
            exam_date=(date.today() + timedelta(days=15)).strftime("%Y-%m-%d"),
            hours_per_day=4.0
        )
        planner_feasible.add_subject("Physics", 75)
        report_feasible = planner_feasible.verify_deadline()
        self.assertTrue(report_feasible.is_feasible)
        self.assertEqual(report_feasible.status_label, "✓ Feasible")
        self.assertGreater(report_feasible.available_future_hours, report_feasible.remaining_required_hours)

        # Case B: Not Feasible (Only 1 day left * 1 hour/day = 1 hour, workload > 5 hours)
        planner_unfeasible = LearnLoopPlanner(
            course="B.S. Engineering",
            exam_date=(date.today() + timedelta(days=1)).strftime("%Y-%m-%d"),
            hours_per_day=1.0
        )
        planner_unfeasible.add_subject("Physics", 20)
        planner_unfeasible.add_subject("Calculus", 20)
        report_unfeasible = planner_unfeasible.verify_deadline()
        self.assertFalse(report_unfeasible.is_feasible)
        self.assertEqual(report_unfeasible.status_label, "⚠ Not Feasible")


# Test runner for standalone execution
if __name__ == "__main__":
    unittest.main(verbosity=2)
