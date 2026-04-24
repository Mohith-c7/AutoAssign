import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { extractDeadlineRegex } from '../utils/parser';

async function sha256(input) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}

function detectSubject(emailSubject, body) {
  const subjectHints = ['dbms', 'database', 'operating systems', 'ai', 'artificial intelligence', 'math', 'physics', 'chemistry'];
  const text = `${emailSubject} ${body}`.toLowerCase();
  const match = subjectHints.find((hint) => text.includes(hint));

  if (!match) {
    return 'Unknown';
  }

  return match
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function classifyPriority(deadlineIso, body) {
  if (/asap|soon|urgent|immediately/i.test(body)) {
    return 'high';
  }

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

export async function processEmail(emailData) {
  const { userId, emailId, emailSubject = '', cleanedEmailBody = '', userTimezone = 'UTC' } =
    emailData;

  const parsed = extractDeadlineRegex(cleanedEmailBody, userTimezone, new Date());
  const isVague = /asap|soon|urgent|immediately/i.test(cleanedEmailBody);
  const deadline = parsed.deadline;
  const confidence = parsed.confidence;

  if (!deadline && !isVague) {
    return {
      persistedCount: 0,
      items: []
    };
  }

  const dedupHash = await sha256(`${userId}:${emailId}:${deadline ?? 'no-deadline'}`);
  const duplicateSnapshot = await getDocs(
    query(collection(db, 'assignments'), where('dedupHash', '==', dedupHash))
  );

  if (!duplicateSnapshot.empty) {
    return {
      persistedCount: 0,
      duplicate: true,
      items: []
    };
  }

  const assignment = {
    userId,
    dedupHash,
    title: emailSubject || 'Assignment deadline',
    deadline: deadline ? new Date(deadline) : null,
    subject: detectSubject(emailSubject, cleanedEmailBody),
    priority: classifyPriority(deadline, cleanedEmailBody),
    confidence: deadline ? confidence : 0.4,
    status: deadline && new Date(deadline).getTime() < Date.now() ? 'overdue' : 'pending',
    source: 'gmail',
    sourceEmailId: emailId,
    reminders: [86400000, 10800000, 3600000],
    calendarEventId: null,
    needsReview: !deadline || confidence < 0.5,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'assignments'), assignment);

  return {
    persistedCount: 1,
    items: [
      {
        ...assignment,
        id: docRef.id,
        deadline
      }
    ]
  };
}

export function subscribeAssignments(callback, onError) {
  const user = auth.currentUser;

  if (!user) {
    callback([]);
    return () => {};
  }

  const assignmentsQuery = query(
    collection(db, 'assignments'),
    where('userId', '==', user.uid),
    orderBy('deadline', 'asc')
  );

  return onSnapshot(
    assignmentsQuery,
    (snapshot) => {
      const assignments = snapshot.docs.map((assignmentDoc) => {
        const data = assignmentDoc.data();
        return {
          ...data,
          deadline: data.deadline?.toDate ? data.deadline.toDate().toISOString() : data.deadline
        };
      });

      callback(assignments);
    },
    onError
  );
}

export async function updateAssignment(assignmentId, updates) {
  await updateDoc(doc(db, 'assignments', assignmentId), updates);
}

export async function deleteAssignment() {
  throw new Error('Not implemented yet.');
}

export async function deleteAllUserData(userId) {
  const assignmentsSnapshot = await getDocs(
    query(collection(db, 'assignments'), where('userId', '==', userId))
  );
  const batch = writeBatch(db);

  assignmentsSnapshot.docs.forEach((assignmentDoc) => {
    batch.delete(assignmentDoc.ref);
  });

  batch.delete(doc(db, 'users', userId));
  await batch.commit();

  return { deleted: true };
}
