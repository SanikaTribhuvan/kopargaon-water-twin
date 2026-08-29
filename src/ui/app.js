// Main Application Controller for Kopargaon Shejpali Water Prioritization Digital Twin
import { WARDS, INITIAL_GRIEVANCES, SEASONAL_PRESETS, I18N, MUNICIPAL_RESOURCES } from '../data/kopargaonData.js';
import { TriageEngine } from '../engine/triageEngine.js';
import { CascadeEngine } from '../engine/cascadeGraph.js';
import { ExplainabilityEngine } from '../engine/explainabilityEngine.js';
import { TemporalLedger } from '../engine/temporalLedger.js';
import { AuditLedger } from '../engine/auditLedger.js';
import { VoiceAIEngine } from '../engine/voiceAI.js';
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
    this.activeTab = "twin";
  }

  init() {
    this.initRenderers();
    this.bindEvents();
    this.runTriageCycle();
    this.updateLanguageUI();
  }

  initRenderers() {
    // Map
    this.mapRenderer = new MapRenderer('map-container', (issueId) => {
      this.selectIssueForInspection(issueId);
      this.switchTab("xai");
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
    // Nav Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        this.switchTab(targetTab);
      });
    });

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
      });
    }

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
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-content').forEach(c => {
      c.classList.toggle('active', c.id === `tab-pane-${tabId}`);
    });

    if (tabId === "twin" && this.mapRenderer && this.mapRenderer.map) {
      setTimeout(() => {
        this.mapRenderer.map.invalidateSize();
      }, 100);
    }
    if (tabId === "cascade" && this.cascadeRenderer) {
      this.cascadeRenderer.draw();
    }
    if (tabId === "xai") {
      this.renderXAIPanel();
    }
    if (tabId === "governance") {
      this.renderGovernancePanel();
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

    // Bind card click
    document.querySelectorAll('.card-grievance').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        this.selectIssueForInspection(id);
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
      ? `<span style="color: #10b981; font-weight:700; font-size:11px;">🚪 ${item.assignedCrew} | 🌊 ${item.appliedDischargeCusecs || 0} Cusecs</span>` 
      : `<span style="color: #94a3b8; font-size:11px;">Est. Wait: +${Math.round(item.estimatedWaitHours || 12)}h</span>`;

    return `
      <div class="card-grievance ${isSelected ? 'selected' : ''}" data-id="${item.id}">
        <div class="card-top">
          <div>
            <span style="font-size:10.5px; color:#38bdf8; font-weight:700; display:block;">📜 ${item.permitNo || 'PERMIT QUEUED'}</span>
            <h4 class="card-title">${title}</h4>
          </div>
          <span class="score-pill ${scoreClass}">${item.triageScore}</span>
        </div>
        <div style="font-size:11.5px; color:#cbd5e1; margin-bottom:4px;"><strong>Applicant:</strong> ${applicant}</div>
        <div class="card-ward">📍 ${item.wardName}</div>
        <div class="card-metrics">
          <div>🌾 <strong>${item.cropType || 'Water Claim'}</strong></div>
          <div>⏱️ <strong>${item.daysSinceLastTurn || 0} days dry</strong></div>
          <div>🌊 <strong>${item.appliedDischargeCusecs || 0} cfs</strong></div>
        </div>
        <div style="margin-top: 8px; display:flex; justify-content:space-between; align-items:center;">
          ${assignedBadge}
          <span style="font-size:10.5px; color:#38bdf8; text-decoration:underline;">Inspect XAI</span>
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
            <span style="font-size:11px; color:#38bdf8; font-weight:700;">📜 ${itemA.permitNo || 'PERMIT PENDING'} • ${applicant}</span>
            <h3 style="font-size:15px; font-weight:700; color:#fff;">${title}</h3>
          </div>
          <span class="badge" style="background:rgba(56,189,248,0.2); color:#38bdf8; border:1px solid #38bdf8; font-size:11px; padding:2px 8px; border-radius:12px;">
            ${justif.publicBadge}
          </span>
        </div>
        <p style="font-size:13px; color:#cbd5e1; margin-bottom:10px; line-height:1.4;">${justif.summary}</p>
        <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:8px;">
          <strong style="font-size:11.5px; color:#38bdf8; display:block; margin-bottom:4px;">Shejpali Decision Drivers:</strong>
          <ul style="padding-left:16px; font-size:12px; color:#94a3b8; display:flex; flex-direction:column; gap:4px;">
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
          <h4 style="font-size:13.5px; font-weight:700; color:#38bdf8;">${contrast.headline}</h4>
          <span style="font-size:11px; color:#94a3b8;">Comparing ${itemA.id} (${itemA.wardName}) vs ${itemB.id} (${itemB.wardName})</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${contrast.comparisons.map(c => `
            <div class="contrast-row">
              <span style="font-weight:600; color:#fff;">${c.dimension}:</span>
              <span style="color:#cbd5e1;">${c.text}</span>
            </div>
          `).join("")}
        </div>
        <div style="margin-top:12px; padding:8px 12px; background:rgba(16,185,129,0.1); border-left:3px solid #10b981; border-radius:4px; font-size:12px; color:#10b981;">
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
        <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:12px;">
          <span>Canal Cusecs Committed: <strong>${oppData.totalCusecsAllocated} Cfs</strong></span>
          <span>Operation Allocation: <strong>₹${oppData.totalBudgetSpent.toLocaleString()}</strong></span>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${oppData.delayedCivicItems.map(d => `
            <div style="background:rgba(0,0,0,0.2); padding:8px; border-radius:6px; font-size:11.5px;">
              <div style="font-weight:600; color:#f8fafc;">${d.title} (${d.ward})</div>
              <div style="color:#f59e0b;">⏳ ${d.consequence}</div>
              <div style="color:#64748b; font-size:10.5px;">Constraint: ${d.bottleneck}</div>
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
          <h4 style="font-size:13px; font-weight:700; color:#fff;">Target: ${deferredTarget.id} (${deferredTarget.cropType}) (Score: ${cfResult.currentScore}) $\\to$ Cutoff (${cfResult.targetCutoff})</h4>
          <span style="font-size:11px; color:#a855f7;">Required Delta to enter Batch 1 Sluice Release: <strong>+${cfResult.requiredDelta} pts</strong></span>
        </div>
        <div class="counterfactual-slider-box">
          <div class="cf-slider-row">
            <span>Simulate Soil Moisture Stress / Days Dry:</span>
            <strong id="cf-pop-val">+0 days</strong>
          </div>
          <input type="range" class="cf-slider" id="cf-pop-slider" min="0" max="20" step="1" value="0" />
          <div id="cf-outcome-text" style="margin-top:8px; font-size:11.5px; color:#94a3b8;">
            Drag slider to simulate soil wilting stress and see if rotational equity promotes this farm to Batch 1.
          </div>
        </div>
      `;

      const slider = document.getElementById('cf-pop-slider');
      if (slider) {
        slider.addEventListener('input', (e) => {
          const addDays = parseInt(e.target.value, 10);
          document.getElementById('cf-pop-val').innerText = `+${addDays} days dry`;
          const boostedScore = Math.min(99.5, Math.round((cfResult.currentScore + (addDays / 20) * 22) * 10) / 10);
          const qualifies = boostedScore >= cfResult.targetCutoff;
          document.getElementById('cf-outcome-text').innerHTML = qualifies
            ? `<span style="color:#10b981; font-weight:700;">🎉 Promoted to Batch 1! New Shejpali Score: ${boostedScore} exceeds cutoff ${cfResult.targetCutoff}</span>`
            : `<span style="color:#f59e0b;">Score increases to ${boostedScore}. Still needs +${Math.round((cfResult.targetCutoff - boostedScore) * 10) / 10} pts.</span>`;
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
        <h4 style="font-size:14px; font-weight:700; color:#fff;">${label}</h4>
        <span class="badge" style="background:rgba(239,68,68,0.2); color:#ef4444; border:1px solid #ef4444; padding:2px 8px; border-radius:10px;">
          Water Stress: ${node.riskScore}%
        </span>
      </div>
      <div style="font-size:12px; color:#cbd5e1; margin-bottom:6px;">Ward: <strong>${node.ward}</strong> | Type: <strong>${node.type.toUpperCase()}</strong></div>
      <div style="background:rgba(0,0,0,0.3); padding:8px; border-radius:6px; font-size:11px; margin-bottom:8px;">
        <strong style="color:#38bdf8;">Downstream Vulnerable Targets:</strong>
        <ul style="padding-left:14px; margin-top:4px;">
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
          <div style="font-weight:700; color:#38bdf8; margin-bottom:4px;">🎙️ ${label}</div>
          <p style="font-size:11.5px; color:#cbd5e1; font-style:italic;">"${s.audioText}"</p>
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
        <div style="background:rgba(56,189,248,0.1); border:1px solid #38bdf8; border-radius:8px; padding:12px; margin-top:12px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <strong style="color:#38bdf8; font-size:13px;">✅ Shejpali Permit Application Extracted</strong>
            <span style="font-size:11px; background:#10b981; color:#0f172a; font-weight:700; padding:2px 6px; border-radius:4px;">NLP Confidence: 96%</span>
          </div>
          <p style="font-size:12px; color:#cbd5e1; font-style:italic; margin-bottom:8px;">"${marathiText}"</p>
          <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px; font-size:11.5px; background:rgba(0,0,0,0.3); padding:8px; border-radius:6px;">
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
        ? `शेजपाळी गुण: ${item.triageScore}/100 • ${item.cropType}`
        : `Shejpali Score: ${item.triageScore}/100 • ${item.cropType}`;

      return `
        <div style="background:rgba(15,23,42,0.6); border:1px solid ${isBatch1 ? '#10b981' : 'rgba(255,255,255,0.08)'}; border-radius:8px; padding:12px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="font-size:13px; color:#fff;">#${idx + 1} ${applicant} - ${title}</strong>
            <span style="font-size:11px; font-weight:700; color:${isBatch1 ? '#10b981' : '#f59e0b'};">
              ${statusText}
            </span>
          </div>
          <div style="font-size:11.5px; color:#94a3b8; display:flex; justify-content:space-between;">
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
          <div style="font-size:11.5px; color:#cbd5e1; margin-bottom:4px;">Authority: <strong>${block.actor || 'SYSTEM'}</strong></div>
          <div style="font-size:11px; color:#94a3b8; margin-bottom:6px;">"${block.justification || ''}"</div>
          <div class="audit-hash">Hash: ${currHash}</div>
          <div style="font-size:10px; color:#64748b;">Prev: ${prevHash.slice(0, 32)}...</div>
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
      banner.style.background = integrity.valid ? 'linear-gradient(90deg, rgba(16,185,129,0.9), rgba(5,150,105,0.95))' : 'linear-gradient(90deg, rgba(239,68,68,0.9), rgba(185,28,28,0.95))';
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
      select.innerHTML = this.activeGrievances.map(g => `<option value="${g.id}">${g.id}: ${g.applicantName} (${g.cropType})</option>`).join("");
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

    if (budgetVal) {
      budgetVal.innerText = `${utilization.cusecsAllocated || 0} / ${utilization.cusecsTotal || 140} Cusecs (${utilization.cusecsPctUsed || 0}%)`;
    }
    if (crewVal) {
      const activeCrews = Object.values(utilization.crewRemainingHours).filter(h => h < 8).length;
      crewVal.innerText = `${4 - activeCrews} / 4 Available`;
    }
    if (equipVal) {
      const busyEquip = Object.values(utilization.equipmentAssigned).filter(val => val !== null).length;
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
      langBtn.innerHTML = this.currentLanguage === "en" ? "🇮🇳 मराठी (MR)" : "🇬🇧 English (EN)";
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
}
