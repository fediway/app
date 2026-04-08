import { Buffer } from 'node:buffer';
import { createError, defineEventHandler, getRequestIP, readFormData } from 'h3';
import sharp from 'sharp';

const SCREENSHOT_MAX_WIDTH = 800;
const SCREENSHOT_JPEG_QUALITY = 70;

async function processScreenshot(file: File): Promise<string | null> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const resized = await sharp(buffer)
      .resize(SCREENSHOT_MAX_WIDTH, undefined, { withoutEnlargement: true })
      .jpeg({ quality: SCREENSHOT_JPEG_QUALITY })
      .toBuffer();
    const base64 = resized.toString('base64');
    return `![Screenshot](data:image/jpeg;base64,${base64})`;
  }
  catch {
    return null;
  }
}

const VALID_CATEGORIES = ['bug', 'suggestion', 'other'] as const;
const VALID_FREQUENCIES = ['always', 'sometimes', 'once'] as const;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX)
    return false;

  entry.count++;
  return true;
}

function isValidPayload(body: unknown): boolean {
  if (!body || typeof body !== 'object')
    return false;

  const b = body as Record<string, unknown>;

  if (typeof b.category !== 'string' || !VALID_CATEGORIES.includes(b.category as typeof VALID_CATEGORIES[number]))
    return false;
  if (typeof b.description !== 'string' || !b.description.trim() || b.description.length > MAX_DESCRIPTION_LENGTH)
    return false;
  if (b.frequency !== undefined && (typeof b.frequency !== 'string' || !VALID_FREQUENCIES.includes(b.frequency as typeof VALID_FREQUENCIES[number])))
    return false;
  if (!b.context || typeof b.context !== 'object')
    return false;

  const ctx = b.context as Record<string, unknown>;
  if (!ctx.app || typeof ctx.app !== 'object')
    return false;
  if (!ctx.device || typeof ctx.device !== 'object')
    return false;
  if (!ctx.route || typeof ctx.route !== 'object')
    return false;
  if (typeof ctx.timestamp !== 'string')
    return false;

  return true;
}

const CATEGORY_LABELS: Record<string, { emoji: string; label: string; priority: string }> = {
  bug: { emoji: '🐛', label: 'Bug', priority: 'medium' },
  suggestion: { emoji: '💡', label: 'Suggestion', priority: 'low' },
  other: { emoji: '💬', label: 'Feedback', priority: 'no-priority' },
};

function getCategoryMeta(category: string): { emoji: string; label: string; priority: string } {
  return CATEGORY_LABELS[category] ?? { emoji: '💬', label: 'Feedback', priority: 'no-priority' };
}

function formatTitle(body: Record<string, any>): string {
  const meta = getCategoryMeta(body.category);
  const firstLine = (body.description as string).split('\n')[0]?.slice(0, 80) ?? '';
  return `${meta.emoji} ${meta.label}: ${firstLine}`;
}

function formatDescription(body: Record<string, any>): string {
  const ctx = body.context as Record<string, any>;
  const device = ctx.device as Record<string, any>;
  const app = ctx.app as Record<string, any>;
  const route = ctx.route as Record<string, any>;
  const user = ctx.user as Record<string, any> | undefined;

  const lines: string[] = [];

  lines.push(body.description);
  lines.push('');

  if (body.expectedBehavior) {
    lines.push('**Expected behavior**');
    lines.push(body.expectedBehavior);
    lines.push('');
  }

  if (body.frequency)
    lines.push(`**Frequency:** ${body.frequency}`);

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`**User:** ${user?.handle || 'Not signed in'}`);
  lines.push(`**App:** ${app.version} (${app.platform})`);
  lines.push(`**Route:** ${route.path}`);
  lines.push(`**Instance:** ${ctx.instanceUrl || 'N/A'}`);
  lines.push(`**Theme:** ${ctx.theme} · **Viewport:** ${device.viewport?.width}×${device.viewport?.height}`);
  lines.push(`**Browser:** ${device.userAgent?.slice(0, 120)}`);
  lines.push(`**Online:** ${device.online ? 'Yes' : 'No'} · **Language:** ${device.language}`);
  lines.push(`**Time:** ${ctx.timestamp}`);

  if (ctx.recentErrors?.length > 0) {
    lines.push('');
    lines.push('**Recent errors:**');
    for (const err of ctx.recentErrors)
      lines.push(`- \`${err.message}\``);
  }

  return lines.join('\n');
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  if (!config.feedbackKaneoBaseUrl || !config.feedbackKaneoApiKey || !config.feedbackKaneoProjectId) {
    throw createError({ statusCode: 501, statusMessage: 'Feedback collection not configured' });
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown';
  if (!checkRateLimit(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many feedback submissions. Please try again later.' });
  }

  const formData = await readFormData(event);
  const dataStr = formData.get('data');
  const screenshot = formData.get('screenshot');

  if (screenshot && screenshot instanceof File && screenshot.size > MAX_SCREENSHOT_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Screenshot too large. Maximum size is 5MB.' });
  }

  if (typeof dataStr !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing data field' });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(dataStr);
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON in data field' });
  }

  if (!isValidPayload(body)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid feedback payload' });
  }

  const validated = body as Record<string, any>;
  const title = formatTitle(validated);
  let description = formatDescription(validated);
  const { priority } = getCategoryMeta(validated.category);

  // Process screenshot: downscale and embed as base64
  if (screenshot && screenshot instanceof File && screenshot.size > 0) {
    const screenshotMarkdown = await processScreenshot(screenshot);
    if (screenshotMarkdown)
      description = `${screenshotMarkdown}\n\n${description}`;
  }

  const url = `${config.feedbackKaneoBaseUrl}/api/task/${config.feedbackKaneoProjectId}`;

  try {
    const response = await $fetch<{ id?: string }>(url, {
      method: 'POST',
      headers: {
        'x-api-key': config.feedbackKaneoApiKey,
        'Content-Type': 'application/json',
      },
      body: { title, description, priority, status: 'to-do' },
    });

    return { success: true, id: response?.id ?? null };
  }
  catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[feedback] Kaneo error:', message);
    throw createError({ statusCode: 502, statusMessage: 'Failed to store feedback' });
  }
});
