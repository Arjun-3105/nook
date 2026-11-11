# Nook — Final Product & Implementation Plan

> **Nook remembers the unfinished things in your browser.**

Nook is a local-first browser companion for people who accumulate tabs, bookmarks, articles, docs, and unfinished work.

The creature is the personality layer. The product underneath it is a memory system for the browser.

The core principle:

**Nook should remain useful if the creature is completely removed.**

The creature makes the utility feel personal, alive, and worth keeping.

---

# 1. Product Thesis

Most browser extensions solve a single explicit problem:

* save tabs
* manage bookmarks
* restore sessions
* group tabs
* track reading position

Nook approaches the browser from a different direction:

> **Your browser contains unfinished things. Nook remembers them.**

Instead of creating another dashboard, Nook quietly remembers context and surfaces it at the moments where it matters.

The product has four core capabilities:

1. **Return Point** — remember where you left off.
2. **Tab Terrarium** — make browser clutter visible and actionable.
3. **Decaying Bookmarks** — give forgotten bookmarks a visible lifecycle.
4. **New-Tab Regroup** — recognize related unfinished work and offer to organize it.

These are not four unrelated utilities.

They share one underlying concept:

**Nook remembers the state of your unfinished browser.**

---

# 2. Core Product Loop

```text
                 YOU BROWSE
                     │
                     ▼
              Nook observes
          lightweight local state
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Page        Tabs      Bookmarks
      position     state       age
          │          │          │
          └──────────┼──────────┘
                     ▼
               Nook remembers
                     │
                     ▼
              You come back
                     │
                     ▼
             Nook helps you
             pick up / clean up
```

The extension should feel **passive most of the time**.

It should not constantly interrupt the user.

Nook notices things in the background and speaks only when there is a useful moment.

---

# 3. Feature 1 — Return Point

## Purpose

Remember exactly where the user left off on a page.

This is the flagship utility.

## What it does

For pages the user has meaningfully read, Nook remembers:

* URL
* timestamp of last meaningful visit
* approximate reading position
* lightweight page structure/hash where applicable

When the user returns later, Nook restores the previous position.

Example:

> **You left off here.**

The page smoothly returns to the relevant section.

For pages that changed since the previous visit, Nook can later surface:

> **This changed since you were last here.**

The first version should prioritize **returning the user to where they stopped** over sophisticated change detection.

## Supported use cases

Especially useful for:

* documentation
* GitHub issues / PRs
* technical articles
* tutorials
* research
* long-form posts
* product documentation
* blog posts
* papers

## Interaction

The default experience should be automatic.

User leaves page → Nook remembers.

User returns → Nook restores position.

No save button.

No bookmark action.

No dashboard required.

## Technical mechanism

Use:

* `IntersectionObserver`
* content-script position tracking
* `chrome.storage.local`

Track the topmost meaningful visible element rather than relying exclusively on raw pixel scroll position.

Store an element/position identifier where possible, with scroll position as fallback.

## Data

```text
{
  url,
  domain,
  timestamp,
  position,
  scrollY,
  pageHash
}
```

Everything remains local.

## Scope

Do not attempt perfect support for every website.

Prioritize content-stable pages.

Avoid aggressive tracking on:

* feeds
* dashboards
* continuously changing applications

---

# 4. Feature 2 — Tab Terrarium

## Purpose

Turn tab accumulation into a visible, ambient state.

The terrarium is Nook's primary home.

## Core idea

The user's browser state changes the environment.

More clutter → more clutter inside the terrarium.

Old untouched tabs → increasingly stale state.

Cleaning up → environment becomes calmer.

The visual state should never become a numerical dashboard.

Avoid:

> 37 tabs

Prefer:

> The terrarium looks overwhelmed.

## Utility

Nook tracks:

* tab count
* last-active timestamp
* stale tabs
* related tab clusters

Tabs that haven't been touched beyond a configurable threshold are marked as stale.

Default:

```text
2 hours
```

Stale tabs are **never silently closed**.

Instead:

> **These haven't been touched in a while.**

Actions:

* group
* archive into session
* dismiss

## Technical mechanism

Use:

* `chrome.tabs`
* `chrome.tabs.onCreated`
* `chrome.tabs.onUpdated`
* `chrome.tabs.onRemoved`
* `chrome.storage.local`

Store only the metadata required for the feature.

## Data

```text
{
  tabId,
  url,
  title,
  domain,
  createdAt,
  lastActiveAt,
  openerTabId
}
```

Local only.

## Important principle

The terrarium is not another tab manager.

Existing tab managers can already solve:

> “Show me all my tabs.”

Nook should solve:

> **“Make me aware of the unfinished mess I have accumulated.”**

---

# 5. Feature 3 — Decaying Bookmarks

## Purpose

Make bookmarks feel alive instead of becoming an infinite graveyard.

This should be Nook's most distinctive feature.

## Core mechanic

Every bookmark has a visible age.

Fresh bookmarks look alive.

As they remain unopened, they gradually fade.

The user can see the decay without opening a management dashboard.

Conceptually:

```text
Fresh
  ↓
Aging
  ↓
Faded
  ↓
Forgotten
```

## Actions

When a bookmark becomes faded, only two primary actions should appear:

### Open

The bookmark is revived.

Its decay resets.

### Snooze

The bookmark's decay pauses temporarily.

Important distinction:

**Open = I actually dealt with this.**

**Snooze = I still intend to deal with this later.**

## Fully decayed bookmarks

Default:

```text
60 days
```

Before deletion/archiving, Nook can create a local offline snapshot where technically feasible.

The user should never unexpectedly lose the underlying content.

## Technical mechanism

Use:

* `chrome.bookmarks`
* navigation events to determine visits
* `chrome.storage.local`

Track:

```text
{
  bookmarkId,
  url,
  lastOpenedAt,
  snoozeUntil
}
```

## Visual implementation

Decay should be gradual rather than binary.

For example:

```text
0–7 days      fresh
7–30 days     aging
30–60 days    faded
60+ days      decayed
```

These values should remain implementation defaults rather than being presented as rigid rules.

## Product principle

This feature should feel slightly emotional and playful without becoming useless.

The utility is real:

**It helps users confront forgotten saves.**

The personality makes that interaction memorable.

---

# 6. Feature 4 — New-Tab Regroup

## Purpose

Use the new-tab moment as a natural opportunity to clean up related work.

## What it does

When a new tab is opened, Nook checks whether currently open tabs appear to belong to the same task.

Signals include:

* creation time proximity
* `openerTabId`
* referrer relationships
* shared navigation chains

Example:

```text
GitHub repo
    ↓
GitHub issue
    ↓
Stack Overflow
    ↓
Documentation
```

Nook may recognize these as one cluster.

Then:

> **These 5 look related — group them?**

Actions:

* Group
* Dismiss

If dismissed, the same cluster should not immediately reappear.

## Why this matters

Chrome already provides domain-based tab grouping.

Nook's differentiator is:

**contextual grouping based on how the tabs came into existence, not simply what domain they belong to.**

## Technical mechanism

Use:

* `chrome.tabs.onCreated`
* `openerTabId`
* creation timestamps
* lightweight clustering

Run the clustering when useful rather than continuously.

## Data retention

Maintain a rolling metadata window.

Suggested:

```text
24 hours
```

Automatically purge older relationship metadata.

Everything remains local.

---

# 7. The Creature

The creature is **not a fifth feature**.

It is the interface layer connecting the four features.

## The creature should react to state

Examples:

### Tabs increasing

Creature becomes increasingly surrounded by clutter.

### User returns to an unfinished page

Creature guides attention toward the return point.

### Bookmark aging

Creature reacts subtly to neglected bookmarks.

### User cleans tabs

Environment becomes calmer.

### Music playing

Creature can bob/pulse as an ambient reaction.

This is personality, not core functionality.

## Critical rule

Never make the creature the only reason the product is interesting.

The extension must still make sense as:

> **A local browser memory system.**

The creature makes that system feel human.

---

# 8. Shared Architecture

Everything should be built around a small shared local foundation.

## Manifest

Use:

```text
Manifest V3
```

Architecture:

```text
Extension
│
├── Service Worker
│   ├── Tab tracker
│   ├── Bookmark tracker
│   ├── Navigation events
│   └── Storage coordination
│
├── Content Scripts
│   ├── Return Point
│   └── Reading position
│
├── New Tab
│   └── Terrarium + creature
│
└── Shared Modules
    ├── Storage
    ├── Tab state
    ├── Bookmark state
    ├── Clustering
    └── Domain utilities
```

---

# 9. Shared Storage

Use:

```text
chrome.storage.local
```

No backend.

No account.

No cloud database.

No external analytics in the initial version.

## Page memory

```text
{
  url,
  domain,
  title,
  lastVisit,
  position,
  scrollPosition,
  hash
}
```

## Tab memory

```text
{
  tabId,
  url,
  title,
  domain,
  createdAt,
  lastActiveAt,
  openerTabId
}
```

## Bookmark memory

```text
{
  bookmarkId,
  url,
  lastOpenedAt,
  snoozeUntil
}
```

Keep the schemas separate where the semantics differ.

Do not force unrelated data into one giant record.

---

# 10. Permissions

Initial permissions should be kept as narrow as practical.

Potential permissions:

```json
{
  "permissions": [
    "tabs",
    "tabGroups",
    "bookmarks",
    "storage"
  ],
  "host_permissions": [
    "<all_urls>"
  ]
}
```

Add additional permissions only when a shipped feature genuinely requires them.

`<all_urls>` deserves a clear README explanation because it is necessary for page-level functionality such as Return Point.

The extension should explicitly communicate:

* what is collected
* why it is needed
* where it is stored
* whether anything leaves the device

---

# 11. Privacy Architecture

Privacy is part of the product, not a README footnote.

## Hard rules

### Local-first

Browser data stays on-device.

### No cloud model

Do not send browsing history to an LLM.

### No page-content server

Nook should never upload pages for processing.

### Minimal data

Store only the metadata necessary for the active feature.

### Automatic expiration

Temporary tracking data should have explicit retention windows.

### Incognito

Do not process Incognito activity unless the user explicitly enables appropriate functionality.

Default:

**excluded.**

### Sensitive domains

Provide a user-managed exclusion list.

Examples:

* banking
* healthcare
* personal services
* custom domains

Excluded domains should be filtered **before processing**, not after.

---

# 12. What Nook Should NOT Become

Avoid turning Nook into:

### ❌ Another tab manager

Tab management is an implementation component, not the product category.

### ❌ Another bookmark manager

Bookmarks are one manifestation of browser memory.

### ❌ A browsing-history dashboard

Never give users a giant searchable history database.

### ❌ An AI browser assistant

No chatbot.

No cloud LLM.

No “ask Nook anything.”

### ❌ A productivity tracker

No productivity scores.

No “you wasted 4 hours.”

No surveillance-like dashboards.

### ❌ A security extension

Redirect Guard can potentially exist later, but it should not define Nook.

### ❌ A daily analytics product

End-of-Day Recap should stay out of the initial product.

---

# 13. Features Explicitly Deferred

## Redirect Guard

Potentially useful, but it pushes Nook toward the security-extension category.

Reconsider later if there is evidence users want it.

## End-of-Day Recap

Interesting but privacy-heavy.

It requires:

* cross-tab aggregation
* domain classification
* additional retention
* more complicated privacy controls

Do not include in the initial release.

## Background Media Reaction

Keep ambient reactions if they are cheap.

Do not treat them as a core feature.

The creature can still react to browser state without making media interaction a headline feature.

---

# 14. MVP

The first public version should contain:

## Must ship

### 1. Return Point

The flagship utility.

### 2. Tab Terrarium

The primary home/new-tab experience.

### 3. Decaying Bookmarks

The distinctive mechanic.

### 4. New-Tab Regroup

The proactive intelligence layer.

### 5. Creature reactions

Personality across all four features.

---

# 15. Suggested Build Order

## Phase 1 — Foundation

Build:

* Manifest V3
* service worker
* storage abstraction
* tab tracker
* navigation tracker
* bookmark tracker
* content-script messaging
* privacy/exclusion system

Nothing visually fancy yet.

---

## Phase 2 — Return Point

Implement:

* position detection
* persistence
* restore
* dynamic-page handling
* per-domain exclusions

This validates Nook's central memory concept.

---

## Phase 3 — Tab Terrarium

Build:

* new-tab page
* creature
* terrarium
* tab-state visualization
* stale-tab detection
* cleanup actions

This becomes the product's visual identity.

---

## Phase 4 — Decaying Bookmarks

Build:

* bookmark synchronization
* age calculation
* decay rendering
* open/revive
* snooze
* eventual archive/snapshot behavior

This becomes the distinctive feature users talk about.

---

## Phase 5 — New-Tab Regroup

Build:

* opener-chain tracking
* time-proximity clustering
* group suggestion
* dismiss state
* native Chrome tab-group creation

Keep suggestions rare and high-confidence.

---

## Phase 6 — Polish

Add:

* creature animations
* ambient reactions
* transitions
* onboarding
* settings
* exclusion list
* privacy explanation
* performance optimization

Personality comes **after the underlying utility works.**

---

# 16. UX Principles

## Passive over interruptive

Nook should notice more than it speaks.

## One useful action

Whenever Nook appears, the user should immediately understand:

> “What does it want me to do?”

## No dashboards

Avoid turning Nook into another productivity application.

## No guilt

The creature can be expressive, but never shame the user.

Not:

> “You wasted your day.”

Instead:

> “These have been waiting.”

## Progressive discovery

Do not explain every capability during onboarding.

Let users discover:

* return memory
* tab relationships
* bookmark decay
* creature behavior

naturally.

## Fast interactions

Every Nook intervention should be dismissible immediately.

---

# 17. The Product's Identity

Nook should not be positioned as:

> “A browser extension with a cute creature.”

Nor:

> “An AI productivity assistant.”

Nor:

> “An all-in-one tab manager.”

The conceptual identity is:

> **A little memory for your browser.**

The creature gives that memory a personality.

---

# 18. Final Feature Map

```text
                           NOOK
                 "Your browser remembers."
                              │
              ┌───────────────┼───────────────┐
              │               │               │
          REMEMBER         ORGANIZE         RESCUE
              │               │               │
              ▼               ▼               ▼
        RETURN POINT     TAB TERRARIUM    DECAYING
        READ POSITION    REGROUP           BOOKMARKS
              │               │               │
              └───────────────┼───────────────┘
                              │
                              ▼
                         THE CREATURE
                       personality layer
```

## Core utility

**Return Point**

## Core environment

**Tab Terrarium**

## Core novelty

**Decaying Bookmarks**

## Core proactive behavior

**New-Tab Regroup**

## Personality layer

**The Creature**

Everything else waits.

---

# 19. Success Criteria

The MVP should answer three questions:

### 1. Does Nook become useful without being asked?

Return Point and Regroup should create this behavior.

### 2. Does Nook feel different from existing extensions?

Decaying Bookmarks + Terrarium should create this differentiation.

### 3. Does the user want to keep it installed?

The answer should come from repeated passive value:

> **Nook remembers things I would otherwise forget.**

That is the product.

Not the creature.

Not the animation.

Not the extension bundle.

**The memory.**
