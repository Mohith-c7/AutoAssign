import { onCall } from 'firebase-functions/v2/https';
import { extractDeadlineRegex } from './regexParser.js';

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

function buildPrompt(cleanedEmailBody, userTimezone) {
  const todayIso = new Date().toISOString().slice(0, 10);

  return [
    {
      role: 'system',
      content:
        `You are an academic deadline extractor. Extract assignment deadlines from email text. Today's date is ${todayIso}. The user's timezone is ${userTimezone}. Always return valid JSON only - no markdown, no explanation.`
    },
    {
      role: 'user',
      content:
        `Extract all assignment deadlines from this email. Return a JSON array. Each item must have: title (string), deadline (ISO 8601 UTC string or null), subject (string or null), priority ('high'|'medium'|'low'), confidence (0.0-1.0). If multiple deadlines exist, return multiple items. If no deadline is detectable, set deadline to null and confidence below 0.5.\n\nEMAIL: ${cleanedEmailBody}`
    }
  ];
}

function deriveFallbackTitle(emailSubject = '') {
  return emailSubject || 'Assignment deadline';
}

async function callOpenAI(cleanedEmailBody, userTimezone) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: buildPrompt(cleanedEmailBody, userTimezone)
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${text}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(content);
  const items = Array.isArray(parsed) ? parsed : parsed.items ?? parsed.deadlines ?? [];

  return Array.isArray(items) ? items : [];
}

export async function parseDeadlineItems({
  cleanedEmailBody,
  emailSubject = '',
  userTimezone = 'UTC'
}) {
  const regexResult = extractDeadlineRegex(cleanedEmailBody);

  if (regexResult.confidence >= 0.8 && regexResult.deadline) {
    return {
      items: [
        {
          title: deriveFallbackTitle(emailSubject),
          deadline: regexResult.deadline,
          subject: null,
          priority: 'medium',
          confidence: regexResult.confidence
        }
      ],
      source: 'regex'
    };
  }

  const aiItems = await callOpenAI(cleanedEmailBody, userTimezone);

  return {
    items: aiItems ?? [],
    source: 'ai'
  };
}

export const parseDeadline = onCall(async (request) => {
  const cleanedEmailBody = request.data?.cleanedEmailBody ?? '';
  const emailSubject = request.data?.emailSubject ?? '';
  const userTimezone = request.data?.userTimezone ?? 'UTC';

  return parseDeadlineItems({
    cleanedEmailBody,
    emailSubject,
    userTimezone
  });
});
