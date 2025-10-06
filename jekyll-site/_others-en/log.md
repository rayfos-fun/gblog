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
{% assign collections = games | concat: posts | sort: "date" | reverse %}
{% for collection in collections %}
  {% assign paths = collection.url | split: '/' %}
  {% if paths[2] == "game" %}
    {% assign type = "GAME" %}
  {% elsif paths[2] == "post" %}
    {% assign type = "POST" %}
  {% endif %}
* [{{ collection.date | date: "%Y-%m-%d"}}: [{{ type }}] {{ collection.title }}]({{ collection.url | relative_url }})
{% endfor %}
