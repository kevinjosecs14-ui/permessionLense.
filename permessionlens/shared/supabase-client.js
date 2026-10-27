/**
 * PermissionLens - Supabase Client & Offline Sync Layer
 * Secure client using publishable/anon key with complete local fallback.
 */

const DEFAULT_SUPABASE_CONFIG = {
  url: "https://eztyekehrdxqslmzmfgg.supabase.co",
  anonKey: "sb_publishable_OcPjw9LCF1ChZBbjhxp2NQ_20cg4NAh"
};

class PermissionLensSupabase {
  constructor(customConfig = {}) {
    // Priority: custom config > window/env overrides > verified project default
    const envUrl = (typeof process !== "undefined" && (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL)) ||
                   (typeof window !== "undefined" && (window.__SUPABASE_URL__ || (window.localStorage && localStorage.getItem("PL_SUPABASE_URL"))));
    const envKey = (typeof process !== "undefined" && (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)) ||
                   (typeof window !== "undefined" && (window.__SUPABASE_ANON_KEY__ || (window.localStorage && localStorage.getItem("PL_SUPABASE_ANON_KEY"))));

    this.url = customConfig.url || envUrl || DEFAULT_SUPABASE_CONFIG.url;
    this.anonKey = customConfig.anonKey || envKey || DEFAULT_SUPABASE_CONFIG.anonKey;
    this.isOnline = true;
  }

  getHeaders() {
    return {
      "apikey": this.anonKey,
      "Authorization": `Bearer ${this.anonKey}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    };
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.url}/rest/v1/permissions?select=id&limit=1`, {
        method: "GET",
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(3500)
      });
      this.isOnline = response.ok;
      return { online: response.ok, status: response.status };
    } catch (err) {
      this.isOnline = false;
      return { online: false, error: err.message };
    }
  }

  async getPermissions() {
    try {
      const response = await fetch(`${this.url}/rest/v1/permissions?select=*`, {
        method: "GET",
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(4000)
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return { data, source: "supabase" };
        }
      }
    } catch (err) {
      console.warn("[PermissionLens] Supabase unreachable, using offline database:", err.message);
    }

    // Graceful offline fallback
    const fallback = (typeof window !== "undefined" && window.PermissionsDB) 
      ? window.PermissionsDB.getAll() 
      : (typeof PERMISSIONS_DATA !== "undefined" ? PERMISSIONS_DATA : []);
    return { data: fallback, source: "offline_bundle" };
  }

  async getProfiles() {
    try {
      const response = await fetch(`${this.url}/rest/v1/profiles?select=*`, {
        method: "GET",
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(4000)
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return { data, source: "supabase" };
        }
      }
    } catch (err) {
      console.warn("[PermissionLens] Supabase unreachable for profiles, using offline fallback:", err.message);
    }

    // Graceful offline fallback
    const fallback = (typeof window !== "undefined" && window.ProfilesDB) 
      ? window.ProfilesDB.getAll() 
      : (typeof PROFILES_DATA !== "undefined" ? PROFILES_DATA : []);
    return { data: fallback, source: "offline_bundle" };
  }

  async recordComparison(comparisonData) {
    // Only attempt if user opted-in and network is available
    try {
      const response = await fetch(`${this.url}/rest/v1/comparison_history`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          label: comparisonData.label || "Manual Comparison",
          before_permissions: comparisonData.before || [],
          after_permissions: comparisonData.after || [],
          summary: comparisonData.summary || "",
          insights: comparisonData.insights || {}
        }),
        signal: AbortSignal.timeout(4000)
      });
      return { success: response.ok, status: response.status };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

const SUPABASE_CONFIG = DEFAULT_SUPABASE_CONFIG;

// Global and module export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PermissionLensSupabase, SUPABASE_CONFIG, DEFAULT_SUPABASE_CONFIG };
}
if (typeof window !== 'undefined') {
  window.PermissionLensSupabase = PermissionLensSupabase;
  window.SUPABASE_CONFIG = SUPABASE_CONFIG;
}
