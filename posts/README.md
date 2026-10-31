# Posts

One Markdown file per post. The file name (minus `.md`) is the URL: `posts/last-seat.md` is served at `/writing/last-seat`.

```
---
title: How CohortCove keeps the last seat from being sold twice
date: 2026-11-02
summary: One sentence shown on /writing, in search results, and in link previews.
draft: true
---

Body in Markdown: ## headings, paragraphs, - lists, 1. lists, > quotes, `code`, ```code blocks```, **bold**, *italic*, [links](https://example.com).
```

A post with `draft: true` is never served, listed, or included in the sitemap, feed, or llms.txt. Remove that line (or set it to false) to publish. The Writing link appears in the nav once at least one post is published.

This repository is public, so anything committed here is readable on GitHub even while it is a draft.
