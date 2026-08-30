<div align="center">

# 💧 KopargaonTwin

### Shejpali Water Prioritization Digital Twin

**From canal to crop, every drop accounted for.**

[![Live Demo](https://img.shields.io/badge/demo-live-7ED957)](https://kopargaon-water-twin.netlify.app/)
[![Deployed on Netlify](https://img.shields.io/badge/deployed-Netlify-00C7B7)](https://kopargaon-water-twin.netlify.app/)
![React](https://img.shields.io/badge/React-19-61DAFB)
![License](https://img.shields.io/badge/license-MIT-blue)
![Hackathon](https://img.shields.io/badge/Smart%20Kopargaon%20Hackathon-2026-F5B814)

[**→ Open the live twin**](https://kopargaon-water-twin.netlify.app/)

</div>

---

<!-- Drop a screenshot or screen recording of the hero section here before submitting -->

## What this is

Kopargaon's Godavari Left Bank Canal serves five wards on one genuinely scarce resource: 140 cusecs a day. Right now, who gets water and when is decided informally, and the gap between the formal Shejpali permit process and what actually happens at the sluice gate is exactly where trust breaks down, a problem the Kopargaon mayor described from the stage himself.

KopargaonTwin is a decision engine, not a complaint log. Every live water request is ranked against every other request on defined, defensible criteria, crop wilting criticality, days since last turn, tail-end vulnerability, and every ranking ships with a plain-language reason a farmer, an officer, or an RTI applicant can actually check. Once a ruling is made, it's sealed into a SHA-256 hash chain, so it can't be quietly reordered after the fact.

## Six modules, one pipeline

| Module | What it does |
|---|---|
| ⚡ **Prioritization Engine** | Ranks competing permits under Maharashtra Irrigation Act, 1976 constraints, MCDM allocation against the daily cusec ceiling |
| 🌊 **Hydraulic Cascade** | Live canal network simulation, models breach propagation from a distributary sluice down to tail-end dry-out |
| 🧠 **Explainability & XAI** | SHAP-style factor attribution and head-to-head contrastive reasoning behind every ruling |
| 🎙️ **Voice Portal** | Farmers report water stress by speaking Marathi, parsed into structured ward, crop, and urgency data |
| 🔒 **Audit Ledger** | Append-only cryptographic chain (Maji Pauti), every ruling tamper-evident from the moment it's made |
| ⏪ **Historical Simulator** | Replays past droughts under different policy weights to test outcomes retroactively |

## Built for the live challenges too

Two curveball problem statements dropped mid-hackathon. Both are answered inside the same system, not bolted on as a separate demo:

- **Zero-Loss Corruption Recovery** — simulates the primary data store wiping mid-operation and demonstrates self-healing recovery with zero permit loss
- **SatyaSetu Truth Engine** — verifies circulating WhatsApp rumors against official telemetry, and defends the triage queue against coordinated fake-complaint floods

## Under the hood

- React + Vite
- Leaflet / CARTO for the live canal GIS
- Web Crypto API (SHA-256) for the audit ledger, no external blockchain dependency
- Client-side state, deployed on Netlify

## Run it locally
