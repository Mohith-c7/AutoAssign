import { createHash } from 'node:crypto';
import { db } from '../firebaseAdmin.js';

export async function generateDedupHash(userId, emailId, deadlineISO) {
  return createHash('sha256')
    .update(`${userId}:${emailId}:${deadlineISO ?? 'no-deadline'}`)
    .digest('hex');
}

export async function checkDuplicate(hash) {
  const snapshot = await db
    .collection('assignments')
    .where('dedupHash', '==', hash)
    .limit(1)
    .get();

  return !snapshot.empty;
}
