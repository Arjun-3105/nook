/**
 * Nook Service Worker (Manifest V3)
 * Tracks active tabs, stale tabs, bookmark decay, and clustering.
 */

import { Storage } from '../shared/storage.js';
import { analyzeTabClusters, groupTabsByDomain, formatDomainLabel } from '../shared/clustering.js';

// Default configuration
const DEFAULT_CONFIG = {
  staleThresholdMinutes: 120, // 2 hours
  decayFreshDays: 7,
  decayAgingDays: 30,
  decayFadedDays: 60,
  excludedDomains: ['bank', 'accounts.google.com', 'login', 'paypal.com'],
  excludeIncognito: true,
  ambientAnimations: true,
  enableNook: true,
  showCreatureOnNewTab: true
};

// Initialize extension defaults
chrome.runtime.onInstalled.addListener(async () => {
  const existing = await Storage.get('config');
  if (!existing || !existing.config) {
    await Storage.set({ config: DEFAULT_CONFIG });
  }
  // Setup alarm for periodic decay check
  chrome.alarms.create('nook_decay_check', { periodInMinutes: 60 });
  syncAllTabs();
  // Inject widget into already-open tabs so user sees it immediately
  injectIntoExistingTabs();
});

/**
 * Inject the content script into all already-open http/https tabs.
 * Chrome content scripts only auto-inject on NEWLY loaded tabs after install.
 * This handles the "why doesn't it show up" on existing tabs problem.
 * Skips: chrome://, extension pages, and tabs already injected.
 */
async function injectIntoExistingTabs() {
  const SKIP = [
    'paypal', 'stripe', 'bank', 'banking',
    'wellsfargo', 'chase.com', 'bankofamerica', 'citibank',
    'barclays', 'hsbc', 'schwab', 'fidelity', 'capitalone',
    'accounts.google.com', 'login.microsoftonline', 'auth0.com',
    'okta.com', 'onelogin.com', 'mail.google.com', 'outlook.live.com',
  ];

  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.url) continue;
    if (!tab.url.startsWith('http')) continue;
    try {
      const host = new URL(tab.url).hostname;
      if (SKIP.some(p => host.includes(p))) continue;
    } catch { continue; }

    // Try injecting — silently skip if tab isn't ready or already has widget
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/nook_widget.js']
    }).catch(() => {});

    chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['content/nook_widget.css']
    }).catch(() => {});
  }
}


// Alarm listener
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'nook_decay_check') {
    checkStaleTabs();
  }
});

// Tab tracking
chrome.tabs.onCreated.addListener(async (tab) => {
  await recordTabState(tab);
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId).catch(() => null);
  if (tab) {
    await recordTabState(tab, true);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    await recordTabState(tab);
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const { tabMemory = {} } = await Storage.get('tabMemory');
  if (tabMemory[tabId]) {
    delete tabMemory[tabId];
    await Storage.set({ tabMemory });
  }
});

async function recordTabState(tab, markActive = false) {
  if (!tab || !tab.id || !tab.url || tab.url.startsWith('chrome://')) return;

  const { tabMemory = {}, config = DEFAULT_CONFIG } = await Storage.get(['tabMemory', 'config']);
  const now = Date.now();

  const isExcluded = (config.excludedDomains || []).some(d => tab.url.includes(d));
  if (isExcluded) return;

  const current = tabMemory[tab.id] || {
    id: tab.id,
    url: tab.url,
    title: tab.title || 'New Tab',
    createdAt: now,
    openerTabId: tab.openerTabId || null
  };

  current.title = tab.title || current.title;
  current.url = tab.url;
  if (markActive || !current.lastActiveAt) {
    current.lastActiveAt = now;
  }

  tabMemory[tab.id] = current;
  await Storage.set({ tabMemory });
}

async function syncAllTabs() {
  const tabs = await chrome.tabs.query({});
  for (const t of tabs) {
    await recordTabState(t);
  }
}

// Check stale tabs and notify
async function checkStaleTabs() {
  const { tabMemory = {}, config = DEFAULT_CONFIG } = await Storage.get(['tabMemory', 'config']);
  const thresholdMs = (config.staleThresholdMinutes || 120) * 60 * 1000;
  const now = Date.now();

  const staleList = [];
  for (const id in tabMemory) {
    const item = tabMemory[id];
    if (now - (item.lastActiveAt || item.createdAt) > thresholdMs) {
      staleList.push(item);
    }
  }

  await Storage.set({ staleTabs: staleList });
}

// Runtime message dispatcher
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_TAB_SUMMARY') {
    handleTabSummary().then(sendResponse);
    return true;
  }
  if (request.type === 'GROUP_TABS') {
    handleGroupTabs(request.tabIds, request.groupTitle).then(sendResponse);
    return true;
  }
  if (request.type === 'ARCHIVE_STALE_TABS') {
    handleArchiveTabs(request.tabIds).then(sendResponse);
    return true;
  }
  if (request.type === 'RECORD_PAGE_POSITION') {
    handleRecordPosition(request.data).then(sendResponse);
    return true;
  }
  if (request.type === 'GET_PAGE_POSITION') {
    handleGetPosition(request.url).then(sendResponse);
    return true;
  }
  if (request.type === 'GET_BOOKMARKS_LIFECYCLE') {
    handleGetBookmarks().then(sendResponse);
    return true;
  }
  if (request.type === 'SAVE_SESSION') {
    handleSaveSession(request.name, request.tabIds).then(sendResponse);
    return true;
  }
  if (request.type === 'GET_SESSIONS') {
    handleGetSessions().then(sendResponse);
    return true;
  }
  if (request.type === 'RESTORE_SESSION') {
    handleRestoreSession(request.sessionId).then(sendResponse);
    return true;
  }
  if (request.type === 'REVIVE_BOOKMARK') {
    handleReviveBookmark(request.id, request.url).then(sendResponse);
    return true;
  }
  if (request.type === 'OPEN_TAB') {
    chrome.tabs.create({ url: request.url });
    sendResponse({ success: true });
    return true;
  }
  if (request.type === 'GET_ALL_POSITIONS') {
    handleGetAllPositions().then(sendResponse);
    return true;
  }
  if (request.type === 'GROUP_BY_SITE') {
    handleGroupBySite().then(sendResponse);
    return true;
  }
  if (request.type === 'GROUP_SPECIFIC_SITE') {
    handleGroupSpecificSite(request.domain).then(sendResponse);
    return true;
  }
  if (request.type === 'DECLARE_BANKRUPTCY') {
    handleDeclareBankruptcy().then(sendResponse);
    return true;
  }
  if (request.type === 'SAVE_FOR_MORNING') {
    handleSaveForMorning(request.data, sender.tab?.id).then(sendResponse);
    return true;
  }
  if (request.type === 'GET_MORNING_QUEUE') {
    handleGetMorningQueue().then(sendResponse);
    return true;
  }
  if (request.type === 'RESTORE_MORNING_QUEUE') {
    handleRestoreMorningQueue().then(sendResponse);
    return true;
  }
});


async function handleTabSummary() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const { tabMemory = {}, config = DEFAULT_CONFIG } = await Storage.get(['tabMemory', 'config']);
  const thresholdMs = (config.staleThresholdMinutes || 120) * 60 * 1000;
  const now = Date.now();

  const activeTabs = [];
  const staleTabs = [];

  for (const t of tabs) {
    if (!t.url || t.url.startsWith('chrome://')) continue;
    const mem = tabMemory[t.id] || { id: t.id, url: t.url, title: t.title, createdAt: now, lastActiveAt: now };
    const age = now - (mem.lastActiveAt || mem.createdAt);
    if (age > thresholdMs) {
      staleTabs.push({ ...t, inactiveDuration: age });
    } else {
      activeTabs.push(t);
    }
  }

  const clusters = analyzeTabClusters(tabs);
  const siteGroups = groupTabsByDomain(tabs);

  return {
    totalTabs: tabs.length,
    activeTabs,
    staleTabs,
    clusters,
    siteGroups
  };
}

async function handleGroupTabs(tabIds, title = 'Nook Group') {
  try {
    if (!chrome.tabGroups) return { success: false, reason: 'tabGroups API not supported' };
    const groupId = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(groupId, { title, color: 'green', collapsed: false });
    return { success: true, groupId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function handleGroupBySite() {
  try {
    if (!chrome.tabGroups) return { success: false, reason: 'tabGroups API not supported' };
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const siteGroups = groupTabsByDomain(tabs);

    if (!siteGroups.length) {
      return { success: false, reason: 'No sites have 2+ tabs to group' };
    }

    const COLORS = ['blue', 'green', 'yellow', 'red', 'purple', 'pink', 'cyan', 'orange'];
    const created = [];

    for (let i = 0; i < siteGroups.length; i++) {
      const g = siteGroups[i];
      const color = COLORS[i % COLORS.length];
      const tabIds = g.tabs.map(t => t.id);
      const groupId = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(groupId, {
        title: `${g.title} (${g.count})`,
        color,
        collapsed: false
      });
      created.push({ domain: g.domain, title: g.title, count: g.count, groupId });
    }

    return { success: true, groups: created };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function handleGroupSpecificSite(domain) {
  try {
    if (!chrome.tabGroups) return { success: false, reason: 'tabGroups API not supported' };
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const matching = tabs.filter(t => {
      try {
        const d = new URL(t.url).hostname.replace(/^www\./, '');
        return d === domain || d.endsWith('.' + domain);
      } catch { return false; }
    });

    if (matching.length === 0) return { success: false, reason: 'No matching tabs' };

    const tabIds = matching.map(t => t.id);
    const groupId = await chrome.tabs.group({ tabIds });
    const label = formatDomainLabel(domain);
    await chrome.tabGroups.update(groupId, {
      title: `${label} (${matching.length})`,
      color: 'blue',
      collapsed: false
    });

    return { success: true, count: matching.length, groupId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function handleArchiveTabs(tabIds) {
  const { archivedSessions = [] } = await Storage.get('archivedSessions');
  const tabs = await chrome.tabs.query({});
  const toArchive = tabs.filter(t => tabIds.includes(t.id));

  const session = {
    id: `session_${Date.now()}`,
    timestamp: Date.now(),
    tabs: toArchive.map(t => ({ title: t.title, url: t.url, favIconUrl: t.favIconUrl }))
  };

  archivedSessions.unshift(session);
  await Storage.set({ archivedSessions });

  // Close the archived tabs
  await chrome.tabs.remove(tabIds);
  return { success: true, count: toArchive.length };
}

async function handleDeclareBankruptcy() {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const validTabs = tabs.filter(t => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://'));

    if (!validTabs.length) {
      return { success: false, reason: 'No open web tabs to archive' };
    }

    const dayName = new Date().toLocaleDateString(undefined, { weekday: 'long' });
    const sessionName = `Bankruptcy: ${dayName} Cleanse (${validTabs.length} tabs)`;

    const session = {
      id: `bankruptcy_${Date.now()}`,
      name: sessionName,
      isBankruptcy: true,
      timestamp: Date.now(),
      savedAt: Date.now(),
      tabs: validTabs.map(t => ({
        title: t.title || 'Untitled',
        url: t.url,
        favIconUrl: t.favIconUrl,
        domain: (() => { try { return new URL(t.url).hostname.replace(/^www\./, ''); } catch { return ''; } })()
      }))
    };

    const { focusSessions = [], archivedSessions = [] } = await Storage.get(['focusSessions', 'archivedSessions']);
    focusSessions.unshift(session);
    archivedSessions.unshift(session);
    await Storage.set({ focusSessions, archivedSessions });

    // Open fresh new tab first so window stays open
    await chrome.tabs.create({ active: true });

    // Remove all previous tabs
    const tabIdsToRemove = validTabs.map(t => t.id);
    await chrome.tabs.remove(tabIdsToRemove);

    return {
      success: true,
      count: validTabs.length,
      sessionName,
      sessionId: session.id
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function handleSaveForMorning(data, tabId) {
  const { morningQueue = [] } = await Storage.get('morningQueue');
  const item = {
    id: `mq_${Date.now()}`,
    url: data?.url || '',
    title: data?.title || 'Late-night reading',
    savedAt: Date.now(),
    percentage: data?.percentage || 0
  };
  morningQueue.unshift(item);
  await Storage.set({ morningQueue });

  if (tabId) {
    await chrome.tabs.remove(tabId).catch(() => {});
  }
  return { success: true, item };
}

async function handleGetMorningQueue() {
  const { morningQueue = [] } = await Storage.get('morningQueue');
  return { morningQueue };
}

async function handleRestoreMorningQueue() {
  const { morningQueue = [] } = await Storage.get('morningQueue');
  for (const item of morningQueue) {
    if (item.url) {
      await chrome.tabs.create({ url: item.url, active: false }).catch(() => {});
    }
  }
  await Storage.set({ morningQueue: [] });
  return { success: true, count: morningQueue.length };
}

async function handleRecordPosition(data) {
  if (!data || !data.url) return;
  const { pagePositions = {} } = await Storage.get('pagePositions');
  pagePositions[data.url] = {
    ...data,
    timestamp: Date.now()
  };
  await Storage.set({ pagePositions });
  return { success: true };
}

async function handleGetPosition(url) {
  const { pagePositions = {} } = await Storage.get('pagePositions');
  return pagePositions[url] || null;
}

async function handleGetAllPositions() {
  const { pagePositions = {} } = await Storage.get('pagePositions');
  return Object.values(pagePositions).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

async function handleGetBookmarks() {
  if (!chrome.bookmarks) {
    return { bookmarks: [] };
  }
  const tree = await chrome.bookmarks.getTree();
  const flat = [];
  function recurse(nodes) {
    for (const node of nodes) {
      if (node.url) {
        flat.push(node);
      }
      if (node.children) {
        recurse(node.children);
      }
    }
  }
  recurse(tree);

  const { bookmarkMetadata = {} } = await Storage.get('bookmarkMetadata');
  const now = Date.now();

  const result = flat.map(b => {
    const meta = bookmarkMetadata[b.id] || {};
    const addedAt = b.dateAdded || (now - 1000 * 60 * 60 * 24 * 3); // default 3 days
    const lastOpened = meta.lastOpenedAt || addedAt;
    const ageDays = Math.floor((now - lastOpened) / (1000 * 60 * 60 * 24));
    
    let stage = 'fresh';
    if (ageDays >= 60) stage = 'decayed';
    else if (ageDays >= 30) stage = 'faded';
    else if (ageDays >= 7) stage = 'aging';

    return {
      id: b.id,
      title: b.title || 'Untitled Bookmark',
      url: b.url,
      ageDays,
      stage,
      snoozedUntil: meta.snoozeUntil || null
    };
  });

  return { bookmarks: result };
}

async function handleReviveBookmark(bookmarkId, url) {
  const { bookmarkMetadata = {} } = await Storage.get('bookmarkMetadata');
  if (bookmarkId) {
    bookmarkMetadata[bookmarkId] = {
      ...(bookmarkMetadata[bookmarkId] || {}),
      lastOpenedAt: Date.now()
    };
    await Storage.set({ bookmarkMetadata });
  }
  if (url) {
    await chrome.tabs.create({ url });
  }
  return { success: true };
}

// ── Focus Session Management ────────────────────────────────────

async function handleSaveSession(name, tabIds) {
  const { focusSessions = [] } = await Storage.get('focusSessions');
  const allTabs = await chrome.tabs.query({});
  const sessionTabs = allTabs.filter(t => !tabIds || tabIds.includes(t.id));

  const session = {
    id: `fs_${Date.now()}`,
    name: name || 'Unnamed Session',
    savedAt: Date.now(),
    tabs: sessionTabs.map(t => ({
      title: t.title,
      url: t.url,
      favIconUrl: t.favIconUrl,
      domain: (() => { try { return new URL(t.url).hostname; } catch { return ''; } })()
    }))
  };

  focusSessions.unshift(session);
  // Cap at 20 saved sessions
  if (focusSessions.length > 20) focusSessions.splice(20);
  await Storage.set({ focusSessions });
  return { success: true, session };
}

async function handleGetSessions() {
  const { focusSessions = [], archivedSessions = [] } = await Storage.get(['focusSessions', 'archivedSessions']);
  return { focusSessions, archivedSessions };
}

async function handleRestoreSession(sessionId) {
  const { focusSessions = [], archivedSessions = [] } = await Storage.get(['focusSessions', 'archivedSessions']);
  const all = [...focusSessions, ...archivedSessions];
  const session = all.find(s => s.id === sessionId);
  if (!session) return { success: false };

  for (const tab of session.tabs) {
    await chrome.tabs.create({ url: tab.url, active: false }).catch(() => {});
  }
  return { success: true, count: session.tabs.length };
}


