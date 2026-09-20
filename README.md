# Nook 🌱 — Your browser remembers.

> **"Same curious mind. Fewer forgotten things."**

Nook is a local-first, cozy browser companion for people who accumulate tabs, bookmarks, articles, docs, and unfinished work. Built with Manifest V3.

![Nook Mockup](ChatGPT%20Image%20Sep%2019,%202026,%2011_34_24%20PM.png)

---

## 🌿 Core Features

1. **Tab Terrarium (Screen 01)**
   - Cozy room terrarium view on every New Tab.
   - Ambient creature resting on the sunbed reacting dynamically to your tab hygiene.
   - Live clock, warm greeting, and quick search.

2. **Return Point (Content Script & Screen 04)**
   - Remembers reading position on long technical articles, GitHub issues, and documentation.
   - Floating leaf pill quietly appears when you return: *"You left off here — Take me there"*.

3. **Stale Tabs Nudge (Screen 02)**
   - Ambiently notices tabs unopened for >2 hours.
   - 1-click **Archive to Session** so you never lose context, without tab clutter.

4. **New-Tab Regroup (Screen 03)**
   - Smart opener-chain & time-proximity clustering.
   - Notices research sessions (e.g. GitHub + StackOverflow + Docs) and offers to organize them into native Chrome tab groups.

5. **Decaying Bookmarks (Screens 06 & 07)**
   - Visual lifecycle for bookmarks:
     - 🍃 **Fresh** (0–7 days)
     - 🍂 **Aging** (7–30 days)
     - 🥀 **Faded** (30–60 days)
     - 🍂 **Decayed** (60+ days)
   - Click to **Revive (Open)**, **Snooze**, or **Archive snapshot**.

6. **The Creature — 8 Emotional States**
   - *Neutral, Happy, Curious, Excited, Sleepy, Concerned, Sad, Proud*.
   - Reacts to your state: cleans tabs → Proud; accumulation → Concerned; late hours → Sleepy.

7. **Viral 𝕏 / Twitter Terrarium Card Generator**
   - Click **Share** on the new tab dock to render a high-aesthetic graphic card showing your creature and browser hygiene stats to post directly on X!

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

