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

## 🚀 Installation Guide

Nook runs on any Chromium-based browser (**Google Chrome**, **Brave**, **Arc**, **Microsoft Edge**, **Opera**, or **Vivaldi**). Follow these quick steps to install and start using Nook:

### Step 1: Clone or Download the Repository

Clone the repository using `git`:
```bash
git clone https://github.com/Arjun-3105/nook.git
```
*Or download the ZIP archive from GitHub and extract it to a folder on your computer.*

---

### Step 2: Open Extensions in Your Browser

In your browser's URL address bar, enter the corresponding URL:
- **Google Chrome**: `chrome://extensions`
- **Brave Browser**: `brave://extensions`
- **Microsoft Edge**: `edge://extensions`
- **Arc**: Open `Settings` → `Extensions` or go to `chrome://extensions`

---

### Step 3: Enable Developer Mode

Locate the **Developer mode** toggle switch in the top-right corner of the Extensions page and turn it **ON**.

---

### Step 4: Load Unpacked Extension

1. Click the **Load unpacked** button in the top-left toolbar.
2. Select the `nook` folder that you cloned or extracted (the folder containing `manifest.json`).
3. **Nook** will instantly appear in your extensions list! 🌱

---

### Step 5: Pin Nook for 1-Click Access

1. Click the puzzle piece icon (**Extensions menu**) in your browser's top toolbar.
2. Find **Nook** and click the **Pin 📌** icon next to it.
3. The cozy Nook sprout icon will now remain visible on your toolbar for instant access.

---

### Step 6: Quick Start Tips

- **Open the Companion Popup**: Click the Nook icon in the toolbar (or press `Alt + Shift + N` / browser shortcut).
- **Universal Search**: Type `/` anywhere inside the popup to jump immediately into instant search.
- **Bento To-Do Board**: Navigate to the **🍱 To-Do** tab to plan your day, write micro-intent notes, or attach current tabs as tasks.
- **Summon Creature On-Page**: Click **"Show creature on site"** in the popup to place your floating 3D companion onto any active article or document.
- **Return Point Jump Back**: When returning to articles, click **Jump Back ↗** to smoothly glide straight to your scroll depth highlighted by an emerald beam.

---

### 🔄 Updating / Reloading the Extension

If you pull new updates or make local code modifications:
1. Return to `chrome://extensions`.
2. Find **Nook**.
3. Click the circular **Reload ↻** button on the Nook card to apply changes immediately.

---

## 🎮 Instant Interactive Showcase (No Extension Required)

You can also explore and demo all screens and flows in a standalone interactive sandbox:
1. Open [`showcase.html`](showcase.html) in your browser, or start a local server:
```bash
python3 -m http.server 8080
```
2. Visit `http://localhost:8080/showcase.html`.

---

## 🔒 Privacy & Local-First Architecture

- **100% On-Device**: All tab data, reading memory, and bookmarks remain entirely within `chrome.storage.local`.
- **Zero Cloud Telemetry**: No tracking, no cookies, no third-party servers, and no external analytics.
- **Sensitive Domain Exclusions**: Automatic safety blocklist excludes banking, login providers, government portals, and payment gateways.

---

## 📄 License

MIT License. Free and open source for all curious minds.
