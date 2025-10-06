---
layout: default
title: Home
lang: en
permalink: /en/home/
order: 1
---
# Daily motto

<sub>[history]({{ '/en/motto/' | relative_url }})</sub>

Hakuna Matata  --by Pumbaa and Timon

# Recent games

<sub>[history]({{ '/en/game/' | relative_url }})</sub>

{% assign games = site.games-en | reverse %}
{% for game in games limit: 3 %}
* [{{ game.date | date: "%Y-%m-%d" }}: {{ game.title }}]({{ game.url | relative_url }})
{% endfor %}
* ...

# Recent blog

<sub>[history]({{ '/en/post/' | relative_url }})</sub>

{% assign posts = site.posts | where: 'lang', 'en' %}
{% for post in posts limit: 3 %}
* [{{ post.date | date: "%Y-%m-%d"}}: {{ post.title }}]({{ post.url | relative_url }})
{% endfor %}
* ...

# Log

<sub>[history]({{ '/en/log/' | relative_url }})</sub>

{% assign collections = games | concat: posts | sort: "date" | reverse %}
{% for collection in collections limit: 3 %}
  {% assign paths = collection.url | split: '/' %}
  {% if paths[2] == "game" %}
    {% assign type = "GAME" %}
  {% elsif paths[2] == "post" %}
    {% assign type = "POST" %}
  {% endif %}
* [{{ collection.date | date: "%Y-%m-%d"}}: [{{ type }}] {{ collection.title }}]({{ collection.url | relative_url }})
{% endfor %}
* ...

