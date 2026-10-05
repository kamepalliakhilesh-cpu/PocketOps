# ⚡ PocketOps — On-Device Resilient Operations & Hot-Standby Enclave

> **Competition:** iQOO Hackathon  
> **Track:** High-Performance Edge AI & Cross-Device Ecosystem Continuity (Wildcard / Open Innovation)  
> **Core Philosophy:** *"When one device fails, your work should never have to stop."*  
> **Status:** Interactive Functional Prototype & Full Hardware Architecture Specification  

---

## 🌟 Hackathon Stack Rule Compliance
* **🧠 Local / Open-Source SLM Core:** Powered by on-device Small Language Models (**Qwen 2.5-Coder 1.5B / Gemma 2B**) running with **0ms cloud latency** via NPU/WASM delegates for instant code syntax auditing, offline task breakdown, and deterministic validation.
* **📱 Phone in the Loop (vivo/iQOO Office Kit Bridge):** Active dual-device bridge—continuous bidirectional clipboard streaming, instant hot-standby heartbeat monitoring, camera OCR token verification, and 3-way visual Git diff patch re-sync.
* **🛡️ Zero-Cloud Security:** Local-first state replication protected by AES-256-GCM hardware keystore encryption.

---

## 💡 The Problem & The PocketOps Solution

| The Crisis Today | The PocketOps Way |
| :--- | :--- |
| **Sudden Laptop Crash / Battery Death:** In-flight terminal sessions, active code edits, and unsaved buffers are permanently lost. | **Hot-Standby Takeover (<500ms):** Phone immediately restores active file path, cursor line number, unsaved buffer, and last terminal command. |
| **Zero-Internet / Field Outages:** Cloud IDEs (Codespaces) completely freeze and sever connection. | **Autonomous Mobile Enclave:** Predictive offline file vault + in-app syntax highlighted code editor with zero cloud roundtrips. |
| **Reconnecting after Crisis:** Manual file overwriting often destroys changes made offline. | **Visual 3-Way Git Diff Inspector:** Side-by-side line additions/deletions review with 1-click patch merge back to the workstation. |

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│               ⚡ POCKETOPS CROSS-DEVICE CONTINUITY                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       [ PRIMARY WORKSTATION ]      │ [ iQOO SMARTPHONE ENCLAVE ]
       • Active Editor Buffer       │ • Hot-Standby Heartbeat Listener
       • Terminal PTY Session       │ • Predictive Offline Vault
       • Git Working Tree           │ • Local Qwen 2.5-Coder SLM
                                    │
                                    ▼
       ⚡ SUDDEN CRASH / HEARTBEAT DROP DETECTED (<300ms)
                                    │
                                    ▼
       📱 [ HOT-STANDBY SESSION TAKEOVER MODAL ]
          ├── Unsaved Code Buffer (Live Editable)
          ├── Terminal Command & Output Snapshot
          └── On-Device SLM Syntax & Safety Audit (0ms Cloud)
                                    │
                                    ▼ (Workstation Powers Back Up)
       🔗 [ VIVO/IQOO OFFICE KIT RE-SYNC BRIDGE ]
          └── Visual 3-Way Git Diff Review & Auto-Commit
```

---

## 🎯 4-Stage Judge Demonstration Flow

PocketOps features a built-in top-bar **1-Click 4-Stage Demo Controller** for a fail-proof 60-second walkthrough:

1. **Stage 1 (Office Kit P2P Mesh):** Demonstrates real-time P2P heartbeat telemetry, latency envelopes ($<4.2\text{ms}$), and bidirectional clipboard streaming.
2. **Stage 2 (Workstation Blackout):** 1-click power loss simulation triggers an immediate acoustic alert, device vibration, and the **Hot-Standby Takeover Modal**.
3. **Stage 3 (Local SLM & Vault Ops):** In-phone code buffer editing + local syntax validation powered by on-device **Qwen 2.5-Coder** in total Airplane Mode.
4. **Stage 4 (Office Kit 3-Way Diff):** Laptop reconnected $\rightarrow$ Visual Git diff inspector with additions/deletions and zero-conflict patch resolution.

---

## 🔬 Target Production Hardware Roadmap

* **P2P Transport:** Android `WifiAwareManager` (Wi-Fi Aware / Neighbor Awareness Networking) + BLE 5.4 PHY.
* **On-Device AI Delegate:** Qualcomm QNN / MediaPipe GenAI NPU delegates targeting iQOO Monster Mode performance profiles.
* **Security Model:** Android Keystore hardware-backed AES-256-GCM authenticated encryption.

---

## 🚀 Getting Started Locally

```bash
# Clone repository
git clone https://github.com/kamepalliakhilesh-cpu/PocketOps.git
cd PocketOps/pocketops

# Install dependencies
npm install

# Start Vite development server
npm run dev

# Run typecheck and production build
npm run typecheck
npm run build
```

---

## 🛠️ Technology Stack
* **UI & State Machine:** React 19, TypeScript, Vite, Custom Cyber-Dark CSS Tokens
* **Local SLM:** Qwen 2.5-Coder 1.5B / Gemma 2B Deterministic Edge Pipeline
* **Tactile & Sound:** Web Audio API Synthetic Acoustic Pulses + Hardware Vibration API
* **Icons & Assets:** Lucide React
