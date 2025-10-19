---
layout: default
title: 首页
lang: zh-cn
permalink: /zh-cn/home/
order: 1
---
# 本日金句 

<sub>[金句大全]({{ '/zh-cn/motto/' | relative_url }})</sub>

思想决定行为，行为决定习惯，习惯决定品格，品格决定命运。 --by 好多人(培根，威廉·詹姆士，史蒂芬柯维，圣雄甘地…等可能都有说过类似的格言)

# 最近更新游戏

<sub>[游戏列表]({{ '/zh-cn/game/' | relative_url }})</sub>

{% assign games = site.games-zh-cn | reverse %}
{% for game in games limit: 3 %}
* [{{ game.date | date: "%Y-%m-%d" }}: {{ game.title }}]({{ game.url | relative_url }})
{% endfor %}
* ...

# 最近更新文章

<sub>[文章列表]({{ '/zh-cn/post/' | relative_url }})</sub>

{% assign posts = site.posts | where: "lang", "zh-cn" %}
{% for post in posts limit: 3 %}
* [{{ post.date | date: "%Y-%m-%d"}}: {{ post.title }}]({{ post.url | relative_url }})
{% endfor %}
* ...

# 最近更新小说

<sub>[章回列表]({{ '/zh-cn/story/' | relative_url }})</sub>

{% assign stories = site.stories-zh-cn | reverse %}
{% for story in stories limit: 3 %}
* [{{ story.date | date: "%Y-%m-%d"}}: {{ story.title }}]({{ story.url | relative_url }})
{% endfor %}
* ...

# 日誌

<sub>[日誌大全]({{ '/zh-cn/log/' | relative_url }})</sub>

{% assign collections = games | concat: posts | concat: stories | sort: "date" | reverse %}
{% for collection in collections limit: 3 %}
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
* ...
