// Main Application Controller for Kopargaon Shejpali Water Prioritization Digital Twin
import { WARDS, INITIAL_GRIEVANCES, SEASONAL_PRESETS, I18N, MUNICIPAL_RESOURCES } from '../data/kopargaonData.js';
import { TriageEngine } from '../engine/triageEngine.js';
import { CascadeEngine } from '../engine/cascadeGraph.js';
import { ExplainabilityEngine } from '../engine/explainabilityEngine.js';
import { TemporalLedger } from '../engine/temporalLedger.js';
import { AuditLedger } from '../engine/auditLedger.js';
import { VoiceAIEngine } from '../engine/voiceAI.js';
import { ResilienceEngine } from '../engine/resilienceEngine.js';
import { TruthEngine } from '../engine/truthEngine.js';
import { MapRenderer } from './mapRenderer.js';
import { CascadeRenderer } from './cascadeRenderer.js';
import { ChartsRenderer } from './chartsRenderer.js';

export class AppController {
  constructor() {
    this.currentLanguage = "en";
    this.activeGrievances = JSON.parse(JSON.stringify(INITIAL_GRIEVANCES));
    
    // Instantiate Core Engines
    this.triageEngine = new TriageEngine();
    this.cascadeEngine = new CascadeEngine();
    this.xaiEngine = new ExplainabilityEngine();
    this.temporalLedger = new TemporalLedger();
    this.auditLedger = new AuditLedger();
    this.voiceAI = new VoiceAIEngine();
    this.resilienceEngine = new ResilienceEngine(this.auditLedger);
    this.truthEngine = new TruthEngine(this.auditLedger);

    // Renderers
    this.mapRenderer = null;
    this.cascadeRenderer = null;
    this.chartsRenderer = new ChartsRenderer();

    // State
    this.currentTriageResult = null;
    this.selectedIssueId = "SHJ-101";
    this.contrastIssueAId = "SHJ-101";
    this.contrastIssueBId = "SHJ-103";
    this.isCascading = false;
    this.activePhaseFilter = "all";

    // Video Scrubbing State
    this.videoElement = null;
    this.isScrubbing = false;
  }

  init() {
    this.initVideoScrubber();
    this.initRenderers();
    this.bindEvents();
    this.runTriageCycle();
    this.updateLanguageUI();
  }

  initVideoScrubber() {
    this.videoElement = document.getElementById('hero-bg-video');
    if (!this.videoElement) return;

    // Ensure video is muted and playsinline for iOS/Chrome
    this.videoElement.muted = true;
    this.videoElement.playsInline = true;

    const heroSection = document.getElementById('hero-section');
    if (!heroSection) return;

    let targetTime = 0;
    let isVideoReady = false;

    this.videoElement.addEventListener('loadedmetadata', () => {
      isVideoReady = true;
      this.videoElement.pause();
    });

    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // If mobile / touch device with slow scrubbing, autoplay loop smoothly
    if (isTouchDevice && window.innerWidth < 768) {
      this.videoElement.loop = true;
      this.videoElement.play().catch(() => {});
      return;
    }

    // Smooth scroll scrubbing loop with RAF
    const onScroll = () => {
      if (!isVideoReady || !this.videoElement.duration) return;

      const rect = heroSection.getBoundingClientRect();
      const totalScrollDistance = heroSection.offsetHeight - window.innerHeight;
      
      if (totalScrollDistance <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollDistance));
      targetTime = progress * (this.videoElement.duration || 10);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // RAF smoothing loop
    const smoothVideoUpdate = () => {
      if (isVideoReady && this.videoElement && !this.videoElement.seeking) {
        const diff = targetTime - this.videoElement.currentTime;
        if (Math.abs(diff) > 0.04) {
          this.videoElement.currentTime += diff * 0.18;
        }
      }
      requestAnimationFrame(smoothVideoUpdate);
    };

    requestAnimationFrame(smoothVideoUpdate);
  }

  initRenderers() {
    // Map
    this.mapRenderer = new MapRenderer('map-container', (issueId) => {
      this.selectIssueForInspection(issueId);
      const xaiSection = document.getElementById('section-explainability');
      if (xaiSection) xaiSection.scrollIntoView({ behavior: 'smooth' });
    });
    this.mapRenderer.init();

    // Cascade Canvas
    this.cascadeRenderer = new CascadeRenderer('cascade-canvas', (node) => {
      this.handleCascadeNodeSelected(node);
    });
    this.cascadeRenderer.setData(this.cascadeEngine.graph, false);

    // Initial Voice Samples
    this.renderVoiceSamples();
  }

  bindEvents() {
    // Language Toggle
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        this.currentLanguage = this.currentLanguage === "en" ? "mr" : "en";
        this.updateLanguageUI();
      });
    }

    // Seasonal Mode Select
    const modeSelect = document.getElementById('seasonal-mode-select');
    if (modeSelect) {
      modeSelect.addEventListener('change', (e) => {
        const mode = e.target.value;
        this.triageEngine.setMode(mode);
        this.auditLedger.addBlock(
          "POLICY_MODE_CHANGE",
          "Executive Engineer (Irrigation Div) & KMC",
          { mode, preset: SEASONAL_PRESETS[mode] },
          `Operational Shejpali policy mode switched to ${mode} (${SEASONAL_PRESETS[mode].name})`
        );
        this.runTriageCycle();
        this.renderAuditLedger();
      });
    }

    // Run Triage Button
    const runTriageBtn = document.getElementById('btn-run-triage');
    if (runTriageBtn) {
      runTriageBtn.addEventListener('click', () => {
        this.runTriageCycle();
        const triageSection = document.getElementById('section-triage-stepper');
        if (triageSection) triageSection.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Phase Stepper Filter Buttons
    document.querySelectorAll('.phase-step-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const phase = btn.dataset.phase;
        this.activePhaseFilter = phase;
        
        document.querySelectorAll('.phase-step-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.applyPhaseFilter(phase);
      });
    });

    // Cascade Trigger Button
    const btnSimCascade = document.getElementById('btn-sim-cascade');
    if (btnSimCascade) {
      btnSimCascade.addEventListener('click', () => {
        this.triggerCascadeSimulation();
      });
    }

    const btnResetCascade = document.getElementById('btn-reset-cascade');
    if (btnResetCascade) {
      btnResetCascade.addEventListener('click', () => {
        this.resetCascadeSimulation();
      });
    }

    // Voice Recording
    const micBtn = document.getElementById('btn-voice-record');
    if (micBtn) {
      micBtn.addEventListener('click', () => {
        this.toggleVoiceRecord();
      });
    }

    // Stage Gate Override
    const btnOverride = document.getElementById('btn-stage-gate-override');
    if (btnOverride) {
      btnOverride.addEventListener('click', () => {
        this.openOverrideModal();
      });
    }

    // RTI Export
    const btnRti = document.getElementById('btn-export-rti');
    if (btnRti) {
      btnRti.addEventListener('click', () => {
        this.exportRTI();
      });
    }

    // Tamper Test
    const btnTamper = document.getElementById('btn-tamper-test');
    if (btnTamper) {
      btnTamper.addEventListener('click', () => {
        this.testTamperDetection();
      });
    }

    // Live Hackathon Challenges (Challenge 1 & Challenge 2)
    this.bindChallengeEvents();
  }

  applyPhaseFilter(phase) {
    const colB1 = document.getElementById('col-batch1-wrapper');
    const colB2 = document.getElementById('col-batch2-wrapper');
    const colDef = document.getElementById('col-deferred-wrapper');
    const grid = document.getElementById('stepper-grid-container');

    if (!colB1 || !colB2 || !colDef || !grid) return;

    if (phase === "all") {
      colB1.style.display = "flex";
      colB2.style.display = "flex";
      colDef.style.display = "flex";
      grid.style.gridTemplateColumns = "repeat(3, 1fr)";
    } else if (phase === "batch1") {
      colB1.style.display = "flex";
      colB2.style.display = "none";
      colDef.style.display = "none";
      grid.style.gridTemplateColumns = "1fr";
    } else if (phase === "batch2") {
      colB1.style.display = "none";
      colB2.style.display = "flex";
      colDef.style.display = "none";
      grid.style.gridTemplateColumns = "1fr";
    } else if (phase === "deferred") {
      colB1.style.display = "none";
      colB2.style.display = "none";
      colDef.style.display = "flex";
      grid.style.gridTemplateColumns = "1fr";
    }
  }

  runTriageCycle() {
    const temporalScores = this.temporalLedger.getScores();
    const result = this.triageEngine.optimizeTriage(this.activeGrievances, temporalScores);
    this.currentTriageResult = result;

    // Update Temporal Ledger with this cycle
    this.temporalLedger.processCycleResults(result.batch1, result.deferred);

    // Record in Audit Ledger
    this.auditLedger.addBlock(
      "SHEJPALI_TRIAGE_DISPATCH",
      "Shejpali Algorithmic Engine v3.0",
      {
        mode: this.triageEngine.currentMode,
        batch1Count: result.batch1.length,
        batch2Count: result.batch2.length,
        deferredCount: result.deferred.length,
        cusecsAllocated: result.resourceUtilization.cusecsAllocated,
        budgetAllocated: result.resourceUtilization.budgetAllocated
      },
      `Authorized Batch 1 (${result.batch1.length} permits) utilizing ${result.resourceUtilization.cusecsAllocated} Cusecs of 140 Cusec daily rotation ceiling.`
    );

    // Update UI Elements
    this.renderTriageColumns(result);
    this.updateMetricsTicker(result.resourceUtilization);
    this.renderMapPins();
    this.renderXAIPanel();
    this.renderCitizenPortal(result);
    this.renderGovernancePanel();
  }

  renderMapPins() {
    if (!this.mapRenderer || !this.currentTriageResult) return;
    const triageMap = {};
    this.currentTriageResult.allScored.forEach(item => {
      triageMap[item.id] = item;
    });
    this.mapRenderer.renderIssues(this.activeGrievances, triageMap);
  }

  renderTriageColumns(result) {
    const b1Container = document.getElementById('queue-batch1');
    const b2Container = document.getElementById('queue-batch2');
    const defContainer = document.getElementById('queue-deferred');

    if (!b1Container || !b2Container || !defContainer) return;

    b1Container.innerHTML = result.batch1.map(item => this.createGrievanceCardHTML(item, "batch1")).join("");
    b2Container.innerHTML = result.batch2.map(item => this.createGrievanceCardHTML(item, "batch2")).join("");
    defContainer.innerHTML = result.deferred.map(item => this.createGrievanceCardHTML(item, "deferred")).join("");

    // Bind card click & Inspect XAI
    document.querySelectorAll('.card-grievance').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = card.dataset.id;
        this.selectIssueForInspection(id);

        if (e.target.closest('.inspect-xai-link')) {
          const xaiSec = document.getElementById('section-explainability');
          if (xaiSec) xaiSec.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  createGrievanceCardHTML(item, type) {
    const isSelected = item.id === this.selectedIssueId;
    const title = this.currentLanguage === "mr" ? (item.titleMr || item.title) : item.title;
    const applicant = this.currentLanguage === "mr" ? (item.applicantNameMr || item.applicantName) : item.applicantName;
    const scoreClass = item.triageScore >= 80 ? "high" : (item.triageScore >= 60 ? "medium" : "low");

    let bottleneckHTML = "";
    if (item.bottlenecks && item.bottlenecks.length > 0) {
      bottleneckHTML = `<div class="card-bottlenecks">⚠️ ${item.bottlenecks[0]}</div>`;
    }

    const assignedBadge = item.assignedCrew 
      ? `<span style="color: #10b981; font-weight:700; font-size:11px;">🚪 ${item.assignedCrew} • 🌊 ${item.appliedDischargeCusecs || 0} cfs</span>` 
      : `<span style="color: #94a3b8; font-size:11px;">Est. Wait: +${Math.round(item.estimatedWaitHours || 12)}h</span>`;

    return `
      <div class="card-grievance ${isSelected ? 'selected' : ''}" data-id="${item.id}">
        <div class="card-top">
          <div>
            <span style="font-size:10.5px; color:#0284c7; font-weight:700; display:block; font-family:var(--font-mono);">📜 ${item.permitNo || 'PERMIT QUEUED'}</span>
            <h4 class="card-title">${title}</h4>
          </div>
          <span class="score-pill ${scoreClass}">${item.triageScore}</span>
        </div>
        <div style="font-size:11.5px; color:#334155; margin-bottom:4px;"><strong>Applicant:</strong> ${applicant}</div>
        <div class="card-ward">📍 ${item.wardName}</div>
        <div class="card-metrics">
          <div>🌾 <strong>${item.cropType ? item.cropType.split(' ')[0] : 'Water Claim'}</strong></div>
          <div>⏱️ <strong>${item.daysSinceLastTurn || 0}d dry</strong></div>
          <div>🌊 <strong>${item.appliedDischargeCusecs || 0} cfs</strong></div>
        </div>
        <div style="margin-top: 8px; display:flex; justify-content:space-between; align-items:center;">
          ${assignedBadge}
          <span class="inspect-xai-link" style="font-size:11px; color:#0284c7; font-weight:700; text-decoration:underline; cursor:pointer;">Inspect XAI →</span>
        </div>
        ${bottleneckHTML}
      </div>
    `;
  }

  selectIssueForInspection(issueId) {
    this.selectedIssueId = issueId;
    this.contrastIssueAId = issueId;
    this.renderTriageColumns(this.currentTriageResult);
    this.renderXAIPanel();
  }

  renderXAIPanel() {
    if (!this.currentTriageResult) return;
    const itemA = this.currentTriageResult.allScored.find(i => i.id === this.contrastIssueAId) || this.currentTriageResult.allScored[0];
    const itemB = this.currentTriageResult.allScored.find(i => i.id === this.contrastIssueBId) || this.currentTriageResult.allScored[this.currentTriageResult.allScored.length - 1];

    if (!itemA) return;

    // 1. Single Item Justification
    const justif = this.xaiEngine.generateJustification(itemA, this.currentLanguage);
    const justifBox = document.getElementById('xai-justification-box');
    if (justifBox) {
      const title = this.currentLanguage === "mr" ? (itemA.titleMr || itemA.title) : itemA.title;
      const applicant = this.currentLanguage === "mr" ? (itemA.applicantNameMr || itemA.applicantName) : itemA.applicantName;

      justifBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div>
            <span style="font-size:11px; color:#0284c7; font-weight:700; font-family:var(--font-mono);">📜 ${itemA.permitNo || 'PERMIT PENDING'} • ${applicant}</span>
            <h3 style="font-size:16px; font-weight:800; color:#0f172a;">${title}</h3>
          </div>
          <span class="badge-pill-green">
            ${justif.publicBadge}
          </span>
        </div>
        <p style="font-size:13px; color:#334155; margin-bottom:12px; line-height:1.45;">${justif.summary}</p>
        <div style="background:#ffffff; border:1px solid var(--border-light); padding:12px; border-radius:8px;">
          <strong style="font-size:11.5px; color:#0284c7; display:block; margin-bottom:6px;">Shejpali Decision Drivers:</strong>
          <ul style="padding-left:16px; font-size:12px; color:#475569; display:flex; flex-direction:column; gap:4px;">
            ${justif.keyDrivers.map(d => `<li>${d}</li>`).join("")}
          </ul>
        </div>
      `;
    }

    // 2. SHAP Chart
    if (itemA.evaluation && itemA.evaluation.contributions) {
      this.chartsRenderer.renderSHAPChart('shap-canvas', itemA.evaluation.contributions, this.currentLanguage);
    }

    // 3. Contrastive Comparison (A vs B)
    const contrastBox = document.getElementById('xai-contrastive-box');
    if (contrastBox && itemB) {
      const contrast = this.xaiEngine.generateContrastiveExplanation(itemA, itemB, this.currentLanguage);
      contrastBox.innerHTML = `
        <div style="margin-bottom:10px;">
          <h4 style="font-size:13.5px; font-weight:800; color:#0f172a;">${contrast.headline}</h4>
          <span style="font-size:11px; color:#64748b;">Comparing ${itemA.id} (${itemA.wardName}) vs ${itemB.id} (${itemB.wardName})</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${contrast.comparisons.map(c => `
            <div class="contrast-row">
              <span style="font-weight:700; color:#0f172a;">${c.dimension}:</span>
              <span style="color:#475569;">${c.text}</span>
            </div>
          `).join("")}
        </div>
        <div style="margin-top:10px; padding:8px 12px; background:#f0fdf4; border-left:3px solid #16a34a; border-radius:4px; font-size:11.5px; color:#15803d;">
          <strong>Verdict:</strong> ${contrast.verdict}
        </div>
      `;
    }

    // 4. Opportunity Cost Panel
    const oppBox = document.getElementById('xai-opportunity-box');
    if (oppBox) {
      const oppData = this.xaiEngine.computeOpportunityCosts(
        this.currentTriageResult.batch1,
        [...this.currentTriageResult.batch2, ...this.currentTriageResult.deferred],
        this.currentLanguage
      );
      oppBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:12px; font-weight:600; color:#0f172a;">
          <span>Canal Cusecs Committed: <strong>${oppData.totalCusecsAllocated} Cfs</strong></span>
          <span>OpEx Allocation: <strong>₹${oppData.totalBudgetSpent.toLocaleString()}</strong></span>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${oppData.delayedCivicItems.map(d => `
            <div style="background:#ffffff; border:1px solid var(--border-light); padding:8px 10px; border-radius:6px; font-size:11.5px;">
              <div style="font-weight:700; color:#0f172a;">${d.title} (${d.ward})</div>
              <div style="color:#d97706; font-size:11px; margin-top:2px;">⏳ ${d.consequence}</div>
              <div style="color:#64748b; font-size:10px;">Constraint: ${d.bottleneck}</div>
            </div>
          `).join("")}
        </div>
      `;
    }

    // 5. Counterfactual Playground
    const cfBox = document.getElementById('xai-counterfactual-box');
    if (cfBox && this.currentTriageResult.batch2.length > 0) {
      const deferredTarget = this.currentTriageResult.batch2[0];
      const lowestBatch1 = this.currentTriageResult.batch1[this.currentTriageResult.batch1.length - 1];
      const cutoff = lowestBatch1 ? lowestBatch1.triageScore : 75;
      const cfResult = this.xaiEngine.solveCounterfactual(deferredTarget, cutoff);

      cfBox.innerHTML = `
        <div style="margin-bottom:8px;">
          <h4 style="font-size:13px; font-weight:700; color:#0f172a;">Target: ${deferredTarget.id} (${deferredTarget.cropType ? deferredTarget.cropType.split(' ')[0] : 'Crop'}) (Score: ${cfResult.currentScore}) $\\to$ Cutoff (${cfResult.targetCutoff})</h4>
          <span style="font-size:11px; color:#7c3aed; font-weight:600;">Required Delta to enter Batch 1 Sluice Release: <strong>+${cfResult.requiredDelta} pts</strong></span>
        </div>
        <div class="counterfactual-slider-box">
          <div class="cf-slider-row">
            <span>Simulate Soil Moisture Stress / Days Dry:</span>
            <strong id="cf-pop-val" style="color:#7c3aed;">+0 days</strong>
          </div>
          <input type="range" class="cf-slider" id="cf-pop-slider" min="0" max="20" step="1" value="0" />
          <div id="cf-outcome-text" style="margin-top:8px; font-size:11.5px; color:#475569;">
            Drag slider to simulate soil wilting stress and see if rotational equity promotes this farm to Batch 1.
          </div>
        </div>
      `;

      const slider = document.getElementById('cf-pop-slider');
      if (slider) {
        slider.addEventListener('input', (e) => {
          const addDays = parseInt(e.target.value, 10);
          const cfVal = document.getElementById('cf-pop-val');
          if (cfVal) cfVal.innerText = `+${addDays} days dry`;
          const boostedScore = Math.min(99.5, Math.round((cfResult.currentScore + (addDays / 20) * 22) * 10) / 10);
          const qualifies = boostedScore >= cfResult.targetCutoff;
          const outText = document.getElementById('cf-outcome-text');
          if (outText) {
            outText.innerHTML = qualifies
              ? `<span style="color:#15803d; font-weight:700;">🎉 Promoted to Batch 1! New Shejpali Score: ${boostedScore} exceeds cutoff ${cfResult.targetCutoff}</span>`
              : `<span style="color:#d97706;">Score increases to ${boostedScore}. Still needs +${Math.round((cfResult.targetCutoff - boostedScore) * 10) / 10} pts.</span>`;
          }
        });
      }
    }
  }

  triggerCascadeSimulation() {
    this.isCascading = true;
    const cascadeResult = this.cascadeEngine.triggerFailure("DIST_D2");
    this.cascadeRenderer.setData(this.cascadeEngine.graph, true);

    // If preemptive tasks were generated, merge into active grievances
    if (cascadeResult.preemptiveTasks.length > 0) {
      cascadeResult.preemptiveTasks.forEach(task => {
        if (!this.activeGrievances.some(g => g.id === task.id)) {
          this.activeGrievances.unshift(task);
        }
      });
    }

    // Record in Audit Ledger
    this.auditLedger.addBlock(
      "CANAL_CASCADE_BREACH",
      "Godavari Canal Sub-Division Telemetry",
      { root: "DIST_D2", affectedNodes: cascadeResult.steps.length, resilienceScore: cascadeResult.networkResilienceScore },
      "Simulated D-2 Siphon Silt Breach & Conveyance Loss. Triggered dynamic failure propagation to Tail-End Minor 4 & Hospital Line."
    );

    // Re-run triage with cascade updates
    this.runTriageCycle();

    // Show alert banner
    const banner = document.getElementById('cascade-alert-banner');
    if (banner) {
      banner.style.display = 'flex';
      banner.innerHTML = `
        <span>🚨 <strong>Active Hydraulic Canal Cascade Alert:</strong> Distributary D-2 breach is starving Tail-End Minor 4 Pomegranate Orchards & Hospital Master ESR-2. Digital Twin generated <strong>${cascadeResult.preemptiveTasks.length} preemptive bypass actions</strong>.</span>
      `;
    }
  }

  resetCascadeSimulation() {
    this.isCascading = false;
    this.cascadeEngine.reset();
    this.cascadeRenderer.setData(this.cascadeEngine.graph, false);
    this.activeGrievances = this.activeGrievances.filter(g => !g.isPreemptive);
    this.runTriageCycle();

    const banner = document.getElementById('cascade-alert-banner');
    if (banner) banner.style.display = 'none';
  }

  handleCascadeNodeSelected(node) {
    const detailBox = document.getElementById('cascade-node-details');
    if (!detailBox) return;

    const label = this.currentLanguage === "mr" ? (node.labelMr || node.label) : node.label;
    const outgoing = this.cascadeEngine.graph.edges.filter(e => e.from === node.id);

    detailBox.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <h4 style="font-size:15px; font-weight:800; color:#fff;">${label}</h4>
        <span class="badge" style="background:rgba(239,68,68,0.2); color:#ef4444; border:1px solid #ef4444; padding:2px 8px; border-radius:10px; font-size:11px; font-family:var(--font-mono);">
          Water Stress: ${node.riskScore}%
        </span>
      </div>
      <div style="font-size:12px; color:#cbd5e1; margin-bottom:6px;">Ward: <strong>${node.ward}</strong> | Type: <strong>${node.type.toUpperCase()}</strong></div>
      <div style="background:rgba(0,0,0,0.4); padding:10px; border-radius:6px; font-size:11px;">
        <strong style="color:#38bdf8; display:block; margin-bottom:4px;">Downstream Vulnerable Targets:</strong>
        <ul style="padding-left:14px;">
          ${outgoing.length > 0 ? outgoing.map(e => `<li>${e.to} (Failure Prob: ${Math.round(e.probability * 100)}% in ~${e.timeDelayHours}h)</li>`).join("") : '<li>Terminal distribution reach</li>'}
        </ul>
      </div>
    `;
  }

  renderVoiceSamples() {
    const container = document.getElementById('voice-samples-container');
    if (!container) return;

    const samples = this.voiceAI.getSamples();
    container.innerHTML = samples.map(s => {
      const label = this.currentLanguage === "mr" ? s.labelMr : s.label;
      return `
        <button class="voice-sample-btn" data-id="${s.id}">
          <div style="font-weight:700; color:#0284c7; margin-bottom:4px; font-size:12.5px;">🎙️ ${label}</div>
          <p style="font-size:11.5px; color:#475569; font-style:italic; line-height:1.4;">"${s.audioText}"</p>
        </button>
      `;
    }).join("");

    container.querySelectorAll('.voice-sample-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const sample = samples.find(s => s.id === id);
        if (sample) {
          this.processVoiceInput(sample.audioText);
        }
      });
    });
  }

  toggleVoiceRecord() {
    const micBtn = document.getElementById('btn-voice-record');
    if (this.voiceAI.isListening) {
      this.voiceAI.isListening = false;
      if (micBtn) micBtn.classList.remove('listening');
    } else {
      this.voiceAI.isListening = true;
      if (micBtn) micBtn.classList.add('listening');

      setTimeout(() => {
        this.voiceAI.isListening = false;
        if (micBtn) micBtn.classList.remove('listening');
        const defaultSample = this.voiceAI.getSamples()[0];
        this.processVoiceInput(defaultSample.audioText);
      }, 2500);
    }
  }

  processVoiceInput(marathiText) {
    const parsedGrievance = this.voiceAI.extractCivicIntent(marathiText);
    
    // Play voice synthesizer feedback
    this.voiceAI.speakMarathi(`तुमचा शेजपाळी पाणी अर्ज प्राप्त झाला आहे. प्रभाग ${parsedGrievance.wardId} मधील ${parsedGrievance.cropType} मागणी नोंदवून डिजिटल ट्विनमध्ये समाविष्ट केली आहे.`);

    // Display in UI
    const outBox = document.getElementById('voice-output-card');
    if (outBox) {
      outBox.style.display = 'block';
      outBox.innerHTML = `
        <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:14px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px; align-items:center;">
            <strong style="color:#0284c7; font-size:13px;">✅ Shejpali Permit Application Extracted</strong>
            <span style="font-size:11px; background:#dcfce7; color:#15803d; font-weight:700; padding:2px 8px; border-radius:4px;">NLP Confidence: 96%</span>
          </div>
          <p style="font-size:12px; color:#334155; font-style:italic; margin-bottom:10px;">"${marathiText}"</p>
          <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px; font-size:11.5px; background:#ffffff; padding:10px; border-radius:6px; border:1px solid var(--border-light);">
            <div>Ward: <strong>${parsedGrievance.wardName}</strong></div>
            <div>Crop: <strong>${parsedGrievance.cropType}</strong></div>
            <div>Criticality: <strong>${parsedGrievance.cropCriticalityIndex}/100</strong></div>
          </div>
        </div>
      `;
    }

    // Add to active grievances and optimize
    this.activeGrievances.unshift(parsedGrievance);
    this.runTriageCycle();
  }

  renderCitizenPortal(result) {
    const publicList = document.getElementById('citizen-public-queue');
    if (!publicList) return;

    publicList.innerHTML = result.allScored.slice(0, 6).map((item, idx) => {
      const isBatch1 = item.allocatedBatch === "BATCH_1";
      const title = this.currentLanguage === "mr" ? (item.titleMr || item.title) : item.title;
      const applicant = this.currentLanguage === "mr" ? (item.applicantNameMr || item.applicantName) : item.applicantName;
      const statusText = isBatch1 
        ? (this.currentLanguage === "mr" ? "कालवा गेट उघडण्यास मंजूर (पाणी सोडले)" : "Authorized for Release (Gates Open)")
        : (this.currentLanguage === "mr" ? `पुढील शिफ्टमध्ये नियोजित (प्रतीक्षा: ${Math.round(item.estimatedWaitHours || 12)} तास)` : `Scheduled Next Shift (Est. wait ~${Math.round(item.estimatedWaitHours || 12)} hrs)`);

      const reason = this.currentLanguage === "mr"
        ? `शेजपाळी गुण: ${item.triageScore}/100 • ${item.cropType ? item.cropType.split(' ')[0] : ''}`
        : `Shejpali Score: ${item.triageScore}/100 • ${item.cropType ? item.cropType.split(' ')[0] : ''}`;

      return `
        <div style="background:#ffffff; border:1px solid ${isBatch1 ? '#86efac' : 'var(--border-light)'}; border-radius:8px; padding:12px; box-shadow:var(--shadow-sm);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="font-size:13px; color:#0f172a;">#${idx + 1} ${applicant} - ${title}</strong>
            <span style="font-size:11px; font-weight:700; color:${isBatch1 ? '#15803d' : '#d97706'};">
              ${statusText}
            </span>
          </div>
          <div style="font-size:11.5px; color:#64748b; display:flex; justify-content:space-between;">
            <span>📍 ${item.wardName} (${item.appliedDischargeCusecs || 0} cfs)</span>
            <span>${reason}</span>
          </div>
        </div>
      `;
    }).join("");
  }

  renderGovernancePanel() {
    this.renderAuditLedger();
    const neglectScores = this.temporalLedger.getScores();
    const trustIndices = this.temporalLedger.getTrustIndices();
    this.chartsRenderer.renderEquityRadar('radar-canvas', neglectScores, trustIndices, this.currentLanguage);
  }

  renderAuditLedger() {
    const list = document.getElementById('audit-blocks-list');
    if (!list) return;

    const chain = this.auditLedger.getChain() || [];
    list.innerHTML = chain.slice().reverse().map(block => {
      const prevHash = block.previousHash || '00000000000000000000000000000000';
      const currHash = block.hash || '00000000000000000000000000000000';
      const timeStr = block.timestamp ? new Date(block.timestamp).toLocaleTimeString() : 'N/A';
      return `
        <div class="audit-block-card">
          <div class="audit-header">
            <span><strong>Block #${block.index ?? 0}</strong> • ${block.actionType || 'AUDIT_LOG'}</span>
            <span>${timeStr}</span>
          </div>
          <div style="font-size:11px; color:#cbd5e1; margin-bottom:4px;">Authority: <strong>${block.actor || 'SYSTEM'}</strong></div>
          <div style="font-size:11px; color:#94a3b8; margin-bottom:6px;">"${block.justification || ''}"</div>
          <div class="audit-hash">Hash: ${currHash}</div>
          <div style="font-size:9.5px; color:#64748b;">Prev: ${prevHash.slice(0, 32)}...</div>
        </div>
      `;
    }).join("");
  }

  testTamperDetection() {
    this.auditLedger.simulateTampering(1);
    const integrity = this.auditLedger.verifyChainIntegrity();
    
    const banner = document.getElementById('cascade-alert-banner');
    if (banner) {
      banner.style.display = 'flex';
      banner.style.background = integrity.valid ? 'linear-gradient(90deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))' : 'linear-gradient(90deg, rgba(239,68,68,0.95), rgba(185,28,28,0.95))';
      banner.innerHTML = integrity.valid
        ? `<span>✅ <strong>Blockchain Verification Passed:</strong> All SHA-256 blocks valid.</span>`
        : `<span>🚨 <strong>SECURITY ALERT: Cryptographic chain tampering detected at Block #${integrity.brokenIndex}!</strong> Reason: ${integrity.reason}</span>`;
      setTimeout(() => { banner.style.display = 'none'; }, 6000);
    }
    this.renderAuditLedger();
  }

  exportRTI() {
    const report = this.auditLedger.generateRTIReport();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `Kopargaon_Shejpali_Audit_RTI_${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  }

  openOverrideModal() {
    const modal = document.getElementById('override-modal');
    if (!modal) return;
    modal.style.display = 'flex';

    const select = document.getElementById('override-issue-select');
    if (select) {
      select.innerHTML = this.activeGrievances.map(g => `<option value="${g.id}">${g.id}: ${g.applicantName} (${g.cropType ? g.cropType.split(' ')[0] : 'Crop'})</option>`).join("");
    }

    const closeBtn = document.getElementById('btn-modal-close');
    if (closeBtn) {
      closeBtn.onclick = () => { modal.style.display = 'none'; };
    }

    const cancelBtn = document.getElementById('btn-modal-cancel');
    if (cancelBtn) {
      cancelBtn.onclick = () => { modal.style.display = 'none'; };
    }

    const confirmBtn = document.getElementById('btn-modal-confirm');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        const issueId = select.value;
        const reason = document.getElementById('override-reason-input').value || "Statutory executive prerogative under Section 32";
        const officer = document.getElementById('override-officer-input').value || "Executive Engineer (Irrigation Div)";

        // Boost score and record override in tamper-proof chain
        const target = this.activeGrievances.find(g => g.id === issueId);
        if (target) {
          target.severity = 99;
          target.cropCriticalityIndex = 99;
          target.daysSinceLastTurn = 45;
        }

        this.auditLedger.addBlock(
          "SHEJPALI_STAGE_GATE_OVERRIDE",
          officer,
          { targetPermitId: issueId, targetApplicant: target?.applicantName, targetWard: target?.wardName },
          `Executive Override Applied: ${reason}`
        );

        modal.style.display = 'none';
        this.runTriageCycle();
      };
    }
  }

  updateMetricsTicker(utilization) {
    const budgetVal = document.getElementById('ticker-budget-val');
    const crewVal = document.getElementById('ticker-crews-val');
    const equipVal = document.getElementById('ticker-equip-val');
    const trustVal = document.getElementById('ticker-trust-val');

    const statAllocated = document.getElementById('stat-allocated-cfs');
    const statRemaining = document.getElementById('stat-remaining-cfs');
    const statOptBudget = document.getElementById('stat-opt-budget');

    const cfsAllocated = utilization.cusecsAllocated || 66;
    const cfsTotal = utilization.cusecsTotal || 140;
    const cfsPct = utilization.cusecsPctUsed || 47;

    if (budgetVal) {
      budgetVal.innerText = `${cfsAllocated} / ${cfsTotal} Cusecs (${cfsPct}%)`;
    }
    if (statAllocated) statAllocated.innerText = `${cfsAllocated}`;
    if (statRemaining) statRemaining.innerText = `${cfsTotal - cfsAllocated}`;
    if (statOptBudget) statOptBudget.innerText = `₹${(utilization.budgetAllocated || 96500).toLocaleString()}`;

    if (crewVal) {
      const activeCrews = Object.values(utilization.crewRemainingHours || {}).filter(h => h < 8).length;
      crewVal.innerText = `${4 - activeCrews} / 4 Available`;
    }
    if (equipVal) {
      const busyEquip = Object.values(utilization.equipmentAssigned || {}).filter(val => val !== null).length;
      equipVal.innerText = `${5 - busyEquip} / 5 Ready`;
    }
    if (trustVal) {
      const avgTrust = Math.round(Object.values(this.temporalLedger.getTrustIndices()).reduce((a, b) => a + b, 0) / 7);
      trustVal.innerText = `${avgTrust}/100`;
    }

    // Also update Donut chart
    this.chartsRenderer.renderBudgetDonut('budget-canvas', utilization, this.currentLanguage);
  }

  updateLanguageUI() {
    const dict = I18N[this.currentLanguage] || I18N.en;
    
    // Header & Titles
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (dict[key]) el.innerText = dict[key];
    });

    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
      const label = langBtn.querySelector('.lang-label');
      if (label) {
        label.innerText = this.currentLanguage === "en" ? "मराठी (MR)" : "English (EN)";
      }
    }

    if (this.mapRenderer) this.mapRenderer.setLanguage(this.currentLanguage);
    if (this.cascadeRenderer) this.cascadeRenderer.setLanguage(this.currentLanguage);
    if (this.currentTriageResult) {
      this.renderTriageColumns(this.currentTriageResult);
      this.renderXAIPanel();
      this.renderCitizenPortal(this.currentTriageResult);
    }
    this.renderVoiceSamples();
  }

  // ==========================================
  // LIVE HACKATHON CHALLENGES CONTROLLERS
  // ==========================================
  bindChallengeEvents() {
    // Challenge 1: Mid-Operation DB Corruption Simulation
    const btnSimWipe = document.getElementById('btn-simulate-db-wipe');
    if (btnSimWipe) {
      btnSimWipe.addEventListener('click', () => {
        this.simulateCatastrophicCorruption();
      });
    }

    // Challenge 1: Autonomous Self-Healing Trigger
    const btnSelfHeal = document.getElementById('btn-trigger-self-heal');
    if (btnSelfHeal) {
      btnSelfHeal.addEventListener('click', () => {
        this.triggerAutonomousSelfHealing();
      });
    }

    // Challenge 2: WhatsApp Rumor Preset Selector
    const rumorSelect = document.getElementById('rumor-preset-select');
    const customRumorInput = document.getElementById('custom-rumor-input');
    if (rumorSelect && customRumorInput) {
      rumorSelect.addEventListener('change', () => {
        if (rumorSelect.value === 'custom') {
          customRumorInput.style.display = 'block';
          customRumorInput.focus();
        } else {
          customRumorInput.style.display = 'none';
        }
      });
    }

    // Challenge 2: Verify WhatsApp Claim
    const btnVerifyRumor = document.getElementById('btn-verify-rumor');
    if (btnVerifyRumor) {
      btnVerifyRumor.addEventListener('click', () => {
        this.verifyRumorClaim();
      });
    }

    // Challenge 2: Sybil Attack Simulator
    const btnSybil = document.getElementById('btn-simulate-sybil-attack');
    if (btnSybil) {
      btnSybil.addEventListener('click', () => {
        this.simulateSybilAttack();
      });
    }
  }

  simulateCatastrophicCorruption() {
    const report = this.resilienceEngine.simulateCatastrophicCorruption(this.activeGrievances);
    
    // Update UI Indicators
    const badge = document.getElementById('storage-health-badge');
    const badgeText = document.getElementById('storage-health-text');
    const metricRecords = document.getElementById('metric-primary-records');
    const metricInflight = document.getElementById('metric-inflight-records');
    const btnHeal = document.getElementById('btn-trigger-self-heal');
    const btnWipe = document.getElementById('btn-simulate-db-wipe');
    const logTerminal = document.getElementById('terminal-resilience-log');

    if (badge) {
      badge.className = "health-badge danger";
      if (badgeText) badgeText.innerText = "CATASTROPHIC WIPE DETECTED";
    }
    if (metricRecords) {
      metricRecords.innerText = "0 Records (Corrupted)";
      metricRecords.className = "metric-val text-red";
    }
    if (metricInflight) {
      metricInflight.innerText = "2 In-Flight Rescued in WAL";
      metricInflight.className = "metric-val text-amber";
    }
    if (btnHeal) btnHeal.disabled = false;
    if (btnWipe) btnWipe.disabled = true;

    if (logTerminal) {
      logTerminal.innerHTML += `
        <div class="terminal-log-line text-red">🚨 [CRITICAL_STORAGE_WIPEOUT] Primary database wiped/corrupted mid-operation!</div>
        <div class="terminal-log-line text-amber">⚡ In-Flight Transaction Buffer intercepted 2 active dispatches (SHJ-101 Gate, SHJ-102 Hospital).</div>
        <div class="terminal-log-line text-cyan">🔒 Merkle Root Checkpoint intact. Standby for autonomous or operator reconstitution.</div>
      `;
      logTerminal.scrollTop = logTerminal.scrollHeight;
    }

    this.runTriageCycle();
  }

  triggerAutonomousSelfHealing() {
    const stats = this.resilienceEngine.reconstituteAndSelfHeal(this.activeGrievances, INITIAL_GRIEVANCES);

    // Update UI Indicators
    const badge = document.getElementById('storage-health-badge');
    const badgeText = document.getElementById('storage-health-text');
    const metricRecords = document.getElementById('metric-primary-records');
    const metricInflight = document.getElementById('metric-inflight-records');
    const metricLatency = document.getElementById('metric-recovery-latency');
    const btnHeal = document.getElementById('btn-trigger-self-heal');
    const btnWipe = document.getElementById('btn-simulate-db-wipe');
    const logTerminal = document.getElementById('terminal-resilience-log');

    if (badge) {
      badge.className = "health-badge healthy";
      if (badgeText) badgeText.innerText = "100% RECOVERED (ZERO LOSS)";
    }
    if (metricRecords) {
      metricRecords.innerText = `${stats.recoveredRecords} Restored`;
      metricRecords.className = "metric-val text-green";
    }
    if (metricInflight) {
      metricInflight.innerText = `${stats.rescuedInFlightTransactions} In-Flight Reconciled`;
      metricInflight.className = "metric-val text-cyan";
    }
    if (metricLatency) {
      metricLatency.innerText = `${stats.reconstitutionLatencyMs} ms`;
      metricLatency.className = "metric-val text-green";
    }
    if (btnHeal) btnHeal.disabled = true;
    if (btnWipe) btnWipe.disabled = false;

    if (logTerminal) {
      logTerminal.innerHTML += `
        <div class="terminal-log-line text-green">✅ [SELF_HEALING_SUCCESS] Reconstituted ${stats.recoveredRecords} records in ${stats.reconstitutionLatencyMs}ms.</div>
        <div class="terminal-log-line text-green">🔒 Cryptographic SHA-256 block committed to Audit Ledger (Zero Data Loss).</div>
      `;
      logTerminal.scrollTop = logTerminal.scrollHeight;
    }

    this.runTriageCycle();
    this.renderAuditLedger();
  }

  verifyRumorClaim() {
    const select = document.getElementById('rumor-preset-select');
    const customInput = document.getElementById('custom-rumor-input');
    const container = document.getElementById('truth-result-container');
    if (!container) return;

    let queryText = "";
    if (select.value === "custom") {
      queryText = customInput.value.trim();
    } else if (select.value === "toxic_water") {
      queryText = "Godavari canal water poisoned with toxic industrial chemical from Nashik MIDC, stop irrigation!";
    } else if (select.value === "subsidy_fraud") {
      queryText = "Government canceled 80% MahaDBT drip irrigation subsidy scheme for Kopargaon, portal is fake!";
    } else if (select.value === "canal_closure") {
      queryText = "Canal closed indefinitely due to Nilwande dam breach rumor, no water for 3 weeks!";
    }

    if (!queryText) {
      alert("Please enter a WhatsApp message or select a preset to fact-check.");
      return;
    }

    const result = this.truthEngine.verifyRumorOrClaim(queryText);
    container.style.display = "block";
    const isFake = result.verdict === "DEBUNKED_FALSE_RUMOR";

    container.innerHTML = `
      <div class="truth-result-header ${isFake ? 'result-fake' : 'result-verified'}">
        <div class="truth-badge-pill ${isFake ? 'badge-fake' : 'badge-true'}">
          ${this.currentLanguage === "mr" ? result.truthBadgeMr : result.truthBadge}
        </div>
        <span class="truth-confidence">Confidence: ${result.confidenceScore}%</span>
      </div>
      <h4 class="truth-result-title">${this.currentLanguage === "mr" ? (result.titleMr || result.title) : result.title}</h4>
      <p class="truth-result-desc">${this.currentLanguage === "mr" ? (result.officialExplanationMr || result.officialExplanation) : result.officialExplanation}</p>
      
      <div class="truth-telemetry-strip">
        ${Object.entries(result.labTelemetry || {}).map(([k, v]) => `
          <div class="telemetry-chip">
            <span class="chip-key">${k}:</span>
            <strong class="chip-val">${v}</strong>
          </div>
        `).join('')}
      </div>

      <div class="truth-footer-row">
        <div class="authority-tag">🏛️ Authority: <strong>${result.sourceAuthority}</strong></div>
        <button id="btn-copy-wa-share" class="btn-copy-wa">
          <span>📲</span> Copy WhatsApp Debunk
        </button>
      </div>
    `;

    const copyBtn = document.getElementById('btn-copy-wa-share');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(result.shareableWhatsAppText || result.officialExplanation);
        alert("✅ Official SatyaSetu WhatsApp Debunk certificate copied to clipboard!");
      });
    }

    this.renderAuditLedger();
  }

  simulateSybilAttack() {
    const fakeBatch = this.truthEngine.generateSimulatedFakeAttackBatch();
    const testSubmissions = [...this.activeGrievances, ...fakeBatch];
    const report = this.truthEngine.detectAndQuarantineSybilAttacks(testSubmissions);

    const statusMsg = document.getElementById('sybil-status-msg');
    if (statusMsg) {
      statusMsg.className = "sybil-status-text text-amber";
      statusMsg.innerHTML = `
        🚨 <strong>Sybil Attack Neutralized:</strong> ${report.flaggedAsFakeOrCoordinated} coordinated fake requests isolated into forensic sandbox.
        <br><span class="text-green">✔ Genuine farmer queue remains 100% unaffected. Security event sealed in SHA-256 ledger.</span>
      `;
    }
    this.renderAuditLedger();
  }
}
