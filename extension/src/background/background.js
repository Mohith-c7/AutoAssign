import { runSync } from '../services/sync';
import { storage } from '../services/storage';

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.alarms.create('gmailSync', {
    periodInMinutes: 30
  });

  await storage.set('lastInstalledAt', new Date().toISOString());
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'gmailSync') {
    await storage.set('lastSyncTrigger', new Date().toISOString());

    try {
      await runSync({ incremental: true });
    } catch (error) {
      await storage.set('syncStatus', {
        stage: 'error',
        message: error.message,
        updatedAt: new Date().toISOString()
      });
    }
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'SYNC_NOW') {
    storage
      .set('lastManualSyncRequest', new Date().toISOString())
      .then(async () => {
        const emails = await runSync({ incremental: false });
        sendResponse({ ok: true, count: emails.length });
      })
      .catch((error) => sendResponse({ ok: false, error: error.message }));

    return true;
  }

  if (message?.type === 'DELETE_DATA') {
    storage
      .clear()
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));

    return true;
  }

  return false;
});
