#!/usr/bin/env python
import os

from opencc import OpenCC


def copy_file(src_file, dst_file):
    cc_t2s = OpenCC("t2s")
    with open(dst_file, "w", encoding="utf-8") as f:
        f.write(cc_t2s.convert(read_file(src_file)))


def copy_dir(src_dir, dst_dir):
    for f in os.listdir(src_dir):
        src_f = os.path.join(src_dir, f)
        dst_f = os.path.join(dst_dir, f)
        if os.path.isfile(src_f):
            if os.path.exists(dst_f):
                src_t = os.path.getmtime(src_f)
                dst_t = os.path.getmtime(dst_f)
                if src_t > dst_t:
                    print(f"Updated file: {dst_f}")
                    copy_file(src_f, dst_f)
            else:
                print(f"Created file: {dst_f}")
                copy_file(src_f, dst_f)
        elif os.path.isdir(src_f):
            copy_dir(src_f, dst_f)


def read_file(filename):
    with open(filename, "r", encoding="utf-8") as f:
        return f.read()


def main():
    cc_t2s = OpenCC("t2s")
    # copy all files from zh-tw to zh-cn
    copy_dir(src_dir="../docs/zh-tw", dst_dir="../docs/zh-cn")


if __name__ == "__main__":
    main()
