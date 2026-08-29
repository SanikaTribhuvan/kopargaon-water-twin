// Kopargaon Hydraulic & Shejpali Canal Cascading Dependency Graph
// Models physical interdependencies across Godavari Left Bank Canal, Sluice Gates, ESRs, and Farm Chaks

export const INFRASTRUCTURE_GRAPH = {
  nodes: [
    { id: "GLBC_HEAD", label: "Godavari Left Main Canal Headworks (KM 12)", labelMr: "गोदावरी डावा मुख्य कालवा हेडवर्क्स (कि.मी. १२)", type: "canal", ward: "W2", status: "HEALTHY", riskScore: 20, lat: 19.8980, lng: 74.4790 },
    { id: "DIST_D2", label: "Distributary D-2 Aqueduct & Sluice Gate", labelMr: "वितरिका डी-२ अ‍ॅक्वाडक्ट व कालवा गेट", type: "canal_gate", ward: "W3", status: "HEALTHY", riskScore: 35, lat: 19.8895, lng: 74.4930 },
    { id: "DIST_D4", label: "Distributary D-4 Tail Sluice Head", labelMr: "वितरिका डी-४ टेल-एंड गेट", type: "canal_gate", ward: "W5", status: "HEALTHY", riskScore: 45, lat: 19.8825, lng: 74.4720 },
    { id: "ESR_2", label: "ESR-2 Master Municipal Reservoir (1.2 ML)", labelMr: "ईएसआर-२ मुख्य नागरी जलकुंभ (१.२ एमएल)", type: "water_potable", ward: "W7", status: "HEALTHY", riskScore: 15, lat: 19.8730, lng: 74.4920 },
    { id: "HOSP_LINE", label: "Sub-District Hospital Dialysis Line HD-01", labelMr: "उपजिल्हा रुग्णालय डायलिसिस थेट जलवाहिनी", type: "health_lifeline", ward: "W7", status: "HEALTHY", riskScore: 18, lat: 19.8715, lng: 74.4910 },
    { id: "TAIL_CHAK_4B", label: "Minor 4B Tail Orchards (42 Ha Pomegranate)", labelMr: "मायनर ४बी टेल-एंड डाळिंब बागायत पट्टा", type: "agriculture_tail", ward: "W5", status: "HEALTHY", riskScore: 50, lat: 19.8810, lng: 74.4690 },
    { id: "SLUM_STANDPOSTS", label: "Ganeshnagar Slum Standpost Sump SP-01/08", labelMr: "गणेशनगर झोपडपट्टी नळ योजना संप", type: "slum_potable", ward: "W5", status: "HEALTHY", riskScore: 42, lat: 19.8840, lng: 74.4760 },
    { id: "TANKER_DEPOT", label: "KMC Emergency Water Tanker Staging Depot", labelMr: "आपत्कालीन टँकर आगार", type: "logistics", ward: "W4", status: "HEALTHY", riskScore: 12, lat: 19.8790, lng: 74.5010 }
  ],
  edges: [
    { from: "GLBC_HEAD", to: "DIST_D2", mechanism: "Main canal discharge fluctuation directly affecting primary distributary head pressure", probability: 0.85, timeDelayHours: 2.0 },
    { from: "DIST_D2", to: "DIST_D4", mechanism: "Upstream canal siphon siltation causing 42% conveyance loss starving downstream tail reach", probability: 0.92, timeDelayHours: 3.5 },
    { from: "DIST_D4", to: "TAIL_CHAK_4B", mechanism: "Sluice gate failure or upstream diversion completely drying out Chak 4B orchards", probability: 0.96, timeDelayHours: 1.5 },
    { from: "DIST_D2", to: "ESR_2", mechanism: "Canal intake breach forcing emergency shutdown of raw water intake feeding master ESR", probability: 0.72, timeDelayHours: 4.0 },
    { from: "ESR_2", to: "HOSP_LINE", mechanism: "Reservoir level drop below 15% immediately starving dialysis and surgical units", probability: 0.95, timeDelayHours: 1.0 },
    { from: "DIST_D4", to: "SLUM_STANDPOSTS", mechanism: "Canal minor dry-out causing low ground pressure & contamination in slum standposts", probability: 0.80, timeDelayHours: 2.5 },
    { from: "ESR_2", to: "TANKER_DEPOT", mechanism: "Pipeline outage triggering immediate surge in emergency municipal tanker rationing", probability: 0.88, timeDelayHours: 1.0 }
  ]
};

export class CascadeEngine {
  constructor() {
    this.graph = JSON.parse(JSON.stringify(INFRASTRUCTURE_GRAPH));
    this.activeCascade = false;
    this.cascadeHistory = [];
  }

  reset() {
    this.graph = JSON.parse(JSON.stringify(INFRASTRUCTURE_GRAPH));
    this.activeCascade = false;
    this.cascadeHistory = [];
  }

  /**
   * Triggers a hydraulic failure at root node and propagates water stress along directed edges
   */
  triggerFailure(rootNodeId = "DIST_D2") {
    this.reset();
    this.activeCascade = true;

    const root = this.graph.nodes.find(n => n.id === rootNodeId);
    if (!root) return null;

    root.status = "CRITICAL_FAILED";
    root.riskScore = 98;

    const propagationSteps = [];
    propagationSteps.push({
      step: 1,
      source: root.id,
      target: root.id,
      name: root.label,
      nameMr: root.labelMr,
      impact: "Canal aqueduct breach & silt choke triggered",
      impactMr: "कालवा अ‍ॅक्वाडक्ट गळती व गाळ साचल्याने पाणीप्रवाह खंडित",
      risk: 98,
      severity: "CRITICAL"
    });

    // BFS / Propagation along edges
    const queue = [{ id: rootNodeId, accumulatedRisk: 0.98, depth: 1 }];
    const visited = new Set([rootNodeId]);

    while (queue.length > 0) {
      const current = queue.shift();
      const outgoingEdges = this.graph.edges.filter(e => e.from === current.id);

      for (const edge of outgoingEdges) {
        const targetNode = this.graph.nodes.find(n => n.id === edge.to);
        if (!targetNode) continue;

        const propagatedRisk = current.accumulatedRisk * edge.probability;
        const newRiskScore = Math.min(99, Math.round(propagatedRisk * 100));

        if (!visited.has(edge.to) || newRiskScore > targetNode.riskScore) {
          visited.add(edge.to);
          targetNode.riskScore = newRiskScore;
          targetNode.status = newRiskScore > 75 ? "CRITICAL_FAILED" : (newRiskScore > 45 ? "WARNING_RISK" : "MONITORED");

          propagationSteps.push({
            step: current.depth + 1,
            source: current.id,
            target: edge.to,
            name: targetNode.label,
            nameMr: targetNode.labelMr,
            mechanism: edge.mechanism,
            delay: edge.timeDelayHours,
            risk: newRiskScore,
            severity: newRiskScore > 75 ? "CRITICAL" : "ELEVATED"
          });

          if (current.depth < 3) {
            queue.push({ id: edge.to, accumulatedRisk: propagatedRisk, depth: current.depth + 1 });
          }
        }
      }
    }

    this.cascadeHistory = propagationSteps;

    // Generate Preemptive / Anticipated Grievances based on cascade
    const preemptiveTasks = this.generatePreemptiveTasks(propagationSteps);

    return {
      rootNode: root,
      steps: propagationSteps,
      preemptiveTasks,
      networkResilienceScore: this.calculateResilienceScore()
    };
  }

  generatePreemptiveTasks(steps) {
    const tasks = [];
    const criticalTargets = steps.filter(s => s.severity === "CRITICAL" && s.target !== s.source);

    criticalTargets.forEach((step, idx) => {
      tasks.push({
        id: `ANTICIPATED-${100 + idx}`,
        isPreemptive: true,
        title: `[Anticipated Hydraulic Cascade] Immediate Siphon Bypass on ${step.name}`,
        titleMr: `[संभाव्य जलसंकट] ${step.nameMr} वर तात्काळ आपत्कालीन बायपास`,
        category: step.target.includes("HOSP") ? "drinking_lifeline" : (step.target.includes("TAIL") ? "agriculture" : "canal_breach"),
        wardId: this.graph.nodes.find(n => n.id === step.target)?.ward || "W5",
        severity: Math.round(step.risk * 0.9),
        affectedPopulation: 3500,
        estimatedCost: 18000,
        estimatedCrewHours: 3.0,
        requiredCrewType: "C1",
        requiredEquipment: ["SJ-01"],
        cascadeRiskScore: step.risk,
        durationHours: 0.5,
        source: "Canal Digital Twin Hydraulic Predictor",
        status: "PREEMPTIVE_QUEUED"
      });
    });

    return tasks;
  }

  calculateResilienceScore() {
    const totalNodes = this.graph.nodes.length;
    const avgRisk = this.graph.nodes.reduce((acc, n) => acc + n.riskScore, 0) / totalNodes;
    return Math.max(10, Math.round(100 - avgRisk));
  }
}
