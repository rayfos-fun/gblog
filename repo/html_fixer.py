#!/usr/bin/env python

from bs4 import BeautifulSoup
from pathlib import Path

import os

def fix_dir(dirname):
  for filename in os.listdir(dirname):
    filepath = os.path.join(dirname, filename)
    if os.path.isfile(filepath):
      fix_file(filepath)
    else:
      fix_dir(filepath)

def fix_file(filename):
  if Path(filename).suffix != '.html':
    return
  soup = BeautifulSoup(read_file(filename), 'lxml')
  html_tag = soup.find('html')
  if not html_tag:
    # could be template
    return
  lang = html_tag.get('lang')
  updated = False
  if 'zh-cn' in filename and lang != 'zh-Hans':
    print(f'update lang zh-Hans file for {filename}')
    html_tag['lang'] = 'zh-Hans'
    updated = True
  elif 'zh-tw' in filename and lang != 'zh-Hant':
    print(f'update lang zh-Hant file for {filename}')
    html_tag['lang'] = 'zh-Hant'
    updated = True
  elif lang != 'en': 
    print(f'update lang en file for {filename}')
    html_tag['lang'] = 'en'
    updated = True

  if updated:
    with open(filename, 'w', encoding='utf-8') as f:
      f.write(soup.prettify())



    
def read_file(filename):
  with open(filename, 'r', encoding='utf-8') as f:
    return f.read()

def main():
  fix_dir('../docs')


if __name__ == '__main__':
  main()
