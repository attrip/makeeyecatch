(function () {
  const {
    storageKey,
    customStylesStorageKey,
    customStylesCookieKey,
    legacyCustomStylesCookieKey,
    baseStyleRules,
  } = window.MakeEyecatchConfig;

  function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    const prefix = `${name}=`;
    const row = document.cookie.split("; ").find((entry) => entry.startsWith(prefix));
    return row ? decodeURIComponent(row.slice(prefix.length)) : "";
  }

  function clearCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  }

  function safeParse(raw) {
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function readCustomStylesFromStorage() {
    return safeParse(window.localStorage.getItem(customStylesStorageKey));
  }

  function readLegacyCustomStyles() {
    return safeParse(getCookie(legacyCustomStylesCookieKey));
  }

  function writeCustomStylesMeta(customStyles) {
    const entries = Object.entries(customStyles);
    const meta = {
      hasCustomStyles: entries.length > 0,
      count: entries.length,
      lastStyleLabel: entries.length ? entries[entries.length - 1][1].label : "",
      updatedAt: new Date().toISOString(),
    };
    setCookie(customStylesCookieKey, JSON.stringify(meta));
  }

  function ensureCustomStylesMigration() {
    const current = readCustomStylesFromStorage();
    if (Object.keys(current).length) {
      writeCustomStylesMeta(current);
      return current;
    }

    const legacy = readLegacyCustomStyles();
    if (!Object.keys(legacy).length) return current;

    window.localStorage.setItem(customStylesStorageKey, JSON.stringify(legacy));
    writeCustomStylesMeta(legacy);
    clearCookie(legacyCustomStylesCookieKey);
    return legacy;
  }

  function readCustomStyles() {
    return ensureCustomStylesMigration();
  }

  function writeCustomStyles(customStyles) {
    window.localStorage.setItem(customStylesStorageKey, JSON.stringify(customStyles));
    writeCustomStylesMeta(customStyles);
  }

  function rebuildStyleRules() {
    return { ...baseStyleRules, ...readCustomStyles() };
  }

  function readState() {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      window.localStorage.removeItem(storageKey);
      return null;
    }
  }

  function writeState(state) {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }

  window.MakeEyecatchStorage = {
    readCustomStyles,
    writeCustomStyles,
    rebuildStyleRules,
    readState,
    writeState,
  };
})();
