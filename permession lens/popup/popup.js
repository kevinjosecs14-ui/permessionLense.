/**
 * PermissionLens - Popup Controller
 * Coordinates live browser permission scanning and navigates to the dashboard/simulator.
 */

let currentSiteInfo = null;
let currentPermissions = [];

document.addEventListener("DOMContentLoaded", () => {
  initializePopup();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById("btnScanSite").addEventListener("click", () => {
    runWebsiteScan();
  });

  document.getElementById("btnOpenDashboard").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "OPEN_DASHBOARD" });
  });

  document.getElementById("btnSiteSettings").addEventListener("click", () => {
    if (currentSiteInfo && currentSiteInfo.origin) {
      chrome.runtime.sendMessage({ 
        action: "OPEN_SITE_SETTINGS", 
        origin: currentSiteInfo.origin 
      });
    }
  });

  document.getElementById("btnSimulator").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "OPEN_DASHBOARD", tab: "simulator" });
  });

  document.getElementById("btnCatalog").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "OPEN_DASHBOARD", tab: "catalog" });
  });
}

async function initializePopup() {
  chrome.runtime.sendMessage({ action: "GET_ACTIVE_TAB_INFO" }, (response) => {
    if (!response || !response.success) {
      showRestrictedState("Unavailable Tab", response ? response.error : "Could not access active tab.");
      return;
    }

    if (response.isRestrictedPage) {
      showRestrictedState(response.title, response.message);
      return;
    }

    currentSiteInfo = response;
    updateSiteCard(response);
    runWebsiteScan();
  });
}

function updateSiteCard(info) {
  const hostnameEl = document.getElementById("siteHostname");
  const securityDot = document.getElementById("securityDot");
  const protocolTag = document.getElementById("protocolTag");

  hostnameEl.textContent = info.hostname || info.origin || "Unknown Site";
  
  if (info.isSecure) {
    securityDot.classList.remove("insecure");
    protocolTag.textContent = "HTTPS (Secure)";
    protocolTag.classList.remove("insecure");
  } else {
    securityDot.classList.add("insecure");
    protocolTag.textContent = "HTTP (Insecure)";
    protocolTag.classList.add("insecure");
  }
}

function showRestrictedState(title, message) {
  const alertEl = document.getElementById("restrictedAlert");
  const titleEl = document.getElementById("restrictedTitle");
  const msgEl = document.getElementById("restrictedMsg");
  const mainSec = document.getElementById("mainSection");
  const siteCard = document.getElementById("siteCard");

  alertEl.classList.remove("hidden");
  titleEl.textContent = title;
  msgEl.textContent = message;

  if (siteCard) siteCard.style.opacity = "0.7";
  if (mainSec) {
    const grid = document.getElementById("permissionsGrid");
    grid.innerHTML = `
      <div style="padding: 18px; text-align: center; color: var(--text-secondary); font-size: 12px;">
        Open any standard website (like google.com or github.com) and click PermissionLens to inspect live browser permissions.
      </div>
    `;
  }
}

function runWebsiteScan() {
  const grid = document.getElementById("permissionsGrid");
  const scanBtn = document.getElementById("btnScanSite");

  scanBtn.disabled = true;
  scanBtn.innerHTML = `
    <div class="mini-spinner" style="border-top-color: #ffffff;"></div>
    Scanning...
  `;

  grid.innerHTML = `
    <div class="grid-loading">
      <div class="mini-spinner"></div>
      <span>Querying browser permissions...</span>
    </div>
  `;

  chrome.runtime.sendMessage({ action: "INSPECT_ACTIVE_PAGE" }, (response) => {
    scanBtn.disabled = false;
    scanBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="23 4 23 10 17 10"/>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
      </svg>
      Scan Permissions
    `;

    if (!response || !response.success || !response.data) {
      grid.innerHTML = `
        <div style="padding: 14px; text-align: center; color: var(--color-denied); font-size: 12px;">
          ${response && response.error ? response.error : "Failed to query permissions from this page."}
        </div>
      `;
      return;
    }

    currentPermissions = response.data.permissions || [];
    renderPermissionsGrid(currentPermissions);
  });
}

function renderPermissionsGrid(perms) {
  const grid = document.getElementById("permissionsGrid");
  const counter = document.getElementById("permCounter");

  if (!perms || perms.length === 0) {
    grid.innerHTML = `<div style="padding: 14px; text-align: center; color: var(--text-muted);">No permissions inquired.</div>`;
    return;
  }

  counter.textContent = `${perms.length} Checked`;
  grid.innerHTML = "";

  perms.forEach((perm, index) => {
    const row = document.createElement("div");
    row.className = "perm-row" + (index === 0 ? " selected" : "");
    row.dataset.id = perm.id;

    let badgeText = "Not Inspectable";
    if (perm.state === "granted") badgeText = "Granted";
    else if (perm.state === "denied") badgeText = "Denied";
    else if (perm.state === "prompt") badgeText = "Prompt";

    row.innerHTML = `
      <div class="perm-left">
        <span class="perm-icon">${perm.icon || "🔒"}</span>
        <span class="perm-name">${perm.label}</span>
      </div>
      <span class="perm-badge ${perm.state}">${badgeText}</span>
    `;

    row.addEventListener("click", () => {
      document.querySelectorAll(".perm-row").forEach(r => r.classList.remove("selected"));
      row.classList.add("selected");
      showPermissionPreview(perm);
    });

    grid.appendChild(row);
  });

  // Show preview of first item by default
  if (perms.length > 0) {
    showPermissionPreview(perms[0]);
  }
}

function showPermissionPreview(perm) {
  const previewBox = document.getElementById("previewBox");
  const previewText = document.getElementById("previewText");

  // Lookup rich explanation from PermissionsDB
  let plainEnglish = "";
  let consideration = "";
  let considerationLevel = "";

  if (window.PermissionsDB) {
    const details = window.PermissionsDB.getById(perm.id);
    if (details) {
      plainEnglish = details.plain_english;
      consideration = details.considerations && details.considerations[0] ? details.considerations[0] : "";
      considerationLevel = details.consideration_level;
    }
  }

  let stateDescription = perm.details;
  if (perm.state === "granted") {
    stateDescription = "Allowed: The site has been granted permission to access this feature.";
  } else if (perm.state === "prompt") {
    stateDescription = "Prompt: The site will ask for your explicit approval before using this feature.";
  } else if (perm.state === "denied") {
    stateDescription = "Blocked: Access is explicitly denied for this origin.";
  }

  previewBox.innerHTML = `
    <div class="preview-header">
      <span class="preview-label">${perm.label} (${perm.state.toUpperCase()})</span>
    </div>
    <p class="preview-text" style="font-weight: 500; color: var(--text-primary); margin-bottom: 4px;">
      ${stateDescription}
    </p>
    <p class="preview-text">
      ${plainEnglish || "Standard browser security barrier."}
    </p>
    ${consideration ? `
      <p class="preview-text" style="margin-top: 5px; font-size: 11px; color: #b45309; background: #fffbeb; padding: 4px 6px; border-radius: 4px;">
        💡 <strong>Privacy Note:</strong> ${consideration}
      </p>
    ` : ""}
  `;
}
