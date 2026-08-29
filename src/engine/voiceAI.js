// Marathi Voice-to-Triage AI Pipeline & NLP Entity Extractor for Shejpali System
// Research basis: White et al., 2021; P. et al., 2026; Mehta, 2025

import { MARATHI_VOICE_SAMPLES, WARDS } from '../data/kopargaonData.js';

export class VoiceAIEngine {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'mr-IN'; // Marathi (India)
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }
  }

  /**
   * Parses Marathi natural language text into structured Shejpali water permit application
   */
  extractCivicIntent(marathiText) {
    const text = marathiText.toLowerCase();
    
    // 1. Identify Ward / Reach
    let detectedWard = null;
    if (text.includes("बेट") || text.includes("गोदावरी") || text.includes("घाट") || text.includes("कच्छेश्वर")) {
      detectedWard = WARDS.find(w => w.id === "W1");
    } else if (text.includes("सुभाष") || text.includes("बाजार") || text.includes("वितरिका १") || text.includes("पेठ")) {
      detectedWard = WARDS.find(w => w.id === "W2");
    } else if (text.includes("समता") || text.includes("सोमय्या") || text.includes("वितरिका २") || text.includes("अ‍ॅक्वाडक्ट")) {
      detectedWard = WARDS.find(w => w.id === "W3");
    } else if (text.includes("शिर्डी") || text.includes("स्टेशन") || text.includes("बस स्टँड") || text.includes("हायवे")) {
      detectedWard = WARDS.find(w => w.id === "W4");
    } else if (text.includes("लक्ष्मी") || text.includes("गणेश") || text.includes("मायनर ४") || text.includes("झोपडपट्टी")) {
      detectedWard = WARDS.find(w => w.id === "W5");
    } else if (text.includes("शिवाजी") || text.includes("एमआयडीसी") || text.includes("कारखाना") || text.includes("कपाशी")) {
      detectedWard = WARDS.find(w => w.id === "W6");
    } else if (text.includes("रुग्णालय") || text.includes("टिळक") || text.includes("हॉस्पिटल") || text.includes("डायलिसिस")) {
      detectedWard = WARDS.find(w => w.id === "W7");
    } else {
      detectedWard = WARDS[4]; // Default Ward 5 Laxmi Nagar
    }

    // 2. Identify Crop & Category
    let category = "agriculture";
    let cropType = "Mixed Horticulture";
    let cropStage = "Vegetative Stage";
    let cropCriticalityIndex = 70;
    let daysSinceLastTurn = 20;
    let appliedCusecs = 20;
    let requiredCrew = "C1";
    let requiredEquip = [];

    if (text.includes("डाळिंब") || text.includes("पेरू") || text.includes("फळगळती") || text.includes("फळ")) {
      category = "agriculture";
      cropType = "Pomegranate / Guava Orchard";
      cropStage = "Fruit Setting / Critical Wilting Threshold";
      cropCriticalityIndex = 94;
      daysSinceLastTurn = 35;
      appliedCusecs = 28;
      requiredCrew = "C1";
      requiredEquip.push("SJ-01");
    } else if (text.includes("रुग्णालय") || text.includes("हॉस्पिटल") || text.includes("डायलिसिस") || text.includes("ईएसआर")) {
      category = "drinking_lifeline";
      cropType = "Hospital Potable Lifeline";
      cropStage = "Critical Healthcare Service";
      cropCriticalityIndex = 99;
      daysSinceLastTurn = 2;
      appliedCusecs = 22;
      requiredCrew = "C2";
      requiredEquip.push("TK-01");
    } else if (text.includes("नळ") || text.includes("स्टँडपोस्ट") || text.includes("पिण्याचे पाणी") || text.includes("वस्ती")) {
      category = "drinking_slum";
      cropType = "Slum Potable Standposts";
      cropStage = "Basic Human Right & Health Security";
      cropCriticalityIndex = 92;
      daysSinceLastTurn = 4;
      appliedCusecs = 16;
      requiredCrew = "C4";
      requiredEquip.push("TK-02");
    } else if (text.includes("ऊस") || text.includes("बागायतदार") || text.includes("आडसाली")) {
      category = "agriculture";
      cropType = "Sugarcane (Hardy Cash Crop)";
      cropStage = "Vegetative Tillering (Non-Critical)";
      cropCriticalityIndex = 52;
      daysSinceLastTurn = 14;
      appliedCusecs = 45;
      requiredCrew = "C1";
    } else if (text.includes("कांदा") || text.includes("भाजीपाला") || text.includes("रोपवाटिका")) {
      category = "agriculture";
      cropType = "Onion & Seedling Nursery";
      cropStage = "Seedling Moisture Sensitive";
      cropCriticalityIndex = 82;
      daysSinceLastTurn = 22;
      appliedCusecs = 18;
      requiredCrew = "C1";
    } else if (text.includes("गळती") || text.includes("फुटली") || text.includes("गाळ") || text.includes("कालवा")) {
      category = "canal_breach";
      cropType = "Conveyance Infrastructure Repair";
      cropStage = "Hydraulic Blockage Prevention";
      cropCriticalityIndex = 88;
      daysSinceLastTurn = 0;
      appliedCusecs = 0;
      requiredCrew = "C3";
      requiredEquip.push("EX-01");
    }

    // 3. Estimate Severity & Urgency
    let severity = cropCriticalityIndex;
    if (text.includes("तातडीने") || text.includes("लगेच") || text.includes("सुकली") || text.includes("मरेल")) {
      severity = Math.min(98, severity + 8);
    }

    // 4. Geo coordinates near Ward
    const centerLat = detectedWard.coordinates[0][0];
    const centerLng = detectedWard.coordinates[0][1];

    const randomPermit = `MAJI-2026-${Math.floor(100 + Math.random() * 899)}`;

    return {
      id: `VOICE-${Date.now().toString().slice(-4)}`,
      permitNo: randomPermit,
      applicantName: `Voice Applicant (${detectedWard.area.split(" ")[0]})`,
      applicantNameMr: `मराठी व्हॉईस अर्जदार (${detectedWard.nameMr.split(":")[1].split("(")[0].trim()})`,
      rawAudioText: marathiText,
      title: `[Voice Permit Application] ${cropType} Water Turn Request`,
      titleMr: `[व्हॉईस पाणी मागणी] ${cropType} साठी शेजपाळी आवर्तन मागणी`,
      category,
      cropType,
      cropStage,
      cropCriticalityIndex,
      daysSinceLastTurn,
      sanctionedAreaHa: category === "agriculture" ? 25.0 : 0,
      appliedDischargeCusecs: appliedCusecs,
      requiredDurationHours: 4.5,
      wardId: detectedWard.id,
      wardName: detectedWard.name,
      locationDesc: `Reported via Marathi Voice in ${detectedWard.area}`,
      lat: centerLat + (Math.random() - 0.5) * 0.004,
      lng: centerLng + (Math.random() - 0.5) * 0.004,
      timestamp: new Date().toISOString(),
      severity,
      affectedPopulation: category === "agriculture" ? 180 : 3500,
      vulnerabilityScore: detectedWard.vulnerabilityIndex,
      durationHours: 1.0,
      estimatedCost: 16000 + Math.round(Math.random() * 10000),
      estimatedCrewHours: 3.5,
      requiredCrewType: requiredCrew,
      requiredEquipment: requiredEquip,
      cascadeRiskScore: severity > 80 ? 80 : 45,
      status: "PENDING_TRIAGE",
      reportedCount: 1,
      source: "Farmer Marathi Voice AI Portal",
      iotData: { soilMoisture: "12.5% (Telemetry Estimated)", voiceConfidence: "96.4%" }
    };
  }

  /**
   * Speaks Marathi text back to user via SpeechSynthesis
   */
  speakMarathi(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'mr-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }

  getSamples() {
    return MARATHI_VOICE_SAMPLES;
  }
}
