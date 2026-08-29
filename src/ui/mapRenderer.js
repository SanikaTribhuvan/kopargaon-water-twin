// Leaflet Map Visualizer for Kopargaon Shejpali Canal & Water Distribution Digital Twin
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WARDS, KOPARGAON_BOUNDS, MUNICIPAL_RESOURCES } from '../data/kopargaonData.js';

export class MapRenderer {
  constructor(containerId, onMarkerClick) {
    this.containerId = containerId;
    this.onMarkerClick = onMarkerClick;
    this.map = null;
    this.wardLayers = {};
    this.issueMarkers = [];
    this.vehicleMarkers = [];
    this.pipelineLayers = [];
    this.currentLanguage = "en";
  }

  init() {
    if (this.map) return;

    this.map = L.map(this.containerId, {
      center: KOPARGAON_BOUNDS.center,
      zoom: KOPARGAON_BOUNDS.zoom,
      minZoom: KOPARGAON_BOUNDS.minZoom,
      maxZoom: KOPARGAON_BOUNDS.maxZoom,
      zoomControl: true
    });

    // High performance CartoDB Voyager tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> | Kopargaon Irrigation Division & KMC',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    this.renderWards();
    this.renderCanalAndPipes();
    this.renderFleet();
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
    this.renderWards();
  }

  renderWards() {
    // Clear existing
    Object.values(this.wardLayers).forEach(layer => this.map.removeLayer(layer));
    this.wardLayers = {};

    WARDS.forEach(ward => {
      const polygon = L.polygon(ward.coordinates, {
        color: ward.color,
        weight: 2.5,
        fillColor: ward.color,
        fillOpacity: 0.14,
        dashArray: '5, 5'
      }).addTo(this.map);

      const title = this.currentLanguage === "mr" ? ward.nameMr : ward.name;
      const area = this.currentLanguage === "mr" ? ward.areaMr : ward.area;
      const reachTag = ward.canalReach === "TAIL_END" ? "🔴 Tail-End Reach" : (ward.canalReach === "HEAD_REACH" ? "🟢 Head-Reach" : "🟡 Middle Reach");

      polygon.bindTooltip(`
        <div class="p-1 font-sans">
          <strong style="color: ${ward.color}">${title}</strong><br/>
          <span style="font-size: 11px; opacity: 0.8">${area}</span><br/>
          <span style="font-size: 10px; color: #0284c7; font-weight:600;">${reachTag} • ${ward.irrigatedHectares} Ha</span><br/>
          <span style="font-size: 10px; color: #64748b">Starvation Index: ${ward.historicalNeglectScore}/100</span>
        </div>
      `, { sticky: true, className: 'custom-map-tooltip' });

      polygon.on('mouseover', () => {
        polygon.setStyle({ fillOpacity: 0.35, weight: 3.5 });
      });
      polygon.on('mouseout', () => {
        polygon.setStyle({ fillOpacity: 0.14, weight: 2.5 });
      });

      this.wardLayers[ward.id] = polygon;
    });
  }

  renderCanalAndPipes() {
    // 1. Godavari River Natural Corridor
    const river = [
      [19.9050, 74.4620],
      [19.9010, 74.4710],
      [19.8960, 74.4810],
      [19.8920, 74.4950]
    ];
    L.polyline(river, {
      color: '#38bdf8',
      weight: 6,
      opacity: 0.65
    }).bindTooltip("🌊 Godavari River Main Corridor", { sticky: true }).addTo(this.map);

    // 2. Godavari Left Bank Canal (GLBC) Main Channel
    const glbcMain = [
      [19.9030, 74.4650],
      [19.8980, 74.4790], // Headworks KM 12
      [19.8895, 74.4930], // D-2 Siphon Crossing
      [19.8790, 74.5080]  // Tailwards
    ];
    L.polyline(glbcMain, {
      color: '#0284c7',
      weight: 4.5,
      opacity: 0.9,
      dashArray: '6, 3'
    }).bindTooltip("💧 Godavari Left Bank Canal (GLBC) - 140 Cfs Awartan", { sticky: true }).addTo(this.map);

    // 3. Distributary D-4 to Ward 5 Tail Reach
    const distD4 = [
      [19.8895, 74.4930],
      [19.8850, 74.4830],
      [19.8825, 74.4720], // D-4 Tail Gate
      [19.8810, 74.4690]  // Minor 4B Tail Orchards
    ];
    L.polyline(distD4, {
      color: '#ec4899',
      weight: 3.5,
      opacity: 0.85,
      dashArray: '4, 4'
    }).bindTooltip("🌾 Distributary D-4 & Minor 4B Tail Canal (Laxmi Nagar)", { sticky: true }).addTo(this.map);

    // 4. Potable Feeder to ESR-2 & Rural Hospital
    const potableFeeder = [
      [19.8980, 74.4790],
      [19.8880, 74.4850],
      [19.8730, 74.4920], // ESR-2 Master Tank
      [19.8715, 74.4910]  // Rural Hospital
    ];
    L.polyline(potableFeeder, {
      color: '#10b981',
      weight: 3,
      opacity: 0.85,
      dashArray: '8, 4'
    }).bindTooltip("🏥 Hospital & Master ESR-2 Dedicated Potable Line", { sticky: true }).addTo(this.map);
  }

  renderFleet() {
    // Clear previous
    this.vehicleMarkers.forEach(m => this.map.removeLayer(m));
    this.vehicleMarkers = [];

    // Crews
    MUNICIPAL_RESOURCES.crews.forEach(crew => {
      const crewIcon = L.divIcon({
        className: 'vehicle-crew-icon',
        html: `<div class="crew-badge pulse-crew"><span class="icon">👷</span> ${crew.id}</div>`,
        iconSize: [44, 24],
        iconAnchor: [22, 12]
      });

      const marker = L.marker(crew.location, { icon: crewIcon }).addTo(this.map);
      marker.bindPopup(`
        <div style="font-size:12px; line-height: 1.4;">
          <strong>${crew.name}</strong><br/>
          <span>In-Charge: ${crew.lead} (${crew.size} Patkaris)</span><br/>
          <span>Status: <strong style="color: #10b981">${crew.status}</strong> (8h Shift Max)</span>
        </div>
      `);
      this.vehicleMarkers.push(marker);
    });

    // Tankers & Pumps
    const pumpLoc = [19.8825, 74.4720];
    const pumpIcon = L.divIcon({
      className: 'vehicle-pump-icon',
      html: `<div class="tanker-badge" style="background:#0284c7; color:#fff;"><span class="icon">⚙️</span> SJ-01</div>`,
      iconSize: [52, 24],
      iconAnchor: [26, 12]
    });
    const pumpMarker = L.marker(pumpLoc, { icon: pumpIcon }).addTo(this.map);
    pumpMarker.bindPopup(`<strong>Mobile Lift Pump (50 HP)</strong><br/>Location: Minor-4 Tail Sluice`);
    this.vehicleMarkers.push(pumpMarker);
  }

  renderIssues(issues, activeTriageMap = {}) {
    // Remove old issue markers
    this.issueMarkers.forEach(m => this.map.removeLayer(m));
    this.issueMarkers = [];

    const categoryIcons = {
      agriculture: '🌾',
      drinking_lifeline: '🏥',
      drinking_slum: '🚰',
      canal_breach: '⚠️',
      drinking_transit: '🚌'
    };

    issues.forEach(issue => {
      const triageItem = activeTriageMap[issue.id];
      const isBatch1 = triageItem && triageItem.allocatedBatch === "BATCH_1";
      const isBatch2 = triageItem && triageItem.allocatedBatch === "BATCH_2";
      const score = triageItem ? triageItem.triageScore : (issue.triageScore || issue.severity);
      const iconEmoji = categoryIcons[issue.category] || '💧';

      const html = `
        <div class="issue-map-pin ${isBatch1 ? 'pin-batch1' : (isBatch2 ? 'pin-batch2' : 'pin-pending')}">
          <div class="pin-inner">
            <span style="font-size:11px;">${iconEmoji}</span>
            <span class="pin-score">${score}</span>
          </div>
          ${isBatch1 ? '<div class="pin-pulse"></div>' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-issue-div-icon',
        html,
        iconSize: [42, 38],
        iconAnchor: [21, 19]
      });

      const marker = L.marker([issue.lat, issue.lng], { icon: customIcon }).addTo(this.map);

      const title = this.currentLanguage === "mr" ? (issue.titleMr || issue.title) : issue.title;
      const applicant = this.currentLanguage === "mr" ? (issue.applicantNameMr || issue.applicantName) : issue.applicantName;
      
      const statusBadge = isBatch1 
        ? '<span class="badge badge-success">Batch 1 (Gate Release Approved)</span>' 
        : (isBatch2 ? '<span class="badge badge-warning">Batch 2 (Next Shift Queued)</span>' : '<span class="badge badge-secondary">Deferred / Quota Limit</span>');

      marker.bindPopup(`
        <div class="map-popup-card">
          <div class="popup-header">
            ${statusBadge}
            <span class="popup-score">Shejpali: <strong>${score}</strong>/100</span>
          </div>
          <div style="font-size:11px; color:#38bdf8; font-weight:700; margin-bottom:3px;">
            📜 ${issue.permitNo || 'SANCTION PENDING'}
          </div>
          <h4 class="popup-title">${title}</h4>
          <p style="font-size:11.5px; color:#cbd5e1; margin:4px 0;"><strong>Applicant:</strong> ${applicant}</p>
          <p class="popup-loc">📍 ${issue.locationDesc} (${issue.wardName})</p>
          <div class="popup-meta">
            <div>🌾 <strong>${issue.cropType || 'Water Demand'}</strong></div>
            <div>⏱️ <strong>${issue.daysSinceLastTurn || 0} days dry</strong></div>
            <div>🌊 <strong>${issue.appliedDischargeCusecs || 0} Cusecs</strong></div>
          </div>
          <button id="inspect-btn-${issue.id}" class="popup-inspect-btn">
            🧠 Inspect XAI Shejpali Explanation & Counterfactuals
          </button>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`inspect-btn-${issue.id}`);
        if (btn && this.onMarkerClick) {
          btn.addEventListener('click', () => {
            this.onMarkerClick(issue.id);
          });
        }
      });

      this.issueMarkers.push(marker);
    });
  }

  highlightWard(wardId) {
    if (this.wardLayers[wardId]) {
      this.wardLayers[wardId].setStyle({ fillOpacity: 0.5, weight: 4 });
      this.map.panTo(this.wardLayers[wardId].getBounds().getCenter(), { animate: true });
    }
  }
}
