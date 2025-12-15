---
layout: default
title: 部落格
lang: zh-cn
permalink: /zh-cn/post/
order: 4
---
# 文章列表

<sub>[<< 返回]({{ '/zh-cn/home/' | relative_url }})</sub>

{% assign posts = site.posts | where: "lang", "zh-cn" %}
{% for post in posts %}
* [{{ post.date | date: "[%Y年%m月%d日] " }}{{ post.title }}]({{ post.url | relative_url }})
{% endfor %}
