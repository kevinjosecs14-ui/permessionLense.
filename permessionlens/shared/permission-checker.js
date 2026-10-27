/**
 * PermissionLens - Real Website Permission Inspector
 * Uses legitimate navigator.permissions API and browser properties.
 * Never guesses or fakes permission states.
 */

const INSPECTABLE_BROWSER_PERMISSIONS = [
  { id: "camera", apiName: "camera", label: "Camera Access", icon: "📷" },
  { id: "microphone", apiName: "microphone", label: "Microphone Access", icon: "🎙️" },
  { id: "location", apiName: "geolocation", label: "Location Access", icon: "📍" },
  { id: "notifications", apiName: "notifications", label: "Notifications", icon: "🔔" },
  { id: "clipboard", apiName: "clipboard-read", label: "Clipboard Access", icon: "📋" }
];

class WebsitePermissionInspector {
  /**
   * Inspects permissions on the active window / document
   */
  static async inspectCurrentPage() {
    const origin = window.location.origin;
    const protocol = window.location.protocol;
    const isSecure = protocol === "https:" || window.location.hostname === "localhost";
    const hostname = window.location.hostname || "unknown";

    const results = [];

    for (const item of INSPECTABLE_BROWSER_PERMISSIONS) {
      let state = "not_inspectable";
      let details = "Not available through this browser API";
      let canInspect = false;

      if (navigator && navigator.permissions && typeof navigator.permissions.query === "function") {
        try {
          const status = await navigator.permissions.query({ name: item.apiName });
          state = status.state; // 'granted' | 'denied' | 'prompt'
          canInspect = true;

          if (state === "granted") {
            details = "Browser has granted permission to this site if requested.";
          } else if (state === "denied") {
            details = "Browser has blocked this site from accessing this feature.";
          } else if (state === "prompt") {
            details = "Site must prompt you for permission before accessing.";
          }
        } catch (err) {
          // Specific permission descriptor is not supported on this browser version
          state = "not_inspectable";
          details = "This browser API does not support programmatic querying of this state.";
        }
      }

      results.push({
        id: item.id,
        label: item.label,
        icon: item.icon,
        apiName: item.apiName,
        state: state,
        canInspect: canInspect,
        details: details,
        explanation: (typeof window !== "undefined" && window.PermissionsDB) 
          ? window.PermissionsDB.getById(item.id) 
          : null
      });
    }

    return {
      origin: origin,
      hostname: hostname,
      isSecure: isSecure,
      protocol: protocol,
      inspectedAt: new Date().toISOString(),
      permissions: results,
      chromeSettingsUrl: `chrome://settings/content/siteDetails?site=${encodeURIComponent(origin)}`
    };
  }

  /**
   * Helper to format permission state as a human-friendly badge
   */
  static getStateBadge(state) {
    switch (state) {
      case "granted":
        return { text: "Granted", className: "badge-granted", color: "#10b981", icon: "✓" };
      case "denied":
        return { text: "Denied", className: "badge-denied", color: "#ef4444", icon: "✕" };
      case "prompt":
        return { text: "Prompt", className: "badge-prompt", color: "#f59e0b", icon: "？" };
      case "not_inspectable":
      default:
        return { text: "Not Inspectable", className: "badge-unsupported", color: "#64748b", icon: "ℹ" };
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WebsitePermissionInspector, INSPECTABLE_BROWSER_PERMISSIONS };
}
if (typeof window !== 'undefined') {
  window.WebsitePermissionInspector = WebsitePermissionInspector;
}
