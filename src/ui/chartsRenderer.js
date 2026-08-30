// Chart.js Visualizers for Shejpali XAI Contributions, Tail-End Equity Radar, and Canal Discharge Quota
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export class ChartsRenderer {
  constructor() {
    this.shapChartInstance = null;
    this.equityRadarInstance = null;
    this.budgetDonutInstance = null;
  }

  renderSHAPChart(canvasId, contributions, lang = "en") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.shapChartInstance) {
      this.shapChartInstance.destroy();
    }

    const labelsEn = {
      cropCriticality: "Crop Growth Stage & Wilting Stress",
      rotationalEquity: "Rotational Turn Dry Interval (Days)",
      tailEndVuln: "Tail-End Canal Reach Equity",
      sanctionCompliance: "Form 7 / Sanction Validity",
      conveyancePenalty: "Canal Discharge Quota Load"
    };

    const labelsMr = {
      cropCriticality: "पीक वाढीची संवेदनशील अवस्था व ताण",
      rotationalEquity: "मागील आवर्तनानंतरचे कोरडे दिवस (न्याय्य वाटप)",
      tailEndVuln: "टेल-एंड कालवा पोहोच दुर्बलता",
      sanctionCompliance: "नमुना ७ पाणी पावती पात्रता",
      conveyancePenalty: "क्युसेक्स कोटा वहन भार"
    };

    const keys = Object.keys(contributions);
    const labels = keys.map(k => lang === "mr" ? (labelsMr[k] || k) : (labelsEn[k] || k));
    const values = keys.map(k => Math.round((contributions[k]?.impact || 0) * 10) / 10);
    const colors = values.map(v => v >= 0 ? '#10b981' : '#ef4444');

    this.shapChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: lang === "mr" ? 'गुणांमधील योगदान (+/-)' : 'Factor Contribution (+/- pts)',
          data: values,
          backgroundColor: colors,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Impact: ${context.parsed.x > 0 ? '+' : ''}${context.parsed.x} points`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(0, 0, 0, 0.06)' },
            ticks: { color: '#64748b', font: { family: 'Outfit, Inter, sans-serif' } }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#0f172a', font: { size: 11, weight: '600', family: 'Outfit, Inter, sans-serif' } }
          }
        }
      }
    });
  }

  renderEquityRadar(canvasId, wardNeglectScores, wardTrustIndices, lang = "en") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.equityRadarInstance) {
      this.equityRadarInstance.destroy();
    }

    const wardLabels = ["W1: Bet (Tail)", "W2: Bazar (Head)", "W3: Samata", "W4: Shirdi Rd", "W5: Laxmi (Tail)", "W6: MIDC", "W7: Hospital"];
    const neglectData = ["W1", "W2", "W3", "W4", "W5", "W6", "W7"].map(id => wardNeglectScores[id] || 50);
    const trustData = ["W1", "W2", "W3", "W4", "W5", "W6", "W7"].map(id => wardTrustIndices[id] || 60);

    this.equityRadarInstance = new Chart(canvas, {
      type: 'radar',
      data: {
        labels: wardLabels,
        datasets: [
          {
            label: lang === "mr" ? 'आवर्तन कोरडे दिवस / उपेक्षा गुण' : 'Canal Starvation Index (0-100)',
            data: neglectData,
            borderColor: '#ec4899',
            backgroundColor: 'rgba(236, 72, 153, 0.25)',
            borderWidth: 2.5,
            pointBackgroundColor: '#ec4899',
            pointRadius: 4
          },
          {
            label: lang === "mr" ? 'शेतकरी विश्वास निर्देशांक' : 'Farmer Transparency & Trust Index',
            data: trustData,
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.2)',
            borderWidth: 2.5,
            pointBackgroundColor: '#0284c7',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { display: false, stepSize: 25 },
            grid: { color: 'rgba(0, 0, 0, 0.08)' },
            angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
            pointLabels: { color: '#334155', font: { size: 11, weight: '600', family: 'Outfit, Inter, sans-serif' } }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#334155', font: { size: 11, weight: '600', family: 'Outfit, Inter, sans-serif' }, boxWidth: 14 }
          }
        }
      }
    });
  }

  renderBudgetDonut(canvasId, utilization, lang = "en") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.budgetDonutInstance) {
      this.budgetDonutInstance.destroy();
    }

    const allocatedCusecs = utilization.cusecsAllocated || 66;
    const remainingCusecs = Math.max(0, (utilization.cusecsTotal || 140) - allocatedCusecs);

    this.budgetDonutInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: [
          lang === "mr" ? 'वाटप केलेले क्युसेक्स (Allocated)' : 'Allocated Discharge (66 Cfs)',
          lang === "mr" ? 'शिल्लक कालवा कोटा (Remaining)' : 'Available Headroom (74 Cfs)'
        ],
        datasets: [{
          data: [allocatedCusecs, remainingCusecs],
          backgroundColor: ['#0284c7', '#e2e8f0'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '74%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#475569', font: { size: 10.5, family: 'Outfit, Inter, sans-serif' }, boxWidth: 12 }
          },
          tooltip: {
            callbacks: {
              label: (c) => ` ${c.label}: ${c.parsed} Cusecs`
            }
          }
        }
      }
    });
  }
}
