---
layout: default
title: Home
lang: en
permalink: /en/
order: 1
---
# Recent games

<sub>[history]({{ '/en/game/' | relative_url }})</sub>

{% assign games = site.games-en | reverse %}
{% for game in games limit: 3 %}
* [{{ game.date | date: "%Y-%m-%d" }}: {{ game.title }}]({{ game.url | relative_url }})
{% endfor %}
* ...

# Recent tools

<sub>[history]({{ '/en/tool/' | relative_url }})</sub>

{% assign tools = site.tools-en | reverse %}
{% for tool in tools limit: 3 %}
* [{{ tool.date | date: "%Y-%m-%d" }}: {{ tool.title }}]({{ tool.url | relative_url }})
{% endfor %}
* ...

# Recent blog

<sub>[history]({{ '/en/post/' | relative_url }})</sub>

{% assign posts = site.posts | where: 'lang', 'en' %}
{% for post in posts limit: 3 %}
* [{{ post.date | date: "%Y-%m-%d"}}: {{ post.title }}]({{ post.url | relative_url }})
{% endfor %}
* ...

# Recent novel

<sub>[history]({{ '/en/story/' | relative_url }})</sub>

{% assign stories = site.stories-en | reverse %}
{% for story in stories limit: 3 %}
* [{{ story.date | date: "%Y-%m-%d"}}: {{ story.title }}]({{ story.url | relative_url }})
{% endfor %}
* ...

# Log

<sub>[history]({{ '/en/log/' | relative_url }})</sub>

{% assign collections = games | concat: tools | concat: posts | concat: stories | sort: "date" | reverse %}
{% for collection in collections limit: 3 %}
  {% assign paths = collection.url | split: '/' %}
  {% if paths[2] == "game" %}
    {% assign type = "GAME" %}
  {% elsif paths[2] == "tool" %}
    {% assign type = "TOOL" %}
  {% elsif paths[2] == "post" %}
    {% assign type = "POST" %}
  {% elsif paths[2] == "story" %}
    {% assign type = "NOVEL" %}
  {% endif %}
* [{{ collection.date | date: "%Y-%m-%d"}}: [{{ type }}] {{ collection.title }}]({{ collection.url | relative_url }})
{% endfor %}
* ...

