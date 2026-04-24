import { onCall } from 'firebase-functions/v2/https';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { db } from '../firebaseAdmin.js';
import { checkDuplicate, generateDedupHash } from '../dedup/dedup.js';
import { extractDeadlineRegex } from './regexParser.js';
import { parseDeadlineItems } from './parseDeadline.js';

function classifyPriority(deadlineIso) {
  if (!deadlineIso) {
    return 'high';
  }

  const diff = new Date(deadlineIso).getTime() - Date.now();

  if (diff < 24 * 60 * 60 * 1000) {
    return 'high';
  }

  if (diff < 3 * 24 * 60 * 60 * 1000) {
    return 'medium';
  }

  return 'low';
}

function normalizeItems(items, emailSubject) {
  return items.map((item) => ({
    title: item.title || emailSubject || 'Assignment deadline',
    deadline: item.deadline || null,
    subject: item.subject || 'Unknown',
    priority: item.priority || classifyPriority(item.deadline),
    confidence: Number(item.confidence ?? 0.4)
  }));
}

export const processEmail = onCall(async (request) => {
  const userId = request.auth?.uid || request.data?.userId;
  const emailId = request.data?.emailId;
  const emailSubject = request.data?.emailSubject ?? '';
  const cleanedEmailBody = request.data?.cleanedEmailBody ?? '';
  const userTimezone = request.data?.userTimezone ?? 'UTC';

  if (!userId || !emailId || !cleanedEmailBody) {
    throw new Error('userId, emailId, and cleanedEmailBody are required.');
  }

  const regexResult = extractDeadlineRegex(cleanedEmailBody);
  let parsedItems = [];
  let source = 'regex';

  if (regexResult.confidence >= 0.8 && regexResult.deadline) {
    parsedItems = [
      {
        title: emailSubject || 'Assignment deadline',
        deadline: regexResult.deadline,
        subject: 'Unknown',
        priority: classifyPriority(regexResult.deadline),
        confidence: regexResult.confidence
      }
    ];
  } else {
    const aiResult = await parseDeadlineItems({
      cleanedEmailBody,
      emailSubject,
      userTimezone
    });
    parsedItems = normalizeItems(aiResult.items || [], emailSubject);
    source = aiResult.source || 'ai';
  }

  const persisted = [];

  for (const item of parsedItems) {
    if (!item.deadline && item.confidence < 0.5) {
      if (/asap|soon|urgent|immediately/i.test(cleanedEmailBody)) {
        item.priority = 'high';
      } else {
        continue;
      }
    }

    const dedupHash = await generateDedupHash(userId, emailId, item.deadline);
    const isDuplicate = await checkDuplicate(dedupHash);

    if (isDuplicate) {
      continue;
    }

    const docRef = db.collection('assignments').doc();
    const payload = {
      id: docRef.id,
      userId,
      dedupHash,
      title: item.title,
      deadline: item.deadline ? Timestamp.fromDate(new Date(item.deadline)) : null,
      subject: item.subject || 'Unknown',
      priority: item.priority,
      confidence: item.confidence,
      status: item.deadline && new Date(item.deadline).getTime() < Date.now() ? 'overdue' : 'pending',
      source,
      sourceEmailId: emailId,
      reminders: [86400000, 10800000, 3600000],
      calendarEventId: null,
      needsReview: !item.deadline || item.confidence < 0.5,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await docRef.set(payload);
    persisted.push({ ...payload, deadline: item.deadline });
  }

  return {
    persistedCount: persisted.length,
    items: persisted
  };
});
