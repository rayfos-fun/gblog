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

{% for game in site.games-en limit: 3 %}
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

* [2025-10-03: [Post] Review: The Lychee Road – A White-Collar Worker's Saga and How to Make Peace with Fate]({{ '/en/post/20251003/' | relative_url }})
* [2025-10-02: [Game] whack-a-mole]({{ '/en/game/whack-a-mole/' | relative_url }})
* [2025-10-01: [Post] The Engineer's Anchor: Why I'm Obsessed with the World Beneath High-Level Code]({{ '/en/post/20251001/' | relative_url }})
* ...
