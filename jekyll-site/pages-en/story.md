---
layout: default
title: Novel
lang: en
permalink: /en/story/
order: 4
---
# Novel

<sub>[<< Back]({{ '/en/home/' | relative_url }})</sub>

{% for story in site.stories-en %}
* [{{ story.title }}]({{ story.url | relative_url }})
{% endfor %}
