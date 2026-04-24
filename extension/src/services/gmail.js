const DEFAULT_QUERY =
  'label:inbox subject:(assignment OR deadline OR submit OR due)';

function buildUrl(path, params = {}) {
  const url = new URL(`https://gmail.googleapis.com/gmail/v1/${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function requestGmail(token, path, params) {
  const response = await fetch(buildUrl(path, params), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = new Error(`Gmail request failed with ${response.status}`);
    error.status = response.status;
    error.body = await response.text();
    throw error;
  }

  return response.json();
}

function decodeBase64Url(value = '') {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
}

function flattenParts(parts = []) {
  return parts.flatMap((part) => [part, ...flattenParts(part.parts || [])]);
}

function getHeader(headers = [], name) {
  return headers.find((header) => header.name.toLowerCase() === name)?.value ?? '';
}

function extractBody(payload = {}) {
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  const parts = flattenParts(payload.parts || []);
  const preferredPart =
    parts.find((part) => part.mimeType === 'text/plain' && part.body?.data) ||
    parts.find((part) => part.mimeType === 'text/html' && part.body?.data);

  return preferredPart?.body?.data
    ? decodeBase64Url(preferredPart.body.data)
    : '';
}

export async function searchEmails(token, query = DEFAULT_QUERY, maxResults = 50) {
  return requestGmail(token, 'users/me/messages', {
    q: query,
    maxResults
  });
}

export async function getEmailBody(token, messageId) {
  const data = await requestGmail(token, `users/me/messages/${messageId}`, {
    format: 'full'
  });

  return {
    id: data.id,
    threadId: data.threadId,
    historyId: data.historyId,
    snippet: data.snippet,
    subject: getHeader(data.payload?.headers, 'Subject'),
    from: getHeader(data.payload?.headers, 'From'),
    date: getHeader(data.payload?.headers, 'Date'),
    body: extractBody(data.payload)
  };
}

export async function fetchRecentEmails(token, maxResults = 50) {
  const list = await searchEmails(token, DEFAULT_QUERY, maxResults);
  const messages = await Promise.all(
    (list.messages || []).map((message) => getEmailBody(token, message.id))
  );

  return {
    historyId: list.historyId ?? null,
    messages
  };
}

export async function fetchNewEmailsSince(token, historyId) {
  if (!historyId) {
    return fetchRecentEmails(token, 50);
  }

  const historyResponse = await requestGmail(token, 'users/me/history', {
    startHistoryId: historyId,
    historyTypes: 'messageAdded'
  });

  const messageIds = [
    ...new Set(
      (historyResponse.history || []).flatMap((entry) =>
        (entry.messagesAdded || []).map((message) => message.message?.id).filter(Boolean)
      )
    )
  ];

  const messages = await Promise.all(
    messageIds.map((messageId) => getEmailBody(token, messageId))
  );

  return {
    historyId: historyResponse.historyId ?? historyId,
    messages
  };
}
