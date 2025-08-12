#!/usr/bin/env python
import subprocess

def main():
  try:
    subprocess.run(['subl', 'hello_subprocess.py'], check=True)
  except FileNotFoundError:
    print(f'hello_subprocess.py not found')
  except subprocess.CalledProcessError as e:
    print(f'failed when "subl hello_subprocess.py": {e}')


if __name__ == '__main__':
  main()
