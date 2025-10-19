---
layout: default
title: Log
lang: en
permalink: /en/log/
---
# Log

<sub>[<< Back]({{ '/en/home/' | relative_url }})</sub>

{% assign games = site.games-en %}
{% assign posts = site.posts | where: 'lang', 'en' %}
{% assign stories = site.stories-en %}
{% assign collections = games | concat: posts | concat: stories | sort: "date" | reverse %}
{% for collection in collections %}
  {% assign paths = collection.url | split: '/' %}
  {% if paths[2] == "game" %}
    {% assign type = "GAME" %}
  {% elsif paths[2] == "post" %}
    {% assign type = "POST" %}
  {% elsif paths[2] == "story" %}
    {% assign type = "NOVEL" %}
  {% endif %}
* [{{ collection.date | date: "%Y-%m-%d"}}: [{{ type }}] {{ collection.title }}]({{ collection.url | relative_url }})
{% endfor %}
