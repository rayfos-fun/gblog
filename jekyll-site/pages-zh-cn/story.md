---
layout: default
title: 剧情
lang: zh-cn
permalink: /zh-cn/story/
order: 4
---
# 剧情

<sub>[<< 返回]({{ '/zh-cn/home/' | relative_url }})</sub>

{% for story in site.stories-zh-cn %}
* [{{ story.title }}]({{ story.url | relative_url }})
{% endfor %}
