// auto-update: checks original repo for new releases
// original: https://github.com/darkreader/darkreader
(function() {
  const REPO = "darkreader/darkreader";
  const CHECK_INTERVAL = 6 * 60 * 60 * 1000;
  const STORAGE_KEY = "fork_update_check";

  async function check() {
    try {
      const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
      if (!r.ok) return;
      const d = await r.json();
      const latest = d.tag_name.replace(/^v/i, "");
      const current = browser.runtime.getManifest().version;
      const s = await browser.storage.local.get(STORAGE_KEY);
      const known = s[STORAGE_KEY] || {};
      if (latest !== known.latestVersion) {
        known.latestVersion = latest;
        known.lastChecked = Date.now();
        await browser.storage.local.set({ [STORAGE_KEY]: known });
        if (compareVersions(latest, current) > 0) {
          if (browser.browserAction) {
            browser.browserAction.setBadgeText({ text: "!" });
            browser.browserAction.setBadgeBackgroundColor({ color: "#f6b012" });
          } else if (browser.action) {
            browser.action.setBadgeText({ text: "!" });
            browser.action.setBadgeBackgroundColor({ color: "#f6b012" });
          }
        }
      }
    } catch(e) { console.debug("update check failed:", e.message); }
  }

  function compareVersions(a, b) {
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const na = pa[i] || 0, nb = pb[i] || 0;
      if (na > nb) return 1;
      if (na < nb) return -1;
    }
    return 0;
  }

  check();
  setInterval(check, CHECK_INTERVAL);
})();
