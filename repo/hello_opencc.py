#!/usr/bin/env python
from opencc import OpenCC

# Initialize OpenCC converter
# 'tw2sp.json' means Traditional Chinese (Taiwan) to Simplified Chinese (with common phrases)
cc = OpenCC('tw2sp')

traditional_text = "滑鼠、記憶體、程式設計、憂鬱、資訊科技、軟體工程師、計程車、鳳梨、列印"
simplified_text = cc.convert(traditional_text)

print(f"繁體中文: {traditional_text}")
print(f"簡體中文: {simplified_text}")

# Example 2: Simplified to Traditional (General)
cc_s2t = OpenCC('s2t')
simplified_text_2 = "鼠标、内存、程序设计、抑郁、信息技术、软件工程师、出租车、菠萝、打印"
traditional_text_2 = cc_s2t.convert(simplified_text_2)

print(f"\n簡體中文: {simplified_text_2}")
print(f"繁體中文: {traditional_text_2}")