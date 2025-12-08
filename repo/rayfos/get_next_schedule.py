from datetime import datetime, timedelta, time
import calendar

def get_next_schedule(
  target_time: time, 
  target_weekday: int = None, 
  target_day_of_month: int = None, 
  now: datetime = None
) -> datetime:
  """
  Returns the nearest future datetime based on scheduling constraints.
  
  Args:
    target_time: The required time (hour, minute, second).
    target_weekday: Optional 0-6 (Mon-Sun). Mutually exclusive with target_day_of_month.
    target_day_of_month: Optional 1-31. Mutually exclusive with target_weekday.
    now: Reference datetime. Defaults to datetime.now().
  """
  if now is None:
    now = datetime.now()
  
  # Normalize microseconds for cleaner comparisons
  if target_time.microsecond == 0:
    now = now.replace(microsecond=0)

  if target_weekday is not None and target_day_of_month is not None:
    raise ValueError("target_weekday and target_day_of_month are mutually exclusive.")

  # --- Scenario: Monthly Schedule (Specific Day of Month) ---
  if target_day_of_month is not None:
    def get_clamped_date(year, month, day):
      # Get the number of days in the requested month
      _, max_days_in_month = calendar.monthrange(year, month)
      # Clamp: If target is 31 but month has 30, use 30
      actual_day = min(day, max_days_in_month)
      return datetime(year, month, actual_day, target_time.hour, target_time.minute, target_time.second)

    # Check current month
    candidate = get_clamped_date(now.year, now.month, target_day_of_month)

    if candidate >= now:
      return candidate
    else:
      # Move to next month
      next_month = now.month + 1
      next_year = now.year
      if next_month > 12:
        next_month = 1
        next_year += 1
      return get_clamped_date(next_year, next_month, target_day_of_month)

  # --- Scenario: Weekly Schedule (Specific Weekday) ---
  elif target_weekday is not None:
    current_weekday_idx = now.weekday()
    days_ahead = (target_weekday - current_weekday_idx + 7) % 7
    
    candidate_date = now.date() + timedelta(days=days_ahead)
    candidate = datetime.combine(candidate_date, target_time)
    
    # If it falls on today but the time has passed, move to next week
    if candidate <= now:
      candidate += timedelta(days=7)
      
    return candidate

  # --- Scenario: Daily Schedule ---
  else:
    candidate = datetime.combine(now.date(), target_time)
    
    # If today's slot has passed, move to tomorrow
    if now >= candidate:
      candidate += timedelta(days=1)
      
    return candidate