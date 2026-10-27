/**
 * PermissionLens - Shared UI Component Helpers
 * Renders consistent, accessible cards and badges in the Anime/White theme.
 */

const UI = {
  renderRiskBadge(level) {
    const l = (level || "").toLowerCase();
    if (l.includes("higher")) {
      return `<span class="pl-badge pl-badge-higher">⚠️ Higher Consideration</span>`;
    } else if (l.includes("moderate")) {
      return `<span class="pl-badge pl-badge-moderate">⚡ Moderate Consideration</span>`;
    } else {
      return `<span class="pl-badge pl-badge-lower">✓ Lower Consideration</span>`;
    }
  },

  renderPermissionCard(permission, options = {}) {
    if (!permission) return "";
    const isExpanded = options.expanded || false;
    const isSelectable = options.selectable || false;
    const isSelected = options.selected || false;
    const showDiffBadge = options.diffBadge || null; // 'added' | 'removed' | 'unchanged'

    let diffHtml = "";
    if (showDiffBadge === "added") {
      diffHtml = `<span class="pl-pill pl-pill-added">+ ADDED</span>`;
    } else if (showDiffBadge === "removed") {
      diffHtml = `<span class="pl-pill pl-pill-removed">- REMOVED</span>`;
    } else if (showDiffBadge === "unchanged") {
      diffHtml = `<span class="pl-pill pl-pill-unchanged">UNCHANGED</span>`;
    }

    const checkboxHtml = isSelectable ? `
      <input type="checkbox" class="pl-checkbox" data-id="${permission.id}" ${isSelected ? "checked" : ""} />
    ` : "";

    const usesList = (permission.legitimate_use_cases || []).map(u => `<li>${u}</li>`).join("");
    const accessibleDataList = (permission.accessible_data || []).map(d => `<li>${d}</li>`).join("");
    const questionsList = (permission.privacy_questions || []).map(q => `<li>${q}</li>`).join("");
    const controlsList = (permission.suggested_controls || []).map(c => `<li>${c}</li>`).join("");

    return `
      <div class="pl-card ${showDiffBadge ? 'pl-card-diff-' + showDiffBadge : ''}" data-permission-id="${permission.id}">
        <div class="pl-card-header">
          <div class="pl-card-title-row">
            ${checkboxHtml}
            <div class="pl-card-name-group">
              <h3 class="pl-card-title">${permission.name}</h3>
              <span class="pl-card-category">${permission.category || "System Sensor"}</span>
            </div>
          </div>
          <div class="pl-card-badges">
            ${diffHtml}
            ${this.renderRiskBadge(permission.consideration_level)}
          </div>
        </div>

        <p class="pl-card-short">${permission.short_description || ""}</p>

        <div class="pl-card-expandable ${isExpanded ? 'is-open' : ''}">
          <div class="pl-section">
            <h4 class="pl-section-title">📖 Plain English Explanation</h4>
            <p class="pl-text">${permission.plain_english || "No extended explanation available."}</p>
          </div>

          ${usesList ? `
            <div class="pl-section">
              <h4 class="pl-section-title">🎯 Why an App or Website May Need It</h4>
              <ul class="pl-list pl-list-uses">${usesList}</ul>
            </div>
          ` : ""}

          ${accessibleDataList ? `
            <div class="pl-section">
              <h4 class="pl-section-title">🔍 What Information Can Be Accessed</h4>
              <ul class="pl-list pl-list-data">${accessibleDataList}</ul>
            </div>
          ` : ""}

          ${questionsList ? `
            <div class="pl-section">
              <h4 class="pl-section-title">❓ Privacy Questions to Ask Yourself</h4>
              <ul class="pl-list pl-list-questions">${questionsList}</ul>
            </div>
          ` : ""}

          ${controlsList ? `
            <div class="pl-section">
              <h4 class="pl-section-title">🛡️ How to Control or Revoke</h4>
              <ul class="pl-list pl-list-controls">${controlsList}</ul>
            </div>
          ` : ""}
        </div>

        <button type="button" class="pl-expand-toggle-btn" aria-label="Toggle details">
          <span class="btn-text">${isExpanded ? "Show Less" : "Explain More"}</span>
          <span class="btn-chevron">${isExpanded ? "▲" : "▼"}</span>
        </button>
      </div>
    `;
  },

  renderEmptyState(title, message, actionHtml = "") {
    return `
      <div class="pl-empty-state">
        <div class="pl-empty-icon">🔍</div>
        <h3 class="pl-empty-title">${title}</h3>
        <p class="pl-empty-desc">${message}</p>
        ${actionHtml ? `<div class="pl-empty-actions">${actionHtml}</div>` : ""}
      </div>
    `;
  },

  renderLoading(message = "Analyzing permissions...") {
    return `
      <div class="pl-loading-container">
        <div class="pl-spinner"></div>
        <p class="pl-loading-text">${message}</p>
      </div>
    `;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UI };
}
if (typeof window !== 'undefined') {
  window.UI = UI;
}
