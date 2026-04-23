# UI Redesign Design Spec

**Date:** 2026-04-23
**Status:** Approved

## Summary

Full UI overhaul from dark "深夜地下誌" theme to a light, bright, relaxed Instagram-inspired design. App renamed from "Spots List" to **地點找找看**.

## Problems With Current Design

- Too empty — cards contain only an index number + italic name, lots of unused padding
- Color mismatch — warm-brown background + lime-yellow accent with no bridge color
- No visual contrast between background and cards (2% difference)
- Instrument Serif italic feels weak at small sizes on dark background
- No visual anchors — nothing to draw the eye
- Search input blends into background

## Approved Design Direction

### Visual Language

- **Background:** White `#ffffff`, light gray sections `#f4f4f6`
- **Cards:** White with `1px solid #f0f0f0` border + subtle hover shadow
- **Accent:** Warm orange `#ff6b35` (not lime-yellow)
- **Typography:** Plus Jakarta Sans (Latin weights) + Noto Sans TC (Chinese)
- **Feel:** Clean, light, content-forward — like Instagram web

### App Name

**地點找找看** — "找找" rendered in accent color `#ff6b35`

### Desktop Layout (≥ 768px)

```
┌─────────────────────────────────────────────┐
│  地點找找看   [🔍 搜尋…]          [＋新增分類] │  ← sticky header
├──────────┬──────────────────────────────────┤
│ Sidebar  │  Content area                    │
│ 220px    │                                  │
│          │  [Category Title]   [＋新增地點]  │
│ ☕ 深夜…  │                                  │
│ 🍸 秘密…  │  [Spot] [Spot] [Spot]  ← 3-col  │
│ 📚 書店   │  [Spot] [Spot]                   │
│          │                                  │
│ [＋新增]  │                                  │
└──────────┴──────────────────────────────────┘
```

- Sidebar: category list with emoji + name + spot count; active item has left orange border
- Content: 3-column spot card grid

### Mobile Layout (< 768px)

- Header: wordmark + ＋ button
- Horizontal scroll row of category circles (Instagram Stories-style)
- Search bar below stories
- 2-column category card grid OR spot list view

### Category Card / Sidebar Item

Fields used:
- `emoji` (new field — see Schema Changes) — displayed as colored circle/avatar
- `name` — primary label
- spot count — from `GET /categories/:id/spots` count

During transition (before schema migration): use auto-assigned emoji from a fixed palette based on category index.

### Spot Card

Fields used:
- `name` — primary label (bold)
- `address` — shown with 📍 icon if present
- `mapsUrl` — shown as "地圖 ↗" link if present
- `notes` — truncated to 2 lines if present

Spot thumbnail: color gradient block (no real image). Color auto-assigned by spot index within category (6 colors rotate).

### Typography

```
Display / Page title : Plus Jakarta Sans 800, -0.5px tracking
Section heading      : Plus Jakarta Sans 700
Body                 : Noto Sans TC 400/500
Small labels         : Plus Jakarta Sans 600, 10-11px, uppercase
```

### Colors

```
Background     #ffffff
Surface gray   #f4f4f6
Border         #f0f0f0
Border hover   #e0e0e0
Text primary   #1a1a1a
Text secondary #888888
Text muted     #aaaaaa
Accent         #ff6b35
Accent light   #fff5f1
Accent dark    #cc5528
```

## Schema Changes Required

One new field: `emoji` on `categories` table.

```sql
-- categories table
emoji TEXT NULL  -- single emoji character, e.g. "☕"
```

- Backend: add `emoji` nullable field to Drizzle schema + DTO
- Frontend: use emoji if present, else use auto-assigned fallback from index

## Out of Scope

- Real image upload (spot thumbnails remain color gradients)
- Dark mode
- Map view / explore tab (shown in mockup but not implemented this phase)
- Bottom tab bar (desktop sidebar covers navigation)
