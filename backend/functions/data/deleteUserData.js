import { onCall } from 'firebase-functions/v2/https';
import { db } from '../firebaseAdmin.js';

export const deleteUserData = onCall(async (request) => {
  const userId = request.auth?.uid || request.data?.userId;

  if (!userId) {
    throw new Error('userId is required.');
  }

  const assignmentsSnapshot = await db
    .collection('assignments')
    .where('userId', '==', userId)
    .get();

  const batch = db.batch();
  assignmentsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(db.collection('users').doc(userId));
  await batch.commit();

  return { deleted: true };
});
