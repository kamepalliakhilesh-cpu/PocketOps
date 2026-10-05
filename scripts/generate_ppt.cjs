const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

async function createDeck() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  const BG_COLOR = '0B0E17';
  const CARD_BG = '141826';
  const ACCENT_ORANGE = 'FF5500';
  const ACCENT_CYAN = '00E5FF';
  const ACCENT_PURPLE = 'A855F7';
  const ACCENT_GREEN = '10B981';
  const TEXT_WHITE = 'FFFFFF';
  const TEXT_MUTED = '94A3B8';

  const screenshotsDir = path.resolve(__dirname, '../screenshots');

  // Helper for slide base styling
  function addBaseSlide(title, subtitle, category = 'iQOO HACKATHON · DEVELOPER TOOLS') {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };

    // Top Header Badge
    slide.addText(category, {
      x: 0.8, y: 0.4, w: 8.0, h: 0.3,
      fontSize: 10, bold: true, color: ACCENT_ORANGE, fontFace: 'Arial',
      letterSpacing: 1.5,
    });

    // Title
    slide.addText(title, {
      x: 0.8, y: 0.65, w: 11.5, h: 0.6,
      fontSize: 22, bold: true, color: TEXT_WHITE, fontFace: 'Arial',
    });

    if (subtitle) {
      slide.addText(subtitle, {
        x: 0.8, y: 1.25, w: 11.5, h: 0.35,
        fontSize: 12, color: TEXT_MUTED, fontFace: 'Arial',
      });
    }

    // Footer
    slide.addText('⚡ PocketOps — "When one device fails, your work should never have to stop."', {
      x: 0.8, y: 7.0, w: 10.0, h: 0.3,
      fontSize: 9, color: '475569', fontFace: 'Arial',
    });

    return slide;
  }

  // -------------------------------------------------------------
  // SLIDE 1: TITLE
  // -------------------------------------------------------------
  const s1 = pptx.addSlide();
  s1.background = { color: BG_COLOR };

  s1.addText('iQOO HACKATHON 2026 · DEVELOPER TOOLS & OPEN INNOVATION', {
    x: 1.0, y: 1.5, w: 11.0, h: 0.4,
    fontSize: 12, bold: true, color: ACCENT_ORANGE, fontFace: 'Arial', letterSpacing: 2,
  });

  s1.addText('⚡ PocketOps', {
    x: 1.0, y: 2.0, w: 11.0, h: 1.1,
    fontSize: 48, bold: true, color: TEXT_WHITE, fontFace: 'Arial',
  });

  s1.addText('On-Device Resilient Operations & Hot-Standby Enclave', {
    x: 1.0, y: 3.1, w: 11.0, h: 0.6,
    fontSize: 20, bold: true, color: ACCENT_CYAN, fontFace: 'Arial',
  });

  s1.addText('"When one device fails, your work should never have to stop."', {
    x: 1.0, y: 3.8, w: 11.0, h: 0.5,
    fontSize: 14, italic: true, color: TEXT_MUTED, fontFace: 'Arial',
  });

  // Feature pills on title slide
  const pills = [
    { text: '🧠 Local Open-Source SLM Core (Qwen 2.5-Coder / Gemma 2B)', color: ACCENT_PURPLE },
    { text: '🔗 vivo/iQOO Office Kit Bridge (Wi-Fi Aware & BLE 5.4)', color: ACCENT_CYAN },
    { text: '⚡ Hot-Standby Blackout Takeover (<300ms)', color: ACCENT_ORANGE },
    { text: '🔄 Visual 3-Way Git Diff Re-Sync', color: ACCENT_GREEN },
  ];

  pills.forEach((p, idx) => {
    s1.addShape(pptx.ShapeType.roundRect, {
      x: 1.0 + (idx % 2) * 5.6,
      y: 4.6 + Math.floor(idx / 2) * 0.9,
      w: 5.3, h: 0.7,
      rectRadius: 0.1,
      fill: { color: CARD_BG },
      line: { color: '2A314A', width: 1 },
    });
    s1.addText(p.text, {
      x: 1.15 + (idx % 2) * 5.6,
      y: 4.6 + Math.floor(idx / 2) * 0.9,
      w: 5.0, h: 0.7,
      fontSize: 11, bold: true, color: p.color, fontFace: 'Arial',
    });
  });

  // -------------------------------------------------------------
  // SLIDE 2: THE PROBLEM
  // -------------------------------------------------------------
  const s2 = addBaseSlide(
    'The Critical Dilemma: Sudden Hardware Failures & Lost Context',
    'Why existing cloud IDEs and ecosystem continuity solutions fail developers during sudden disruptions.'
  );

  const problems = [
    {
      title: '🚨 Sudden Laptop Crash / Battery Death',
      desc: 'When a workstation powers off unexpectedly during code deployments, active editor buffers and in-flight terminal commands are permanently lost.',
      tag: 'CONTEXT WIPEOUT',
      tagColor: 'EF4444',
    },
    {
      title: '☁️ Cloud IDEs Require 100% Internet',
      desc: 'Cloud environments (Codespaces) immediately sever and freeze without active Wi-Fi, leaving field engineers and travelers stranded with zero access.',
      tag: 'ZERO RESILIENCE',
      tagColor: 'F59E0B',
    },
    {
      title: '🔀 Painful Reconnection & File Conflicts',
      desc: 'Rewriting work from memory after reboot causes duplicate code, messy file overwrites, and painful Git branch conflicts.',
      tag: 'MERGE CONFLICTS',
      tagColor: '8B5CF6',
    },
  ];

  problems.forEach((p, i) => {
    const x = 0.8 + i * 3.9;
    s2.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.9, w: 3.7, h: 4.6,
      rectRadius: 0.15,
      fill: { color: CARD_BG },
      line: { color: '22283A', width: 1 },
    });

    s2.addText(p.tag, {
      x: x + 0.3, y: 2.2, w: 3.1, h: 0.3,
      fontSize: 9, bold: true, color: p.tagColor, fontFace: 'Arial', letterSpacing: 1,
    });

    s2.addText(p.title, {
      x: x + 0.3, y: 2.6, w: 3.1, h: 0.7,
      fontSize: 14, bold: true, color: TEXT_WHITE, fontFace: 'Arial',
    });

    s2.addText(p.desc, {
      x: x + 0.3, y: 3.4, w: 3.1, h: 2.8,
      fontSize: 11, color: TEXT_MUTED, fontFace: 'Arial', lineSpacing: 18,
    });
  });

  // -------------------------------------------------------------
  // SLIDE 3: STACK RULE COMPLIANCE (LOCAL SLM + OFFICE KIT)
  // -------------------------------------------------------------
  const s3 = addBaseSlide(
    'Official Hackathon Stack Rule Compliance',
    'Open-Source SLM at the core with active smartphone loop via vivo/iQOO Office Kit Bridge.'
  );

  // Box 1: Local Open-Source SLM
  s3.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.8, w: 5.7, h: 4.8,
    rectRadius: 0.15,
    fill: { color: CARD_BG },
    line: { color: ACCENT_PURPLE, width: 1.5 },
  });
  s3.addText('🧠 LOCAL OPEN-SOURCE SLM CORE', {
    x: 1.1, y: 2.1, w: 5.1, h: 0.4,
    fontSize: 13, bold: true, color: ACCENT_PURPLE, fontFace: 'Arial',
  });
  s3.addText('• Model: Qwen 2.5-Coder (1.5B) & Gemma 2B Local SLM\n• Quantization: 4-bit INT4 for on-device mobile NPU execution\n• 0ms Cloud Latency: 100% Airplane Mode offline operation\n• Local Syntax Auditing: Instant safety evaluation of emergency hotpatches before committing\n• Zero IP Leakage: Proprietary enterprise code never leaves device flash', {
    x: 1.1, y: 2.6, w: 5.1, h: 3.7,
    fontSize: 11, color: TEXT_WHITE, fontFace: 'Arial', lineSpacing: 22,
  });

  // Box 2: Office Kit Bridge
  s3.addShape(pptx.ShapeType.roundRect, {
    x: 6.8, y: 1.8, w: 5.7, h: 4.8,
    rectRadius: 0.15,
    fill: { color: CARD_BG },
    line: { color: ACCENT_ORANGE, width: 1.5 },
  });
  s3.addText('📱 PHONE IN THE LOOP (OFFICE KIT BRIDGE)', {
    x: 7.1, y: 2.1, w: 5.1, h: 0.4,
    fontSize: 13, bold: true, color: ACCENT_ORANGE, fontFace: 'Arial',
  });
  s3.addText('• Continuous Heartbeat: Wi-Fi Aware & BLE 5.4 state replication\n• Bidirectional Clipboard: Live real-time stream between laptop & phone\n• Hot-Standby Session Handover: Recovers exact cursor line & terminal state within 300ms\n• Visual 3-Way Git Diff: One-click assisted patch merge to laptop repo\n• Enclave Security: Hardware-backed Android Keystore AES-256-GCM', {
    x: 7.1, y: 2.6, w: 5.1, h: 3.7,
    fontSize: 11, color: TEXT_WHITE, fontFace: 'Arial', lineSpacing: 22,
  });

  // -------------------------------------------------------------
  // SLIDE 4: SYSTEM ARCHITECTURE & 4 CORE PILLARS
  // -------------------------------------------------------------
  const s4 = addBaseSlide(
    'PocketOps 4 Core Architectural Pillars',
    'Engineered for maximum resilience, tactile feedback, and enterprise security.'
  );

  const pillars = [
    { title: '1. Blackout Engine', sub: '<300ms Handover', desc: 'Monitors workstation heartbeats; instantly captures active file path, cursor line, unsaved buffer, and terminal PTY history upon power cut.', col: ACCENT_ORANGE },
    { title: '2. Offline File Vault', sub: 'In-App Mobile Editor', desc: 'Predictively caches project files and dependencies locally. Allows full syntax-highlighted code edits in total flight mode.', col: ACCENT_CYAN },
    { title: '3. On-Device SLM', sub: 'Qwen 2.5-Coder 1.5B', desc: 'Offline code intelligence for hotpatch analysis, syntax validation, and multimodal camera token verification without cloud.', col: ACCENT_PURPLE },
    { title: '4. Visual Git Diff', sub: '3-Way Merge Inspector', desc: 'Computes SHA-256 patch checksums and presents visual line-by-line additions/deletions before merging back to the workstation.', col: ACCENT_GREEN },
  ];

  pillars.forEach((p, idx) => {
    const x = 0.8 + (idx % 2) * 5.9;
    const y = 1.9 + Math.floor(idx / 2) * 2.4;

    s4.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 5.6, h: 2.1,
      rectRadius: 0.12,
      fill: { color: CARD_BG },
      line: { color: '242B3E', width: 1 },
    });

    s4.addText(p.title, {
      x: x + 0.3, y: y + 0.25, w: 3.2, h: 0.35,
      fontSize: 13, bold: true, color: p.col, fontFace: 'Arial',
    });
    s4.addText(p.sub, {
      x: x + 3.6, y: y + 0.25, w: 1.7, h: 0.35,
      fontSize: 9, bold: true, color: TEXT_MUTED, fontFace: 'Arial', align: 'right',
    });
    s4.addText(p.desc, {
      x: x + 0.3, y: y + 0.7, w: 5.0, h: 1.2,
      fontSize: 10.5, color: TEXT_WHITE, fontFace: 'Arial', lineSpacing: 16,
    });
  });

  // -------------------------------------------------------------
  // SLIDE 5: 60-SECOND JUDGE DEMO FLOW
  // -------------------------------------------------------------
  const s5 = addBaseSlide(
    'The 60-Second Fail-Proof Judge Demonstration Flow',
    'Demonstrated via our built-in 1-Click 4-Stage Demo Controller with synthetic acoustic and haptic cues.'
  );

  const demoStages = [
    { num: 'STAGE 1', title: 'P2P Mesh Telemetry', desc: 'Live Office Kit telemetry, low latency (<4.2ms PHY), and bidirectional clipboard streaming.' },
    { num: 'STAGE 2', title: 'Workstation Blackout', desc: '1-click power loss trigger -> Acoustic alert + device vibration -> Hot-Standby Enclave activates.' },
    { num: 'STAGE 3', title: 'Offline SLM & Vault Ops', desc: 'Edit unsaved code in mobile editor + on-device Qwen2.5-Coder SLM syntax audit in Airplane Mode.' },
    { num: 'STAGE 4', title: 'Office Kit Re-Sync', desc: 'Laptop reconnected -> Visual Git diff review with green additions/red deletions -> Auto-commit.' },
  ];

  demoStages.forEach((st, i) => {
    const x = 0.8 + i * 2.95;
    s5.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.9, w: 2.75, h: 4.6,
      rectRadius: 0.12,
      fill: { color: CARD_BG },
      line: { color: i === 1 ? ACCENT_ORANGE : i === 3 ? ACCENT_GREEN : '2A314A', width: 1.5 },
    });

    s5.addText(st.num, {
      x: x + 0.2, y: 2.2, w: 2.35, h: 0.3,
      fontSize: 10, bold: true, color: i === 1 ? ACCENT_ORANGE : i === 3 ? ACCENT_GREEN : ACCENT_CYAN, fontFace: 'Arial',
    });

    s5.addText(st.title, {
      x: x + 0.2, y: 2.6, w: 2.35, h: 0.6,
      fontSize: 13, bold: true, color: TEXT_WHITE, fontFace: 'Arial',
    });

    s5.addText(st.desc, {
      x: x + 0.2, y: 3.3, w: 2.35, h: 2.8,
      fontSize: 10.5, color: TEXT_MUTED, fontFace: 'Arial', lineSpacing: 17,
    });
  });

  // -------------------------------------------------------------
  // SLIDE 6: COMPETITIVE ADVANTAGE MATRIX
  // -------------------------------------------------------------
  const s6 = addBaseSlide(
    'Competitive Differentiation vs. Existing Solutions',
    'Why PocketOps establishes a completely new category in cross-device resilience.'
  );

  const matrixHeaders = ['Capability / Feature', 'Apple Continuity / Phone Link', 'Cloud IDEs (Codespaces)', '⚡ PocketOps (iQOO Prototype)'];
  const matrixRows = [
    ['Network Dependency', 'Requires Wi-Fi Router / Cloud', '100% Active Internet Required', 'Zero-Cloud P2P (Airplane Mode)'],
    ['Sudden Crash / Blackout', 'Lost context / No takeover', 'Severed session / Lost data', 'Instant Hot-Standby (<300ms)'],
    ['Unsaved Buffer Takeover', 'None', 'None (Requires active net)', 'Live Code & Terminal Snapshot'],
    ['Core AI Architecture', 'Cloud Siri / Copilot', 'Cloud LLM (OpenAI/Claude)', 'Local Qwen 2.5-Coder SLM (NPU)'],
    ['Post-Crash Git Re-Sync', 'None', 'Remote Git push required', 'Visual 3-Way Git Diff Inspector'],
  ];

  // Draw Table
  const tableData = [
    matrixHeaders.map(h => ({ text: h, options: { bold: true, color: ACCENT_ORANGE, fill: '1A2035', fontSize: 10 } })),
    ...matrixRows.map((row, rIdx) =>
      row.map((cell, cIdx) => ({
        text: cell,
        options: {
          bold: cIdx === 3,
          color: cIdx === 3 ? ACCENT_CYAN : TEXT_WHITE,
          fill: rIdx % 2 === 0 ? '111524' : '151B2E',
          fontSize: 9.5,
        },
      }))
    ),
  ];

  s6.addTable(tableData, {
    x: 0.8, y: 1.9, w: 11.7, h: 4.6,
    colW: [2.5, 2.9, 2.9, 3.4],
    border: { color: '2A314A', width: 0.5 },
  });

  // -------------------------------------------------------------
  // SLIDE 7: SUMMARY & CONCLUSION
  // -------------------------------------------------------------
  const s7 = addBaseSlide(
    'Summary: The Future of Cross-Device Continuity',
    'PocketOps proves that smartphones can be active, resilient tactical enclaves for developers.'
  );

  s7.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.9, w: 11.7, h: 4.6,
    rectRadius: 0.15,
    fill: { color: CARD_BG },
    line: { color: ACCENT_ORANGE, width: 1.5 },
  });

  s7.addText('🏆 Why PocketOps Wins the iQOO Hackathon:', {
    x: 1.2, y: 2.3, w: 10.9, h: 0.5,
    fontSize: 16, bold: true, color: ACCENT_ORANGE, fontFace: 'Arial',
  });

  const takeaways = [
    '1. End Product Quality (30%): Zero-error React 19 + TypeScript production build with rich tactile and acoustic feedback.',
    '2. Novelty & Impact (20%): Solves the critical real-world crash & blackout context loss problem with zero cloud dependency.',
    '3. Creative Phone Use (15%): Transforms phone into an emergency code enclave with camera OCR and predictive vault.',
    '4. Technical Depth (15%): On-device Qwen 2.5-Coder SLM core, Wi-Fi Aware mesh protocol, and 3-way visual Git diff review.',
    '5. Office Kit Bridge (10%): Seamless bidirectional clipboard and automated Git patch synchronization between laptop and phone.',
    '6. Presentation (10%): Bulletproof 1-click 4-stage judge demo walkthrough designed for a crisp, memorable 60-second pitch.',
  ];

  s7.addText(takeaways.join('\n\n'), {
    x: 1.2, y: 2.9, w: 10.9, h: 3.3,
    fontSize: 11, color: TEXT_WHITE, fontFace: 'Arial',
  });

  // Save presentation
  const outputPath = path.resolve(__dirname, '../PocketOps_Presentation.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Presentation successfully created at: ${outputPath}`);
}

createDeck().catch(err => {
  console.error(err);
  process.exit(1);
});
