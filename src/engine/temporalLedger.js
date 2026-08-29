// Temporal Fairness Ledger & Citizen Trust Index Engine
// Research basis: Cari et al., 2026; Mehta, 2025; Levy et al., 2021

import { WARDS } from '../data/kopargaonData.js';

export class TemporalLedger {
  constructor() {
    this.historyCycles = [];
    this.wardNeglectScores = {};
    this.wardTrustIndices = {};

    // Initialize with baseline data
    WARDS.forEach(w => {
      this.wardNeglectScores[w.id] = w.historicalNeglectScore;
      this.wardTrustIndices[w.id] = Math.max(45, Math.round(100 - w.historicalNeglectScore * 0.6 + Math.random() * 10));
    });
  }

  getScores() {
    return { ...this.wardNeglectScores };
  }

  getTrustIndices() {
    return { ...this.wardTrustIndices };
  }

  /**
   * Updates temporal equity when a triage cycle executes
   */
  processCycleResults(batch1Items, deferredItems) {
    const servicedWardIds = new Set(batch1Items.map(i => i.wardId));
    const deferredWardIds = new Set(deferredItems.map(i => i.wardId));

    const cycleRecord = {
      timestamp: new Date().toISOString(),
      servicedWards: Array.from(servicedWardIds),
      deferredWards: Array.from(deferredWardIds),
      neglectState: {}
    };

    WARDS.forEach(ward => {
      let currentNeglect = this.wardNeglectScores[ward.id];
      let currentTrust = this.wardTrustIndices[ward.id];

      if (servicedWardIds.has(ward.id)) {
        // Relief: reduce neglect by 55%, boost trust
        currentNeglect = Math.max(10, Math.round(currentNeglect * 0.45));
        currentTrust = Math.min(98, currentTrust + 6);
      } else {
        // Deprioritization: accumulate rotational urgency
        const increaseRate = ward.slumPocket ? 14 : 9;
        currentNeglect = Math.min(99, currentNeglect + increaseRate);
        currentTrust = Math.max(20, currentTrust - 3);
      }

      this.wardNeglectScores[ward.id] = currentNeglect;
      this.wardTrustIndices[ward.id] = currentTrust;
      cycleRecord.neglectState[ward.id] = currentNeglect;
    });

    this.historyCycles.push(cycleRecord);
    return cycleRecord;
  }

  /**
   * Identifies wards at critical starvation risk
   */
  getStarvationAlerts() {
    const alerts = [];
    WARDS.forEach(w => {
      const score = this.wardNeglectScores[w.id];
      if (score >= 75) {
        alerts.push({
          wardId: w.id,
          wardName: w.name,
          wardNameMr: w.nameMr,
          neglectScore: score,
          status: "CRITICAL_STARVATION_RISK",
          recommendation: "Algorithm automatically boosting temporal equity weight by +40% for next dispatch cycle."
        });
      }
    });
    return alerts;
  }
}
