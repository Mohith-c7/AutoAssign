import { processEmail } from './api';
import { cleanEmailBody, truncateText } from '../utils/parser';
import { getCurrentUser, getStoredAuthToken, refreshToken } from './auth';
import { fetchNewEmailsSince, fetchRecentEmails } from './gmail';
import { storage } from './storage';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const HISTORY_KEY = 'gmailHistoryId';
const SYNC_RESULTS_KEY = 'lastSyncResults';
const SYNC_STATUS_KEY = 'syncStatus';

async function withFreshToken(request) {
  const token = await getStoredAuthToken();

  if (!token) {
    throw new Error('No Gmail token available. Connect Gmail first.');
  }

  try {
    return await request(token);
  } catch (error) {
    if (error.status === 401) {
      const refreshedToken = await refreshToken(token);
      return request(refreshedToken);
    }

    throw error;
  }
}

function normalizeMessage(message) {
  const cleanedBody = truncateText(cleanEmailBody(message.body || ''), 2000);

  return {
    ...message,
    cleanedBody
  };
}

export async function runSync({ incremental = true } = {}) {
  await storage.set(SYNC_STATUS_KEY, {
    stage: 'syncing',
    message: incremental ? 'Checking for new emails...' : 'Fetching recent emails...',
    updatedAt: new Date().toISOString()
  });

  const historyId = incremental ? await storage.get(HISTORY_KEY) : null;
  const result = await withFreshToken((token) =>
    incremental
      ? fetchNewEmailsSince(token, historyId)
      : fetchRecentEmails(token, 50)
  );

  const normalizedMessages = result.messages.map(normalizeMessage);
  const currentUser = getCurrentUser();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const processed = [];

  for (const message of normalizedMessages) {
    if (!currentUser) {
      break;
    }

    try {
      const response = await processEmail({
        userId: currentUser.uid,
        emailId: message.id,
        emailSubject: message.subject,
        cleanedEmailBody: message.cleanedBody,
        userTimezone
      });
      processed.push({
        emailId: message.id,
        persistedCount: response.persistedCount
      });
    } catch (error) {
      processed.push({
        emailId: message.id,
        error: error.message
      });
    }
  }

  await storage.set(HISTORY_KEY, result.historyId);
  await storage.set(SYNC_RESULTS_KEY, normalizedMessages);
  await storage.set('lastProcessResults', processed);

  if (currentUser) {
    await setDoc(
      doc(db, 'users', currentUser.uid),
      {
        gmailSyncToken: result.historyId ?? null,
        lastSync: serverTimestamp(),
        timezone: userTimezone
      },
      { merge: true }
    );
  }

  await storage.set(SYNC_STATUS_KEY, {
    stage: 'idle',
    message: `Fetched ${normalizedMessages.length} email(s), processed ${processed.filter((item) => !item.error).length}.`,
    updatedAt: new Date().toISOString()
  });

  console.log('AutoAssign sync results', normalizedMessages);

  return normalizedMessages;
}
