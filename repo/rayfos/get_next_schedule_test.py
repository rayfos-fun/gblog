import unittest
from datetime import datetime, time, timedelta

from .get_next_schedule import get_next_schedule


class TestGetNextSchedule(unittest.TestCase):

    def setUp(self):
        # Set a fixed "now" reference for consistent testing
        # Reference: October 11, 2023 (Wednesday) at 10:00:00
        self.now = datetime(2023, 10, 11, 10, 0, 0)

    # ==========================================
    # 1. Daily Schedule Tests
    # ==========================================
    def test_daily_future_time(self):
        """Scenario: Target time is later today -> Returns today."""
        target = time(14, 30)  # 14:30
        expected = datetime(2023, 10, 11, 14, 30)

        result = get_next_schedule(target_time=target, now=self.now)
        self.assertEqual(result, expected)

    def test_daily_past_time(self):
        """Scenario: Target time is earlier today -> Returns tomorrow."""
        target = time(9, 0)  # 09:00 (Current is 10:00)
        expected = datetime(2023, 10, 12, 9, 0)  # Tomorrow

        result = get_next_schedule(target_time=target, now=self.now)
        self.assertEqual(result, expected)

    # ==========================================
    # 2. Weekly Schedule Tests
    # ==========================================
    def test_weekly_today_future(self):
        """Scenario: Target is Wednesday (2), time is later -> Returns today."""
        target_time = time(14, 0)
        target_weekday = 2  # Wednesday (Reference is also Wednesday)
        expected = datetime(2023, 10, 11, 14, 0)

        result = get_next_schedule(
            target_time, target_weekday=target_weekday, now=self.now
        )
        self.assertEqual(result, expected)

    def test_weekly_today_past(self):
        """Scenario: Target is Wednesday (2), time is earlier -> Returns next Wednesday."""
        target_time = time(9, 0)
        target_weekday = 2  # Wednesday
        expected = datetime(2023, 10, 18, 9, 0)  # 11th + 7 days = 18th

        result = get_next_schedule(
            target_time, target_weekday=target_weekday, now=self.now
        )
        self.assertEqual(result, expected)

    def test_weekly_next_day(self):
        """Scenario: Target is Friday (4) -> Returns this coming Friday."""
        target_time = time(10, 0)
        target_weekday = 4  # Friday
        expected = datetime(2023, 10, 13, 10, 0)  # 11th (Wed) -> 13th (Fri)

        result = get_next_schedule(
            target_time, target_weekday=target_weekday, now=self.now
        )
        self.assertEqual(result, expected)

    def test_weekly_past_day(self):
        """Scenario: Target is Monday (0) -> Returns next Monday."""
        target_time = time(10, 0)
        target_weekday = 0  # Monday (Passed)
        expected = datetime(2023, 10, 16, 10, 0)  # Next Monday

        result = get_next_schedule(
            target_time, target_weekday=target_weekday, now=self.now
        )
        self.assertEqual(result, expected)

    # ==========================================
    # 3. Monthly Schedule Tests
    # ==========================================
    def test_monthly_same_month(self):
        """Scenario: Target is the 20th of this month -> Returns the 20th of this month."""
        target_time = time(10, 0)
        target_day = 20
        expected = datetime(2023, 10, 20, 10, 0)

        result = get_next_schedule(
            target_time, target_day_of_month=target_day, now=self.now
        )
        self.assertEqual(result, expected)

    def test_monthly_next_month(self):
        """Scenario: Target is the 5th (already passed) -> Returns the 5th of next month."""
        target_time = time(10, 0)
        target_day = 5
        expected = datetime(2023, 11, 5, 10, 0)

        result = get_next_schedule(
            target_time, target_day_of_month=target_day, now=self.now
        )
        self.assertEqual(result, expected)

    def test_monthly_year_rollover(self):
        """Scenario: Current is December, target passed -> Returns January of next year."""
        dec_now = datetime(2023, 12, 25, 10, 0)
        target_time = time(10, 0)
        target_day = 10
        expected = datetime(2024, 1, 10, 10, 0)  # Next year

        result = get_next_schedule(
            target_time, target_day_of_month=target_day, now=dec_now
        )
        self.assertEqual(result, expected)

    # ==========================================
    # 4. Edge Cases (Clamping Logic)
    # ==========================================
    def test_monthly_clamping_february(self):
        """Scenario: Target 31st, next month is Feb (28 days) -> Clamps to Feb 28."""
        # Current: Jan 31st (passed)
        jan_now = datetime(2023, 1, 31, 12, 0)
        target_time = time(10, 0)  # Earlier than current, check next month

        # Logic: Next month is Feb, target 31st -> Should clamp to Feb 28th
        expected = datetime(2023, 2, 28, 10, 0)

        result = get_next_schedule(target_time, target_day_of_month=31, now=jan_now)
        self.assertEqual(result, expected)

    def test_monthly_clamping_leap_year(self):
        """Scenario: Target 31st, next month is Leap Year Feb (29 days) -> Clamps to Feb 29."""
        # Set current to Jan 2024 (Leap Year)
        jan_now = datetime(2024, 1, 31, 12, 0)
        target_time = time(10, 0)

        expected = datetime(2024, 2, 29, 10, 0)  # Leap year Feb has 29 days

        result = get_next_schedule(target_time, target_day_of_month=31, now=jan_now)
        self.assertEqual(result, expected)

    def test_monthly_clamping_april(self):
        """Scenario: Target 31st, current month is April (30 days) -> Clamps to Apr 30."""
        # Current: April 1st
        apr_now = datetime(2023, 4, 1, 10, 0)
        target_time = time(14, 0)

        # Logic: Try 4/31, but April has 30 days -> Returns 4/30
        expected = datetime(2023, 4, 30, 14, 0)

        result = get_next_schedule(target_time, target_day_of_month=31, now=apr_now)
        self.assertEqual(result, expected)

    # ==========================================
    # 5. Error Handling
    # ==========================================
    def test_mutually_exclusive_error(self):
        """Scenario: Providing both Weekday and Day of Month -> Should raise ValueError."""
        with self.assertRaises(ValueError):
            get_next_schedule(
                time(10, 0), target_weekday=1, target_day_of_month=1, now=self.now
            )


if __name__ == "__main__":
    unittest.main()
