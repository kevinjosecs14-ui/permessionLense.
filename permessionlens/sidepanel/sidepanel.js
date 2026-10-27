/**
 * PermissionLens - Side Panel Controller
 */

let spActiveSite = null;

document.addEventListener("DOMContentLoaded", () => {
  setupSidepanelNav();
  setupSidepanelEvents();
  inspectSidepanelSite();
  runSidepanelSimulator();
});

function setupSidepanelNav() {
  const tabs = document.querySelectorAll(".panel-nav .nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const targetView = tab.dataset.view;
      document.querySelectorAll(".view-pane").forEach(pane => {
        pane.classList.toggle("active", pane.id === targetView);
      });
    });
  });
}

function setupSidepanelEvents() {
  document.getElementById("btnSideRefresh").addEventListener("click", () => {
    inspectSidepanelSite();
  });

  document.getElementById("btnSideOpenFull").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "OPEN_DASHBOARD" });
  });

  document.getElementById("btnSpScan").addEventListener("click", () => {
    inspectSidepanelSite();
  });

  document.getElementById("btnSpSettings").addEventListener("click", () => {
    if (spActiveSite && spActiveSite.origin) {
      chrome.runtime.sendMessage({ 
        action: "OPEN_SITE_SETTINGS", 
        origin: spActiveSite.origin 
      });
    }
  });

  document.getElementById("btnSpSimulate").addEventListener("click", () => {
    runSidepanelSimulator();
  });
}

function inspectSidepanelSite() {
  const hostnameEl = document.getElementById("spHostname");
  const securityDot = document.getElementById("spSecurityDot");
  const protocolPill = document.getElementById("spProtocol");
  const listEl = document.getElementById("spPermissionsList");

  listEl.innerHTML = `
    <div class="loading-box">
      <div class="mini-spinner"></div>
      <span>Querying browser permissions...</span>
    </div>
  `;

  chrome.runtime.sendMessage({ action: "GET_ACTIVE_TAB_INFO" }, (tabInfo) => {
    if (!tabInfo || !tabInfo.success || tabInfo.isRestrictedPage) {
      hostnameEl.textContent = tabInfo && tabInfo.title ? tabInfo.title : "Restricted Page";
      protocolPill.textContent = "N/A";
      listEl.innerHTML = `<p style="padding:10px; font-size:11.5px; color:var(--text-muted); text-align:center;">Open a public website to inspect permissions.</p>`;
      return;
    }

    spActiveSite = tabInfo;
    hostnameEl.textContent = tabInfo.hostname || tabInfo.origin;

    if (tabInfo.isSecure) {
      securityDot.classList.remove("insecure");
      protocolPill.textContent = "HTTPS";
      protocolPill.classList.remove("insecure");
    } else {
      securityDot.classList.add("insecure");
      protocolPill.textContent = "HTTP";
      protocolPill.classList.add("insecure");
    }

    // In-page permissions
    chrome.runtime.sendMessage({ action: "INSPECT_ACTIVE_PAGE" }, (res) => {
      if (!res || !res.success || !res.data) {
        listEl.innerHTML = `<p style="padding:10px; font-size:11.5px; color:var(--color-denied); text-align:center;">Could not inspect permissions.</p>`;
        return;
      }

      renderSidepanelPermissions(res.data.permissions);
    });
  });
}

function renderSidepanelPermissions(perms) {
  const listEl = document.getElementById("spPermissionsList");
  listEl.innerHTML = "";

  perms.forEach((p, idx) => {
    const item = document.createElement("div");
    item.className = "sp-perm-item" + (idx === 0 ? " active" : "");
    item.innerHTML = `
      <div class="sp-perm-name">
        <span>${p.icon || "🔒"}</span>
        <span>${p.label}</span>
      </div>
      <span class="badge-tag ${p.state}">${p.state.toUpperCase()}</span>
    `;

    item.addEventListener("click", () => {
      document.querySelectorAll(".sp-perm-item").forEach(x => x.classList.remove("active"));
      item.classList.add("active");
      updateSidepanelDetail(p);
    });

    listEl.appendChild(item);
  });

  if (perms.length > 0) {
    updateSidepanelDetail(perms[0]);
  }
}

function updateSidepanelDetail(perm) {
  const detailText = document.getElementById("spDetailText");
  let explanation = perm.details;

  if (window.PermissionsDB) {
    const meta = window.PermissionsDB.getById(perm.id);
    if (meta) {
      explanation = meta.plain_english;
    }
  }

  detailText.innerHTML = `
    <strong>${perm.label} (${perm.state.toUpperCase()}):</strong> ${explanation}
  `;
}

function runSidepanelSimulator() {
  const profAId = document.getElementById("spSelectA").value;
  const profBId = document.getElementById("spSelectB").value;

  const profA = window.ProfilesDB ? window.ProfilesDB.getById(profAId) : null;
  const profB = window.ProfilesDB ? window.ProfilesDB.getById(profBId) : null;

  const permsA = profA ? profA.permission_ids : [];
  const permsB = profB ? profB.permission_ids : [];

  const res = PermissionImpactSimulator.compareProfiles(permsA, permsB);
  const resultsContainer = document.getElementById("spSimResults");

  resultsContainer.innerHTML = `
    <div class="sim-res-box">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <strong style="font-size:12px;">${res.assessment.title}</strong>
        <span style="font-size:11px; font-weight:800; color:var(--purple-600);">${res.stats.deltaScore >= 0 ? '+' : ''}${res.stats.deltaScore} pts</span>
      </div>
      <p style="font-size:11px; color:var(--text-muted); margin-bottom:8px;">${res.assessment.description}</p>
      <div style="display:flex; gap:6px; font-size:10.5px; font-weight:700;">
        <span style="background:var(--bg-granted); color:var(--color-granted); padding:2px 6px; border-radius:6px;">+${res.stats.addedCount} Added</span>
        <span style="background:var(--accent-soft); color:var(--purple-600); padding:2px 6px; border-radius:6px;">-${res.stats.removedCount} Removed</span>
        <span style="background:#f1f5f9; color:var(--text-muted); padding:2px 6px; border-radius:6px;">=${res.stats.unchangedCount} Unchanged</span>
      </div>
    </div>
  `;
}
