import type { Filter, Property } from '@prisma/client';
import { buildMatchingPrompt, toListingSummary } from './matching-prompt.js';

export interface GrokMatchResult {
  listingId: string;
  score: number;
  aiComment: string;
}

interface GrokApiResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GrokUsageStats {
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
  durationMs: number;
}

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-3-mini';
const MAX_TOKENS = 4000;
const TIMEOUT_MS = 30_000;
const RETRY_DELAY_MS = 2000;
const COST_PER_1K_INPUT = 0.0003;
const COST_PER_1K_OUTPUT = 0.0005;

function getApiKey(): string {
  const key = process.env.GROK_API_KEY;
  if (!key) throw new Error('GROK_API_KEY environment variable is not set');
  return key;
}

function calculateCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1000) * COST_PER_1K_INPUT + (outputTokens / 1000) * COST_PER_1K_OUTPUT;
}

async function callGrokApi(prompt: string): Promise<{ result: GrokMatchResult[]; usage: GrokUsageStats }> {
  const apiKey = getApiKey();
  const startTime = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: MAX_TOKENS,
        temperature: 0.1,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'unknown error');
    throw new Error(`Grok API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as GrokApiResponse;
  const content = data.choices?.[0]?.message?.content ?? '';
  const durationMs = Date.now() - startTime;

  const tokensInput = data.usage?.prompt_tokens ?? 0;
  const tokensOutput = data.usage?.completion_tokens ?? 0;

  const parsed = parseGrokResponse(content);

  return {
    result: parsed,
    usage: {
      tokensInput,
      tokensOutput,
      costUsd: calculateCost(tokensInput, tokensOutput),
      durationMs,
    },
  };
}

function parseGrokResponse(content: string): GrokMatchResult[] {
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Grok response does not contain a JSON array');

  const raw = JSON.parse(jsonMatch[0]) as Array<{
    listingId: string;
    score: number;
    comment: string;
  }>;

  return raw
    .filter((item) => typeof item.listingId === 'string' && typeof item.score === 'number')
    .map((item) => ({
      listingId: item.listingId,
      score: Math.min(100, Math.max(0, Math.round(item.score))),
      aiComment: item.comment ?? '',
    }));
}

async function callWithRetry(prompt: string): Promise<{ result: GrokMatchResult[]; usage: GrokUsageStats }> {
  try {
    return await callGrokApi(prompt);
  } catch (err) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return callGrokApi(prompt);
  }
}

export async function matchListings(
  filter: Filter,
  listings: Property[],
): Promise<{ matches: GrokMatchResult[]; usage: GrokUsageStats }> {
  const BATCH_SIZE = 50;
  const allResults: GrokMatchResult[] = [];
  let totalUsage: GrokUsageStats = { tokensInput: 0, tokensOutput: 0, costUsd: 0, durationMs: 0 };

  for (let i = 0; i < listings.length; i += BATCH_SIZE) {
    const batch = listings.slice(i, i + BATCH_SIZE).map(toListingSummary);
    const prompt = buildMatchingPrompt(filter, batch);
    const { result, usage } = await callWithRetry(prompt);

    allResults.push(...result);
    totalUsage = {
      tokensInput: totalUsage.tokensInput + usage.tokensInput,
      tokensOutput: totalUsage.tokensOutput + usage.tokensOutput,
      costUsd: totalUsage.costUsd + usage.costUsd,
      durationMs: totalUsage.durationMs + usage.durationMs,
    };
  }

  const sorted = allResults.sort((a, b) => b.score - a.score);

  return { matches: sorted, usage: totalUsage };
}
