#!/usr/bin/env python
import datetime

# output weeks since today until 2070
def main():
  start_date = datetime.date.today()
  end_date = datetime.date(year=2070, month=1, day=1)
  current_date = start_date
  while current_date < end_date:
    print(current_date.strftime('%Y-%m-%d'))
    current_date += datetime.timedelta(days=7)


if __name__ == '__main__':
  main()
