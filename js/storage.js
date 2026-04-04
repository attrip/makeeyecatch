(function () {
  const { storageKey, customStylesCookieKey, baseStyleRules } = window.MakeEyecatchConfig;

  function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    const prefix = `${name}=`;
    const row = document.cookie.split("; ").find((entry) => entry.startsWith(prefix));
    return row ? decodeURIComponent(row.slice(prefix.length)) : "";
  }

  function readCustomStyles() {
    const raw = getCookie(customStylesCookieKey);
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeCustomStyles(customStyles) {
    setCookie(customStylesCookieKey, JSON.stringify(customStyles));
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
