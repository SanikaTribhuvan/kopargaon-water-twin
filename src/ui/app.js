// Main Application Controller for Kopargaon Shejpali Water Prioritization Digital Twin
import websiteVideoUrl from '../assets/website-video.mp4';
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
    this.initSplashGate();
    this.initVideoScrubber();
    this.initRenderers();
    this.bindEvents();
    this.initCarouselInteractive();
    this.initLandPipesToggle();
    this.runTriageCycle();
    this.updateLanguageUI();
  }

  initSplashGate() {
    const splashGate = document.getElementById('splash-gate');
    const btnEnter = document.getElementById('btn-enter-twin');
    
    if (splashGate && btnEnter) {
      btnEnter.addEventListener('click', () => {
        splashGate.classList.add('splash-hidden');
        sessionStorage.setItem('KOPARGAON_SPLASH_DISMISSED', 'true');
        if (this.videoElement) {
          this.videoElement.play().catch(() => {});
        }
      });

      // If already dismissed in this session, keep hidden
      if (sessionStorage.getItem('KOPARGAON_SPLASH_DISMISSED') === 'true') {
        splashGate.classList.add('splash-hidden');
      }
    }
  }

  initVideoScrubber() {
    this.videoElement = document.getElementById('hero-bg-video');
    if (!this.videoElement) return;

    this.videoElement.src = websiteVideoUrl;
    this.videoElement.muted = true;
    this.videoElement.defaultMuted = true;
    this.videoElement.playsInline = true;
    this.videoElement.autoplay = true;
    this.videoElement.loop = true;

    const playVideo = () => {
      const p = this.videoElement.play();
      if (p !== undefined) {
        p.catch(() => {
          document.addEventListener('click', () => {
            this.videoElement.play().catch(() => {});
          }, { once: true });
        });
      }
    };

    if (this.videoElement.readyState >= 2) {
      playVideo();
    } else {
      this.videoElement.addEventListener('canplay', playVideo, { once: true });
      this.videoElement.addEventListener('loadeddata', playVideo, { once: true });
    }

    setTimeout(playVideo, 200);
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

  initCarouselInteractive() {
    const cards = document.querySelectorAll('.carousel-card');
    const previewNum = document.querySelector('.preview-badge-num');
    const previewTitle = document.getElementById('preview-module-title');
    const previewDesc = document.getElementById('preview-module-desc');
    const previewIcon = document.querySelector('.preview-icon-graphic');
    const statusLbl = document.getElementById('active-carousel-module-lbl');

    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        const idx = card.dataset.modIdx;
        const title = card.dataset.modTitle;
        const desc = card.dataset.modDesc;
        const icon = card.dataset.modIcon;

        if (previewNum) previewNum.innerText = idx;
        if (previewTitle) previewTitle.innerText = title;
        if (previewDesc) previewDesc.innerText = desc;
        if (previewIcon) previewIcon.innerText = icon;
        if (statusLbl) statusLbl.innerText = `MODULE ACTIVE · ${idx} ${title.toUpperCase()}`;
      });
    });
  }

  initLandPipesToggle() {
    const btnRaw = document.getElementById('btn-toggle-raw-land');
    const btnPipes = document.getElementById('btn-toggle-pipes');
    const box = document.getElementById('land-pipes-display-box');
    const statusTxt = document.getElementById('land-pipes-status-txt');

    if (btnRaw && btnPipes && box) {
      btnRaw.addEventListener('click', () => {
        btnRaw.classList.add('active');
        btnPipes.classList.remove('active');
        box.className = "display-box state-raw-land";
        if (statusTxt) statusTxt.innerText = "RAW LAND PARCEL BOUNDARY · MAHABHULEKH SURVEY TRACE";
      });

      btnPipes.addEventListener('click', () => {
        btnPipes.classList.add('active');
        btnRaw.classList.remove('active');
        box.className = "display-box state-pipes";
        if (statusTxt) statusTxt.innerText = "GHOSTED PIPE NETWORK · ACTIVE FLOW SIMULATION";
      });
    }

    const btnNextBatch = document.getElementById('btn-scroll-next-batch');
    if (btnNextBatch) {
      btnNextBatch.addEventListener('click', () => {
        const b2 = document.getElementById('split-card-b2');
        if (b2) b2.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
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

    // Menu Drawer Navigation
    this.bindMenuDrawerEvents();
  }

  bindMenuDrawerEvents() {
    const menuBtn = document.getElementById('nav-menu-btn');
    const drawer = document.getElementById('nav-menu-drawer');
    const closeBtn = document.getElementById('btn-nav-menu-close');
    const backdrop = document.getElementById('drawer-backdrop');
    const drawerLang = document.getElementById('drawer-lang-toggle');

    if (menuBtn && drawer) {
      const openDrawer = () => {
        drawer.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      };
      const closeDrawer = () => {
        drawer.style.display = 'none';
        document.body.style.overflow = '';
      };

      menuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openDrawer();
      });

      if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
      if (backdrop) backdrop.addEventListener('click', closeDrawer);

      document.querySelectorAll('.drawer-link').forEach(link => {
        link.addEventListener('click', () => {
          closeDrawer();
        });
      });

      if (drawerLang) {
        drawerLang.addEventListener('click', () => {
          this.currentLanguage = this.currentLanguage === "en" ? "mr" : "en";
          this.updateLanguageUI();
        });
      }
    }
  }

  applyPhaseFilter(phase) {
    const cardB1 = document.getElementById('split-card-b1');
    const cardB2 = document.getElementById('split-card-b2');
    const cardDef = document.getElementById('split-card-def');

    if (!cardB1 || !cardB2 || !cardDef) return;

    if (phase === "all") {
      cardB1.style.display = "block";
      cardB2.style.display = "block";
      cardDef.style.display = "block";
    } else if (phase === "batch1") {
      cardB1.style.display = "block";
      cardB2.style.display = "none";
      cardDef.style.display = "none";
    } else if (phase === "batch2") {
      cardB1.style.display = "none";
      cardB2.style.display = "block";
      cardDef.style.display = "none";
    } else if (phase === "deferred") {
      cardB1.style.display = "none";
      cardB2.style.display = "none";
      cardDef.style.display = "block";
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
    this.renderAuditLedger();
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
    const b1Container = document.getElementById('split-b1-items-list');
    const b2Container = document.getElementById('split-b2-items-list');
    const defContainer = document.getElementById('split-def-items-list');

    if (b1Container) b1Container.innerHTML = result.batch1.map(item => this.createSplitCardHTML(item, "batch1")).join("");
    if (b2Container) b2Container.innerHTML = result.batch2.map(item => this.createSplitCardHTML(item, "batch2")).join("");
    if (defContainer) defContainer.innerHTML = result.deferred.map(item => this.createSplitCardHTML(item, "deferred")).join("");

    // Bind card click & Inspect XAI
    document.querySelectorAll('.split-item-row').forEach(card => {
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

  createSplitCardHTML(item, type) {
    const isSelected = item.id === this.selectedIssueId;
    const title = this.currentLanguage === "mr" ? (item.titleMr || item.title) : item.title;
    const applicant = this.currentLanguage === "mr" ? (item.applicantNameMr || item.applicantName) : item.applicantName;
    const scoreClass = item.triageScore >= 80 ? "high" : (item.triageScore >= 60 ? "medium" : "low");

    const assignedBadge = item.assignedCrew 
      ? `<span style="color: #23531F; font-weight:700; font-size:11px;">${item.assignedCrew} • ${item.appliedDischargeCusecs || 0} cfs</span>` 
      : `<span style="color: #8E8695; font-size:11px;">Est. Wait: +${Math.round(item.estimatedWaitHours || 12)}h</span>`;

    return `
      <div class="split-item-row ${isSelected ? 'selected' : ''}" data-id="${item.id}" style="background:#F7F4EC; border-radius:8px; padding:12px 14px; margin-bottom:8px; cursor:pointer; border-left:3px solid ${isSelected ? '#7ED957' : '#D5CEBF'};">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
          <div>
            <span style="font-size:10px; color:#23531F; font-weight:700; font-family:var(--font-mono); display:block;">${item.permitNo || 'PERMIT QUEUED'}</span>
            <strong style="font-size:13px; color:#1A1420; display:block;">${title}</strong>
          </div>
          <span style="background:#FFFFFF; font-family:var(--font-mono); font-size:11px; font-weight:800; padding:2px 8px; border-radius:999px; color:#1A1420; box-shadow:0 2px 6px rgba(0,0,0,0.06);">${item.triageScore}</span>
        </div>
        <div style="font-size:11px; color:#4A4250; margin-bottom:4px;"><strong>Applicant:</strong> ${applicant} • ${item.wardName}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
          ${assignedBadge}
          <span class="inspect-xai-link" style="font-size:11px; color:#23531F; font-weight:700; text-decoration:underline;">Inspect XAI →</span>
        </div>
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
    const titleEl = document.getElementById('xai-selected-title');
    const scoreEl = document.getElementById('xai-selected-score');
    const plainTextBox = document.getElementById('xai-explanation-text');
    const shapBarsBox = document.getElementById('xai-shap-bars');

    if (titleEl) titleEl.innerText = `Permit Breakdown: ${itemA.id} (${itemA.wardName})`;
    if (scoreEl) scoreEl.innerText = `Score: ${itemA.triageScore}/100`;

    if (plainTextBox) {
      plainTextBox.innerHTML = `
        <div style="background:#F7F4EC; padding:16px; border-radius:8px; margin-top:12px;">
          <h4 style="font-size:14px; font-weight:800; color:#1A1420; margin-bottom:6px;">${justif.publicBadge}</h4>
          <p style="font-size:13px; color:#4A4250; line-height:1.5;">${justif.summary}</p>
          <div style="margin-top:10px;">
            <strong style="font-size:11px; color:#23531F; text-transform:uppercase;">Key Agronomic Drivers:</strong>
            <ul style="padding-left:16px; font-size:12px; color:#4A4250; margin-top:4px;">
              ${justif.keyDrivers.map(d => `<li>${d}</li>`).join("")}
            </ul>
          </div>
        </div>
      `;
    }

    // Render SHAP Bars
    if (shapBarsBox && itemA.evaluation && itemA.evaluation.contributions) {
      const contribs = itemA.evaluation.contributions;
      shapBarsBox.innerHTML = Object.entries(contribs).map(([k, v]) => {
        const isPos = v >= 0;
        const widthPct = Math.min(100, Math.abs(v) * 2.5);
        return `
          <div style="margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:600; color:#1A1420; margin-bottom:2px;">
              <span>${k}</span>
              <span style="color:${isPos ? '#23531F' : '#DC2626'}">${isPos ? '+' : ''}${v.toFixed(1)} pts</span>
            </div>
            <div style="background:#ECE7DD; height:6px; border-radius:3px; overflow:hidden;">
              <div style="background:${isPos ? '#7ED957' : '#EF4444'}; width:${widthPct}%; height:100%;"></div>
            </div>
          </div>
        `;
      }).join("");
    }

    // Populate Selects for Contrastive A vs B
    const selectA = document.getElementById('contrast-issue-a-select');
    const selectB = document.getElementById('contrast-issue-b-select');
    const contrastResBox = document.getElementById('xai-contrast-result');

    if (selectA && selectB) {
      selectA.innerHTML = this.currentTriageResult.allScored.map(i => `<option value="${i.id}" ${i.id === this.contrastIssueAId ? 'selected' : ''}>${i.id}: ${i.wardName} (${i.triageScore})</option>`).join("");
      selectB.innerHTML = this.currentTriageResult.allScored.map(i => `<option value="${i.id}" ${i.id === this.contrastIssueBId ? 'selected' : ''}>${i.id}: ${i.wardName} (${i.triageScore})</option>`).join("");

      selectA.onchange = (e) => { this.contrastIssueAId = e.target.value; this.renderXAIPanel(); };
      selectB.onchange = (e) => { this.contrastIssueBId = e.target.value; this.renderXAIPanel(); };
    }

    if (contrastResBox && itemB) {
      const contrast = this.xaiEngine.generateContrastiveExplanation(itemA, itemB, this.currentLanguage);
      contrastResBox.innerHTML = `
        <div style="background:#F7F4EC; padding:14px; border-radius:8px; margin-top:10px;">
          <h4 style="font-size:13.5px; font-weight:800; color:#1A1420; margin-bottom:6px;">${contrast.headline}</h4>
          <div style="display:flex; flex-direction:column; gap:4px; font-size:12px; color:#4A4250;">
            ${contrast.comparisons.map(c => `<div><strong>${c.dimension}:</strong> ${c.text}</div>`).join("")}
          </div>
          <div style="margin-top:8px; font-size:11.5px; color:#23531F; font-weight:700;">Verdict: ${contrast.verdict}</div>
        </div>
      `;
    }
  }

  renderVoiceSamples() {
    document.querySelectorAll('.voice-sample-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const idx = parseInt(chip.dataset.sampleIdx, 10);
        this.simulateVoiceSample(idx);
      });
    });
  }

  simulateVoiceSample(idx) {
    const samples = [
      { ward: "Ward 5 (Laxmi Nagar)", crop: "Pomegranate (Wilting)", urgency: "94/100 (Critical)", action: "Allocate 28 Cfs via Minor-4" },
      { ward: "Ward 7 (Tilak Nagar)", crop: "Hospital ESR-2 Lifeline", urgency: "99/100 (Emergency)", action: "Release 22 Cfs Intake Booster" },
      { ward: "Ward 1 (Bet Kopargaon)", crop: "Onion Seedlings (Sandy Soil)", urgency: "82/100 (High)", action: "Schedule 18 Cfs Lift Awartan" }
    ];
    const s = samples[idx] || samples[0];

    const vWard = document.getElementById('v-ward');
    const vCrop = document.getElementById('v-crop');
    const vUrgency = document.getElementById('v-urgency');
    const vAction = document.getElementById('v-action');
    const statusText = document.getElementById('voice-recording-status');

    if (vWard) vWard.innerText = s.ward;
    if (vCrop) vCrop.innerText = s.crop;
    if (vUrgency) vUrgency.innerText = s.urgency;
    if (vAction) vAction.innerText = s.action;
    if (statusText) statusText.innerText = `Simulated spoken intake for ${s.ward} successfully extracted.`;
  }

  toggleVoiceRecord() {
    const statusText = document.getElementById('voice-recording-status');
    if (statusText) {
      statusText.innerText = "Listening to spoken dialect (Simulating 3s)...";
      setTimeout(() => {
        this.simulateVoiceSample(0);
      }, 1500);
    }
  }

  renderAuditLedger() {
    const container = document.getElementById('audit-blocks-list');
    if (!container) return;

    const chain = this.auditLedger.getChain();
    container.innerHTML = chain.map((block, idx) => `
      <div style="background:#140D18; padding:10px; border-radius:6px; margin-bottom:8px; border-left:3px solid #7ED957; font-size:11px;">
        <div style="display:flex; justify-content:space-between; color:#F5B814; font-weight:700; margin-bottom:2px;">
          <span>BLOCK #${block.index} [${block.actionType}]</span>
          <span>${new Date(block.timestamp).toLocaleTimeString()}</span>
        </div>
        <div style="color:#C5BFCC; margin-bottom:4px;">${block.justification}</div>
        <div style="color:#38BDF8; font-size:10px;">Hash: ${block.hash.substring(0, 24)}...</div>
      </div>
    `).join("");
  }

  exportRTI() {
    const rti = this.auditLedger.generateRTIReport();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rti, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `KMC_SHEJPALI_RTI_REPORT_${Date.now()}.json`);
    dlAnchor.click();
    alert("Section 4(1)(b) RTI Audit Certificate exported successfully.");
  }

  testTamperDetection() {
    const success = this.auditLedger.simulateTampering(1);
    const integrity = this.auditLedger.verifyChainIntegrity();
    
    if (!integrity.valid) {
      alert(`TAMPER DETECTED BY CRYPTOGRAPHIC LEDGER!\nBroken Block Index: ${integrity.brokenIndex}\nReason: ${integrity.reason}\nBlockchain security preserved.`);
    }
    this.renderAuditLedger();
  }

  updateMetricsTicker(utilization) {
    const budgetVal = document.getElementById('ticker-budget-val');
    const crewVal = document.getElementById('ticker-crews-val');
    const equipVal = document.getElementById('ticker-equip-val');
    const trustVal = document.getElementById('ticker-trust-val');

    const cfsAllocated = utilization.cusecsAllocated || 66;
    const cfsTotal = 140;
    const cfsPct = Math.round((cfsAllocated / cfsTotal) * 100);

    if (budgetVal) budgetVal.innerText = `${cfsAllocated} / ${cfsTotal} Cfs (${cfsPct}%)`;
    if (crewVal) crewVal.innerText = `4 / 4 Active`;
    if (equipVal) equipVal.innerText = `5 / 5 Ready`;
    if (trustVal) {
      const avgTrust = Math.round(Object.values(this.temporalLedger.getTrustIndices()).reduce((a, b) => a + b, 0) / 7);
      trustVal.innerText = `${avgTrust}/100`;
    }
  }

  updateLanguageUI() {
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
      const label = langBtn.querySelector('.lang-label');
      if (label) {
        label.innerText = this.currentLanguage === "en" ? "MR / EN" : "EN / MR";
      }
    }
    if (this.mapRenderer) this.mapRenderer.setLanguage(this.currentLanguage);
    if (this.currentTriageResult) {
      this.renderTriageColumns(this.currentTriageResult);
      this.renderXAIPanel();
    }
  }

  // ==========================================
  // LIVE HACKATHON CHALLENGES CONTROLLERS
  // ==========================================
  bindChallengeEvents() {
    const btnSimWipe = document.getElementById('btn-simulate-db-wipe');
    if (btnSimWipe) {
      btnSimWipe.addEventListener('click', () => {
        this.simulateCatastrophicCorruption();
      });
    }

    const btnSelfHeal = document.getElementById('btn-trigger-self-heal');
    if (btnSelfHeal) {
      btnSelfHeal.addEventListener('click', () => {
        this.triggerAutonomousSelfHealing();
      });
    }

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

    const btnVerifyRumor = document.getElementById('btn-verify-rumor');
    if (btnVerifyRumor) {
      btnVerifyRumor.addEventListener('click', () => {
        this.verifyRumorClaim();
      });
    }

    const btnSybil = document.getElementById('btn-simulate-sybil-attack');
    if (btnSybil) {
      btnSybil.addEventListener('click', () => {
        this.simulateSybilAttack();
      });
    }
  }

  simulateCatastrophicCorruption() {
    const report = this.resilienceEngine.simulateCatastrophicCorruption(this.activeGrievances);
    
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
        <div class="terminal-log-line text-red">[CRITICAL_STORAGE_WIPEOUT] Primary database wiped mid-operation.</div>
        <div class="terminal-log-line text-amber">In-Flight Transaction Buffer intercepted 2 active dispatches (SHJ-101 Gate, SHJ-102 Hospital).</div>
        <div class="terminal-log-line text-cyan">Merkle Root Checkpoint intact. Standby for autonomous reconstitution.</div>
      `;
      logTerminal.scrollTop = logTerminal.scrollHeight;
    }

    this.runTriageCycle();
  }

  triggerAutonomousSelfHealing() {
    const stats = this.resilienceEngine.reconstituteAndSelfHeal(this.activeGrievances, INITIAL_GRIEVANCES);

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
        <div class="terminal-log-line text-green">[SELF_HEALING_SUCCESS] Reconstituted ${stats.recoveredRecords} records in ${stats.reconstitutionLatencyMs}ms.</div>
        <div class="terminal-log-line text-green">Cryptographic SHA-256 block committed to Audit Ledger (Zero Data Loss).</div>
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
      <div style="background:#161019; border:1px solid ${isFake ? '#EF4444' : '#7ED957'}; border-radius:8px; padding:14px; margin-top:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="background:${isFake ? 'rgba(239,68,68,0.2)' : 'rgba(126,217,87,0.2)'}; color:${isFake ? '#FCA5A5' : '#7ED957'}; font-family:var(--font-mono); font-size:11px; font-weight:800; padding:3px 10px; border-radius:999px;">
            ${this.currentLanguage === "mr" ? result.truthBadgeMr : result.truthBadge}
          </span>
          <span style="font-family:var(--font-mono); font-size:11px; color:#C5BFCC;">Confidence: ${result.confidenceScore}%</span>
        </div>
        <h4 style="font-size:14px; font-weight:800; color:#FFFFFF; margin-bottom:4px;">${this.currentLanguage === "mr" ? (result.titleMr || result.title) : result.title}</h4>
        <p style="font-size:12.5px; color:#C5BFCC; line-height:1.45; margin-bottom:10px;">${this.currentLanguage === "mr" ? (result.officialExplanationMr || result.officialExplanation) : result.officialExplanation}</p>
        
        <div style="display:flex; gap:8px; flex-wrap:wrap; background:#0B070D; padding:8px 10px; border-radius:6px; margin-bottom:10px;">
          ${Object.entries(result.labTelemetry || {}).map(([k, v]) => `
            <div style="font-size:11px; color:#8E8695;">${k}: <strong style="color:#38BDF8;">${v}</strong></div>
          `).join('')}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; border-top:1px solid rgba(255,255,255,0.08); padding-top:8px;">
          <div style="font-size:11px; color:#C5BFCC;">Authority: <strong style="color:#F5B814;">${result.sourceAuthority}</strong></div>
          <button id="btn-copy-wa-share" style="background:#25D366; color:#000000; border:none; font-weight:700; font-size:11px; padding:6px 12px; border-radius:4px; cursor:pointer;">
            <span>Copy Fact-Check</span>
          </button>
        </div>
      </div>
    `;

    const copyBtn = document.getElementById('btn-copy-wa-share');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(result.shareableWhatsAppText || result.officialExplanation);
        alert("Official SatyaSetu Fact-Check certificate copied to clipboard.");
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
        <strong>Sybil Attack Neutralized:</strong> ${report.flaggedAsFakeOrCoordinated} coordinated fake requests isolated into forensic sandbox.
        <br><span style="color:#7ED957;">Genuine farmer queue remains 100% unaffected. Security event sealed in SHA-256 ledger.</span>
      `;
    }
    this.renderAuditLedger();
  }

  triggerCascadeSimulation() {
    this.isCascading = true;
    this.cascadeEngine.simulateBreach("N3"); // Distributary D-2
    this.cascadeRenderer.setData(this.cascadeEngine.graph, true);

    const statusText = document.getElementById('cascade-status-text');
    const statusDot = document.getElementById('cascade-status-dot');
    if (statusText) statusText.innerText = "CRITICAL BREACH: D-2 Siphon Silting Jam (38% Loss)";
    if (statusDot) statusDot.className = "status-dot dot-red";

    const banner = document.getElementById('cascade-alert-banner');
    if (banner) {
      banner.style.display = "block";
      banner.className = "alert-banner danger";
      banner.innerHTML = `
        <strong>HYDRAULIC BREACH DETECTED:</strong> Distributary D-2 Siphon Silt Jam.
        Conveyance loss surging to 38%. Sluice Patrol Squad C3 dispatched with Excavator EX-01 to protect downstream Ward 5 orchards.
      `;
    }
  }

  resetCascadeSimulation() {
    this.isCascading = false;
    this.cascadeEngine.resetGraph();
    this.cascadeRenderer.setData(this.cascadeEngine.graph, false);

    const statusText = document.getElementById('cascade-status-text');
    const statusDot = document.getElementById('cascade-status-dot');
    if (statusText) statusText.innerText = "Hydraulics Nominal (3.2 m/s)";
    if (statusDot) statusDot.className = "status-dot dot-green";

    const banner = document.getElementById('cascade-alert-banner');
    if (banner) banner.style.display = "none";
  }

  handleCascadeNodeSelected(node) {
    if (!node) return;
    alert(`Hydraulic Asset Selected: ${node.name}\nType: ${node.type}\nCapacity: ${node.capacityCusecs || 0} Cusecs\nStatus: ${node.status}`);
  }

  openOverrideModal() {
    const modal = document.getElementById('override-modal');
    const select = document.getElementById('override-issue-select');
    if (!modal || !select || !this.currentTriageResult) return;

    select.innerHTML = this.currentTriageResult.allScored.map(i => `
      <option value="${i.id}">${i.id}: ${i.title} (${i.wardName})</option>
    `).join("");

    modal.style.display = "flex";

    const btnClose = document.getElementById('btn-modal-close');
    const btnCancel = document.getElementById('btn-modal-cancel');
    const btnConfirm = document.getElementById('btn-modal-confirm');

    const closeModal = () => { modal.style.display = "none"; };
    if (btnClose) btnClose.onclick = closeModal;
    if (btnCancel) btnCancel.onclick = closeModal;

    if (btnConfirm) {
      btnConfirm.onclick = () => {
        const issueId = select.value;
        const officer = document.getElementById('override-officer-input').value;
        const reason = document.getElementById('override-reason-input').value;

        if (!reason.trim()) {
          alert("Mandatory statutory justification required under RTI Act Section 4(1)(b).");
          return;
        }

        this.auditLedger.addBlock(
          "OFFICER_STAGE_GATE_OVERRIDE",
          officer,
          { elevatedIssueId: issueId, reason },
          `Officer override authorized: Elevated ${issueId} to Batch 1 under emergency powers. Justification: ${reason}`
        );

        alert(`Override committed to SHA-256 Audit Ledger for ${issueId}.`);
        closeModal();
        this.runTriageCycle();
      };
    }
  }
}
