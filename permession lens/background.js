/**
 * PermissionLens - Background Service Worker (Manifest V3)
 * Coordinates tab inspection, side panel behavior, and navigation helpers.
 */

// Configure side panel to open on action click if supported
if (chrome.sidePanel && typeof chrome.sidePanel.setPanelBehavior === "function") {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(err => {
    console.log("[PermissionLens] Side panel behavior init:", err);
  });
}

// Handle extension installation or update
chrome.runtime.onInstalled.addListener((details) => {
  console.log(`[PermissionLens] Extension installed / updated: reason = ${details.reason}`);
  
  // Set default settings in chrome.storage.local
  chrome.storage.local.get(["cloudSyncEnabled", "recentComparisons"], (res) => {
    if (res.cloudSyncEnabled === undefined) {
      chrome.storage.local.set({ cloudSyncEnabled: true });
    }
    if (!res.recentComparisons) {
      chrome.storage.local.set({ recentComparisons: [] });
    }
  });
});

// Centralized Message Bus
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "GET_ACTIVE_TAB_INFO") {
    handleGetActiveTabInfo(sendResponse);
    return true; // async sendResponse
  }

  if (message.action === "OPEN_DASHBOARD") {
    const targetUrl = chrome.runtime.getURL("dashboard/dashboard.html" + (message.tab ? `?tab=${message.tab}` : ""));
    chrome.tabs.create({ url: targetUrl });
    sendResponse({ success: true });
    return true;
  }

  if (message.action === "OPEN_SIDE_PANEL") {
    if (chrome.sidePanel && chrome.sidePanel.open) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.sidePanel.open({ tabId: tabs[0].id }).catch(err => {
            console.warn("Could not open sidepanel:", err);
          });
        }
      });
    }
    sendResponse({ success: true });
    return true;
  }

  if (message.action === "OPEN_SITE_SETTINGS") {
    const origin = message.origin;
    if (origin) {
      const settingsUrl = `chrome://settings/content/siteDetails?site=${encodeURIComponent(origin)}`;
      chrome.tabs.create({ url: settingsUrl });
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: "Origin missing" });
    }
    return true;
  }

  if (message.action === "INSPECT_ACTIVE_PAGE") {
    handleInspectActivePage(sendResponse);
    return true;
  }
});

/**
 * Retrieves the active tab URL and basic connection details safely
 */
async function handleGetActiveTabInfo(sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      sendResponse({ success: false, error: "No active tab accessible" });
      return;
    }

    // Ignore restricted internal pages
    if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://") || tab.url.startsWith("edge://") || tab.url.startsWith("about:")) {
      sendResponse({
        success: true,
        isRestrictedPage: true,
        url: tab.url,
        title: tab.title || "Browser System Page",
        message: "Chrome restricts extensions from querying permissions on internal browser pages."
      });
      return;
    }

    const urlObj = new URL(tab.url);
    sendResponse({
      success: true,
      isRestrictedPage: false,
      tabId: tab.id,
      url: tab.url,
      origin: urlObj.origin,
      hostname: urlObj.hostname,
      protocol: urlObj.protocol,
      isSecure: urlObj.protocol === "https:" || urlObj.hostname === "localhost",
      title: tab.title || urlObj.hostname
    });
  } catch (err) {
    sendResponse({ success: false, error: err.message });
  }
}

/**
 * Injects in-page query into the active tab to execute navigator.permissions checks
 */
async function handleInspectActivePage(sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id || !tab.url) {
      sendResponse({ success: false, error: "No active tab found" });
      return;
    }

    if (tab.url.startsWith("chrome://") || tab.url.startsWith("about:") || tab.url.startsWith("chrome-extension://")) {
      sendResponse({
        success: true,
        isRestrictedPage: true,
        url: tab.url,
        message: "Cannot inspect internal browser pages."
      });
      return;
    }

    // Execute script in active tab context
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: runInPagePermissionQueries
    });

    if (results && results[0] && results[0].result) {
      sendResponse({ success: true, isRestrictedPage: false, data: results[0].result });
    } else {
      sendResponse({ success: false, error: "Could not read permission states from page context" });
    }
  } catch (err) {
    sendResponse({ success: false, error: err.message });
  }
}

/**
 * Function executed directly inside the page context to test navigator.permissions
 */
async function runInPagePermissionQueries() {
  const inspectable = [
    { id: "camera", apiName: "camera", label: "Camera Access", icon: "📷" },
    { id: "microphone", apiName: "microphone", label: "Microphone Access", icon: "🎙️" },
    { id: "location", apiName: "geolocation", label: "Location Access", icon: "📍" },
    { id: "notifications", apiName: "notifications", label: "Notifications", icon: "🔔" },
    { id: "clipboard", apiName: "clipboard-read", label: "Clipboard Access", icon: "📋" }
  ];

  const permissionsResult = [];

  for (const item of inspectable) {
    let state = "not_inspectable";
    let details = "Not available through this browser API";
    let canInspect = false;

    if (navigator && navigator.permissions && typeof navigator.permissions.query === "function") {
      try {
        const queryRes = await navigator.permissions.query({ name: item.apiName });
        state = queryRes.state; // 'granted' | 'denied' | 'prompt'
        canInspect = true;
        if (state === "granted") {
          details = "Browser has granted permission to this site.";
        } else if (state === "denied") {
          details = "Browser has blocked this site from accessing this feature.";
        } else if (state === "prompt") {
          details = "Site must ask you before accessing.";
        }
      } catch (e) {
        state = "not_inspectable";
        details = "Browser API does not support querying this permission.";
      }
    }

    permissionsResult.push({
      id: item.id,
      label: item.label,
      icon: item.icon,
      apiName: item.apiName,
      state: state,
      canInspect: canInspect,
      details: details
    });
  }

  return {
    origin: window.location.origin,
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    isSecure: window.location.protocol === "https:" || window.location.hostname === "localhost",
    permissions: permissionsResult,
    timestamp: new Date().toISOString()
  };
}
