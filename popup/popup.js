/**
 * Nook Toolbar Popup Controller
 * Full interactive suite:
 * - Interactive 3D creature companion
 * - Focus Sessions & Tab Clustering (Grouping & Restoring)
 * - Decaying Bookmarks lifecycle with instant Revive
 * - Return Point recent reading list
 * - 1-Click X / Twitter status generator
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── Elements ───────────────────────────────────────────────────
  const statTabs       = document.getElementById('statTabs');
  const statStale      = document.getElementById('statStale');
  const statDecay      = document.getElementById('statDecay');
  const statusTitle    = document.getElementById('statusTitle');
  const statusSub      = document.getElementById('statusSub');
  const statusBody     = document.getElementById('statusBody');
  const sEyeL          = document.getElementById('sEyeL');
  const sEyeR          = document.getElementById('sEyeR');
  const sMouth         = document.getElementById('sMouth');
  const overviewCards  = document.getElementById('overviewCards');
  const sessionsList   = document.getElementById('sessionsList');
  const bookmarksList  = document.getElementById('bookmarksFullList');
  const readingList    = document.getElementById('readingList');
  const bookmarkCounter = document.getElementById('bookmarkCounter');
  const toast          = document.getElementById('toast');

  let currentTabSummary = null;
  let currentBookmarks  = [];
  let currentSessions   = [];
  let currentReading    = [];
  let currentMorningQueue = [];

  // ── Tab Switching ───────────────────────────────────────────────
  const navPills = document.querySelectorAll('.nav-pill');
  const panels = {
    overview:  document.getElementById('panelOverview'),
    sessions:  document.getElementById('panelSessions'),
    bookmarks: document.getElementById('panelBookmarks'),
    reading:   document.getElementById('panelReading')
  };

  function switchTab(targetTab) {
    navPills.forEach(p => p.classList.toggle('active', p.dataset.tab === targetTab));
    Object.keys(panels).forEach(key => {
      panels[key]?.classList.toggle('active', key === targetTab);
    });
    document.querySelectorAll('.stat').forEach(st => {
      st.classList.toggle('active', st.dataset.tab === targetTab);
    });
  }

  navPills.forEach(pill => {
    pill.addEventListener('click', () => switchTab(pill.dataset.tab));
  });

  document.querySelectorAll('.stat').forEach(stat => {
    stat.addEventListener('click', () => {
      const tab = stat.dataset.tab;
      if (tab) switchTab(tab);
    });
  });

  // ── Creature Emotions ───────────────────────────────────────────
  function setCreatureEmotion(name, title, sub) {
    if (!sEyeL) return;
    [sEyeL, sEyeR].forEach(e => { e.style.cssText = ''; });
    sMouth.style.cssText = '';
    statusBody.style.boxShadow = '';
    document.getElementById('statusCreature')?.classList.toggle('sleepy', name === 'sleepy');

    const emo = {
      happy:     () => {},
      sleepy:    () => {
        [sEyeL, sEyeR].forEach(e => { e.style.height='2.5px'; e.style.borderRadius='3px 3px 0 0'; });
        sMouth.style.width='7px'; sMouth.style.height='3.5px';
      },
      concerned: () => {
        [sEyeL, sEyeR].forEach(e => { e.style.width='5px'; e.style.height='8px'; e.style.borderRadius='40%'; });
        sMouth.style.borderRadius='10px 10px 0 0'; sMouth.style.borderTop='2px solid #2d1f0e';
        sMouth.style.borderBottom='none'; sMouth.style.width='10px';
      },
      curious: () => { sEyeL.style.width='9px'; sEyeL.style.height='9px'; },
      excited: () => {
        sMouth.style.width='16px'; sMouth.style.height='8px';
      },
      proud: () => {
        sMouth.style.width='18px'; sMouth.style.height='9px';
        statusBody.style.boxShadow='inset -3px -3px 7px rgba(180,140,90,.25),inset 3px 3px 6px rgba(255,255,255,.9),0 0 16px rgba(74,222,128,.5),0 5px 14px rgba(100,70,20,.16)';
      }
    };
    (emo[name] || emo.happy)();
    if (title) statusTitle.textContent = title;
    if (sub)   statusSub.textContent   = sub;
  }

  // ── Creature Poke ───────────────────────────────────────────────
  const creatureCard = document.getElementById('creatureCard');
  const pokeQuotes = [
    { emo: 'excited', title: 'Hehe, that tickles!', sub: 'Watching your tabs closely ✨' },
    { emo: 'proud',   title: 'Keeping your browser cozy.', sub: 'Clean tabs, clear head 🌱' },
    { emo: 'curious', title: 'Whatcha exploring today?', sub: 'I will remember where you stop 📖' },
    { emo: 'happy',   title: 'All systems green!', sub: 'Nook is quietly helping in background 🌿' }
  ];
  let pokeIdx = 0;
  creatureCard?.addEventListener('click', () => {
    const q = pokeQuotes[pokeIdx % pokeQuotes.length];
    pokeIdx++;
    setCreatureEmotion(q.emo, q.title, q.sub);
  });

  // ── Toast Helper ────────────────────────────────────────────────
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }

  // ── Load All Data ───────────────────────────────────────────────
  function refreshAll() {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      statTabs.textContent = '6';
      statStale.textContent = '0';
      statDecay.textContent = '1';
      return;
    }

    // 1. Tab Summary
    chrome.runtime.sendMessage({ type: 'GET_TAB_SUMMARY' }, (res) => {
      if (!res) return;
      currentTabSummary = res;
      statTabs.textContent  = res.totalTabs || 0;
      statStale.textContent = res.staleTabs?.length || 0;
      renderOverview();
    });

    // 2. Bookmarks Lifecycle
    chrome.runtime.sendMessage({ type: 'GET_BOOKMARKS_LIFECYCLE' }, (res) => {
      if (!res?.bookmarks) return;
      currentBookmarks = res.bookmarks;
      const decaying = currentBookmarks.filter(b => b.stage === 'faded' || b.stage === 'decayed');
      statDecay.textContent = decaying.length;
      bookmarkCounter.textContent = `${decaying.length} decaying`;
      renderBookmarksTab();
      renderOverview();
    });

    // 3. Focus Sessions
    chrome.runtime.sendMessage({ type: 'GET_SESSIONS' }, (res) => {
      if (!res) return;
      currentSessions = [...(res.focusSessions || []), ...(res.archivedSessions || [])];
      renderSessionsTab();
    });

    // 4. Reading Positions
    chrome.runtime.sendMessage({ type: 'GET_ALL_POSITIONS' }, (res) => {
      if (!res) return;
      currentReading = res;
      renderReadingTab();
      renderOverview();
    });

    // 5. Morning Reading Queue
    chrome.runtime.sendMessage({ type: 'GET_MORNING_QUEUE' }, (res) => {
      if (!res) return;
      currentMorningQueue = res.morningQueue || [];
      renderOverview();
    });
  }

  // ── Render 1: Overview Tab ──────────────────────────────────────
  function renderOverview() {
    overviewCards.innerHTML = '';
    const stale    = currentTabSummary?.staleTabs || [];
    const clusters = currentTabSummary?.clusters  || [];
    const decaying = currentBookmarks.filter(b => b.stage === 'faded' || b.stage === 'decayed');

    // 0. Morning Queue Card (if any saved from last night)
    if (currentMorningQueue.length > 0) {
      const card = createCard(
        'return', '☀️',
        `Morning Queue (${currentMorningQueue.length} saved)`,
        'Ready to open your late-night reading list?',
        'Open All', 'primary',
        () => {
          chrome.runtime.sendMessage({ type: 'RESTORE_MORNING_QUEUE' }, (res) => {
            showToast(`Opened ${res?.count || currentMorningQueue.length} tabs from last night! ☀️`);
            refreshAll();
          });
        }
      );
      overviewCards.appendChild(card);
    }

    // Late-Night Sleep Mode Card (if 11 PM – 6 AM)
    const currentHour = new Date().getHours();
    const isLateNight = currentHour >= 23 || currentHour < 6;
    if (isLateNight) {
      const card = createCard(
        'decay', '🛌',
        'Sleep Mode Active (Late Night)',
        'Tuck current tab into tomorrow\'s queue & sleep?',
        'Save & Sleep', 'amber',
        () => {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.runtime.sendMessage({
                type: 'SAVE_FOR_MORNING',
                data: { url: tabs[0].url, title: tabs[0].title }
              }, () => {
                showToast('Tucked tab into tomorrow morning queue! 🌙');
                chrome.tabs.remove(tabs[0].id).catch(() => {});
                window.close();
              });
            }
          });
        }
      );
      overviewCards.appendChild(card);
    }

    // A. Focus Cluster Card (if 3+ related tabs found)
    if (clusters.length > 0) {
      const cl = clusters[0];
      const count = cl.tabs?.length || 0;
      const title = cl.title || 'Related Tabs';
      const card = createCard(
        'cluster', '🗂️',
        `"${title}" (${count} tabs)`,
        'These look related — group into a session?',
        'Group', 'indigo',
        () => {
          chrome.runtime.sendMessage({
            type: 'GROUP_TABS',
            tabIds: cl.tabs.map(t => t.id),
            groupTitle: title
          }, () => {
            showToast(`Grouped into "${title}"! 🎉`);
            setCreatureEmotion('proud', 'Focus session created!', 'Your tabs are organized.');
            refreshAll();
          });
        }
      );
      overviewCards.appendChild(card);
    }

    // B. Per-Site Grouping Nudges (if any site has 2+ tabs)
    const siteGroups = currentTabSummary?.siteGroups || [];
    siteGroups.slice(0, 2).forEach(sg => {
      const card = createCard(
        'cluster', '🌐',
        `"${sg.title}" (${sg.count} tabs)`,
        `Group all ${sg.domain} tabs together?`,
        'Group Site', 'indigo',
        () => {
          chrome.runtime.sendMessage({
            type: 'GROUP_SPECIFIC_SITE',
            domain: sg.domain
          }, (res) => {
            showToast(`Grouped ${res?.count || sg.count} ${sg.title} tabs! 🌐`);
            setCreatureEmotion('proud', `${sg.title} tabs grouped!`, 'Organized by domain.');
            refreshAll();
          });
        }
      );
      overviewCards.appendChild(card);
    });

    // B. Stale Tabs Nudge (if any)
    if (stale.length > 0) {
      const card = createCard(
        'stale', '🌿',
        `${stale.length} Stale Tabs`,
        'Haven\'t been visited in over 2 hours.',
        'Archive', 'amber',
        () => {
          chrome.runtime.sendMessage({
            type: 'ARCHIVE_STALE_TABS',
            tabIds: stale.map(t => t.id)
          }, () => {
            showToast(`Archived ${stale.length} tabs to session! 🌿`);
            setCreatureEmotion('proud', 'Tabs archived!', 'Breathing room restored.');
            refreshAll();
          });
        }
      );
      overviewCards.appendChild(card);
    }

    // C. Decaying Bookmark Nudge (if any)
    if (decaying.length > 0) {
      const b = decaying[0];
      const leaf = b.stage === 'decayed' ? '🥀' : '🍂';
      const card = createCard(
        'decay', leaf,
        b.title || 'Forgotten Bookmark',
        `${b.ageDays}d forgotten · ${b.url ? new URL(b.url).hostname : ''}`,
        'Revive', 'primary',
        () => {
          chrome.runtime.sendMessage({
            type: 'REVIVE_BOOKMARK',
            id: b.id,
            url: b.url
          }, () => {
            showToast(`Revived "${(b.title || '').slice(0, 18)}"! 🌱`);
            setCreatureEmotion('excited', 'Bookmark revived!', 'Given a fresh new leaf.');
            refreshAll();
          });
        }
      );
      overviewCards.appendChild(card);
    }

    // D. Recent Reading Point (if any)
    if (currentReading.length > 0) {
      const rp = currentReading[0];
      const card = createCard(
        'return', '📖',
        rp.title || 'Saved reading point',
        `${rp.percentage || '?'}% read · ${rp.url ? new URL(rp.url).hostname : ''}`,
        'Resume', 'primary',
        () => {
          chrome.tabs.create({ url: rp.url }, (tab) => {
            window.close();
          });
        }
      );
      overviewCards.appendChild(card);
    }

    // E. Tab Overload / Bankruptcy Card (if 5+ open tabs)
    const totalOpen = currentTabSummary?.totalTabs || 0;
    if (totalOpen >= 5) {
      const card = createCard(
        'stale', '⏳',
        `Tab Overload (${totalOpen} tabs)`,
        'Declare Bankruptcy & start fresh with zero guilt?',
        'Cleanse', 'amber',
        () => {
          declareTabBankruptcy();
        }
      );
      overviewCards.appendChild(card);
    }

    // Update Creature Speech
    if (isLateNight) {
      setCreatureEmotion('sleepy', 'z Z Z... Sleep Mode Active 😴', 'Tuck tabs for tomorrow and rest your eyes.');
    } else if (totalOpen >= 15) {
      setCreatureEmotion('concerned', `Holding ${totalOpen} tabs...`, 'Declare Tab Bankruptcy for a fresh slate 🍃');
    } else if (decaying.length > 0 && stale.length > 0) {
      setCreatureEmotion('concerned', `${stale.length} stale tabs & ${decaying.length} forgotten bookmarks.`, 'Want to tidy up together?');
    } else if (decaying.length > 0) {
      setCreatureEmotion('curious', `${decaying.length} bookmark feels forgotten 🍂`, 'A quick revival gives it new life.');
    } else if (stale.length > 0) {
      setCreatureEmotion('concerned', `${stale.length} tabs are piling up...`, 'I can safely archive them.');
    } else {
      setCreatureEmotion('happy', 'All quiet for now ✨', 'Nook is watching in the background.');
    }
  }

  function createCard(type, icon, title, sub, btnLabel, btnColor, onClick) {
    const card = document.createElement('div');
    card.className = `card ${type}`;
    card.innerHTML = `
      <span class="card-icon">${icon}</span>
      <div class="card-info">
        <div class="card-title">${title}</div>
        <div class="card-sub">${sub}</div>
      </div>
      <button class="card-action ${btnColor}">${btnLabel}</button>
    `;
    card.addEventListener('click', onClick);
    card.querySelector('.card-action').addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
    return card;
  }

  // ── Render 2: Sessions Tab ──────────────────────────────────────
  function renderSessionsTab() {
    sessionsList.innerHTML = '';
    if (!currentSessions.length) {
      sessionsList.innerHTML = '<div class="empty-state">No saved sessions yet. Use "Group into Session" or save current tabs!</div>';
      return;
    }

    currentSessions.forEach(s => {
      const dateStr = s.savedAt || s.timestamp ? new Date(s.savedAt || s.timestamp).toLocaleDateString(undefined, { month:'short', day:'numeric' }) : '';
      const tabCount = s.tabs?.length || 0;
      const isBankrupt = s.isBankruptcy;
      const badge = isBankrupt ? '<span style="color:#b91c1c;font-weight:800;font-size:9px;background:#fee2e2;padding:2px 5px;border-radius:4px;margin-left:5px">BANKRUPTCY</span>' : '';
      const row = document.createElement('div');
      row.className = 'list-item';
      row.innerHTML = `
        <span class="list-item-icon">${isBankrupt ? '⏳' : '🗂️'}</span>
        <div class="list-item-body">
          <div class="list-item-title">${s.name || 'Unnamed Session'}${badge}</div>
          <div class="list-item-meta">${tabCount} tabs · ${dateStr}</div>
        </div>
        <button class="card-action primary">Restore</button>
      `;
      row.querySelector('button').addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'RESTORE_SESSION', sessionId: s.id }, (res) => {
          showToast(`Restored ${res?.count || tabCount} tabs! 🚀`);
          window.close();
        });
      });
      sessionsList.appendChild(row);
    });
  }

  // ── Render 3: Bookmarks Tab ─────────────────────────────────────
  function renderBookmarksTab() {
    bookmarksList.innerHTML = '';
    if (!currentBookmarks.length) {
      bookmarksList.innerHTML = '<div class="empty-state">No bookmarks found in browser.</div>';
      return;
    }

    // Sort: most decayed first
    const sorted = [...currentBookmarks].sort((a, b) => b.ageDays - a.ageDays);

    sorted.slice(0, 15).forEach(b => {
      const leaf = b.stage === 'decayed' ? '🥀' : (b.stage === 'faded' ? '🍂' : (b.stage === 'aging' ? '🍂' : '🍃'));
      const row = document.createElement('div');
      row.className = 'list-item';
      row.innerHTML = `
        <span class="list-item-icon">${leaf}</span>
        <div class="list-item-body">
          <div class="list-item-title">${b.title || 'Untitled'}</div>
          <div class="list-item-meta">${b.ageDays}d old · ${b.stage} · ${b.url ? new URL(b.url).hostname : ''}</div>
        </div>
        <button class="card-action primary">Revive</button>
      `;
      row.querySelector('button').addEventListener('click', () => {
        chrome.runtime.sendMessage({
          type: 'REVIVE_BOOKMARK',
          id: b.id,
          url: b.url
        }, () => {
          showToast(`Revived "${(b.title || '').slice(0, 16)}"! 🌿`);
          refreshAll();
        });
      });
      bookmarksList.appendChild(row);
    });
  }

  // ── Render 4: Reading Tab ───────────────────────────────────────
  function renderReadingTab() {
    readingList.innerHTML = '';
    if (!currentReading.length) {
      readingList.innerHTML = '<div class="empty-state">No reading points recorded yet. Scroll past 300px on long articles to automatically remember your place!</div>';
      return;
    }

    currentReading.forEach(r => {
      const row = document.createElement('div');
      row.className = 'list-item';
      row.innerHTML = `
        <span class="list-item-icon">📖</span>
        <div class="list-item-body">
          <div class="list-item-title">${r.title || 'Article'}</div>
          <div class="list-item-meta">${r.percentage || 0}% through · ${r.url ? new URL(r.url).hostname : ''}</div>
        </div>
        <button class="card-action primary">Jump Back</button>
      `;
      row.querySelector('button').addEventListener('click', () => {
        chrome.tabs.create({ url: r.url });
        window.close();
      });
      readingList.appendChild(row);
    });
  }

  // ── Button: Group Tabs by Site (Domain) ─────────────────────────
  document.getElementById('btnGroupBySite')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'GROUP_BY_SITE' }, (res) => {
      if (res?.success) {
        const count = res.groups?.length || 0;
        showToast(`Organized into ${count} site group(s)! 🌐`);
        setCreatureEmotion('proud', 'Tabs grouped by site!', 'Every domain has its own color group.');
        refreshAll();
      } else {
        showToast(res?.reason || 'Need 2+ tabs on the same site to group!');
      }
    });
  });

  // ── Button: Group Active Tabs ───────────────────────────────────
  document.getElementById('btnGroupAll')?.addEventListener('click', () => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const valid = tabs.filter(t => t.url && !t.url.startsWith('chrome://'));
      if (valid.length <= 1) {
        showToast('Need 2+ tabs to group!');
        return;
      }
      const title = `Session · ${new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}`;
      chrome.runtime.sendMessage({
        type: 'GROUP_TABS',
        tabIds: valid.map(t => t.id),
        groupTitle: title
      }, () => {
        chrome.runtime.sendMessage({
          type: 'SAVE_SESSION',
          name: title,
          tabIds: valid.map(t => t.id)
        });
        showToast(`Grouped ${valid.length} tabs! 🗂️`);
        refreshAll();
      });
    });
  });

  // ── Button: Save Current Window as Session ───────────────────────
  document.getElementById('btnSaveCurrentSession')?.addEventListener('click', () => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const valid = tabs.filter(t => t.url && !t.url.startsWith('chrome://'));
      const name = prompt('Name this Focus Session:', `Session ${new Date().toLocaleDateString()}`);
      if (!name) return;
      chrome.runtime.sendMessage({
        type: 'SAVE_SESSION',
        name,
        tabIds: valid.map(t => t.id)
      }, () => {
        showToast(`Saved session "${name}"! 💾`);
        refreshAll();
      });
    });
  });

  // ── Button: Show Floating Creature on Page ──────────────────────
  document.getElementById('btnShowWidget')?.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove('nook_widget_hidden');
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            const r = document.getElementById('nook-root');
            if (r) r.style.display = 'block';
          }
        }).catch(() => {});
      }
      showToast('Creature unhidden! 🌱');
      setTimeout(() => window.close(), 600);
    });
  });

  // ── Button: Declare Tab Bankruptcy ─────────────────────────────
  let lastBankruptcyCount = 0;
  let lastBankruptcyName  = '';

  function declareTabBankruptcy() {
    if (!confirm('Declare Tab Bankruptcy? 🍃\n\nAll open tabs will be safely tucked into an archive so you can start completely fresh with zero guilt.\n\nYou can restore them anytime with 1 click!')) {
      return;
    }
    chrome.runtime.sendMessage({ type: 'DECLARE_BANKRUPTCY' }, (res) => {
      if (res?.success) {
        lastBankruptcyCount = res.count;
        lastBankruptcyName  = res.sessionName;
        const modal = document.getElementById('bankruptcyModal');
        const modalDesc = document.getElementById('modalDesc');
        if (modalDesc) {
          modalDesc.innerHTML = `I've tucked all <strong>${res.count} tabs</strong> into <em>"${res.sessionName}"</em>.<br><br>Breathe easy and enjoy your clean slate! 🍃`;
        }
        if (modal) modal.classList.add('open');
        setCreatureEmotion('proud', 'Tab Bankruptcy declared! ✨', 'All tabs safely archived.');
        showToast(`Tucked ${res.count} tabs into safe archive! 🍃`);
        refreshAll();
      } else {
        showToast(res?.reason || 'No open tabs to archive');
      }
    });
  }

  document.getElementById('btnDeclareBankruptcy')?.addEventListener('click', () => {
    declareTabBankruptcy();
  });

  document.getElementById('btnCloseModal')?.addEventListener('click', () => {
    document.getElementById('bankruptcyModal')?.classList.remove('open');
  });

  document.getElementById('btnTweetBankruptcy')?.addEventListener('click', () => {
    const count = lastBankruptcyCount || currentTabSummary?.totalTabs || 24;
    const tweet = `I just declared tab bankruptcy on ${count} tabs using @nook browser companion 🍃\n\nTucked them all into a safe archive and started completely fresh with zero guilt. Cleanest my brain has felt all week.\n\n#TabBankruptcy #BuildInPublic`;
    navigator.clipboard.writeText(tweet).then(() => {
      showToast('Copied tweet! 📋 Opening X...');
    });
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
    chrome.tabs.create({ url: intentUrl });
    document.getElementById('bankruptcyModal')?.classList.remove('open');
  });

  // ── Button: Viral X Status Share ────────────────────────────────
  document.getElementById('btnShareX')?.addEventListener('click', () => {
    const tabsCount = currentTabSummary?.totalTabs || 6;
    const staleCount = currentTabSummary?.staleTabs?.length || 0;
    const decayCount = currentBookmarks.filter(b => b.stage === 'faded' || b.stage === 'decayed').length;

    const tweetText = `🌱 My Nook Browser Terrarium today:
• ${tabsCount} open tabs
• ${decayCount} decaying bookmarks given a second life 🍂
• ${staleCount} stale tabs organized

A local browser companion that quietly remembers what I forgot.
#BuildInPublic #Nook`;

    navigator.clipboard.writeText(tweetText).then(() => {
      showToast('Copied X post to clipboard! 📋');
      setCreatureEmotion('excited', 'Copied your terrarium card!', 'Ready to share on X / Twitter ✨');
    });
  });

  // ── Settings Drawer Toggle ──────────────────────────────────────
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsDrawer = document.getElementById('settingsDrawer');
  const settingsArrow  = document.getElementById('settingsArrow');

  settingsToggle?.addEventListener('click', () => {
    settingsDrawer.classList.toggle('open');
    settingsArrow.classList.toggle('open');
  });

  // ── Export & Clear ──────────────────────────────────────────────
  document.getElementById('btnExport')?.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(null, (d) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }));
        a.download = `nook-backup-${Date.now()}.json`;
        a.click();
        showToast('Exported backup! 📦');
      });
    }
  });

  document.getElementById('btnClear')?.addEventListener('click', () => {
    if (confirm('Clear all Nook data? (Sessions, Return Points, History)')) {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.clear(() => {
          showToast('All data cleared.');
          refreshAll();
        });
      }
    }
  });

  // Initial Load
  refreshAll();
});
