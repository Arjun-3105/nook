/**
 * Nook Toolbar Popup Controller
 * Full interactive suite:
 * - Interactive 3D creature companion
 * - Accordion Fold: 1-click collapse/unfold native tab groups
 * - Tab Intent Notes & Ambient Spotlight Focus Dock
 * - Focus Sessions & Tab Clustering (Grouping & Restoring)
 * - Decaying Bookmarks lifecycle with instant Revive & Evergreen pins
 * - Return Point recent reading list
 * - Guilt-Free Tab Bankruptcy with in-popup confirmation
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

  // Accordion Fold & Intent Elements
  const btnToggleFoldGroups = document.getElementById('btnToggleFoldGroups');
  const toggleFoldText      = document.getElementById('toggleFoldText');
  const foldBadge           = document.getElementById('foldBadge');
  const foldIcon            = document.getElementById('foldIcon');
  const currentTabLabel     = document.getElementById('currentTabLabel');
  const inputTabIntent      = document.getElementById('inputTabIntent');
  const btnSaveIntent       = document.getElementById('btnSaveIntent');
  const spotlightStatusTag  = document.getElementById('spotlightStatusTag');
  const activeSpotlightContainer = document.getElementById('activeSpotlightContainer');
  const intentsCounter      = document.getElementById('intentsCounter');
  const intentsList         = document.getElementById('intentsList');
  const currentTabTagStatus = document.getElementById('currentTabTagStatus');
  const inputQuickTask      = document.getElementById('inputQuickTask');
  const btnAddQuickTask     = document.getElementById('btnAddQuickTask');
  const btnAttachTabAsTask  = document.getElementById('btnAttachTabAsTask');
  const quickTasksList      = document.getElementById('quickTasksList');
  const bentoProgressBadge  = document.getElementById('bentoProgressBadge');
  const globalSearchInput   = document.getElementById('globalSearchInput');
  const btnSearchClear      = document.getElementById('btnSearchClear');
  const panelSearch         = document.getElementById('panelSearch');
  const searchResultsList   = document.getElementById('searchResultsList');
  const searchCountBadge    = document.getElementById('searchCountBadge');

  let currentTabSummary = null;
  let currentBookmarks  = [];
  let currentSessions   = [];
  let currentReading    = [];
  let currentMorningQueue = [];
  let currentTasks      = [];
  let currentBookmarkFilter = 'all';
  let activeWindowTab   = null;

  // ── Tab Switching ───────────────────────────────────────────────
  const navPills = document.querySelectorAll('.nav-pill');
  const panels = {
    overview:  document.getElementById('panelOverview'),
    intents:   document.getElementById('panelIntents'),
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

  // Bookmark filter pills
  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach(btn => {
    btn.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      currentBookmarkFilter = btn.dataset.filter || 'all';
      renderBookmarksTab();
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
      default:   () => {},
      happy:     () => {},
      sleepy:    () => {
        [sEyeL, sEyeR].forEach(e => { e.style.height='2.5px'; e.style.borderRadius='3px 3px 0 0'; });
        sMouth.style.width='7px'; sMouth.style.height='3.5px';
      },
      tired:     () => {
        [sEyeL, sEyeR].forEach(e => { e.style.height='3px'; e.style.borderRadius='3px 3px 0 0'; });
        sMouth.style.width='8px'; sMouth.style.height='3px';
      },
      bored:     () => {
        [sEyeL, sEyeR].forEach(e => { e.style.height='4px'; e.style.borderRadius='2px'; });
        sMouth.style.width='8px'; sMouth.style.height='2px'; sMouth.style.borderBottom='2px solid #2d1f0e';
      },
      concerned: () => {
        [sEyeL, sEyeR].forEach(e => { e.style.width='5px'; e.style.height='8px'; e.style.borderRadius='40%'; });
        sMouth.style.borderRadius='10px 10px 0 0'; sMouth.style.borderTop='2px solid #2d1f0e';
        sMouth.style.borderBottom='none'; sMouth.style.width='10px';
      },
      confused:  () => {
        sEyeL.style.width='8px'; sEyeL.style.height='8px';
        sEyeR.style.width='4px'; sEyeR.style.height='4px';
        sMouth.style.borderRadius='50%'; sMouth.style.width='5px'; sMouth.style.height='5px';
      },
      curious: () => { sEyeL.style.width='9px'; sEyeL.style.height='9px'; },
      excited: () => {
        sMouth.style.width='16px'; sMouth.style.height='8px';
      },
      focused: () => {
        [sEyeL, sEyeR].forEach(e => { e.style.width='6px'; e.style.height='5px'; });
        sMouth.style.width='8px'; sMouth.style.height='2px';
      },
      reading: () => {
        [sEyeL, sEyeR].forEach(e => { e.style.height='3px'; e.style.borderRadius='0 0 3px 3px'; });
        sMouth.style.width='8px'; sMouth.style.height='4px';
      },
      thinking: () => {
        sEyeL.style.transform = 'translateY(-2px)';
        sMouth.style.borderRadius='50%'; sMouth.style.width='5px'; sMouth.style.height='5px';
      },
      proud: () => {
        sMouth.style.width='18px'; sMouth.style.height='9px';
        statusBody.style.boxShadow='inset -3px -3px 7px rgba(180,140,90,.25),inset 3px 3px 6px rgba(255,255,255,.9),0 0 16px rgba(74,222,128,.5),0 5px 14px rgba(100,70,20,.16)';
      },
      cheering: () => {
        sMouth.style.width='18px'; sMouth.style.height='10px';
        statusBody.style.boxShadow='0 0 18px rgba(250,204,21,.6)';
      },
      love: () => {
        [sEyeL, sEyeR].forEach(e => { e.style.borderRadius='50% 50% 0 0'; e.style.height='5px'; });
        sMouth.style.width='10px'; sMouth.style.height='6px';
        statusBody.style.boxShadow='0 0 16px rgba(244,114,182,.5)';
      },
      motivated: () => {
        [sEyeL, sEyeR].forEach(e => { e.style.width='7px'; e.style.height='6px'; });
        sMouth.style.width='14px'; sMouth.style.height='7px';
      },
      productive: () => {
        sMouth.style.width='14px'; sMouth.style.height='7px';
        statusBody.style.boxShadow='0 0 16px rgba(34,197,94,.4)';
      },
      sad: () => {
        [sEyeL, sEyeR].forEach(e => { e.style.borderRadius='50% 50% 0 0'; e.style.height='4px'; });
        sMouth.style.borderRadius='8px 8px 0 0'; sMouth.style.borderTop='2px solid #2d1f0e'; sMouth.style.borderBottom='none';
      },
      decaying: () => {
        [sEyeL, sEyeR].forEach(e => { e.style.height='3px'; });
        sMouth.style.borderRadius='8px 8px 0 0'; sMouth.style.borderTop='2px solid #2d1f0e'; sMouth.style.borderBottom='none';
      },
      content: () => {
        [sEyeL, sEyeR].forEach(e => { e.style.height='3px'; e.style.borderRadius='3px 3px 0 0'; });
        sMouth.style.width='10px'; sMouth.style.height='5px';
      }
    };
    (emo[name] || emo.happy)();
    if (title) statusTitle.textContent = title;
    if (sub)   statusSub.textContent   = sub;
  }

  // ── Creature Poke ───────────────────────────────────────────────
  const creatureCard = document.getElementById('creatureCard');
  const pokeQuotes = [
    { emo: 'excited',    title: 'Hehe, that tickles!', sub: 'Watching your tabs closely ✨' },
    { emo: 'proud',      title: 'Keeping your browser cozy.', sub: 'Clean tabs, clear head 🌱' },
    { emo: 'focused',    title: 'Deep in the zone!', sub: 'Distraction-free browsing dock 🎯' },
    { emo: 'reading',    title: 'I saved your scroll depth.', sub: 'Jump Back anytime you return 📖' },
    { emo: 'curious',    title: 'Whatcha exploring today?', sub: 'I will remember where you stop 🔍' },
    { emo: 'productive', title: 'Crushing your missions!', sub: 'Bento To-Do board updated 🍱' },
    { emo: 'love',       title: 'Cozy browsing vibes.', sub: '100% on-device private memory 💚' },
    { emo: 'happy',      title: 'All systems green!', sub: 'Nook is quietly helping in background 🌿' }
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
      updateFoldButtonState(res);
      renderIntentsTab();
      renderOverview();
    });

    // Active Window Tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        activeWindowTab = tabs[0];
        if (currentTabLabel) {
          currentTabLabel.textContent = `Current: ${tabs[0].title || tabs[0].url}`;
          currentTabLabel.title = tabs[0].url;
        }
        if (currentTabSummary?.tabIntents && currentTabSummary.tabIntents[tabs[0].url] && inputTabIntent) {
          if (!inputTabIntent.value) {
            inputTabIntent.value = currentTabSummary.tabIntents[tabs[0].url].intent || '';
          }
        }
        renderIntentsTab();
      }
    });

    // 2. Bookmarks Lifecycle
    chrome.runtime.sendMessage({ type: 'GET_BOOKMARKS_LIFECYCLE' }, (res) => {
      if (!res?.bookmarks) return;
      currentBookmarks = res.bookmarks;
      const decaying = currentBookmarks.filter(b => (b.stage === 'faded' || b.stage === 'decayed') && !b.isEvergreen);
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

    // 6. Quick Tasks
    chrome.runtime.sendMessage({ type: 'GET_TASKS' }, (res) => {
      currentTasks = res?.tasks || [];
      renderTasks();
    });
  }

  // ── Render 1: Overview Tab ──────────────────────────────────────
  function renderOverview() {
    overviewCards.innerHTML = '';
    const stale    = currentTabSummary?.staleTabs || [];
    const clusters = (currentTabSummary?.clusters || []).filter(cl => {
      const ungrouped = (cl.tabs || []).filter(t => !t.groupId || t.groupId <= 0);
      return ungrouped.length >= 2;
    });
    const siteGroups = (currentTabSummary?.siteGroups || []).filter(sg => {
      const ungrouped = (sg.tabs || []).filter(t => !t.groupId || t.groupId <= 0);
      return ungrouped.length >= 2;
    });
    const decaying = currentBookmarks.filter(b => (b.stage === 'faded' || b.stage === 'decayed') && !b.isEvergreen);
    const activeSpotlight = currentTabSummary?.activeSpotlight;

    // 0. Active Spotlight Priority Focus Card
    if (activeSpotlight) {
      const card = createCard(
        'return', '🎯',
        `Spotlight: ${activeSpotlight.goal || activeSpotlight.title}`,
        'Active priority focus · Kept alive with zero tab closing',
        'Done ✓', 'primary',
        () => {
          chrome.runtime.sendMessage({ type: 'COMPLETE_SPOTLIGHT' }, () => {
            showToast('Spotlight mission complete! Great work 🎉');
            setCreatureEmotion('proud', 'Mission accomplished! ✨', 'Spotlight completed.');
            refreshAll();
          });
        }
      );
      overviewCards.appendChild(card);
    }

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

    // A. Focus Cluster Card (if 2+ related ungrouped tabs found)
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

    // B. Per-Site Grouping Nudges (if any site has 2+ ungrouped tabs)
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

    // C. Stale Tabs Nudge (if any)
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

    // D. Decaying Bookmark Nudge (if any)
    if (decaying.length > 0) {
      const b = decaying[0];
      const leaf = b.stage === 'decayed' ? '🥀' : '🍂';
      const card = document.createElement('div');
      card.className = 'card decay';
      card.innerHTML = `
        <span class="card-icon">${leaf}</span>
        <div class="card-info">
          <div class="card-title">${(b.title || 'Bookmark').slice(0, 24)}</div>
          <div class="card-sub">${b.ageDays}d forgotten · ${b.url ? new URL(b.url).hostname : ''}</div>
        </div>
        <div style="display:flex; gap:4px; flex-shrink:0;">
          <button class="card-action evergreen-btn" id="btnEvergreenNudge" title="Keep forever — exempt from decay">⭐ Forever</button>
          <button class="card-action primary" id="btnReviveNudge">Revive</button>
        </div>
      `;
      card.querySelector('#btnReviveNudge')?.addEventListener('click', (e) => {
        e.stopPropagation();
        chrome.runtime.sendMessage({
          type: 'REVIVE_BOOKMARK',
          id: b.id,
          url: b.url
        }, () => {
          showToast(`Revived "${(b.title || '').slice(0, 18)}"! 🌱`);
          setCreatureEmotion('excited', 'Bookmark revived!', 'Given a fresh new leaf.');
          refreshAll();
        });
      });
      card.querySelector('#btnEvergreenNudge')?.addEventListener('click', (e) => {
        e.stopPropagation();
        chrome.runtime.sendMessage({
          type: 'TOGGLE_EVERGREEN_BOOKMARK',
          id: b.id
        }, (res) => {
          showToast(`Marked as Evergreen! 🌲`);
          setCreatureEmotion('happy', 'Kept forever! 🌲', 'This bookmark will never decay.');
          refreshAll();
        });
      });
      overviewCards.appendChild(card);
    }

    // E. Recent Reading Point (if any)
    if (currentReading.length > 0) {
      const rp = currentReading[0];
      const card = createCard(
        'return', '📖',
        rp.title || 'Saved reading point',
        `${rp.percentage || '?'}% read · ${rp.url ? new URL(rp.url).hostname : ''}`,
        'Resume', 'primary',
        () => {
          jumpBackToReadingPoint(rp);
        }
      );
      overviewCards.appendChild(card);
    }

    // F. Tab Overload / Fold Groups Card (if 6+ open tabs)
    const totalOpen = currentTabSummary?.totalTabs || 0;
    if (totalOpen >= 6) {
      const card = createCard(
        'stale', '📁',
        `Tabs Piling Up (${totalOpen} tabs)`,
        'Fold inactive groups or declare a clean slate.',
        'Clean Slate', 'amber',
        () => {
          declareTabBankruptcy();
        }
      );
      overviewCards.appendChild(card);
    }

    // Update Creature Speech
    if (isLateNight) {
      setCreatureEmotion('sleepy', 'z Z Z... Sleep Mode Active 😴', 'Tuck tabs for tomorrow and rest your eyes.');
    } else if (activeSpotlight) {
      setCreatureEmotion('excited', `Focus Spotlight: "${(activeSpotlight.goal || activeSpotlight.title).slice(0, 20)}" 🎯`, 'Background tabs stay alive in memory — zero pressure.');
    } else if (totalOpen >= 15) {
      const foldedCount = currentTabSummary?.collapsedGroupsCount || 0;
      if (foldedCount > 0) {
        setCreatureEmotion('happy', `Holding ${totalOpen} tabs · ${foldedCount} group(s) folded 📁`, 'Tab bar clean! Pick a Spotlight tab to stay in flow 🎯');
      } else {
        setCreatureEmotion('curious', `Holding ${totalOpen} tabs...`, 'Fold background groups or set a Spotlight goal 🎯');
      }
    } else if (decaying.length > 0 && stale.length > 0) {
      setCreatureEmotion('concerned', `${stale.length} stale tabs & ${decaying.length} forgotten bookmarks.`, 'Want to tidy up together?');
    } else if (decaying.length > 0) {
      setCreatureEmotion('curious', `${decaying.length} bookmark feels forgotten 🍂`, 'A quick revival gives it new life.');
    } else if (stale.length > 0) {
      setCreatureEmotion('concerned', `${stale.length} tabs are piling up...`, 'I can safely archive or fold them.');
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

  // ── Accordion Fold Controller ───────────────────────────────────
  function updateFoldButtonState(res) {
    if (!btnToggleFoldGroups) return;
    const groupsCount = res?.groupsCount || 0;
    const collapsedCount = res?.collapsedGroupsCount || 0;
    if (groupsCount === 0) {
      if (toggleFoldText) toggleFoldText.textContent = 'Fold Tab Groups';
      if (foldBadge) {
        foldBadge.textContent = '0 groups';
        foldBadge.style.background = '#f1f5f9';
        foldBadge.style.color = '#64748b';
      }
      if (foldIcon) foldIcon.textContent = '📁';
    } else if (collapsedCount === groupsCount) {
      if (toggleFoldText) toggleFoldText.textContent = 'Unfold All Groups';
      if (foldBadge) {
        foldBadge.textContent = `${collapsedCount} folded`;
        foldBadge.style.background = '#dcfce7';
        foldBadge.style.color = '#15803d';
      }
      if (foldIcon) foldIcon.textContent = '📂';
    } else {
      if (toggleFoldText) toggleFoldText.textContent = 'Fold All Groups';
      if (foldBadge) {
        foldBadge.textContent = `${groupsCount} groups`;
        foldBadge.style.background = '#e0e7ff';
        foldBadge.style.color = '#4338ca';
      }
      if (foldIcon) foldIcon.textContent = '📁';
    }
  }

  btnToggleFoldGroups?.addEventListener('click', () => {
    const groupsCount = currentTabSummary?.groupsCount || 0;
    if (groupsCount === 0) {
      showToast('Group related tabs or by site first to fold! 🗂️');
      return;
    }
    chrome.runtime.sendMessage({ type: 'TOGGLE_FOLD_GROUPS' }, (res) => {
      if (res?.success) {
        const action = res.collapsed ? 'Folded' : 'Unfolded';
        showToast(`${action} ${res.count} tab group(s)! 📁`);
        setCreatureEmotion('proud', `${action} ${res.count} tab groups!`, res.collapsed ? 'Tab bar is tidy and compact ✨' : 'Tab groups expanded.');
        refreshAll();
      } else {
        showToast(res?.reason || 'Could not toggle tab groups');
      }
    });
  });

  // ── Render 2: Focus & Tags Tab ──────────────────────────────────
  function renderIntentsTab() {
    if (!intentsList || !activeSpotlightContainer) return;
    const intents = currentTabSummary?.tabIntents || {};
    const spotlight = currentTabSummary?.activeSpotlight;
    const allTabs = [...(currentTabSummary?.activeTabs || []), ...(currentTabSummary?.staleTabs || [])];

    // 1. Render Spotlight container
    activeSpotlightContainer.innerHTML = '';
    if (spotlight) {
      if (spotlightStatusTag) {
        spotlightStatusTag.textContent = 'Active 🎯';
        spotlightStatusTag.style.color = '#15803d';
      }
      const card = document.createElement('div');
      card.className = 'spotlight-card';
      const hostname = spotlight.activeTabUrl ? (() => { try { return new URL(spotlight.activeTabUrl).hostname; } catch { return ''; } })() : '';
      card.innerHTML = `
        <span class="spotlight-icon">🎯</span>
        <div class="spotlight-info">
          <div class="spotlight-goal">${spotlight.goal || spotlight.title}</div>
          <div class="spotlight-sub">${hostname ? hostname + ' · ' : ''}Spotlight Focus Mode (Distractions Folded)</div>
        </div>
        <div style="display:flex; gap:5px; flex-shrink:0;">
          <button class="btn-jump-tab" id="btnJumpSpotlight" title="Switch to this tab">Jump ↗</button>
          <button class="btn-spotlight-done" id="btnCompleteSpotlight" title="Mark spotlight goal as completed">✓ Done</button>
        </div>
      `;
      card.querySelector('#btnJumpSpotlight')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (spotlight.tabId) {
          chrome.tabs.update(spotlight.tabId, { active: true });
          window.close();
        } else if (spotlight.activeTabUrl) {
          chrome.tabs.query({ currentWindow: true }, tabs => {
            const found = tabs.find(t => t.url === spotlight.activeTabUrl);
            if (found) {
              chrome.tabs.update(found.id, { active: true });
              window.close();
            }
          });
        }
      });
      card.querySelector('#btnCompleteSpotlight')?.addEventListener('click', (e) => {
        e.stopPropagation();
        chrome.runtime.sendMessage({ type: 'COMPLETE_SPOTLIGHT' }, () => {
          showToast('Spotlight mission completed! 🎉');
          setCreatureEmotion('proud', 'Mission accomplished! ✨', 'Spotlight cleared.');
          refreshAll();
        });
      });
      activeSpotlightContainer.appendChild(card);
    } else {
      if (spotlightStatusTag) {
        spotlightStatusTag.textContent = 'None active';
        spotlightStatusTag.style.color = '#94a3b8';
      }
      const card = document.createElement('div');
      card.className = 'quick-focus-card';
      const curTitle = activeWindowTab?.title || 'current tab';
      const cleanTitle = curTitle.length > 28 ? curTitle.slice(0, 26) + '…' : curTitle;
      card.innerHTML = `
        <div class="quick-focus-info">
          <div class="quick-focus-title">🎯 Spotlight Focus</div>
          <div class="quick-focus-desc">Lock into “${cleanTitle}” and quiet background tabs</div>
        </div>
        <button class="btn-quick-focus" id="btnQuickFocusCurrent">🎯 Focus Tab</button>
      `;
      card.querySelector('#btnQuickFocusCurrent')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!activeWindowTab) {
          showToast('No active tab to focus');
          return;
        }
        const goal = (intents[activeWindowTab.url]?.intent) || activeWindowTab.title || 'Focus';
        chrome.runtime.sendMessage({
          type: 'SET_SPOTLIGHT',
          spotlight: {
            title: goal,
            goal: goal,
            activeTabUrl: activeWindowTab.url,
            tabId: activeWindowTab.id
          }
        }, () => {
          showToast(`Spotlight focused on "${goal.slice(0, 18)}" 🎯`);
          setCreatureEmotion('excited', 'Focus Spotlight locked!', 'Distracting tabs folded into background.');
          refreshAll();
        });
      });
      activeSpotlightContainer.appendChild(card);
    }

    // 2. Render Active Tab Tag Info
    if (currentTabLabel) {
      currentTabLabel.textContent = activeWindowTab ? `Current: ${activeWindowTab.title || activeWindowTab.url}` : 'Tab: None active';
      if (activeWindowTab?.url) currentTabLabel.title = activeWindowTab.url;
    }
    if (currentTabTagStatus) {
      const activeEnriched = currentTabSummary?.activeTabs?.find(t => t.id === activeWindowTab?.id);
      const existingTag = activeEnriched?.group?.title || intents[activeWindowTab?.url]?.intent;
      if (existingTag) {
        currentTabTagStatus.style.display = 'flex';
        currentTabTagStatus.innerHTML = `
          <span>🏷️ Tag on tab: <strong class="tag-badge ${activeEnriched?.group?.color || 'blue'}">${existingTag}</strong></span>
          <button class="btn-remove-tag" id="btnRemoveCurrentTag" title="Remove tag and ungroup tab in Chrome">✕ Remove</button>
        `;
        currentTabTagStatus.querySelector('#btnRemoveCurrentTag')?.addEventListener('click', () => {
          saveTabTag('');
        });
      } else {
        currentTabTagStatus.style.display = 'none';
      }
    }

    // 3. Render Open Tabs with Tags List
    intentsList.innerHTML = '';
    const uniqueTabs = [];
    const seenIds = new Set();
    for (const t of allTabs) {
      if (!seenIds.has(t.id)) {
        seenIds.add(t.id);
        uniqueTabs.push(t);
      }
    }

    let taggedCount = 0;
    uniqueTabs.forEach(t => {
      if (t.group?.title || intents[t.url]?.intent) taggedCount++;
    });
    if (intentsCounter) intentsCounter.textContent = `${taggedCount} tagged · ${uniqueTabs.length} tabs`;

    if (!uniqueTabs.length) {
      intentsList.innerHTML = '<div class="empty-state">No open tabs found in window.</div>';
    } else {
      // Sort: spotlight tab, then tagged tabs, then rest
      uniqueTabs.sort((a, b) => {
        const aSpot = spotlight && (spotlight.tabId === a.id || spotlight.activeTabUrl === a.url);
        const bSpot = spotlight && (spotlight.tabId === b.id || spotlight.activeTabUrl === b.url);
        if (aSpot !== bSpot) return aSpot ? -1 : 1;
        const aHas = !!(a.group?.title || intents[a.url]?.intent);
        const bHas = !!(b.group?.title || intents[b.url]?.intent);
        if (aHas !== bHas) return aHas ? -1 : 1;
        return 0;
      });

      uniqueTabs.slice(0, 30).forEach(tab => {
        const tag = tab.group?.title || intents[tab.url]?.intent;
        const isSpotlightTab = spotlight && (spotlight.tabId === tab.id || spotlight.activeTabUrl === tab.url);
        const star = isSpotlightTab ? '🎯' : (tag ? '🏷️' : '🌐');
        const domain = tab.url ? (() => { try { return new URL(tab.url).hostname; } catch { return ''; } })() : '';
        const tagBadgeHtml = tag ? `<span class="tag-badge ${tab.group?.color || 'blue'}">${tag}</span>` : '';

        const row = document.createElement('div');
        row.className = 'list-item';
        row.innerHTML = `
          <span class="list-item-icon">${star}</span>
          <div class="list-item-body">
            <div class="list-item-title">${tab.title || 'Tab'} ${tagBadgeHtml}</div>
            <div class="list-item-meta">${domain}</div>
          </div>
          <div style="display:flex; gap:4px; flex-shrink:0;">
            <button class="card-action spotlight-btn btn-make-spotlight" title="Lock in and focus this tab">
              ${isSpotlightTab ? 'Active' : '🎯 Focus'}
            </button>
          </div>
        `;

        row.querySelector('.btn-make-spotlight')?.addEventListener('click', (e) => {
          e.stopPropagation();
          const goal = tag || tab.title || 'Focus Task';
          chrome.runtime.sendMessage({
            type: 'SET_SPOTLIGHT',
            spotlight: {
              title: goal,
              goal: goal,
              activeTabUrl: tab.url,
              tabId: tab.id
            }
          }, () => {
            showToast(`Spotlight focused: "${goal.slice(0, 18)}" 🎯`);
            setCreatureEmotion('excited', 'Focus Spotlight set!', `Target: "${goal.slice(0, 22)}"`);
            refreshAll();
          });
        });

        row.addEventListener('click', () => {
          chrome.tabs.update(tab.id, { active: true });
          window.close();
        });

        intentsList.appendChild(row);
      });
    }

    renderTasks();
  }

  // ── Tab Tagging Helper ───────────────────────────────────────────
  function saveTabTag(tagText) {
    if (!activeWindowTab || !activeWindowTab.url) {
      showToast('No active tab to set tag for');
      return;
    }
    const cleanTag = (tagText !== undefined ? tagText : (inputTabIntent?.value || '')).trim();
    chrome.runtime.sendMessage({
      type: 'SET_TAB_INTENT',
      url: activeWindowTab.url,
      title: activeWindowTab.title,
      tabId: activeWindowTab.id,
      intent: cleanTag
    }, (res) => {
      if (res?.success) {
        if (cleanTag) {
          showToast(`Tagged tab: "${cleanTag.slice(0, 18)}" 🏷️`);
          setCreatureEmotion('excited', 'Tab tagged in Chrome!', `"${cleanTag.slice(0, 20)}"`);
        } else {
          showToast('Tag removed from tab');
        }
        if (inputTabIntent) inputTabIntent.value = '';
        refreshAll();
      }
    });
  }

  btnSaveIntent?.addEventListener('click', () => saveTabTag());
  inputTabIntent?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveTabTag();
  });

  document.querySelectorAll('.tag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      saveTabTag(chip.dataset.tag);
    });
  });

  // ── Quick Tasks Management ──────────────────────────────────────
  function renderTasks() {
    if (!quickTasksList) return;
    quickTasksList.innerHTML = '';
    const total = currentTasks.length;
    const completed = currentTasks.filter(t => t.done).length;
    if (bentoProgressBadge) {
      bentoProgressBadge.textContent = `${completed}/${total} completed`;
    }

    if (!total) {
      quickTasksList.innerHTML = '<div class="bento-empty-prompt">No tasks yet. Jot a quick to-do or attach your tab!</div>';
      return;
    }

    currentTasks.forEach((task, idx) => {
      const item = document.createElement('div');
      item.className = `bento-task-item ${task.done ? 'completed' : ''}`;
      const tabMetaHtml = task.tabUrl ? `<span class="bento-task-meta" title="Jump to linked tab">🔗 Tab</span>` : '';
      item.innerHTML = `
        <input type="checkbox" class="bento-checkbox" ${task.done ? 'checked' : ''} />
        <span class="bento-task-text">${task.text}</span>
        ${tabMetaHtml}
        <button class="bento-task-del" title="Delete task">✕</button>
      `;

      item.querySelector('.bento-checkbox').addEventListener('change', (e) => {
        task.done = e.target.checked;
        saveTasks();
      });

      if (task.tabUrl) {
        item.querySelector('.bento-task-meta')?.addEventListener('click', (e) => {
          e.stopPropagation();
          chrome.tabs.query({ currentWindow: true }, tabs => {
            const found = tabs.find(t => t.url === task.tabUrl);
            if (found) {
              chrome.tabs.update(found.id, { active: true });
              window.close();
            } else {
              chrome.tabs.create({ url: task.tabUrl });
              window.close();
            }
          });
        });
      }

      item.querySelector('.bento-task-del').addEventListener('click', (e) => {
        e.stopPropagation();
        currentTasks.splice(idx, 1);
        saveTasks();
      });

      quickTasksList.appendChild(item);
    });
  }

  function saveTasks() {
    chrome.runtime.sendMessage({ type: 'SAVE_TASKS', tasks: currentTasks }, () => {
      renderTasks();
    });
  }

  function addQuickTask(text, tabUrl = null) {
    const val = (text || '').trim();
    if (!val) return;
    currentTasks.unshift({
      id: Date.now(),
      text: val,
      done: false,
      tabUrl: tabUrl || null
    });
    saveTasks();
    showToast('Task added! 📋');
    if (inputQuickTask) inputQuickTask.value = '';
  }

  btnAddQuickTask?.addEventListener('click', () => {
    addQuickTask(inputQuickTask?.value);
  });
  inputQuickTask?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addQuickTask(inputQuickTask?.value);
  });
  btnAttachTabAsTask?.addEventListener('click', () => {
    if (activeWindowTab) {
      addQuickTask(activeWindowTab.title || 'Review active tab', activeWindowTab.url);
    } else {
      showToast('No active tab to attach');
    }
  });

  // ── Universal Search ─────────────────────────────────────────────
  if (globalSearchInput) {
    let lastTabBeforeSearch = 'overview';

    globalSearchInput.addEventListener('input', () => {
      const q = globalSearchInput.value.trim().toLowerCase();
      if (!q) {
        if (btnSearchClear) btnSearchClear.style.display = 'none';
        if (panelSearch) panelSearch.style.display = 'none';
        switchTab(lastTabBeforeSearch);
        return;
      }

      if (btnSearchClear) btnSearchClear.style.display = 'block';
      const activeNav = document.querySelector('.nav-pill.active');
      if (activeNav && activeNav.dataset.tab !== 'search') {
        lastTabBeforeSearch = activeNav.dataset.tab;
      }

      Object.values(panels).forEach(p => p?.classList.remove('active'));
      if (panelSearch) panelSearch.style.display = 'block';
      navPills.forEach(p => p.classList.remove('active'));

      renderSearchResults(q);
    });

    btnSearchClear?.addEventListener('click', () => {
      globalSearchInput.value = '';
      btnSearchClear.style.display = 'none';
      if (panelSearch) panelSearch.style.display = 'none';
      switchTab(lastTabBeforeSearch);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== globalSearchInput && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        globalSearchInput.focus();
      }
      if (e.key === 'Escape' && document.activeElement === globalSearchInput) {
        globalSearchInput.value = '';
        if (btnSearchClear) btnSearchClear.style.display = 'none';
        if (panelSearch) panelSearch.style.display = 'none';
        switchTab(lastTabBeforeSearch);
      }
    });
  }

  function renderSearchResults(q) {
    if (!searchResultsList) return;
    searchResultsList.innerHTML = '';
    const results = [];

    // 1. Open tabs
    const allTabs = [...(currentTabSummary?.activeTabs || []), ...(currentTabSummary?.staleTabs || [])];
    allTabs.forEach(t => {
      if ((t.title && t.title.toLowerCase().includes(q)) || (t.url && t.url.toLowerCase().includes(q))) {
        results.push({ type: 'tab', icon: '🌐', title: t.title || t.url, sub: 'Open tab', tabId: t.id });
      }
    });

    // 2. Reading points
    (currentReading || []).forEach(r => {
      if ((r.title && r.title.toLowerCase().includes(q)) || (r.url && r.url.toLowerCase().includes(q))) {
        results.push({ type: 'reading', icon: '📖', title: r.title || r.url, sub: `Reading Point (${r.percentage || 0}%)`, item: r });
      }
    });

    // 3. Bookmarks
    (currentBookmarks || []).forEach(b => {
      if ((b.title && b.title.toLowerCase().includes(q)) || (b.url && b.url.toLowerCase().includes(q))) {
        results.push({ type: 'bookmark', icon: '🍂', title: b.title, sub: `Bookmark · ${b.stage}`, url: b.url });
      }
    });

    // 4. Tasks
    (currentTasks || []).forEach(task => {
      if (task.text && task.text.toLowerCase().includes(q)) {
        results.push({ type: 'task', icon: '📋', title: task.text, sub: task.done ? 'Task (Completed)' : 'Task (Pending)' });
      }
    });

    if (searchCountBadge) searchCountBadge.textContent = `${results.length} matches`;

    if (!results.length) {
      searchResultsList.innerHTML = '<div class="empty-state">No matching tabs, bookmarks, reading points, or tasks found.</div>';
      return;
    }

    results.slice(0, 20).forEach(item => {
      const row = document.createElement('div');
      row.className = 'list-item';
      row.innerHTML = `
        <span class="list-item-icon">${item.icon}</span>
        <div class="list-item-body">
          <div class="list-item-title">${item.title}</div>
          <div class="list-item-meta">${item.sub}</div>
        </div>
      `;
      row.addEventListener('click', () => {
        if (item.type === 'tab' && item.tabId) {
          chrome.tabs.update(item.tabId, { active: true });
          window.close();
        } else if (item.type === 'bookmark' && item.url) {
          chrome.tabs.create({ url: item.url });
          window.close();
        } else if (item.type === 'reading' && item.item) {
          restoreReadingPosition(item.item);
        } else if (item.type === 'task') {
          globalSearchInput.value = '';
          if (btnSearchClear) btnSearchClear.style.display = 'none';
          if (panelSearch) panelSearch.style.display = 'none';
          switchTab('intents');
        }
      });
      searchResultsList.appendChild(row);
    });
  }

  // ── Render 3: Sessions Tab ──────────────────────────────────────
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

  // ── Render 4: Bookmarks Tab ─────────────────────────────────────
  function renderBookmarksTab() {
    bookmarksList.innerHTML = '';
    if (!currentBookmarks.length) {
      bookmarksList.innerHTML = '<div class="empty-state">No bookmarks found in browser.</div>';
      return;
    }

    let filtered = [...currentBookmarks];
    if (currentBookmarkFilter === 'decaying') {
      filtered = filtered.filter(b => (b.stage === 'faded' || b.stage === 'decayed') && !b.isEvergreen);
    } else if (currentBookmarkFilter === 'evergreen') {
      filtered = filtered.filter(b => b.isEvergreen);
    }

    if (!filtered.length) {
      const msg = currentBookmarkFilter === 'evergreen' 
        ? 'No evergreen bookmarks yet. Click "⭐ Forever" on any bookmark to keep it permanently!'
        : (currentBookmarkFilter === 'decaying' ? 'No decaying bookmarks! All bookmarks are fresh or evergreen ✨' : 'No bookmarks found.');
      bookmarksList.innerHTML = `<div class="empty-state">${msg}</div>`;
      return;
    }

    filtered.sort((a, b) => {
      if (a.isEvergreen !== b.isEvergreen) return a.isEvergreen ? 1 : -1;
      return b.ageDays - a.ageDays;
    });

    filtered.slice(0, 40).forEach(b => {
      const isEg = !!b.isEvergreen;
      const leaf = isEg ? '🌲' : (b.stage === 'decayed' ? '🥀' : (b.stage === 'faded' ? '🍂' : (b.stage === 'aging' ? '🍂' : '🍃')));
      const stageText = isEg ? '🌲 Evergreen · Kept Forever' : `${b.ageDays}d old · ${b.stage}`;
      const row = document.createElement('div');
      row.className = 'list-item';
      row.innerHTML = `
        <span class="list-item-icon">${leaf}</span>
        <div class="list-item-body">
          <div class="list-item-title">${b.title || 'Untitled'}</div>
          <div class="list-item-meta">${stageText} · ${b.url ? new URL(b.url).hostname : ''}</div>
        </div>
        <div style="display:flex; gap:4px; flex-shrink:0;">
          <button class="card-action ${isEg ? 'evergreen-active' : 'evergreen-btn'} btn-toggle-evergreen" title="${isEg ? 'Kept forever (Click to remove)' : 'Keep forever (Never decays)'}">
            ${isEg ? '🌲 Kept' : '⭐ Forever'}
          </button>
          ${!isEg ? '<button class="card-action primary btn-revive">Revive</button>' : ''}
        </div>
      `;

      row.querySelector('.btn-toggle-evergreen')?.addEventListener('click', (e) => {
        e.stopPropagation();
        chrome.runtime.sendMessage({
          type: 'TOGGLE_EVERGREEN_BOOKMARK',
          id: b.id
        }, (res) => {
          showToast(res?.isEvergreen ? `Saved "${(b.title || '').slice(0, 16)}" forever! 🌲` : `Removed from Evergreen.`);
          refreshAll();
        });
      });

      row.querySelector('.btn-revive')?.addEventListener('click', (e) => {
        e.stopPropagation();
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

  // ── Helper: Format Time Ago ─────────────────────────────────────
  function formatTimeAgo(ts) {
    if (!ts) return '';
    const diff = Math.max(0, Date.now() - ts);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  // ── Jump Back: Open/Switch Tab + Smooth Scroll + Area Highlight ──
  function jumpBackToReadingPoint(r) {
    if (!r || !r.url) return;
    const targetUrl = r.url;
    const targetScrollY = typeof r.scrollY === 'number' ? r.scrollY : 0;
    const targetPercentage = r.percentage || 0;
    const targetTitle = r.title || 'Article';

    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      // Find open tab that matches target URL (ignoring hash)
      const targetBase = targetUrl.split('#')[0];
      const match = tabs.find(t => t.url && t.url.split('#')[0] === targetBase);

      if (match) {
        chrome.tabs.update(match.id, { active: true }, () => {
          executeScrollAndHighlight(match.id, targetScrollY, targetPercentage, targetTitle);
          window.close();
        });
      } else {
        chrome.tabs.create({ url: targetUrl, active: true }, (newTab) => {
          const tabId = newTab.id;
          let executed = false;

          const onUpdatedHandler = (updatedId, info) => {
            if (updatedId === tabId && info.status === 'complete' && !executed) {
              executed = true;
              chrome.tabs.onUpdated.removeListener(onUpdatedHandler);
              setTimeout(() => {
                executeScrollAndHighlight(tabId, targetScrollY, targetPercentage, targetTitle);
              }, 400);
            }
          };
          chrome.tabs.onUpdated.addListener(onUpdatedHandler);

          // Backup timeout
          setTimeout(() => {
            if (!executed) {
              executed = true;
              chrome.tabs.onUpdated.removeListener(onUpdatedHandler);
              executeScrollAndHighlight(tabId, targetScrollY, targetPercentage, targetTitle);
            }
          }, 2400);

          window.close();
        });
      }
    });
  }

  function executeScrollAndHighlight(tabId, targetY, pct, articleTitle) {
    if (!tabId || typeof chrome === 'undefined' || !chrome.scripting) return;
    chrome.scripting.executeScript({
      target: { tabId },
      func: (scrollY, percentage, title) => {
        function runHighlight() {
          // 1. Smooth scroll to destination
          window.scrollTo({ top: scrollY, behavior: 'smooth' });
          setTimeout(() => {
            if (Math.abs(window.scrollY - scrollY) > 80) {
              window.scrollTo({ top: scrollY, behavior: 'smooth' });
            }
          }, 350);

          // Remove any lingering highlights
          document.getElementById('nook-resume-beam')?.remove();
          document.getElementById('nook-resume-pill')?.remove();

          // 2. Ambient glowing green pulse line across page at eye line
          const beam = document.createElement('div');
          beam.id = 'nook-resume-beam';
          beam.style.cssText = `
            position: fixed;
            top: 32%;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, transparent 0%, #22c55e 15%, #4ade80 50%, #22c55e 85%, transparent 100%);
            box-shadow: 0 0 18px 4px rgba(34, 197, 94, 0.7);
            z-index: 2147483646;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.4s ease;
          `;
          document.body.appendChild(beam);

          // 3. Floating resume banner toast
          const pill = document.createElement('div');
          pill.id = 'nook-resume-pill';
          const pctStr = percentage ? ` (${percentage}% through)` : '';
          pill.innerHTML = `
            <div style="display:flex; align-items:center; gap:9px;">
              <span style="font-size:17px; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.1));">📖</span>
              <div style="text-align:left;">
                <div style="font-size:12.5px; font-weight:700; color:#1e293b; line-height:1.2;">Resumed Reading${pctStr}</div>
                <div style="font-size:10.5px; color:#15803d; font-weight:500;">Nook brought you right back to your saved line ✨</div>
              </div>
            </div>
          `;
          pill.style.cssText = `
            position: fixed;
            top: 24px;
            left: 50%;
            transform: translateX(-50%) translateY(-24px);
            background: #ffffff;
            border: 2px solid #22c55e;
            box-shadow: 0 12px 36px rgba(34, 197, 94, 0.3), 0 4px 14px rgba(0,0,0,0.08);
            border-radius: 9999px;
            padding: 8px 18px;
            z-index: 2147483647;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            pointer-events: none;
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          `;
          document.body.appendChild(pill);

          // 4. Subtle outline glow around the target paragraph or heading
          try {
            const targetEl = document.elementFromPoint(window.innerWidth / 2, window.innerHeight * 0.35);
            if (targetEl && targetEl !== document.body && targetEl !== document.documentElement) {
              const origOutline = targetEl.style.outline;
              const origOutlineOffset = targetEl.style.outlineOffset;
              const origTransition = targetEl.style.transition;
              targetEl.style.transition = 'all 0.5s ease';
              targetEl.style.outline = '3px solid rgba(34, 197, 94, 0.6)';
              targetEl.style.outlineOffset = '4px';
              targetEl.style.borderRadius = '4px';

              setTimeout(() => {
                targetEl.style.outline = '3px solid rgba(34, 197, 94, 0)';
                setTimeout(() => {
                  targetEl.style.outline = origOutline;
                  targetEl.style.outlineOffset = origOutlineOffset;
                  targetEl.style.transition = origTransition;
                }, 600);
              }, 2600);
            }
          } catch (e) {}

          requestAnimationFrame(() => {
            pill.style.opacity = '1';
            pill.style.transform = 'translateX(-50%) translateY(0)';
            beam.style.opacity = '0.9';
          });

          setTimeout(() => {
            pill.style.opacity = '0';
            pill.style.transform = 'translateX(-50%) translateY(-20px)';
            beam.style.opacity = '0';
            setTimeout(() => {
              pill.remove();
              beam.remove();
            }, 500);
          }, 3200);
        }

        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          runHighlight();
        } else {
          window.addEventListener('DOMContentLoaded', runHighlight, { once: true });
        }
      },
      args: [targetY, pct, articleTitle]
    }).catch(() => {});
  }

  // ── Render 5: Reading Tab ───────────────────────────────────────
  function renderReadingTab() {
    const readingList = document.getElementById('readingList');
    const readingCounter = document.getElementById('readingCounter');
    const btnClearReading = document.getElementById('btnClearReading');
    if (!readingList) return;

    readingList.innerHTML = '';

    // Filter out search engines, invalid or trivial <250px entries
    const searchEngines = ['google.com/search', 'bing.com/search', 'duckduckgo.com', 'search.yahoo.com'];
    const valid = currentReading.filter(r => {
      if (!r || !r.url) return false;
      if (searchEngines.some(se => r.url.includes(se))) return false;
      const pct = r.percentage || 0;
      const sy = r.scrollY || 0;
      return pct >= 2 || sy >= 250;
    });

    // Deduplicate by base URL
    const seen = new Set();
    const unique = [];
    for (const r of valid) {
      const base = r.url.split('#')[0];
      if (!seen.has(base)) {
        seen.add(base);
        unique.push(r);
      }
    }

    if (readingCounter) {
      readingCounter.textContent = `${unique.length} article${unique.length === 1 ? '' : 's'}`;
    }
    if (btnClearReading) {
      btnClearReading.style.display = unique.length > 0 ? 'inline-block' : 'none';
      btnClearReading.onclick = () => {
        if (!confirm('Clear all saved reading points? 📖')) return;
        chrome.runtime.sendMessage({ type: 'CLEAR_PAGE_POSITIONS' }, () => {
          showToast('Cleared reading points! ✨');
          refreshAll();
        });
      };
    }

    if (!unique.length) {
      readingList.innerHTML = `
        <div class="empty-state">
          No reading points recorded yet.<br>
          Scroll down long articles or docs — Nook quietly remembers your exact line! 📖
        </div>
      `;
      return;
    }

    unique.forEach(r => {
      let hostname = '';
      try {
        hostname = new URL(r.url).hostname.replace('www.', '');
      } catch (e) {
        hostname = 'Article';
      }

      const title = r.title || hostname || 'Saved article';
      const pct = Math.max(1, Math.min(100, r.percentage || Math.round((r.scrollY || 0) / 30)));
      const ago = formatTimeAgo(r.timestamp);

      const card = document.createElement('div');
      card.className = 'reading-card';
      card.innerHTML = `
        <div class="reading-card-header">
          <span class="reading-domain-tag">🌐 ${hostname}</span>
          <div class="reading-header-meta">
            <span class="reading-time-ago">${ago}</span>
            <button class="reading-remove-btn" title="Remove reading point">✕</button>
          </div>
        </div>
        <div class="reading-card-title">${title}</div>
        <div class="reading-card-footer">
          <div class="reading-progress-track">
            <div class="reading-progress-fill" style="width: ${pct}%;"></div>
          </div>
          <span class="reading-pct-label">${pct}% read</span>
          <button class="reading-jump-btn">Jump Back ↗</button>
        </div>
      `;

      // Remove button
      card.querySelector('.reading-remove-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        chrome.runtime.sendMessage({ type: 'REMOVE_PAGE_POSITION', url: r.url }, () => {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          card.style.transition = 'all 0.2s ease';
          setTimeout(() => {
            card.remove();
            refreshAll();
          }, 200);
          showToast('Removed reading point');
        });
      });

      // Jump Back button and Card click
      card.querySelector('.reading-jump-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        jumpBackToReadingPoint(r);
      });
      card.addEventListener('click', () => {
        jumpBackToReadingPoint(r);
      });

      readingList.appendChild(card);
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
      const name = `Session · ${new Date().toLocaleDateString(undefined, { month:'short', day:'numeric' })} ${new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}`;
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
  document.getElementById('btnShowWidget')?.addEventListener('click', async () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.remove('nook_widget_hidden');
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs && tabs[0];
      if (!tab || !tab.url) return;

      const url = tab.url;
      const isRestricted = !url.startsWith('http://') && !url.startsWith('https://') || url.includes('.pdf');
      if (isRestricted) {
        showToast('Chrome blocks extensions on PDFs & system pages 📄');
        setCreatureEmotion('concerned', 'Restricted page!', 'Extensions cannot run on PDF files or chrome:// pages.');
        return;
      }

      // Try sending message to tab first
      chrome.tabs.sendMessage(tab.id, { type: 'SHOW_NOOK_WIDGET' }, (res) => {
        if (chrome.runtime.lastError || !res) {
          // Content script not yet injected — inject CSS and JS
          chrome.scripting?.insertCSS({
            target: { tabId: tab.id },
            files: ['content/nook_widget.css']
          }).catch(() => {});

          chrome.scripting?.executeScript({
            target: { tabId: tab.id },
            files: ['content/nook_widget.js']
          }).then(() => {
            showToast('Creature summoned to page! 🌿');
            setTimeout(() => window.close(), 650);
          }).catch(() => {
            showToast('Could not attach creature to page');
          });
        } else {
          showToast('Creature unhidden! 🌿');
          setTimeout(() => window.close(), 650);
        }
      });
    });
  });

  // ── Button: Declare Tab Bankruptcy ─────────────────────────────
  let lastBankruptcyCount = 0;
  let lastBankruptcyName  = '';

  const confirmBankruptcyModal = document.getElementById('confirmBankruptcyModal');
  const bankruptcyModal = document.getElementById('bankruptcyModal');
  const btnConfirmBankruptcy = document.getElementById('btnConfirmBankruptcy');
  const btnCancelBankruptcy  = document.getElementById('btnCancelBankruptcy');

  function declareTabBankruptcy() {
    confirmBankruptcyModal?.classList.add('open');
  }

  btnCancelBankruptcy?.addEventListener('click', () => {
    confirmBankruptcyModal?.classList.remove('open');
  });

  btnConfirmBankruptcy?.addEventListener('click', () => {
    confirmBankruptcyModal?.classList.remove('open');
    chrome.runtime.sendMessage({ type: 'DECLARE_BANKRUPTCY' }, (res) => {
      if (res?.success) {
        lastBankruptcyCount = res.count;
        lastBankruptcyName  = res.sessionName;
        const modalDesc = document.getElementById('modalDesc');
        if (modalDesc) {
          modalDesc.innerHTML = `I've tucked all <strong>${res.count} tabs</strong> into <em>"${res.sessionName}"</em>.<br><br>Breathe easy and enjoy your clean slate! 🍃`;
        }
        bankruptcyModal?.classList.add('open');
        setCreatureEmotion('proud', 'Tab Bankruptcy declared! ✨', 'All tabs safely archived.');
        showToast(`Tucked ${res.count} tabs into safe archive! 🍃`);
        refreshAll();
      } else {
        showToast(res?.reason || 'No open tabs to archive');
      }
    });
  });

  document.getElementById('btnDeclareBankruptcy')?.addEventListener('click', () => {
    declareTabBankruptcy();
  });

  document.getElementById('btnCloseModal')?.addEventListener('click', () => {
    bankruptcyModal?.classList.remove('open');
  });

  document.getElementById('btnTweetBankruptcy')?.addEventListener('click', () => {
    const count = lastBankruptcyCount || currentTabSummary?.totalTabs || 24;
    const tweet = `I just declared tab bankruptcy on ${count} tabs using @nook browser companion 🍃\n\nTucked them all into a safe archive and started completely fresh with zero guilt. Cleanest my brain has felt all week.\n\n#TabBankruptcy #BuildInPublic`;
    navigator.clipboard.writeText(tweet).then(() => {
      showToast('Copied tweet! 📋 Opening X...');
    });
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
    chrome.tabs.create({ url: intentUrl });
    bankruptcyModal?.classList.remove('open');
  });

  // ── Button: Viral X Status Share ────────────────────────────────
  document.getElementById('btnShareX')?.addEventListener('click', () => {
    const tabsCount = currentTabSummary?.totalTabs || 6;
    const staleCount = currentTabSummary?.staleTabs?.length || 0;
    const decayCount = currentBookmarks.filter(b => (b.stage === 'faded' || b.stage === 'decayed') && !b.isEvergreen).length;

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

  let clearClickCount = 0;
  document.getElementById('btnClear')?.addEventListener('click', () => {
    clearClickCount++;
    if (clearClickCount === 1) {
      showToast('Click again to confirm data reset ⚠️');
      setTimeout(() => { clearClickCount = 0; }, 3000);
      return;
    }
    clearClickCount = 0;
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.clear(() => {
        showToast('All Nook data cleared.');
        refreshAll();
      });
    }
  });

  // Initial Load
  refreshAll();
});
