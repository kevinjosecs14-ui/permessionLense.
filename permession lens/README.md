# PermissionLens — Explain What an App or Website Can Access

> **Voltalgo Hackathon Concept:** Understand permissions before the click. Protect your privacy.

PermissionLens is a Google Chrome Extension (Manifest V3) and dashboard application that translates complex browser permissions and application access requests into plain-English explanations, objective privacy considerations, and actionable controls.

---

## Key Features

1. **Live Website Permission Inspection**
   - Discovers active website origin and verifies HTTPS connection status.
   - Queries real browser states (`granted`, `denied`, `prompt`, or `not inspectable`) via `navigator.permissions.query()`.
   - Never fakes uninspectable permissions; provides direct deep links to Chrome's native site settings (`chrome://settings/content/siteDetails`).
2. **Permission Impact Simulator**
   - Compares **Profile A (Current)** vs **Profile B (Proposed)**.
   - Calculates **Added**, **Removed**, and **Unchanged** access.
   - Computes deterministic delta scores ($\Delta \text{Score}$) based on sensitivity categories (Higher: 3 pts, Moderate: 2 pts, Lower: 1 pt) without opaque AI hallucinations.
3. **Application Permission Catalog**
   - Pre-seeded with 6 categorized reference app profiles from Supabase.
   - Explores 13 comprehensive permission guides with legitimate use cases, accessible data items, and practical revocations.
   - Transparently labels catalog profiles as educational sample data.
4. **Supabase Cloud Backend Integration with 100% Offline Fallback**
   - Connects to Supabase PostgreSQL database (`permissionlens`, ID: `eztyekehrdxqslmzmfgg`) using secure publishable keys.
   - Bundles complete offline fallback databases (`permissions-data.js` and `profiles-data.js`) so the extension works completely offline or when Supabase is unreachable.
5. **Cybersecurity SaaS Design System (Team VOLTALGO)**
   - Tailored palette: Navy `#173B63`, Primary Blue `#2F6DB2`, Electric Blue `#4F8CFF`, Soft Gold `#F4C542`, Ice Blue `#DCEAF7`, Warm Background `#F7F4EB`.
   - Polished white cards with rounded corners, subtle borders, soft shadows, and clean typographic hierarchy.
   - High-contrast, accessibility-tested status badges: Granted (`#16A34A`), Denied (`#DC2626`), Prompt (`#F59E0B`), and Unsupported (`#64748B`).
   - Dual-Mode Architecture: Mode A (Localhost/Deployed Web Application with honest HTTPS probing) & Mode B (Chrome Manifest V3 Extension for live active tab context).
   - Accessible across **Full Dashboard**, **Toolbar Popup**, and **Chrome Side Panel**.

---

## Quick Start with npm

You can launch and test the extension directly from the terminal:

```bash
# Run tests and launch Chrome with PermissionLens pre-loaded
npm run dev

# Run the automated verification test suite
npm test
```

---

## How to Install and Run in Google Chrome

1. Open Google Chrome.
2. In the URL address bar, navigate to:  
   `chrome://extensions`
3. In the top-right corner of the Extensions page, switch the toggle on for **Developer mode**.
4. In the top-left corner, click the **Load unpacked** button.
5. In the file picker dialog, select the project directory:  
   `D:\permession lens`
6. Click **Select Folder**.
7. **PermissionLens** is now installed! Click the puzzle icon (Extensions) in your Chrome toolbar and click the pin icon next to **PermissionLens** to keep it readily available.

---

## How to Test

- **Test 1: Toolbar Popup & Live Scan:**  
  Visit any website (e.g., `https://github.com` or `https://google.com`), click the PermissionLens toolbar icon, and observe the live HTTPS security badge and permissions list (Camera, Microphone, Geolocation, Notifications, Clipboard).
- **Test 2: Chrome Site Settings Deep Link:**  
  Click **⚙️ Settings** in the popup or dashboard to open Chrome's native site settings page for the active origin.
- **Test 3: Full Dashboard & Impact Simulator:**  
  Click the dashboard icon or navigate to `dashboard/dashboard.html`. Switch between Profile A (Messaging) and Profile B (Video-Conferencing) in the **Permission Impact Simulator** and observe the calculated Added/Removed/Unchanged diff and deterministic risk score.
- **Test 4: Chrome Side Panel:**  
  Right-click the extension icon and select **Open side panel** (or click the Side Panel toggle in Chrome) to keep the assistant docked beside your active tabs.
- **Test 5: Offline Independence:**  
  Disconnect from Wi-Fi or run locally without an internet connection. The extension automatically switches to the offline bundle with zero errors.

---

## Security & Privacy Safeguards

- **Zero Telemetry:** No user browsing history, search queries, or URLs are sent to any remote server without explicit consent.
- **Least-Privilege Manifest V3:** Only requests `"activeTab"`, `"scripting"`, `"storage"`, and `"sidePanel"`. Does not use `<all_urls>` background tracking.
- **Safe Sandboxing:** Zero access to passwords, credit card fields, authentication cookies, or DOM page contents.
