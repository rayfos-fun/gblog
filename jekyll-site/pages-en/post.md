---
layout: default
title: Blog
lang: en
permalink: /en/post/
order: 3
---
# Blog

<sub>[<< Back]({{ '/en/home/' | relative_url }})</sub>

{% assign posts = site.posts | where: "lang", "en" %}
{% for post in posts reversed %}
* [[{{post.date | date: "%Y-%m-%d"}}] {{ post.title }}]({{ post.url | relative_url }})
{% endfor %}
