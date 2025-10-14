---
layout: default
title: 日誌
lang: zh-tw
permalink: /zh-tw/log/
---
# 日誌大全

<sub>[<< 返回]({{ '/zh-tw/home/' | relative_url }})</sub>

{% assign games = site.games-zh-tw %}
{% assign posts = site.posts | where: 'lang', 'zh-tw' %}
{% assign stories = site.stories-zh-tw %}
{% assign collections = games | concat: posts | concat: stories | sort: "date" | reverse %}
{% for collection in collections %}
  {% assign paths = collection.url | split: '/' %}
  {% if paths[2] == "game" %}
    {% assign type = "遊戲" %}
  {% elsif paths[2] == "post" %}
    {% assign type = "文章" %}
  {% elsif paths[2] == "story" %}
    {% assign type = "小說" %}
  {% endif %}
* [{{ collection.date | date: "%Y-%m-%d"}}: [{{ type }}] {{ collection.title }}]({{ collection.url | relative_url }})
{% endfor %}
