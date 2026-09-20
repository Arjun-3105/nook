/**
 * Tab Relationship & Contextual Clustering
 * Groups tabs based on opener chains, timing proximity, and semantic relationships
 */

export function analyzeTabClusters(tabs) {
  if (!tabs || tabs.length < 2) return [];

  // Group by opener tab or domain correlation within time windows
  const clusters = [];
  const visited = new Set();

  for (let i = 0; i < tabs.length; i++) {
    const root = tabs[i];
    if (visited.has(root.id)) continue;

    const cluster = [root];
    visited.add(root.id);

    for (let j = i + 1; j < tabs.length; j++) {
      const candidate = tabs[j];
      if (visited.has(candidate.id)) continue;

      const isChild = candidate.openerTabId === root.id || root.openerTabId === candidate.id;
      const isSameOpener = candidate.openerTabId && candidate.openerTabId === root.openerTabId;
      
      let sameDomain = false;
      try {
        const d1 = new URL(root.url).hostname;
        const d2 = new URL(candidate.url).hostname;
        sameDomain = d1 === d2;
      } catch {}

      // If connected by opener chain or closely related browsing intent
      if (isChild || isSameOpener || sameDomain) {
        cluster.push(candidate);
        visited.add(candidate.id);
      }
    }

    if (cluster.length >= 3) {
      clusters.push({
        id: `cluster_${root.id}`,
        title: guessClusterTitle(cluster),
        tabs: cluster
      });
    }
  }

  return clusters;
}

function guessClusterTitle(tabs) {
  // Score-based name detection
  const domains = tabs.map(t => {
    try { return new URL(t.url).hostname.replace('www.', ''); } catch { return ''; }
  }).filter(Boolean);

  const domainCounts = {};
  domains.forEach(d => { domainCounts[d] = (domainCounts[d] || 0) + 1; });
  const topDomain = Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  // Known domain labels
  const domainLabels = {
    'github.com': 'GitHub',
    'stackoverflow.com': 'Stack Overflow',
    'developer.chrome.com': 'Chrome Docs',
    'developer.mozilla.org': 'MDN',
    'notion.so': 'Notion',
    'figma.com': 'Figma',
    'linear.app': 'Linear',
    'vercel.com': 'Vercel',
  };

  // Try to find a PR / issue number for GitHub
  for (const t of tabs) {
    const prMatch = t.title?.match(/(PR|#\d+|Issue|pull)/i);
    if (prMatch && t.url?.includes('github.com')) {
      return `GitHub · ${t.title?.slice(0, 28) || 'Review'}`;
    }
  }

  if (domainLabels[topDomain]) return `${domainLabels[topDomain]} Research`;

  // Generic title from most common page words
  const words = tabs
    .flatMap(t => (t.title || '').split(/[\s\-–|·]+/))
    .filter(w => w.length > 3 && !/^(the|and|for|with|http|www)$/i.test(w));
  const wordFreq = {};
  words.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
  const topWord = Object.entries(wordFreq).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (topWord) return `${topWord} Research`;

  return 'Focus Session';
}

/**
 * Group tabs purely per website / domain
 * Returns array of { domain, title, count, tabs } for domains with 2+ tabs
 */
export function groupTabsByDomain(tabs) {
  if (!tabs || tabs.length < 2) return [];
  const domainMap = {};

  for (const t of tabs) {
    if (!t.url || t.url.startsWith('chrome://') || t.url.startsWith('chrome-extension://')) continue;
    try {
      const d = new URL(t.url).hostname.replace(/^www\./, '');
      if (!domainMap[d]) domainMap[d] = [];
      domainMap[d].push(t);
    } catch {}
  }

  const result = [];
  for (const [domain, dTabs] of Object.entries(domainMap)) {
    if (dTabs.length >= 2) {
      result.push({
        domain,
        title: formatDomainLabel(domain),
        count: dTabs.length,
        tabs: dTabs
      });
    }
  }

  return result.sort((a, b) => b.count - a.count);
}

export function formatDomainLabel(domain) {
  const domainLabels = {
    'github.com': 'GitHub',
    'youtube.com': 'YouTube',
    'twitter.com': 'X / Twitter',
    'x.com': 'X',
    'reddit.com': 'Reddit',
    'stackoverflow.com': 'Stack Overflow',
    'developer.chrome.com': 'Chrome Docs',
    'developer.mozilla.org': 'MDN',
    'notion.so': 'Notion',
    'figma.com': 'Figma',
    'linear.app': 'Linear',
    'vercel.com': 'Vercel',
    'google.com': 'Google',
    'wikipedia.org': 'Wikipedia'
  };

  if (domainLabels[domain]) return domainLabels[domain];

  const parts = domain.split('.');
  if (parts.length >= 2) {
    const main = parts[parts.length - 2];
    return main.charAt(0).toUpperCase() + main.slice(1);
  }
  return domain;
}



