---
layout: default
title: 日誌
lang: zh-cn
permalink: /zh-cn/log/
---
# 日誌大全

<sub>[<< 返回]({{ '/zh-cn/home/' | relative_url }})</sub>

{% assign games = site.games-zh-cn %}
{% assign posts = site.posts | where: 'lang', 'zh-cn' %}
{% assign stories = site.stories-zh-cn %}
{% assign collections = games | concat: posts | concat: stories | sort: "date" | reverse %}
{% for collection in collections %}
  {% assign paths = collection.url | split: '/' %}
  {% if paths[2] == "game" %}
    {% assign type = "游戏" %}
  {% elsif paths[2] == "post" %}
    {% assign type = "文章" %}
  {% elsif paths[2] == "story" %}
    {% assign type = "小说" %}
  {% endif %}
* [{{ collection.date | date: "%Y-%m-%d"}}: [{{ type }}] {{ collection.title }}]({{ collection.url | relative_url }})
{% endfor %}
