/**
 * PermissionLens - Content Script
 * Executes safely within supported web pages when analysis is requested.
 * Operates under strict least-privilege: zero access to passwords, tokens, or form inputs.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXECUTE_PERMISSION_CHECK") {
    inspectPagePermissions().then(result => {
      sendResponse({ success: true, data: result });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true; // async
  }
});

async function inspectPagePermissions() {
  const inspectable = [
    { id: "camera", apiName: "camera", label: "Camera Access", icon: "📷" },
    { id: "microphone", apiName: "microphone", label: "Microphone Access", icon: "🎙️" },
    { id: "location", apiName: "geolocation", label: "Location Access", icon: "📍" },
    { id: "notifications", apiName: "notifications", label: "Notifications", icon: "🔔" },
    { id: "clipboard", apiName: "clipboard-read", label: "Clipboard Access", icon: "📋" }
  ];

  const results = [];

  for (const item of inspectable) {
    let state = "not_inspectable";
    let details = "Not available through this browser API";
    let canInspect = false;

    if (navigator && navigator.permissions && typeof navigator.permissions.query === "function") {
      try {
        const queryRes = await navigator.permissions.query({ name: item.apiName });
        state = queryRes.state;
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

    results.push({
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
    permissions: results,
    timestamp: new Date().toISOString()
  };
}
