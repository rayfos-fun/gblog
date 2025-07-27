#!/usr/bin/env python
import os
from opencc import OpenCC

def read_file(filename):
  with open(filename, 'r', encoding='utf-8') as f:
    return f.read()

def main():
  cc_t2s = OpenCC('t2s')
  # copy all files from zh-tw to zh-cn
  src_dir = '../docs/zh-tw'
  dst_dir = '../docs/zh-cn'
  for f in os.listdir(src_dir):
    print(f'copying {f}...')
    with open(os.path.join(dst_dir, f), 'w', encoding='utf-8') as wf:
      wf.write(cc_t2s.convert(read_file(os.path.join(src_dir, f))))

if __name__ == '__main__':
  main()
