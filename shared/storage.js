/**
 * Local-First Storage Abstraction for Nook
 * Falls back gracefully to localStorage when running in standalone preview mode.
 */

const isChromeStorage = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

export const Storage = {
  async get(keys) {
    if (isChromeStorage) {
      return new Promise((resolve) => {
        chrome.storage.local.get(keys, (res) => resolve(res || {}));
      });
    }
    const result = {};
    const keyList = Array.isArray(keys) ? keys : (typeof keys === 'string' ? [keys] : Object.keys(keys || {}));
    for (const k of keyList) {
      const val = localStorage.getItem(`nook_${k}`);
      if (val !== null) {
        try {
          result[k] = JSON.parse(val);
        } catch {
          result[k] = val;
        }
      } else if (typeof keys === 'object' && keys !== null && k in keys) {
        result[k] = keys[k];
      }
    }
    return result;
  },

  async set(data) {
    if (isChromeStorage) {
      return new Promise((resolve) => {
        chrome.storage.local.set(data, () => resolve());
      });
    }
    for (const [key, val] of Object.entries(data)) {
      localStorage.setItem(`nook_${key}`, JSON.stringify(val));
    }
  },

  async remove(keys) {
    if (isChromeStorage) {
      return new Promise((resolve) => {
        chrome.storage.local.remove(keys, () => resolve());
      });
    }
    const keyList = Array.isArray(keys) ? keys : [keys];
    for (const k of keyList) {
      localStorage.removeItem(`nook_${k}`);
    }
  },

  async clear() {
    if (isChromeStorage) {
      return new Promise((resolve) => {
        chrome.storage.local.clear(() => resolve());
      });
    }
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith('nook_')) {
        localStorage.removeItem(k);
      }
    }
  }
};

