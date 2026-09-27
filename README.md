# Nook 🌱 — Your browser remembers.

> **"Same curious mind. Fewer forgotten things."**

Nook is a local-first, cozy browser companion for people who accumulate tabs, bookmarks, articles, docs, and unfinished work. Built with Manifest V3.

![Nook Mockup](ChatGPT%20Image%20Sep%2019,%202026,%2011_34_24%20PM.png)

---

## 🌿 Core Features

1. **Living Creature Companion (In-Page & Popup)**
   - 8 dynamic emotional states (*Neutral, Happy, Curious, Excited, Sleepy, Concerned, Sad, Proud*), poke interactions, and contextual dialogue based on real browsing habits.
   - Pure CSS 3D animated companion with eyes, cheeks, leaf sprout, and snore animations.

2. **🍱 Bento To-Do Board & Tab Mission Notes**
   - Built-in Bento To-Do workspace right inside the extension popup: Big Goal, Supporting Tasks, and Micro Tab Tasks.
   - 1-line micro-mission notes answering *"Why did I open this?"* attached directly to active tabs.
   - Instant 1-click button to attach any current tab as an actionable task on your Bento board.

3. **🔍 Universal Search & Quick Navigator**
   - Instant search bar with `/` keyboard shortcut.
   - Live query across open tabs, remembered reading points, saved sessions, and to-do tasks.

4. **⚡ Spotlight Focus Dock**
   - Ambient priority focus bar for your current mission.
   - 1-click completion with celebratory creature animations and zero unnecessary tab closes.

5. **📁 Accordion Fold**
   - Non-destructive tab group collapse keeping tabs alive in memory while cleanly compacting the tab bar.

6. **🌐 Smart Tab Clustering & Domain Grouping**
   - Opener-chain research thread clustering and 1-click grouping by domain (with duplicate-skipping and distinct color coding).

7. **📖 Return Point (Reading Position Memory & Jump Back)**
   - Remembers exact scroll depth on articles, documentation, and long threads.
   - Jump Back feature automatically switches/opens the tab, smoothly scrolls to the exact point, and pulses an ambient green beam with an eye-line badge.

8. **🍂 Decaying Bookmarks & Evergreen Keeps**
   - 4-stage visual bookmark lifecycle: 🍃 **Fresh** (0–7d), 🍂 **Aging** (7–30d), 🥀 **Faded** (30–60d), 🍂 **Decayed** (60d+).
   - 1-click revive, snooze, and ⭐ Forever / 🌲 Kept evergreen status protection.

9. **🍃 Tab Bankruptcy (Guilt-Free Clean Slate)**
   - Safely tucks open tabs into an archival session with 1-click instant restore anytime.

10. **🛌 Late-Night Sleep Mode & Morning Queue**
    - Late-night scroll detection on rabbit-hole sites, sleeping leaf blanket animation, and morning reading queue.

11. **🌱 Tab Terrarium & Viral 𝕏 Share Card**
    - Cozy new tab terrarium view and 1-click clipboard / tweet status card generator.

12. **🔒 100% On-Device Privacy**
    - Local storage only (`chrome.storage.local`), zero cloud telemetry, no analytics, and sensitive domain exclusions (banking, auth, government).

---

## 🚀 How to Install & Run

### Method 1: Load as Chrome Extension
1. Open Chrome (or Brave / Edge) and navigate to `chrome://extensions`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select this directory: `/home/arjun-chaudhary/Desktop/nook`.
5. Open a new tab to experience your new cozy Terrarium!

### Method 2: Instant Interactive Showcase (No Extension Required)
You can test and demo every single screen directly in your browser:
- Open [`showcase.html`](file:///home/arjun-chaudhary/Desktop/nook/showcase.html) or run:
```bash
python3 -m http.server 8080
```
Then visit `http://localhost:8080/showcase.html`.

---

## 🔒 Privacy & Local-First Architecture
- **100% On-Device**: All tab states, reading marks, and bookmarks stay locally in `chrome.storage.local`.
- **No Cloud Database / No Tracking**: No external analytics or accounts required.
- **Sensitive Domain Exclusions**: Built-in blocklist for banking, logins, and private apps.

