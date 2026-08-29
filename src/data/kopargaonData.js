// Kopargaon Shejpali Water Triage & Digital Twin Data Model
// Realistic municipal & irrigation data for Kopargaon Municipal Council (KMC) & Godavari Left Bank Canal Network, Ahmednagar District, Maharashtra
// Compliant with Maharashtra Irrigation Act, 1976 & Municipal Potable Allocation Norms

export const KOPARGAON_BOUNDS = {
  center: [19.8906, 74.4786],
  zoom: 14,
  minZoom: 13,
  maxZoom: 17
};

export const WARDS = [
  {
    id: "W1",
    name: "Ward 1: Godavari Ghat & Bet Kopargaon (Tail-End Minor 1)",
    nameMr: "प्रभाग १: गोदावरी घाट व बेट कोपरगाव (टेल-एंड मायनर १)",
    area: "Bet Kopargaon & Riverbank Irrigation Pocket",
    areaMr: "बेट कोपरगाव व नदीकाठ शेती परिसर",
    population: 14200,
    irrigatedHectares: 340,
    canalReach: "TAIL_END", // Head, Middle, Tail
    vulnerabilityIndex: 0.82, // High tail-end starvation risk
    slumPocket: true,
    historicalNeglectScore: 74, // Accumulated water starvation counter (0-100)
    criticalAssets: ["River Intake Well #1", "ESR-1 Bet Reservoir", "Minor-1 Sluice Gate", "Kachheshwar Lift Scheme"],
    coordinates: [
      [19.8985, 74.4680],
      [19.9040, 74.4750],
      [19.8995, 74.4840],
      [19.8930, 74.4780],
      [19.8920, 74.4710]
    ],
    color: "#3b82f6"
  },
  {
    id: "W2",
    name: "Ward 2: Bazar Peth & Commercial Core (Distributary D-1)",
    nameMr: "प्रभाग २: बाजार पेठ व मध्यवर्ती व्यापारी विभाग (वितरिका डी-१)",
    area: "Central Commercial Core & Urban Water Main",
    areaMr: "मध्यवर्ती व्यापारी पेठ व मुख्य जलवाहिनी",
    population: 18500,
    irrigatedHectares: 45,
    canalReach: "HEAD_REACH",
    vulnerabilityIndex: 0.45,
    slumPocket: false,
    historicalNeglectScore: 22,
    criticalAssets: ["Subhash Chowk Booster Sump", "Main Distribution Junction V-01", "KMC Commercial Water Meter"],
    coordinates: [
      [19.8930, 74.4780],
      [19.8995, 74.4840],
      [19.8940, 74.4920],
      [19.8875, 74.4860]
    ],
    color: "#f59e0b"
  },
  {
    id: "W3",
    name: "Ward 3: Samata Nagar & Somaiya Belt (Distributary D-2)",
    nameMr: "प्रभाग ३: समता नगर व सोमय्या शेती पट्टा (वितरिका डी-२)",
    area: "Education Zone & Mixed Peri-Urban Farmlands",
    areaMr: "शैक्षणिक परिसर व उपनगरीय बागायती पट्टा",
    population: 16800,
    irrigatedHectares: 280,
    canalReach: "MIDDLE_REACH",
    vulnerabilityIndex: 0.58,
    slumPocket: false,
    historicalNeglectScore: 38,
    criticalAssets: ["Somaiya Agricultural Nursery", "Water Main Valve V-04", "ESR-3 Samata Reservoir"],
    coordinates: [
      [19.8875, 74.4860],
      [19.8940, 74.4920],
      [19.8890, 74.5010],
      [19.8810, 74.4940]
    ],
    color: "#10b981"
  },
  {
    id: "W4",
    name: "Ward 4: Shirdi Highway & Station Road (Transit Corridor)",
    nameMr: "प्रभाग ४: शिर्डी हायवे व स्टेशन रोड (भाविक व वाहतूक कॉरिडॉर)",
    area: "Transit & Pilgrim Potable Lifeline",
    areaMr: "भाविक व प्रवासी पिण्याचे पाणी कॉरिडॉर",
    population: 12400,
    irrigatedHectares: 90,
    canalReach: "MIDDLE_REACH",
    vulnerabilityIndex: 0.52,
    slumPocket: false,
    historicalNeglectScore: 35,
    criticalAssets: ["MSRTC Transit Standpost Sump", "Station Road Feeder Line", "Railway Ground Sump"],
    coordinates: [
      [19.8810, 74.4940],
      [19.8890, 74.5010],
      [19.8820, 74.5100],
      [19.8730, 74.5020]
    ],
    color: "#8b5cf6"
  },
  {
    id: "W5",
    name: "Ward 5: Laxmi Nagar & Ganeshnagar Slums (Tail-End Minor 4)",
    nameMr: "प्रभाग ५: लक्ष्मीनगर व गणेशनगर वस्ती (टेल-एंड मायनर ४)",
    area: "Low-Income Informal Zone & Smallholder Orchards",
    areaMr: "अल्प उत्पन्न वस्ती व अल्पभूधारक डाळिंब/पेरू बागा",
    population: 21300,
    irrigatedHectares: 410,
    canalReach: "TAIL_END", // Chronic tail-end dry-out
    vulnerabilityIndex: 0.96, // Highest socio-economic & water distress
    slumPocket: true,
    historicalNeglectScore: 89, // Severe rotational skipping in past seasons
    criticalAssets: ["Public Standpost Cluster SP-01/08", "Minor-4 Tail Sluice Gate", "Ganeshnagar Sump Well"],
    coordinates: [
      [19.8820, 74.4680],
      [19.8920, 74.4710],
      [19.8875, 74.4860],
      [19.8780, 74.4800]
    ],
    color: "#ec4899"
  },
  {
    id: "W6",
    name: "Ward 6: Shivaji Nagar & MIDC Agro-Industrial Belt",
    nameMr: "प्रभाग ६: शिवाजी नगर व एमआयडीसी कृषी-उद्योग पट्टा",
    area: "Sugar Mills & Food Processing Supply Line",
    areaMr: "साखर कारखाना व अन्न प्रक्रिया औद्योगिक पाणीपुरवठा",
    population: 13900,
    irrigatedHectares: 190,
    canalReach: "MIDDLE_REACH",
    vulnerabilityIndex: 0.64,
    slumPocket: false,
    historicalNeglectScore: 55,
    criticalAssets: ["MIDC Industrial Feeder Line", "Cooperative Sugar Mill Offtake", "Chak 6 Distributary"],
    coordinates: [
      [19.8780, 74.4800],
      [19.8875, 74.4860],
      [19.8810, 74.4940],
      [19.8730, 74.4880]
    ],
    color: "#06b6d4"
  },
  {
    id: "W7",
    name: "Ward 7: Tilak Nagar & Rural Hospital Lifeline",
    nameMr: "प्रभाग ७: टिळक नगर व ग्रामीण रुग्णालय जीवनरेखा",
    area: "Sub-District Hospital & Master ESR-2 Zone",
    areaMr: "उपजिल्हा रुग्णालय व मुख्य जलकुंभ ईएसआर-२",
    population: 15100,
    irrigatedHectares: 120,
    canalReach: "HEAD_REACH",
    vulnerabilityIndex: 0.88, // Hospital dialysis & surgical wards require 100% water security
    slumPocket: false,
    historicalNeglectScore: 28,
    criticalAssets: ["Kopargaon Sub-District Hospital (100 Beds + Dialysis)", "ESR-2 Master Water Reservoir (1.2 ML)", "Hospital Direct Line HD-01"],
    coordinates: [
      [19.8730, 74.4880],
      [19.8810, 74.4940],
      [19.8730, 74.5020],
      [19.8660, 74.4930]
    ],
    color: "#6366f1"
  }
];

export const MUNICIPAL_RESOURCES = {
  crews: [
    { id: "C1", name: "Squad 1: Canal Sluice Gate & Patrolling", nameMr: "पथक १: कालवा गेट व गस्त नियंत्रण पथक", lead: "Santosh Shinde (Patkari)", size: 6, maxHours: 8, status: "Available", location: [19.8912, 74.4820], currentTask: null, specialized: ["canal_gate_operation", "sluice_valve_release", "tail_end_monitoring"] },
    { id: "C2", name: "Squad 2: Municipal Water Works & Booster Pumps", nameMr: "पथक २: जलशुद्धीकरण व बुस्टर पंप पथक", lead: "Bhausaheb Kale (Tech Lead)", size: 5, maxHours: 8, status: "Available", location: [19.8880, 74.4795], currentTask: null, specialized: ["esr_refill", "pipeline_breach", "pressure_tuning"] },
    { id: "C3", name: "Squad 3: Distributary Maintenance & Desilting", nameMr: "पथक ३: वितरिका दुरुस्ती व गाळ उपसा पथक", lead: "Ganesh Tambe (Junior Eng)", size: 7, maxHours: 8, status: "Available", location: [19.8845, 74.4910], currentTask: null, specialized: ["canal_desilting", "breach_containment", "siphon_clear"] },
    { id: "C4", name: "Squad 4: Water Tanker Emergency Dispatch", nameMr: "पथक ४: आपत्कालीन टँकर वाटप व पर्यवेक्षण", lead: "Kailas Thorat (Inspector)", size: 4, maxHours: 8, status: "Available", location: [19.8790, 74.4750], currentTask: null, specialized: ["slum_tanker_supply", "hospital_emergency_tanker", "standpost_refill"] }
  ],
  equipment: {
    tankers: [
      { id: "TK-01", capacity: "10,000 Liters", status: "Available", assignedWard: null, efficiency: 0.95 },
      { id: "TK-02", capacity: "6,000 Liters", status: "Available", assignedWard: null, efficiency: 0.90 },
      { id: "TK-03", capacity: "6,000 Liters", status: "Available", assignedWard: null, efficiency: 0.88 }
    ],
    specialVehicles: [
      { id: "SJ-01", type: "High-Discharge Mobile Canal Pump (50 HP)", nameMr: "मोबाईल डिझेल लिफ्ट पंप (५० एचपी)", status: "Available", assignedTask: null, costPerHour: 1200 },
      { id: "EX-01", type: "Canal Desilting JCB Excavator", nameMr: "कालवा गाळ उपसा जेसीबी", status: "Available", assignedTask: null, costPerHour: 2200 }
    ]
  },
  dailyDischargeLimitCusecs: 140, // 140 Cusecs daily rotation discharge ceiling (Godavari Canal Awartan)
  dailyDischargeLimitML: 34.0, // ~34 Megaliters total rotational budget per 24h cycle
  dailyBudgetLimit: 150000, // ₹1,50,000 INR maximum emergency operation budget
  allocatedBudget: 0,
  allocatedDischargeCusecs: 0
};

export const INITIAL_GRIEVANCES = [
  {
    id: "SHJ-101",
    permitNo: "MAJI-2026-789",
    applicantName: "Suresh Baburao Kale (Minor 4 Water Users Association)",
    applicantNameMr: "सुरेश बाबुराव काळे (पाणी वापर संस्था, मायनर ४)",
    title: "Critical Wilting: 42 Hectares Pomegranate & Guava Orchards",
    titleMr: "डाळिंब व पेरू बागांना तातडीचे आवर्तन: पाण्याचा ताण पडून फळगळती सुरू",
    category: "agriculture",
    cropType: "Pomegranate / Guava (Horticulture Cash Crop)",
    cropStage: "Fruit Setting / Critical Wilting Threshold",
    cropCriticalityIndex: 94, // 0-100 (Horticultural trees die without water within 4 days)
    daysSinceLastTurn: 38, // Long starvation (normal cycle is 21 days)
    sanctionedAreaHa: 42.0,
    appliedDischargeCusecs: 28,
    requiredDurationHours: 6.0,
    wardId: "W5",
    wardName: "Ward 5: Laxmi Nagar / Ganeshnagar (Tail-End)",
    locationDesc: "Minor-4 Tail Gate, Chak 4B, Near Ganeshnagar Border",
    lat: 19.8825,
    lng: 74.4720,
    timestamp: "2026-08-29T05:30:00",
    severity: 93,
    affectedPopulation: 340, // 34 farming families
    vulnerabilityScore: 0.95, // High tail-end starvation vulnerability
    estimatedCost: 18500, // Operating & Patkari deployment cost (INR)
    estimatedCrewHours: 5.0,
    requiredCrewType: "C1",
    requiredEquipment: ["SJ-01"],
    cascadeRiskScore: 90, // Loss of ₹1.4 Crore horticultural tree assets if missed
    upstreamAssets: ["Distributary D-4 Sluice", "Godavari Left Main Canal KM 24"],
    downstreamAssets: ["Chak 4B Field Channels", "Groundwater Recharge Zone 5"],
    status: "PENDING_TRIAGE",
    reportedCount: 19,
    source: "Maji Pauti System + Satellite Soil Moisture NDVI (0.18 - Severe Stress)",
    iotData: { soilMoisture: "11.2% (Wilting Point 10%)", canalTailDepth: "0.05m (Dry)", ndviStress: "Critical Red" }
  },
  {
    id: "SHJ-102",
    permitNo: "HOSP-2026-004",
    applicantName: "Superintendent, Kopargaon Sub-District Hospital",
    applicantNameMr: "वैद्यकीय अधीक्षक, कोपरगाव उपजिल्हा रुग्णालय",
    title: "Emergency Potable Supply: Hospital Master ESR-2 Refill",
    titleMr: "उपजिल्हा रुग्णालय ईएसआर-२ जलकुंभ पुनर्भरण: डायलिसिस व शस्त्रक्रिया कक्ष टंचाई",
    category: "drinking_lifeline",
    cropType: "Municipal Hospital Potable Lifeline (Non-Crop)",
    cropStage: "Continuous Lifeline / Critical Health Service",
    cropCriticalityIndex: 99, // Ultimate human health priority under Maharashtra Water Policy
    daysSinceLastTurn: 2,
    sanctionedAreaHa: 0,
    appliedDischargeCusecs: 22,
    requiredDurationHours: 4.0,
    wardId: "W7",
    wardName: "Ward 7: Tilak Nagar / Rural Hospital",
    locationDesc: "Civil Hospital Master Intake Valve V-08",
    lat: 19.8720,
    lng: 74.4920,
    timestamp: "2026-08-29T06:15:00",
    severity: 98,
    affectedPopulation: 4200, // Includes 100 indoor patients + dialysis unit
    vulnerabilityScore: 0.98,
    estimatedCost: 24000,
    estimatedCrewHours: 3.5,
    requiredCrewType: "C2",
    requiredEquipment: ["TK-01"],
    cascadeRiskScore: 95,
    upstreamAssets: ["ESR-2 Master Reservoir", "Intake Pipeline HD-01"],
    downstreamAssets: ["ICU & Dialysis Center", "Maternity Ward"],
    status: "PENDING_TRIAGE",
    reportedCount: 8,
    source: "Medical Superintendent Hotline + Ultrasonic Tank Sensor",
    iotData: { esrLevel: "14% (Emergency Reserve Threshold 15%)", inflowPressure: "0.4 bar" }
  },
  {
    id: "SHJ-103",
    permitNo: "MAJI-2026-612",
    applicantName: "Bhausaheb Vitthal Patil (Head-Reach Sugarcane Society)",
    applicantNameMr: "भाऊसाहेब विठ्ठल पाटील (ऊस बागायतदार संस्था, हेड-रीच)",
    title: "Routine Rotation: 65 Hectares Adsali Sugarcane",
    titleMr: "नियमित आवर्तन मागणी: ६५ हेक्टर आडसाली ऊस पट्टा (हेड-रीच)",
    category: "agriculture",
    cropType: "Sugarcane (High Water Demand / Hardy)",
    cropStage: "Vegetative Tillering (Non-Critical)",
    cropCriticalityIndex: 52, // Sugarcane can tolerate 10-14 day delays without crop failure
    daysSinceLastTurn: 14, // Received water only 14 days ago
    sanctionedAreaHa: 65.0,
    appliedDischargeCusecs: 45, // Heavy discharge request
    requiredDurationHours: 7.0,
    wardId: "W2",
    wardName: "Ward 2: Bazar Peth / Head-Reach Distributary D-1",
    locationDesc: "Distributary D-1 Sluice Head, Near Subhash Road Outfall",
    lat: 19.8920,
    lng: 74.4820,
    timestamp: "2026-08-29T07:00:00",
    severity: 48,
    affectedPopulation: 180,
    vulnerabilityScore: 0.38, // Head-reach farm with rich private well backups
    estimatedCost: 32000,
    estimatedCrewHours: 6.0,
    requiredCrewType: "C1",
    requiredEquipment: [],
    cascadeRiskScore: 30,
    upstreamAssets: ["Godavari Main Canal KM 12 Headgate"],
    downstreamAssets: ["D-1 Sugarcane Fields", "Private Farm Ponds"],
    status: "PENDING_TRIAGE",
    reportedCount: 6,
    source: "Irrigation Form 7 Application",
    iotData: { soilMoisture: "32.4% (Adequate)", canalHeadFlow: "Normal 3.2 m/s" }
  },
  {
    id: "SHJ-104",
    permitNo: "SLUM-2026-108",
    applicantName: "Laxmi Nagar Slum Citizens Action Committee",
    applicantNameMr: "लक्ष्मीनगर झोपडपट्टी पाणी हक्क समिती",
    title: "Potable Deficit: 8 Public Standpost Clusters Depleted",
    titleMr: "सार्वजनिक नळ स्टँडपोस्ट कोरडे: ८ हजार वस्तीत पिण्याच्या पाण्याचे तीव्र संकट",
    category: "drinking_slum",
    cropType: "Slum Community Potable Supply (Non-Crop)",
    cropStage: "Basic Human Right / High Epidemic Risk",
    cropCriticalityIndex: 95,
    daysSinceLastTurn: 4,
    sanctionedAreaHa: 0,
    appliedDischargeCusecs: 16,
    requiredDurationHours: 3.5,
    wardId: "W5",
    wardName: "Ward 5: Laxmi Nagar Slums",
    locationDesc: "Standposts SP-01 to SP-08, Ganeshnagar Galli 4",
    lat: 19.8840,
    lng: 74.4760,
    timestamp: "2026-08-29T04:45:00",
    severity: 91,
    affectedPopulation: 8500,
    vulnerabilityScore: 0.96, // Highest socio-economic vulnerability
    estimatedCost: 16000,
    estimatedCrewHours: 3.5,
    requiredCrewType: "C4",
    requiredEquipment: ["TK-02", "TK-03"],
    cascadeRiskScore: 85, // Sullage contamination if standposts remain under negative pressure
    upstreamAssets: ["Ganeshnagar Sump Well"],
    downstreamAssets: ["Public Standposts SP-01 to SP-08"],
    status: "PENDING_TRIAGE",
    reportedCount: 32,
    source: "Marathi Voice Portal + Community Corporator Call",
    iotData: { standpostPressure: "0.1 bar (Zero Flow)", waterColiform: "Safe but empty" }
  },
  {
    id: "SHJ-105",
    permitNo: "MAJI-2026-340",
    applicantName: "Bet Kopargaon Vegetable Growers Cooperative",
    applicantNameMr: "बेट कोपरगाव भाजीपाला उत्पादक सहकारी संस्था",
    title: "Vegetable Seedling & Onion Crop: 28 Hectares in Sandy Soil",
    titleMr: "कांदा रोपवाटिका व भाजीपाला पट्टा: वाळूमिश्रित जमिनीत पाण्याचा ताण",
    category: "agriculture",
    cropType: "Onion Seedlings & Summer Vegetables",
    cropStage: "Seedling Establishment (High Moisture Sensitivity)",
    cropCriticalityIndex: 82,
    daysSinceLastTurn: 22,
    sanctionedAreaHa: 28.0,
    appliedDischargeCusecs: 18,
    requiredDurationHours: 4.5,
    wardId: "W1",
    wardName: "Ward 1: Bet Kopargaon (Tail-End Minor 1)",
    locationDesc: "River Intake Lift Well #1, Chak 1A",
    lat: 19.8970,
    lng: 74.4720,
    timestamp: "2026-08-29T06:00:00",
    severity: 78,
    affectedPopulation: 260,
    vulnerabilityScore: 0.79,
    estimatedCost: 19500,
    estimatedCrewHours: 4.0,
    requiredCrewType: "C1",
    requiredEquipment: ["SJ-01"],
    cascadeRiskScore: 72,
    upstreamAssets: ["River Intake Well #1", "Minor-1 Sluice Gate"],
    downstreamAssets: ["Bet Vegetable Channels", "Ghat Drinking Wells"],
    status: "PENDING_TRIAGE",
    reportedCount: 14,
    source: "Water Users Association Form 7",
    iotData: { soilMoisture: "14.8% (Dry)", riverLevel: "2.1m" }
  },
  {
    id: "SHJ-106",
    permitNo: "INFRA-2026-021",
    applicantName: "Executive Engineer, Godavari Left Bank Canal Div.",
    applicantNameMr: "कार्यकारी अभियंता, गोदावरी डावा कालवा विभाग",
    title: "Distributary D-2 Sluice Breach & Conveyance Silt Jam",
    titleMr: "वितरिका डी-२ गेट गळती व गाळ साचल्याने टेल-एंडला पाणी पोहोचण्यात अडथळा",
    category: "canal_breach",
    cropType: "Infrastructure Conduit (Affects 180 Ha downstream)",
    cropStage: "System Conveyance Blockage",
    cropCriticalityIndex: 88,
    daysSinceLastTurn: 0,
    sanctionedAreaHa: 0,
    appliedDischargeCusecs: 0, // Hydraulic repair to prevent 40% conveyance loss
    requiredDurationHours: 5.0,
    wardId: "W3",
    wardName: "Ward 3: Samata Nagar (Distributary D-2)",
    locationDesc: "D-2 Aqueduct Siphon Crossing, Somaiya Road",
    lat: 19.8895,
    lng: 74.4930,
    timestamp: "2026-08-29T03:30:00",
    severity: 86,
    affectedPopulation: 6400,
    vulnerabilityScore: 0.72,
    estimatedCost: 38000,
    estimatedCrewHours: 4.5,
    requiredCrewType: "C3",
    requiredEquipment: ["EX-01"],
    cascadeRiskScore: 88, // Can drown road culvert while starving downstream Ward 5
    upstreamAssets: ["Main Godavari Canal KM 18"],
    downstreamAssets: ["D-2 Distributary", "Ward 5 Chak 4B"],
    status: "PENDING_TRIAGE",
    reportedCount: 11,
    source: "Patkari Canal Patrol Inspection",
    iotData: { flowVelocity: "0.6 m/s (Silted, Expected 1.8 m/s)", seepageLoss: "38%" }
  },
  {
    id: "SHJ-107",
    permitNo: "MAJI-2026-554",
    applicantName: "Shivaji Nagar Mixed Orchard & Cotton Growers",
    applicantNameMr: "शिवाजी नगर बागायतदार व कपाशी शेतकरी गट",
    title: "BT Cotton & Sweet Lime: 35 Hectares Boll-Formation Stage",
    titleMr: "कपाशी बोंड भरण्याची अवस्था व मोसंबी: ३५ हेक्टरसाठी पाणी आवर्तन",
    category: "agriculture",
    cropType: "BT Cotton / Sweet Lime (Cash Crop)",
    cropStage: "Boll Formation & Flowering (Moderately Critical)",
    cropCriticalityIndex: 74,
    daysSinceLastTurn: 25,
    sanctionedAreaHa: 35.0,
    appliedDischargeCusecs: 24,
    requiredDurationHours: 4.5,
    wardId: "W6",
    wardName: "Ward 6: Shivaji Nagar / MIDC Agro Belt",
    locationDesc: "Chak 6 Minor Offtake, MIDC Sector 3",
    lat: 19.8760,
    lng: 74.4840,
    timestamp: "2026-08-29T06:45:00",
    severity: 72,
    affectedPopulation: 190,
    vulnerabilityScore: 0.65,
    estimatedCost: 21000,
    estimatedCrewHours: 4.0,
    requiredCrewType: "C1",
    requiredEquipment: [],
    cascadeRiskScore: 55,
    upstreamAssets: ["MIDC Feeder Canal"],
    downstreamAssets: ["Chak 6 Farm Outlets"],
    status: "PENDING_TRIAGE",
    reportedCount: 9,
    source: "WUA Irrigation Request",
    iotData: { soilMoisture: "18.2%", canopyTemp: "36.2°C (Moderate Water Stress)" }
  },
  {
    id: "SHJ-108",
    permitNo: "PILG-2026-015",
    applicantName: "Shirdi Highway Transit Water Management Cell",
    applicantNameMr: "शिर्डी हायवे भाविक पिण्याचे पाणी व्यवस्थापन कक्ष",
    title: "MSRTC Bus Depot & Sai Pilgrim Standpost Feeder Refill",
    titleMr: "बस स्टँड व शिर्डी भाविक कॉरिडॉर: जलकुंभ पुनर्भरण मागणी",
    category: "drinking_transit",
    cropType: "Pilgrim Transit Potable (Non-Crop)",
    cropStage: "Continuous Public Transit Need",
    cropCriticalityIndex: 70,
    daysSinceLastTurn: 3,
    sanctionedAreaHa: 0,
    appliedDischargeCusecs: 14,
    requiredDurationHours: 3.0,
    wardId: "W4",
    wardName: "Ward 4: Shirdi Highway / Station Road",
    locationDesc: "MSRTC Standpost Sump, Near Highway Circle",
    lat: 19.8795,
    lng: 74.5030,
    timestamp: "2026-08-29T07:30:00",
    severity: 64,
    affectedPopulation: 7800,
    vulnerabilityScore: 0.52,
    estimatedCost: 14000,
    estimatedCrewHours: 2.5,
    requiredCrewType: "C4",
    requiredEquipment: ["TK-01"],
    cascadeRiskScore: 40,
    upstreamAssets: ["Station Road Feeder Line"],
    downstreamAssets: ["MSRTC Public Coolers", "Highway Kiosks"],
    status: "PENDING_TRIAGE",
    reportedCount: 7,
    source: "Bus Station Master Log",
    iotData: { sumpLevel: "28% (Refill required within 6h)" }
  }
];

export const SEASONAL_PRESETS = {
  NORMAL: {
    id: "NORMAL",
    name: "Standard Shejpali Rotation (नियमित शेजपाळी आवर्तन)",
    nameMr: "नियमित शेजपाळी आवर्तन स्थिती",
    weights: { cropCriticality: 0.28, rotationalEquity: 0.22, tailEndVuln: 0.20, sanctionCompliance: 0.15, conveyanceLoss: 0.15 },
    description: "Balanced multi-criteria prioritization under standard Maharashtra Irrigation Act rules.",
    descriptionMr: "महाराष्ट्र पाटबंधारे कायदा १९७६ नुसार समतोल बहु-निकष शेजपाळी पाणी वाटप."
  },
  SUMMER_DROUGHT: {
    id: "SUMMER_DROUGHT",
    name: "Severe Summer Crisis: Tail-End & Potable Priority",
    nameMr: "उन्हाळी तीव्र टंचाई: टेल-एंड व पिण्याचे पाणी सर्वोच्च प्राधान्य",
    weights: { cropCriticality: 0.35, rotationalEquity: 0.25, tailEndVuln: 0.25, sanctionCompliance: 0.10, conveyanceLoss: 0.05 },
    boosts: { drinking_lifeline: 2.5, drinking_slum: 2.2, tailEndWards: ["W1", "W5"] },
    description: "Strictly enforces drinking lifelines, hospital ESRs, and tail-end orchard preservation over hardy cash crops.",
    descriptionMr: "रुग्णालय, झोपडपट्टी पिण्याचे पाणी व टेल-एंड फळबागांना सर्वोच्च प्राधान्य; ऊस पिकांचे वाटप मर्यादित."
  },
  KHARIF_ROTATION: {
    id: "KHARIF_ROTATION",
    name: "Kharif Canal Awartan (खरीप आवर्तन व्यवस्थापन)",
    nameMr: "खरीप हंगाम आवर्तन व निचरा संतुलन",
    weights: { cropCriticality: 0.30, rotationalEquity: 0.20, tailEndVuln: 0.18, sanctionCompliance: 0.20, conveyanceLoss: 0.12 },
    boosts: { agriculture: 1.4, canal_breach: 1.6 },
    description: "Prioritizes rain-gap supplemental watering, seedling nurseries, and breach containment.",
    descriptionMr: "पावसातील खंड काळात पिके वाचवणे व वितरिका गळती रोखण्याला प्राधान्य."
  },
  FESTIVAL_PALKHI: {
    id: "FESTIVAL_PALKHI",
    name: "Shirdi Sai Palkhi & Godavari Snan Lifeline",
    nameMr: "शिर्डी पालखी व गोदावरी पर्वणी विशेष पाणी नियोजन",
    weights: { cropCriticality: 0.20, rotationalEquity: 0.18, tailEndVuln: 0.15, sanctionCompliance: 0.12, conveyanceLoss: 0.35 },
    boosts: { drinking_transit: 2.2, drinking_lifeline: 2.0, transitWards: ["W1", "W2", "W4"] },
    description: "Prioritizes pilgrim transit corridors, public standposts, and Godavari ghat replenishment.",
    descriptionMr: "भाविक वाहतूक कॉरिडॉर, सार्वजनिक पाणपोया व गोदावरी घाटावरील पाण्याच्या पातळीला प्राधान्य."
  }
};

export const MARATHI_VOICE_SAMPLES = [
  {
    id: "V1",
    label: "Sample 1: Tail-End Pomegranate Farmer (Ward 5)",
    labelMr: "नमुना १: टेल-एंड शेतकरी (गणेशनगर) - डाळिंब फळगळती",
    audioText: "नमस्कार साहेब, मी गणेशनगर मायनर ४ च्या टेल-एंडवरून सुरेश काळे बोलतोय. गेली ३८ दिवस पाण्याचा पत्ता नाही. डाळिंबाची फळे गळून पडत आहेत आणि झाडे सुकायला लागली आहेत. आमची पाणी पावती मंजूर आहे, कृपया तातडीने आवर्तन सोडा!",
    expectedEntities: { permitNo: "MAJI-2026-789", wardId: "W5", crop: "Pomegranate", criticality: 94, cusecs: 28 }
  },
  {
    id: "V2",
    label: "Sample 2: Hospital Superintendent (Emergency ESR Refill)",
    labelMr: "नमुना २: ग्रामीण रुग्णालय अधीक्षक - डायलिसिस वॉर्ड पाणी टंचाई",
    audioText: "मी कोपरगाव उपजिल्हा रुग्णालयातून बोलतोय. आमचा ईएसआर-२ मास्टर जलकुंभ १४ टक्क्यांवर आला आहे. उद्या सकाळपर्यंत पाणी मिळाले नाही तर डायलिसिस आणि शस्त्रक्रिया विभाग बंद पडतील. तातडीने व्हॉल्व्ह उघडा किंवा टँकर पाठवा.",
    expectedEntities: { permitNo: "HOSP-2026-004", wardId: "W7", crop: "Hospital Lifeline", criticality: 99, cusecs: 22 }
  },
  {
    id: "V3",
    label: "Sample 3: Head-Reach Sugarcane Farmer (Routine Turn)",
    labelMr: "नमुना ३: हेड-रीच शेतकरी (बाजारपेठ) - ऊस पिकासाठी मागणी",
    audioText: "साहेब, आम्ही सुभाष रोड वितरिका १ वरील बागायतदार आहोत. आमच्या ६५ हेक्टर उसासाठी पाणी सोडण्याची मागणी आहे. मागच्या वेळी १४ दिवसांपूर्वी पाणी घेतले होते, तरीही आमचा कोटा मंजूर करा.",
    expectedEntities: { permitNo: "MAJI-2026-612", wardId: "W2", crop: "Sugarcane", criticality: 52, cusecs: 45 }
  }
];

export const I18N = {
  en: {
    appTitle: "Kopargaon Shejpali Water Prioritization Digital Twin",
    appSubtitle: "Explainable, Fairness-Aware Canal Water Allocation Engine under Maharashtra Irrigation Act, 1976",
    kmcHeader: "Kopargaon Municipal Council & Godavari Canal Division • Scarce Water Decision OS",
    tabTwin: "Canal & Urban Digital Twin",
    tabTriage: "Shejpali Prioritization Engine",
    tabCascade: "Hydraulic Network & Canal Cascade",
    tabXAI: "Explainability & Counterfactuals",
    tabCitizen: "Farmer / Citizen Voice AI Portal",
    tabGovernance: "Cryptographic Audit & RTI Ledger",
    tabTimeTravel: "Historical Rotation Simulator",
    modeSelector: "Irrigation & Seasonal Policy",
    activeMode: "Active Policy",
    budgetAvailable: "Daily Canal Quota (Cusecs):",
    budgetUsed: "Allocated Cusecs:",
    crewsAvailable: "Canal Sluice Squads:",
    equipmentAvailable: "Mobile Lift & Tankers:",
    runTriageBtn: "Compute Shejpali Triage",
    simCascadeBtn: "Simulate Canal Sluice Breach",
    resetBtn: "Reset Simulation",
    dispatchBtn: "Authorize & Open Canal Gates (Batch 1)",
    overrideBtn: "Stage-Gate Officer Override",
    batch1Title: "Batch 1: Authorized for Immediate Canal Release",
    batch2Title: "Batch 2: Scheduled for Next 12h Sluice Shift",
    deferredTitle: "Deferred: Non-Critical / Rotational Quota Exceeded",
    whyThisFirst: "Why was this permit prioritized?",
    whyNotOthers: "Contrast with deferred permit requests",
    opportunityCost: "Agronomic & Hydraulic Trade-off Analysis",
    counterfactualTitle: "Counterfactual Permit Explorer",
    rotationalEquityScore: "Rotational Equity Index (Anti-Starvation Decay)",
    trustIndexTitle: "Farmer Trust & Transparency Index",
    tamperProofAudit: "Cryptographic SHA-256 Sanction Ledger (Maji Pauti)",
    voiceAssistantTitle: "Marathi Voice-to-Triage Permit Assistant",
    listening: "Listening in Marathi...",
    processVoiceBtn: "Simulate Farmer Voice Grievance",
    voiceTranscribed: "Transcribed Speech (मराठी)",
    extractedIntent: "AI Extracted Irrigation Intent",
    confidence: "Model Confidence"
  },
  mr: {
    appTitle: "कोपरगाव शेजपाळी जलवाटप डिजिटल ट्विन",
    appSubtitle: "महाराष्ट्र पाटबंधारे कायदा १९७६ अंतर्गत पारदर्शक, न्याय्य कालवा पाणी वाटप निर्णय प्रणाली",
    kmcHeader: "कोपरगाव नगरपरिषद व गोदावरी डावा कालवा विभाग • मर्यादित जलसंपत्ती नियोजन व्यवस्था",
    tabTwin: "कालवा व जल डिजिटल ट्विन (नकाशा)",
    tabTriage: "शेजपाळी प्राधान्यक्रम ट्रायज इंजिन",
    tabCascade: "जलवाहिन्या व वितरिका नेटवर्क (कॅस्केड)",
    tabXAI: "निर्णय स्पष्टीकरण व विश्लेषण (XAI)",
    tabCitizen: "शेतकरी/नागरी पोर्टल व मराठी व्हॉईस AI",
    tabGovernance: "अपरिवर्तनीय ऑडिट लेजर व माहिती अधिकार",
    tabTimeTravel: "ऐतिहासिक आवर्तन सिम्युलेटर",
    modeSelector: "हंगामी व आवर्तन धोरण मोड",
    activeMode: "सक्रिय धोरण",
    budgetAvailable: "दैनंदिन कालवा कोटा (क्युसेक्स):",
    budgetUsed: "वाटप केलेले क्युसेक्स:",
    crewsAvailable: "कालवा गेट व गस्त पथके:",
    equipmentAvailable: "लिफ्ट पंप व टँकर फ्लीट:",
    runTriageBtn: "शेजपाळी ट्रायज गणना करा",
    simCascadeBtn: "वितरिका गळती संकट सिम्युलेट करा",
    resetBtn: "पूर्ववत करा",
    dispatchBtn: "बॅच १ मंजूर करून कालवा गेट उघडा",
    overrideBtn: "अधिकारी स्तरावर निर्णय बदल (ओव्हरराईड)",
    batch1Title: "बॅच १: तात्काळ पाणी सोडण्यासाठी मंजूर (प्राधान्य)",
    batch2Title: "बॅच २: पुढील १२ तासांच्या शिफ्टमध्ये नियोजित",
    deferredTitle: "प्रलंबित: कमी निकड / कोटा मर्यादा ओलांडली",
    whyThisFirst: "या पाणी अर्जालाच पहिले प्राधान्य का?",
    whyNotOthers: "इतर प्रलंबित पाणी अर्जांशी तुलना",
    opportunityCost: "पीक व जलसंपत्ती संधी खर्च (Opportunity Cost)",
    counterfactualTitle: "पर्यायी परिस्थिती (Counterfactual) प्रयोगशाळा",
    rotationalEquityScore: "आवर्तन न्याय्य निर्देशांक (टेल-एंड उपेक्षा विरोधी गुण)",
    trustIndexTitle: "शेतकरी विश्वास व पारदर्शकता निर्देशांक",
    tamperProofAudit: "अपरिवर्तनीय क्रिप्टोग्राफिक SHA-256 पाणी पावती नोंदवही",
    voiceAssistantTitle: "मराठी व्हॉईस-टू-शेजपाळी AI सहाय्यक",
    listening: "मराठीत ऐकत आहे...",
    processVoiceBtn: "शेतकरी मराठी तक्रार सिम्युलेट करा",
    voiceTranscribed: "ध्वनीमुद्रित मजकूर (मराठी)",
    extractedIntent: "AI द्वारे ओळखलेला पाणी हक्क तपशील",
    confidence: "मॉडेल विश्वासार्हता"
  }
};
