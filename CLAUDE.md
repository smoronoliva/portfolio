# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Plain HTML/CSS/JS — no build tools, no frameworks, no package manager. Open directly in a browser.

```bash
open index.html
```

## Architecture

This is a single-page application (SPA) simulating a desktop OS. There is only one HTML file.

### File roles
- `index.html` — the entire application: desktop, icons, window content templates, welcome dialog, taskbar.
- `css/win95.css` — all styles. Single stylesheet.
- `js/win95.js` — single IIFE, all logic inside `DOMContentLoaded`.
- `references/` — local image assets (wallpaper, reference photos).

### Window content
Each section's content lives in a `<template>` tag in `index.html`:
- `#tpl-about`, `#tpl-projects`, `#tpl-experience`, `#tpl-contact`

When a window opens, the template's `innerHTML` is cloned into a dynamically created `.spa-window` DOM element and appended to `#desktop-windows`.

### Window Manager (js/win95.js)
The window manager maintains a `windows` object keyed by window ID (`about`, `projects`, `experience`, `contact`). Each entry holds `{ el, minimized, maximized, prevState }`.

Key functions:
- `openWindow(id)` — creates window from template, cascades position, adds taskbar button. If already open: restores or focuses.
- `closeWindow(id)` — removes DOM element and taskbar button.
- `minimizeWindow(id)` / `restoreWindow(id)` — toggles `display: none`.
- `maximizeWindow(id)` — toggles `.maximized` class, saves/restores `prevState` (left/top/width/height).
- `focusWindow(id)` — increments `highestZ` and assigns to window's `z-index`.
- `updateTaskbarActive()` — finds the topmost non-minimized window and marks its taskbar button `.active`.

Window configs (title, icon, label, default width/height) are defined in the `configs` object at the top of the window manager section.

### CSS layers (z-index)
| Layer | z-index |
|---|---|
| `.desktop-icons` | 10 |
| `#desktop-windows` container | 50 |
| Windows (start at) | 100+ |
| `.taskbar` | 1000 |
| `.dialog-overlay` | 2000 |

`#desktop-windows` is `position: fixed; inset: 0 0 30px 0; pointer-events: none`. Windows inside are `position: absolute; pointer-events: all; resize: both; overflow: hidden`.

### CSS design system (Windows XP Luna theme)
Custom properties in `:root`:
- `--xp-desktop` `#236bcc` — body background color (behind wallpaper)
- `--xp-window-bg` `#ece9d8` — cream/sand window interior
- `--xp-border` / `--xp-navy` `#0a246a` — window outlines and headings
- `--xp-highlight` `#316ac5` — hover/active accent

Wallpaper: `body { background: url('../references/mustang.webp') center / cover no-repeat fixed }`.

### Desktop icons
Icons are `<div class="desktop-icon" data-window="[id]">` — `div`, not `<a>`. Navigation is handled entirely by JS via `dblclick`. Positions are persisted in `localStorage` under key `desktop-icon-positions`.

### Welcome dialog
`#welcome-dialog` starts with class `hidden`. JS removes it on load only if `sessionStorage` key `welcome-seen` is absent. Set on close, cleared when the browser session ends.
