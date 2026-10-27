/**
 * PermissionLens - Permission Impact Simulator Engine
 * Implements deterministic set comparison and transparent risk impact scoring.
 */

class PermissionImpactSimulator {
  /**
   * Compares two sets of permission IDs
   * @param {string[]} currentIds Array of permission IDs for Profile A
   * @param {string[]} proposedIds Array of permission IDs for Profile B
   * @param {Function} getPermissionFn Lookup function to fetch permission details
   */
  static compareProfiles(currentIds = [], proposedIds = [], getPermissionFn = null) {
    const lookup = getPermissionFn || ((id) => {
      if (typeof window !== "undefined" && window.PermissionsDB) {
        return window.PermissionsDB.getById(id);
      }
      return null;
    });

    const setA = new Set(currentIds.filter(Boolean));
    const setB = new Set(proposedIds.filter(Boolean));

    const addedIds = [...setB].filter(id => !setA.has(id));
    const removedIds = [...setA].filter(id => !setB.has(id));
    const unchangedIds = [...setA].filter(id => setB.has(id));

    const added = addedIds.map(id => lookup(id) || { id, name: id, consideration_level: "Moderate consideration", risk_score: 2 });
    const removed = removedIds.map(id => lookup(id) || { id, name: id, consideration_level: "Moderate consideration", risk_score: 2 });
    const unchanged = unchangedIds.map(id => lookup(id) || { id, name: id, consideration_level: "Moderate consideration", risk_score: 2 });

    // Deterministic Scoring
    const scoreA = this.calculateSetScore(setA, lookup);
    const scoreB = this.calculateSetScore(setB, lookup);
    const addedScore = added.reduce((sum, p) => sum + (p.risk_score || 2), 0);
    const removedScore = removed.reduce((sum, p) => sum + (p.risk_score || 2), 0);
    const deltaScore = scoreB - scoreA;

    let impactAssessment = "Neutral";
    let impactDescription = "No net change in requested sensitive capabilities.";

    if (deltaScore > 3) {
      impactAssessment = "Significantly Increased Exposure";
      impactDescription = `Adds ${added.length} new sensitive permission(s) requiring careful review before granting.`;
    } else if (deltaScore > 0) {
      impactAssessment = "Moderately Increased Exposure";
      impactDescription = `Slight expansion in data or sensor access (+${deltaScore} points).`;
    } else if (deltaScore < 0) {
      impactAssessment = "Reduced Data Exposure";
      impactDescription = `Privacy improves as ${removed.length} sensitive capability(ies) are removed (${deltaScore} points).`;
    } else if (added.length > 0 && removed.length > 0) {
      impactAssessment = "Changed Access Surface";
      impactDescription = `Different permissions swapped with equal aggregate sensitivity weights.`;
    }

    return {
      currentIds: [...setA],
      proposedIds: [...setB],
      added,
      removed,
      unchanged,
      stats: {
        totalBefore: setA.size,
        totalAfter: setB.size,
        addedCount: added.length,
        removedCount: removed.length,
        unchangedCount: unchanged.length,
        scoreBefore: scoreA,
        scoreAfter: scoreB,
        addedScore,
        removedScore,
        deltaScore
      },
      assessment: {
        title: impactAssessment,
        description: impactDescription,
        scoringRules: "Deterministic calculation based on sensitivity categories: Higher consideration = 3 pts (Microphone, Camera, Contacts, Location), Moderate consideration = 2 pts (Storage, Photos, Bluetooth, Sensors), Lower consideration = 1 pt (Notifications). This is an educational metric of access breadth, not an assessment of whether an app is malicious."
      }
    };
  }

  static calculateSetScore(idSet, lookup) {
    let score = 0;
    for (const id of idSet) {
      const p = lookup(id);
      score += (p && p.risk_score) ? p.risk_score : 2;
    }
    return score;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PermissionImpactSimulator };
}
if (typeof window !== 'undefined') {
  window.PermissionImpactSimulator = PermissionImpactSimulator;
}
