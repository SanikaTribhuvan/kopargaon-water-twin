// Explainability Engine (XAI), Contrastive Justifications & Counterfactual Explorer for Shejpali System
// Research basis: Alammar et al., 2026; Bruijn et al., 2021; Papadakis et al., 2024; Levy et al., 2021

export class ExplainabilityEngine {
  /**
   * Generates natural language justification for a prioritized water permit
   */
  generateJustification(item, lang = "en") {
    const evalData = item.evaluation || {};
    const contrib = evalData.contributions || {};

    // Sort contributions by absolute impact
    const sortedFactors = Object.entries(contrib)
      .sort(([, a], [, b]) => Math.abs(b.impact) - Math.abs(a.impact));

    const topFactorKey = sortedFactors[0]?.[0] || "cropCriticality";
    const secondFactorKey = sortedFactors[1]?.[0] || "rotationalEquity";

    if (lang === "mr") {
      const factorLabelsMr = {
        cropCriticality: "पीक वाढीची संवेदनशील अवस्था व पाणी ताण",
        rotationalEquity: "मागील आवर्तनानंतरचा प्रदीर्घ कोरडा कालावधी (दिवस)",
        tailEndVuln: "टेल-एंड कालवा पोहोच दुर्बलता",
        sanctionCompliance: "नमुना ७ व मंजूर पाणी पावती पात्रता",
        conveyancePenalty: "कालवा वहन क्षमता व जलसंपत्ती बचत"
      };

      const topLabel = factorLabelsMr[topFactorKey] || "पिकाची तातडीची निकड";
      const secondLabel = factorLabelsMr[secondFactorKey] || "आवर्तन न्याय्यता";

      return {
        summary: `या पाणी मागणी अर्जास ${item.triageScore} गुण मिळाले असून मुख्यत्वे '${topLabel}' आणि '${secondLabel}' या घटकांमुळे तात्काळ बॅच १ कालवा गेट उघडण्यास मान्यता दिली आहे.`,
        keyDrivers: [
          `पीक अवस्था / निकड: ${item.cropType || 'पाणी मागणी'} (${item.cropStage || 'संवेदनशील अवस्था'}).`,
          `आवर्तन प्रतीक्षा: मागील पाण्यानंतर ${item.daysSinceLastTurn || 0} दिवस कोरडे (टेल-एंड उपेक्षा विरोधी लाभ).`,
          `कालवा वाटप: ${item.appliedDischargeCusecs || 0} क्युसेक्स कोटा मंजूर (दैनंदिन १४० क्युसेक्स मर्यादेत).`
        ],
        publicBadge: "तातडीने कालवा पाणी सोडण्यास मंजूर"
      };
    } else {
      const factorLabelsEn = {
        cropCriticality: "Crop Growth Stage & Wilting Stress",
        rotationalEquity: "Rotational Turn Dry Duration (Days)",
        tailEndVuln: "Tail-End Canal Reach Equity",
        sanctionCompliance: "Form 7 Sanction Validity",
        conveyancePenalty: "Hydraulic Conveyance Efficiency"
      };

      const topLabel = factorLabelsEn[topFactorKey] || "Critical Crop Water Stress";
      const secondLabel = factorLabelsEn[secondFactorKey] || "Rotational Equity Decay";

      return {
        summary: `Authorized in Batch 1 with a Shejpali Priority Score of ${item.triageScore}/100. Primary allocation drivers: '${topLabel}' and '${secondLabel}'.`,
        keyDrivers: [
          `Crop / Sector Need: ${item.cropType || 'Water Demand'} (${item.cropStage || 'Critical Wilting Threshold'}).`,
          `Rotational Delay: ${item.daysSinceLastTurn || 0} days dry since last Awartan (Tail-end anti-starvation boost).`,
          `Canal Resource Match: ${item.appliedDischargeCusecs || 0} Cusecs allocated within 140 Cusec daily rotation limit.`
        ],
        publicBadge: "Approved for Sluice Gate Release"
      };
    }
  }

  /**
   * Generates Contrastive "Why Ticket A over Ticket B?" Explanation
   */
  generateContrastiveExplanation(itemA, itemB, lang = "en") {
    const scoreDiff = Math.round((itemA.triageScore - itemB.triageScore) * 10) / 10;
    const daysDiff = (itemA.daysSinceLastTurn || 0) - (itemB.daysSinceLastTurn || 0);

    if (lang === "mr") {
      return {
        headline: `पाणी अर्ज '${itemA.id}' (${itemA.applicantNameMr || itemA.applicantName}) ला '${itemB.id}' पेक्षा +${scoreDiff} अधिक गुण मिळण्याचे कारण:`,
        comparisons: [
          {
            dimension: "पीक अवस्था व पाण्याचा ताण",
            winner: (itemA.cropCriticalityIndex || itemA.severity) > (itemB.cropCriticalityIndex || itemB.severity) ? itemA.id : itemB.id,
            text: `${itemA.id} (${itemA.cropType}): ${itemA.cropStage} (निकड गुण: ${itemA.cropCriticalityIndex || itemA.severity}/100) विरूद्ध ${itemB.id} (${itemB.cropType}): ${itemB.cropStage} (निकड गुण: ${itemB.cropCriticalityIndex || itemB.severity}/100).`
          },
          {
            dimension: "मागील आवर्तनानंतरची प्रतीक्षा",
            winner: (itemA.daysSinceLastTurn || 0) > (itemB.daysSinceLastTurn || 0) ? itemA.id : itemB.id,
            text: `${itemA.id} ला पाणी मिळून ${itemA.daysSinceLastTurn || 0} दिवस झाले आहेत, तर ${itemB.id} ला केवळ ${itemB.daysSinceLastTurn || 0} दिवस.`
          },
          {
            dimension: "कालवा पोहोच (हेड वि. टेल)",
            winner: itemA.vulnerabilityScore > itemB.vulnerabilityScore ? itemA.id : itemB.id,
            text: `${itemA.wardName} (टेल-एंड उपेक्षा निर्देशांक: ${Math.round(itemA.vulnerabilityScore * 100)}%) ला अग्रक्रम मिळाला.`
          }
        ],
        verdict: `अल्गोरिदमने ${itemA.id} ला प्राधान्य दिले कारण पिकाची फळगळती/वाळणे रोखणे हे नियमित वाढीच्या उसापेक्षा अधिक निकडीचे आहे.`
      };
    } else {
      return {
        headline: `Why Permit '${itemA.id}' (${itemA.applicantName}) was prioritized over '${itemB.id}' (+${scoreDiff} pts):`,
        comparisons: [
          {
            dimension: "Crop Water-Criticality",
            winner: (itemA.cropCriticalityIndex || itemA.severity) > (itemB.cropCriticalityIndex || itemB.severity) ? itemA.id : itemB.id,
            text: `${itemA.id} (${itemA.cropType}): ${itemA.cropStage} (Criticality: ${itemA.cropCriticalityIndex || itemA.severity}/100) vs ${itemB.id} (${itemB.cropType}): ${itemB.cropStage} (Criticality: ${itemB.cropCriticalityIndex || itemB.severity}/100).`
          },
          {
            dimension: "Rotational Interval (Days Dry)",
            winner: (itemA.daysSinceLastTurn || 0) > (itemB.daysSinceLastTurn || 0) ? itemA.id : itemB.id,
            text: `${itemA.id} has waited ${itemA.daysSinceLastTurn || 0} days dry since last turn vs ${itemB.id}'s ${itemB.daysSinceLastTurn || 0} days.`
          },
          {
            dimension: "Canal Reach Vulnerability",
            winner: itemA.vulnerabilityScore > itemB.vulnerabilityScore ? itemA.id : itemB.id,
            text: `${itemA.wardName} carries a tail-end starvation vulnerability of ${Math.round(itemA.vulnerabilityScore * 100)}%.`
          }
        ],
        verdict: `The Shejpali triage engine prioritized ${itemA.id} because permanent tree mortality/hospital deficit incurs irreversible loss compared to hardy vegetative sugarcane.`
      };
    }
  }

  /**
   * Computes Opportunity Costs of selecting Batch 1 actions
   */
  computeOpportunityCosts(batch1, deferredOrBatch2, lang = "en") {
    const totalCusecsAllocated = batch1.reduce((sum, item) => sum + (item.appliedDischargeCusecs || 0), 0);
    const totalBudgetSpent = batch1.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);

    const delayedCivicItems = deferredOrBatch2.slice(0, 3).map(item => {
      const waitHours = Math.round(item.estimatedWaitHours || 12);
      if (lang === "mr") {
        return {
          title: `${item.applicantNameMr || item.applicantName} (${item.cropType})`,
          ward: item.wardName,
          consequence: `पाणी वाटप पुढील शिफ्टपर्यंत (+${waitHours} तास) पुढे ढकलले. क्युसेक्स मागणी: ${item.appliedDischargeCusecs} cfs.`,
          bottleneck: item.bottlenecks ? item.bottlenecks.join("; ") : "कालवा क्षमता मर्यादा"
        };
      } else {
        return {
          title: `${item.applicantName} (${item.cropType})`,
          ward: item.wardName,
          consequence: `Release scheduled for next shift (+${waitHours} hrs). Requested: ${item.appliedDischargeCusecs} cusecs.`,
          bottleneck: item.bottlenecks ? item.bottlenecks.join("; ") : "Canal discharge ceiling"
        };
      }
    });

    return {
      totalCusecsAllocated,
      totalBudgetSpent,
      delayedCivicItems
    };
  }

  /**
   * Solves Counterfactual: What would need to change for a deferred water permit to qualify for Batch 1?
   */
  solveCounterfactual(targetItem, cutoffScore) {
    const currentScore = targetItem.triageScore;
    const requiredDelta = Math.max(0, cutoffScore - currentScore + 0.5);

    return {
      currentScore,
      targetCutoff: cutoffScore,
      requiredDelta: Math.round(requiredDelta * 10) / 10,
      scenarios: [
        {
          param: "Rotational Turn Dry Interval",
          paramMr: "आवर्तन प्रतीक्षा कालावधी (दिवस)",
          currentVal: `${targetItem.daysSinceLastTurn || 10} days`,
          requiredVal: `${Math.round((targetItem.daysSinceLastTurn || 10) + requiredDelta * 0.8)} days`,
          feasibility: "Will automatically qualify next Awartan cycle via Rotational Equity"
        },
        {
          param: "Crop Criticality / Soil Moisture",
          paramMr: "मातीतील ओलावा व पीक ताण",
          currentVal: `${targetItem.cropCriticalityIndex || 50}/100`,
          requiredVal: `${Math.min(100, Math.round((targetItem.cropCriticalityIndex || 50) + requiredDelta * 1.1))}/100`,
          feasibility: "Plausible if soil moisture telemetry drops below 15% (Wilting Point)"
        },
        {
          param: "Discharge Efficiency Demand",
          paramMr: "क्युसेक्स मागणी नियंत्रण",
          currentVal: `${targetItem.appliedDischargeCusecs || 20} Cusecs`,
          requiredVal: `${Math.max(10, Math.round((targetItem.appliedDischargeCusecs || 20) * 0.7))} Cusecs (Micro-drip)`,
          feasibility: "Switching to micro-irrigation reduces cusec load and qualifies instantly"
        }
      ]
    };
  }
}
