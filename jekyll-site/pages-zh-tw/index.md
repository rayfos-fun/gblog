---
layout: default
title: 首頁
lang: zh-tw
permalink: /zh-tw/home/
order: 1
---
# 一日一金句 

<sub>[金句大全]({{ '/zh-tw/motto/' | relative_url }})</sub>

人生海海 歡喜就好  --by 陳雷

# 最近更新遊戲

<sub>[遊戲列表]({{ '/zh-tw/game/' | relative_url }})</sub>

{% assign games = site.games-zh-tw | reverse %}
{% for game in games limit: 3 %}
* [{{ game.date | date: "%Y-%m-%d" }}: {{ game.title }}]({{ game.url | relative_url }})
{% endfor %}
* ...

# 最近更新文章

<sub>[文章列表]({{ '/zh-tw/post/' | relative_url }})</sub>

{% assign posts = site.posts | where: "lang", "zh-tw" %}
{% for post in posts limit: 3 %}
* [{{ post.date | date: "%Y-%m-%d"}}: {{ post.title }}]({{ post.url | relative_url }})
{% endfor %}
* ...

# 日誌

<sub>[日誌大全]({{ '/zh-tw/log/' | relative_url }})</sub>

{% assign collections = games | concat: posts | sort: "date" | reverse %}
{% for collection in collections limit: 3 %}
  {% assign paths = collection.url | split: '/' %}
  {% if paths[2] == "game" %}
    {% assign type = "遊戲" %}
  {% elsif paths[2] == "post" %}
    {% assign type = "文章" %}
  {% endif %}
* [{{ collection.date | date: "%Y-%m-%d"}}: [{{ type }}] {{ collection.title }}]({{ collection.url | relative_url }})
{% endfor %}
* ...
