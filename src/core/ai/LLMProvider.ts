import type { AIResult, IntentResult, TaskBreakdownResult } from '../../shared/types';

/**
 * LLMProvider — abstraction over local / on-device / cloud models.
 * Prototype ships a deterministic MockLocalProvider.
 * Swap this with a real provider (Ollama, GPT, Gemini) later.
 */
export interface LLMProvider {
  readonly id: string;
  readonly available: boolean;
  extractIntent(input: string): Promise<AIResult<IntentResult>>;
  decomposeTask(taskTitle: string): Promise<AIResult<TaskBreakdownResult>>;
  interpretImage(context: string): Promise<AIResult<{ observation: string; confidence: string; metrics: Record<string, string> }>>;
}

/* ---------- tiny schema validators (no external deps) ---------- */

function isStr(v: unknown): v is string { return typeof v === 'string' && v.length > 0; }

const KNOWN_INTENTS: ReadonlySet<string> = new Set([
  'CREATE_TASK', 'DEVICE_STATUS', 'RESUME_WORKFLOW', 'SEARCH_FILES',
  'WAKE_DEVICE', 'PAUSE_WORKFLOW', 'COMPLETE_STEP', 'START_WORKFLOW', 'NAVIGATE',
]);

const PRIORITIES: ReadonlySet<string> = new Set(['LOW', 'MEDIUM', 'HIGH']);

function validateIntent(raw: unknown): AIResult<IntentResult> {
  if (!raw || typeof raw !== 'object') return { valid: false, error: 'Invalid payload' };
  const o = raw as Record<string, unknown>;
  if (!isStr(o.intent) || !KNOWN_INTENTS.has(o.intent)) return { valid: false, error: 'Unknown intent' };
  if (o.intent === 'CREATE_TASK' && !isStr(o.title)) return { valid: false, error: 'Missing task title' };
  if (o.priority !== undefined && !PRIORITIES.has(String(o.priority))) return { valid: false, error: 'Bad priority' };
  return { valid: true, data: o as unknown as IntentResult };
}

function validateBreakdown(raw: unknown): AIResult<TaskBreakdownResult> {
  if (!raw || typeof raw !== 'object') return { valid: false, error: 'Invalid payload' };
  const o = raw as Record<string, unknown>;
  if (!isStr(o.intent) || o.intent !== 'BREAKDOWN_TASK') return { valid: false, error: 'Bad intent' };
  if (!Array.isArray(o.steps) || o.steps.length === 0) return { valid: false, error: 'No steps' };
  if (!o.steps.every((s: unknown) => typeof s === 'string' && s.trim().length > 0)) {
    return { valid: false, error: 'Malformed steps' };
  }
  if (!isStr(o.summary)) return { valid: false, error: 'No summary' };
  return { valid: true, data: o as unknown as TaskBreakdownResult };
}

/* ---------- Mock local provider ---------- */

const BREAKDOWN_RULES: { match: RegExp; steps: string[] }[] = [
  {
    match: /project report|report/i,
    steps: [
      'Complete methodology',
      'Add implementation screenshots',
      'Add results',
      'Review references',
      'Export PDF',
    ],
  },
  {
    match: /hackathon|demo|presentation/i,
    steps: [
      'Finalize project scope',
      'Polish core screens',
      'Prepare demo data',
      'Record demo video',
      'Write pitch script',
      'Test on physical device',
      'Final rehearsal',
    ],
  },
  {
    match: /leetcode|code|algorithm|problem/i,
    steps: [
      'Read and restate the problem',
      'Identify brute-force approach',
      'Optimize the solution',
      'Write tests with edge cases',
      'Summarise time and space complexity',
    ],
  },
  {
    match: /inspection|machine|device check/i,
    steps: [
      'Connect to the device',
      'Check machine status',
      'Capture evidence image',
      'Analyze observation',
      'Generate inspection report',
    ],
  },
  {
    match: /submit|deadline|assignment/i,
    steps: [
      'Review all requirements',
      'Complete remaining sections',
      'Proofread content',
      'Upload to portal',
      'Confirm submission receipt',
    ],
  },
];

const INTENT_RULES: { match: RegExp; build: (m: RegExpMatchArray) => IntentResult }[] = [
  { match: /check (my )?laptop|device status|how.*laptop/i, build: () => ({ intent: 'DEVICE_STATUS' }) },
  { match: /wake (my )?laptop|wake (the )?device/i, build: () => ({ intent: 'WAKE_DEVICE' }) },
  { match: /resume.*(inspection|workflow|report)|continue.*(workflow|inspection)/i, build: () => ({ intent: 'RESUME_WORKFLOW' }) },
  { match: /pause.*(workflow|inspection)/i, build: () => ({ intent: 'PAUSE_WORKFLOW' }) },
  { match: /show.*files|search.*file|project files/i, build: () => ({ intent: 'SEARCH_FILES', query: 'project' }) },
  { match: /add (a task )?(to )?(.+?)( tomorrow| today| by .+)?$/i, build: (m) => {
      const title = (m[3] || m[0]).trim();
      const when = (m[4] || '').trim();
      return {
        intent: 'CREATE_TASK',
        title: title.charAt(0).toUpperCase() + title.slice(1),
        dueDate: when === 'tomorrow' ? 'tomorrow' : when === 'today' ? 'today' : undefined,
        priority: 'HIGH',
      };
    },
  },
  { match: /start.*workflow/i, build: () => ({ intent: 'START_WORKFLOW' }) },
];

export class MockLocalProvider implements LLMProvider {
  readonly id = 'mock-local';
  readonly available = true;

  async extractIntent(input: string): Promise<AIResult<IntentResult>> {
    await delay(400);
    for (const rule of INTENT_RULES) {
      const m = input.match(rule.match);
      if (m) {
        const result = rule.build(m);
        return validateIntent(result);
      }
    }
    return validateIntent({ intent: 'NAVIGATE', query: input });
  }

  async decomposeTask(taskTitle: string): Promise<AIResult<TaskBreakdownResult>> {
    await delay(1400);
    const rule = BREAKDOWN_RULES.find(r => r.match.test(taskTitle));
    const steps = rule
      ? rule.steps
      : [
          `Define scope for: ${taskTitle}`,
          'Gather required resources',
          'Complete the core work',
          'Review and refine output',
          'Deliver final result',
        ];
    return validateBreakdown({
      intent: 'BREAKDOWN_TASK',
      taskId: '',
      steps,
      summary: `${steps.length} actionable steps generated for "${taskTitle}".`,
    });
  }

  async interpretImage(_context: string): Promise<AIResult<{ observation: string; confidence: string; metrics: Record<string, string> }>> {
    await delay(1800);
    return {
      valid: true,
      data: {
        observation: 'Possible surface irregularity detected.',
        confidence: 'High (0.87)',
        metrics: {
          'Surface roughness': 'Moderate',
          'Anomaly area': '~2.1 cm²',
          'Contrast delta': '+14%',
        },
      },
    };
  }
}

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

/** Current provider instance — swap for real LLM later. */
export const aiProvider: LLMProvider = new MockLocalProvider();
