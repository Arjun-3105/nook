/**
 * Nook — New Tab Terrarium Controller
 * Handles live clock, search, modal dialogs, tab management,
 * bookmark lifecycles, creature interactions, and viral card generation.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── Elements ──────────────────────────────────────────────────────────
  const liveClock           = document.getElementById('liveClock');
  const greetingText        = document.getElementById('greetingText');
  const searchForm          = document.getElementById('searchForm');
  const searchInput         = document.getElementById('searchInput');
  const proactiveChip       = document.getElementById('proactiveChip');
  const chipText            = document.getElementById('chipText');
  const creatureNook        = document.getElementById('creatureNook');
  const creatureImg         = document.getElementById('creatureImg');
  const sleepBubble         = document.getElementById('sleepBubble');

  // Dock Buttons
  const btnDockTabs         = document.getElementById('btnDockTabs');
  const badgeTabCount       = document.getElementById('badgeTabCount');
  const btnDockBookmarks    = document.getElementById('btnDockBookmarks');
  const badgeBookmarkDecay  = document.getElementById('badgeBookmarkDecay');
  const btnDockSettings     = document.getElementById('btnDockSettings');
  const btnShareX           = document.getElementById('btnShareX');

  // Modals
  const modalStaleTabs      = document.getElementById('modalStaleTabs');
  const staleModalTitle     = document.getElementById('staleModalTitle');
  const staleTabsContainer  = document.getElementById('staleTabsContainer');
  const btnArchiveSession   = document.getElementById('btnArchiveSession');

  const modalRegroup        = document.getElementById('modalRegroup');
  const regroupTabsContainer= document.getElementById('regroupTabsContainer');
  const btnGroupTabs        = document.getElementById('btnGroupTabs');

  const modalReturnPoint    = document.getElementById('modalReturnPoint');
  const returnTitle         = document.getElementById('returnTitle');
  const returnUrl           = document.getElementById('returnUrl');
  const btnTakeMeThere      = document.getElementById('btnTakeMeThere');

  const modalPageChange     = document.getElementById('modalPageChange');
  const btnShowChanges      = document.getElementById('btnShowChanges');

  const modalBookmarks      = document.getElementById('modalBookmarks');
  const tabBookmarksView    = document.getElementById('tabBookmarksView');
  const tabArchivedView     = document.getElementById('tabArchivedView');
  const tabSettingsView     = document.getElementById('tabSettingsView');
  const bmSearchInput       = document.getElementById('bmSearchInput');
  const bmFilterDropdown    = document.getElementById('bmFilterDropdown');
  const bookmarksContainer  = document.getElementById('bookmarksContainer');

  const modalBookmarkDetail = document.getElementById('modalBookmarkDetail');
  const detailIcon          = document.getElementById('detailIcon');
  const detailTitle         = document.getElementById('detailTitle');
  const detailDomain        = document.getElementById('detailDomain');
  const detailAddedAge      = document.getElementById('detailAddedAge');
  const detailCreatureImg   = document.getElementById('detailCreatureImg');
  const detailQuote         = document.getElementById('detailQuote');
  const btnReviveBookmark   = document.getElementById('btnReviveBookmark');
  const btnSnoozeBookmark   = document.getElementById('btnSnoozeBookmark');
  const btnDeleteBookmark   = document.getElementById('btnDeleteBookmark');
  const btnArchiveSnapshot  = document.getElementById('btnArchiveSnapshot');

  const modalSettings       = document.getElementById('modalSettings');
  const setEnableNook       = document.getElementById('setEnableNook');
  const setShowCreature     = document.getElementById('setShowCreature');
  const setPlayAmbient      = document.getElementById('setPlayAmbient');
  const setExcludeIncognito = document.getElementById('setExcludeIncognito');
  const setAutoDeleteOld    = document.getElementById('setAutoDeleteOld');
  const btnClearData        = document.getElementById('btnClearData');
  const btnExportData       = document.getElementById('btnExportData');
  const btnViewStored       = document.getElementById('btnViewStored');

  const modalShareX         = document.getElementById('modalShareX');
  const shareCanvas         = document.getElementById('shareCanvas');
  const btnPostTwitter      = document.getElementById('btnPostTwitter');
  const btnDownloadCard     = document.getElementById('btnDownloadCard');

  // ── State ─────────────────────────────────────────────────────────────
  let currentSummary = null;
  let currentBookmarks = [];
  let currentReading = [];
  let selectedBookmark = null;
  let activeTabFilter = 'bookmarks'; // 'bookmarks' | 'archived' | 'settings'

  // Fallback realistic mock data for standalone/preview
  const MOCK_DATA = {
    tabs: [
      { id: 101, title: 'Attention Is All You Need — arXiv', url: 'https://arxiv.org/abs/1706.03762', domain: 'arxiv.org', inactiveDuration: 4 * 3600 * 1000 },
      { id: 102, title: 'Building for the Open Web | Chrome for Developers', url: 'https://developer.chrome.com/docs/extensions/', domain: 'developer.chrome.com', inactiveDuration: 3 * 3600 * 1000 },
      { id: 103, title: 'Figma — Cozy Creature Design System v2', url: 'https://figma.com/design/cozy-creature', domain: 'figma.com', inactiveDuration: 2.5 * 3600 * 1000 },
      { id: 104, title: 'TypeScript 5.8 Release Notes', url: 'https://devblogs.microsoft.com/typescript/', domain: 'devblogs.microsoft.com', inactiveDuration: 5 * 3600 * 1000 },
      { id: 105, title: 'Hacker News — Ask HN: What are your favorite browser extensions?', url: 'https://news.ycombinator.com/item?id=3849102', domain: 'news.ycombinator.com', inactiveDuration: 2 * 3600 * 1000 }
    ],
    bookmarks: [
      { id: 'b1', title: 'A Guide to Better Thinking & Mental Models', url: 'https://fs.blog/mental-models/', stage: 'decayed', daysAgo: 61, isEvergreen: false },
      { id: 'b2', title: 'Designing Data-Intensive Applications Summary', url: 'https://martin.kleppmann.com/books/', stage: 'faded', daysAgo: 42, isEvergreen: false },
      { id: 'b3', title: 'Tailwind CSS Tips for Cozy Interfaces', url: 'https://tailwindcss.com/blog', stage: 'aging', daysAgo: 18, isEvergreen: false },
      { id: 'b4', title: 'Chrome Extensions MV3 Migration Guide', url: 'https://developer.chrome.com/docs/extensions/mv3/', stage: 'fresh', daysAgo: 3, isEvergreen: true },
      { id: 'b5', title: 'Local-First Software: You own your data', url: 'https://www.inkandswitch.com/local-first/', stage: 'decayed', daysAgo: 74, isEvergreen: false }
    ],
    reading: {
      url: 'https://developer.chrome.com/docs/extensions/',
      title: 'Building for the open web',
      scrollY: 1240,
      percentage: 42
    }
  };

  // ── Clock & Greeting ──────────────────────────────────────────────────
  function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    if (liveClock) {
      liveClock.textContent = `${hours % 12 || 12}:${minutes}`;
    }
    if (greetingText) {
      let g = 'Good morning';
      if (hours >= 12 && hours < 17) g = 'Good afternoon';
      else if (hours >= 17 && hours < 22) g = 'Good evening';
      else if (hours >= 22 || hours < 5) g = 'Late night nook';
      greetingText.textContent = g;
    }
  }
  updateClock();
  setInterval(updateClock, 10000);

  // ── Search Form ───────────────────────────────────────────────────────
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = (searchInput?.value || '').trim();
      if (!q) return;
      if (q.startsWith('http://') || q.startsWith('https://')) {
        window.location.href = q;
      } else {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
      }
    });
  }

  // ── Modal Helpers ─────────────────────────────────────────────────────
  function openModal(modal) {
    if (!modal) return;
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
    modal.classList.add('open');
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
  }

  // Close buttons and backdrop click
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-backdrop');
      closeModal(modal);
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // ESC to close any open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(closeModal);
    }
  });

  // ── Creature Poke & Mood Switcher ─────────────────────────────────────
  const creatureMoods = [
    { mode: 'sleepy', quote: 'Zzz... taking a peaceful nap 🌱', sprite: '../assets/creature/sleepy.png', bubble: true },
    { mode: 'happy', quote: 'Glad you dropped by! Your browser feels lighter.', sprite: '../assets/creature/happy.png', bubble: false },
    { mode: 'curious', quote: 'Looking for that tab from yesterday? I got you!', sprite: '../assets/creature/curious.png', bubble: false },
    { mode: 'excited', quote: 'Ready to build something awesome today? ✨', sprite: '../assets/creature/excited.png', bubble: false },
    { mode: 'relaxing', quote: 'No rush. Take your time and breathe.', sprite: '../assets/creature/relaxing.png', bubble: false },
    { mode: 'proud', quote: 'Look at that clean workspace! Top work. 🌿', sprite: '../assets/creature/proud.png', bubble: false },
    { mode: 'content', quote: 'All tabs tucked in safely. Pure peace.', sprite: '../assets/creature/content.png', bubble: false }
  ];
  let currentMoodIdx = 0;

  if (creatureNook) {
    creatureNook.addEventListener('click', () => {
      currentMoodIdx = (currentMoodIdx + 1) % creatureMoods.length;
      const mood = creatureMoods[currentMoodIdx];
      if (creatureImg) {
        creatureImg.src = mood.sprite;
        creatureImg.style.transform = 'scale(1.2) rotate(-4deg)';
        setTimeout(() => creatureImg.style.transform = '', 300);
      }
      if (sleepBubble) {
        sleepBubble.style.display = mood.bubble ? 'block' : 'none';
      }
      if (chipText) {
        chipText.textContent = mood.quote;
      }
    });
  }

  // ── Load Real or Mock Extension Data ──────────────────────────────────
  function loadData() {
    const hasChrome = typeof chrome !== 'undefined' && chrome.runtime?.sendMessage;

    if (!hasChrome) {
      applySummary({
        totalTabs: 12,
        staleTabs: MOCK_DATA.tabs,
        activeTabs: MOCK_DATA.tabs
      });
      applyBookmarks(MOCK_DATA.bookmarks);
      applyReading(MOCK_DATA.reading);
      return;
    }

    // Tab summary
    chrome.runtime.sendMessage({ type: 'GET_TAB_SUMMARY' }, (res) => {
      if (res) applySummary(res);
      else applySummary({ totalTabs: 12, staleTabs: MOCK_DATA.tabs });
    });

    // Bookmarks
    chrome.runtime.sendMessage({ type: 'GET_BOOKMARKS_LIFECYCLE' }, (res) => {
      if (res?.bookmarks) applyBookmarks(res.bookmarks);
      else applyBookmarks(MOCK_DATA.bookmarks);
    });

    // Reading points
    chrome.runtime.sendMessage({ type: 'GET_ALL_POSITIONS' }, (res) => {
      if (res && res.length > 0) applyReading(res[0]);
      else applyReading(MOCK_DATA.reading);
    });
  }

  function applySummary(summary) {
    currentSummary = summary;
    const staleCount = summary.staleTabs?.length || 0;
    const totalCount = summary.totalTabs || 0;

    if (badgeTabCount) badgeTabCount.textContent = totalCount;
    if (chipText) {
      chipText.textContent = staleCount > 0
        ? `You've got ${staleCount} tab${staleCount > 1 ? 's' : ''} that haven't been visited in a while.`
        : `Your browser is calm and clutter-free right now. 🌱`;
    }
    if (staleModalTitle) {
      staleModalTitle.textContent = `${staleCount} stale tab${staleCount > 1 ? 's' : ''}`;
    }

    renderStaleTabsList(summary.staleTabs || []);
  }

  function applyBookmarks(bookmarks) {
    currentBookmarks = bookmarks;
    const decaying = bookmarks.filter(b => (b.stage === 'faded' || b.stage === 'decayed') && !b.isEvergreen);
    if (badgeBookmarkDecay) {
      badgeBookmarkDecay.textContent = decaying.length;
      badgeBookmarkDecay.style.display = decaying.length > 0 ? 'inline-block' : 'none';
    }
    renderBookmarksList();
  }

  function applyReading(point) {
    currentReading = point;
    if (point && returnTitle && returnUrl) {
      returnTitle.textContent = point.title || 'Saved Reading Point';
      try {
        returnUrl.textContent = new URL(point.url).hostname;
      } catch {
        returnUrl.textContent = point.url || '';
      }
    }
  }

  // ── Render Stale Tabs Modal ───────────────────────────────────────────
  function renderStaleTabsList(tabs) {
    if (!staleTabsContainer) return;
    staleTabsContainer.innerHTML = '';

    if (!tabs || tabs.length === 0) {
      staleTabsContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; color: #6b7280; font-size: 14px;">
          No stale tabs! Everything is clean and fresh. 🌿
        </div>
      `;
      return;
    }

    tabs.forEach(t => {
      const row = document.createElement('div');
      row.className = 'tab-item-row';
      const domain = (() => { try { return new URL(t.url).hostname; } catch { return ''; } })();
      const hoursAgo = t.inactiveDuration ? Math.round(t.inactiveDuration / (3600 * 1000)) : 3;

      row.innerHTML = `
        <div class="tab-item-info">
          <div class="tab-item-title" title="${t.title || ''}">${t.title || 'Untitled Tab'}</div>
          <div class="tab-item-meta">
            <span>${domain}</span> · <span>inactive ${hoursAgo}h</span>
          </div>
        </div>
        <div class="tab-item-actions">
          <button class="btn btn-outline-sm btn-open-tab" title="Switch to tab">Open</button>
          <button class="btn btn-icon-only btn-close-tab" title="Close tab">✕</button>
        </div>
      `;

      row.querySelector('.btn-open-tab')?.addEventListener('click', () => {
        if (typeof chrome !== 'undefined' && chrome.tabs?.update && t.id) {
          chrome.tabs.update(t.id, { active: true });
        } else {
          window.open(t.url, '_blank');
        }
      });

      row.querySelector('.btn-close-tab')?.addEventListener('click', () => {
        if (typeof chrome !== 'undefined' && chrome.tabs?.remove && t.id) {
          chrome.tabs.remove(t.id).catch(() => {});
        }
        row.style.opacity = '0';
        setTimeout(() => row.remove(), 150);
      });

      staleTabsContainer.appendChild(row);
    });
  }

  // Archive Session Button
  if (btnArchiveSession) {
    btnArchiveSession.addEventListener('click', () => {
      const tabs = currentSummary?.staleTabs || [];
      if (!tabs.length) return;
      const tabIds = tabs.map(t => t.id).filter(Boolean);

      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ type: 'ARCHIVE_STALE_TABS', tabIds }, () => {
          closeModal(modalStaleTabs);
          loadData();
        });
      } else {
        closeModal(modalStaleTabs);
        if (chipText) chipText.textContent = `Archived ${tabs.length} tabs safely into session! 📦`;
        applySummary({ totalTabs: 0, staleTabs: [] });
      }
    });
  }

  // ── Render Bookmarks Lifecycle List ───────────────────────────────────
  function renderBookmarksList() {
    if (!bookmarksContainer) return;
    bookmarksContainer.innerHTML = '';

    const filter = bmFilterDropdown?.value || 'all';
    const query = (bmSearchInput?.value || '').toLowerCase().trim();

    let list = currentBookmarks.filter(b => {
      if (filter !== 'all' && b.stage !== filter) return false;
      if (query) {
        return (b.title && b.title.toLowerCase().includes(query)) ||
               (b.url && b.url.toLowerCase().includes(query));
      }
      return true;
    });

    if (list.length === 0) {
      bookmarksContainer.innerHTML = `
        <div style="padding: 32px; text-align: center; color: #9ca3af; font-size: 14px;">
          No bookmarks match your filter. 🌱
        </div>
      `;
      return;
    }

    list.forEach(b => {
      const item = document.createElement('div');
      item.className = 'bm-list-item';

      const domain = (() => { try { return new URL(b.url).hostname; } catch { return ''; } })();
      const stage = b.stage || 'fresh';
      const stageLabels = {
        fresh: '🍃 Fresh',
        aging: '🍂 Aging',
        faded: '🥀 Faded',
        decayed: '🍂 Decayed'
      };

      item.innerHTML = `
        <div class="bm-info-col">
          <div class="bm-title" title="${b.title || ''}">${b.title || 'Untitled Bookmark'}</div>
          <div class="bm-meta">
            <span>${domain}</span> · <span class="bm-badge stage-${stage}">${stageLabels[stage] || stage}</span>
            ${b.isEvergreen ? '<span class="bm-badge evergreen">🌲 Evergreen</span>' : ''}
          </div>
        </div>
        <div class="bm-action-col">
          <button class="btn btn-outline-sm btn-inspect-bm">Details</button>
          <button class="btn btn-outline-sm btn-revive-bm" title="Open and reset decay">Revive 🌿</button>
        </div>
      `;

      item.querySelector('.btn-inspect-bm')?.addEventListener('click', (e) => {
        e.stopPropagation();
        openBookmarkDetail(b);
      });

      item.querySelector('.btn-revive-bm')?.addEventListener('click', (e) => {
        e.stopPropagation();
        reviveBookmark(b);
      });

      item.addEventListener('click', () => openBookmarkDetail(b));
      bookmarksContainer.appendChild(item);
    });
  }

  function openBookmarkDetail(b) {
    selectedBookmark = b;
    if (!modalBookmarkDetail) return;

    if (detailTitle) detailTitle.textContent = b.title || 'Bookmark';
    const domain = (() => { try { return new URL(b.url).hostname; } catch { return ''; } })();
    if (detailDomain) detailDomain.textContent = domain;
    if (detailIcon) detailIcon.textContent = (domain[0] || 'B').toUpperCase();
    if (detailAddedAge) detailAddedAge.textContent = `Added ${b.daysAgo || 61} days ago`;

    if (detailCreatureImg) {
      if (b.stage === 'decayed') {
        detailCreatureImg.src = '../assets/creature/decaying.png';
        if (detailQuote) detailQuote.textContent = 'This bookmark is feeling forgotten... 🍂';
      } else if (b.stage === 'faded') {
        detailCreatureImg.src = '../assets/creature/sad.png';
        if (detailQuote) detailQuote.textContent = 'It has been a while since you visited.';
      } else {
        detailCreatureImg.src = '../assets/creature/curious.png';
        if (detailQuote) detailQuote.textContent = 'Curious to read this today? 🌱';
      }
    }

    openModal(modalBookmarkDetail);
  }

  function reviveBookmark(b) {
    if (!b) return;
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'REVIVE_BOOKMARK', id: b.id, url: b.url }, () => {
        window.open(b.url, '_blank');
        closeModal(modalBookmarkDetail);
        loadData();
      });
    } else {
      window.open(b.url, '_blank');
      b.stage = 'fresh';
      b.daysAgo = 0;
      closeModal(modalBookmarkDetail);
      renderBookmarksList();
    }
  }

  if (btnReviveBookmark) {
    btnReviveBookmark.addEventListener('click', () => {
      if (selectedBookmark) reviveBookmark(selectedBookmark);
    });
  }

  if (btnSnoozeBookmark) {
    btnSnoozeBookmark.addEventListener('click', () => {
      if (selectedBookmark) {
        selectedBookmark.daysAgo = Math.max(0, (selectedBookmark.daysAgo || 30) - 14);
        selectedBookmark.stage = 'fresh';
        closeModal(modalBookmarkDetail);
        renderBookmarksList();
      }
    });
  }

  if (btnDeleteBookmark) {
    btnDeleteBookmark.addEventListener('click', () => {
      if (!selectedBookmark) return;
      if (typeof chrome !== 'undefined' && chrome.bookmarks?.remove) {
        chrome.bookmarks.remove(selectedBookmark.id).catch(() => {});
      }
      currentBookmarks = currentBookmarks.filter(x => x.id !== selectedBookmark.id);
      closeModal(modalBookmarkDetail);
      renderBookmarksList();
    });
  }

  // Filters
  bmFilterDropdown?.addEventListener('change', renderBookmarksList);
  bmSearchInput?.addEventListener('input', renderBookmarksList);

  // ── Dock Button Listeners ─────────────────────────────────────────────
  btnDockTabs?.addEventListener('click', () => openModal(modalStaleTabs));
  btnDockBookmarks?.addEventListener('click', () => openModal(modalBookmarks));
  btnDockSettings?.addEventListener('click', () => openModal(modalSettings));
  btnShareX?.addEventListener('click', () => {
    drawShareCard();
    openModal(modalShareX);
  });
  proactiveChip?.addEventListener('click', () => openModal(modalStaleTabs));

  // Return point Jump Back
  btnTakeMeThere?.addEventListener('click', () => {
    if (!currentReading?.url) return;
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url: currentReading.url }, (newTab) => {
        closeModal(modalReturnPoint);
      });
    } else {
      window.open(currentReading.url, '_blank');
      closeModal(modalReturnPoint);
    }
  });

  // ── Viral X / Twitter Canvas Card ──────────────────────────────────────
  function drawShareCard() {
    if (!shareCanvas) return;
    const ctx = shareCanvas.getContext('2d');
    const w = shareCanvas.width;
    const h = shareCanvas.height;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#fbf9f4');
    grad.addColorStop(0.5, '#f4ede1');
    grad.addColorStop(1, '#e8dcce');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Decorative cozy border
    ctx.strokeStyle = '#dfd6c8';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, w - 24, h - 24);

    // Top Brand & Date
    ctx.fillStyle = '#2d6a4f';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('Nook 🌱', 32, 48);

    ctx.fillStyle = '#78716c';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const dateStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    ctx.fillText(`Daily Terrarium Snapshot · ${dateStr}`, 32, 70);

    // Mascot Sprite
    const mascot = new Image();
    mascot.crossOrigin = 'anonymous';
    mascot.src = '../assets/creature/proud.png';
    mascot.onload = () => {
      ctx.drawImage(mascot, w - 160, 60, 110, 130);
    };

    // Stats Section
    const activeTabs = currentSummary?.totalTabs || 8;
    const staleTabs = currentSummary?.staleTabs?.length || 0;
    const cleaned = Math.max(0, 15 - staleTabs);

    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('🌿 Browser Wellness Score', 32, 115);

    // Stat boxes
    drawStatPill(ctx, 32, 130, 'Active Tabs', String(activeTabs), '#15803d', '#dcfce7');
    drawStatPill(ctx, 150, 130, 'Cleaned Tabs', String(cleaned), '#b45309', '#fef3c7');
    drawStatPill(ctx, 270, 130, 'Decay Kept', '100%', '#4338ca', '#e0e7ff');

    // Quote
    ctx.fillStyle = '#44403c';
    ctx.font = 'italic 14px Georgia, serif';
    ctx.fillText('"Same curious mind. Fewer forgotten things."', 32, 230);

    // Footer Watermark
    ctx.fillStyle = '#a8a29e';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('nook-browser.local · 100% on-device private memory', 32, 295);
  }

  function drawStatPill(ctx, x, y, label, val, textCol, bgCol) {
    ctx.fillStyle = bgCol;
    ctx.beginPath();
    ctx.roundRect(x, y, 105, 54, 8);
    ctx.fill();

    ctx.fillStyle = textCol;
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(val, x + 14, y + 26);

    ctx.fillStyle = '#57534e';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(label, x + 14, y + 44);
  }

  if (btnDownloadCard) {
    btnDownloadCard.addEventListener('click', () => {
      if (!shareCanvas) return;
      const link = document.createElement('a');
      link.download = `nook-snapshot-${Date.now()}.png`;
      link.href = shareCanvas.toDataURL('image/png');
      link.click();
    });
  }

  if (btnPostTwitter) {
    btnPostTwitter.addEventListener('click', () => {
      const text = encodeURIComponent("My browser has never felt this calm. 🌿 Built with @Nook 🌱 — Your browser remembers.");
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    });
  }

  // ── Settings ──────────────────────────────────────────────────────────
  if (btnClearData) {
    btnClearData.addEventListener('click', () => {
      if (confirm('Clear all stored Nook data and memory? 🌿')) {
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          chrome.storage.local.clear();
        }
        alert('All local Nook memory cleared.');
        loadData();
      }
    });
  }

  // Initial load
  loadData();
});
