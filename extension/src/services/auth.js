import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut
} from 'firebase/auth/web-extension';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { storage } from './storage';

const GMAIL_TOKEN_KEY = 'gmailAuthToken';
const SYNC_STATUS_KEY = 'syncStatus';

function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

function normalizeAuthTokenResult(result) {
  if (typeof result === 'string') {
    return {
      token: result,
      grantedScopes: []
    };
  }

  return {
    token: result?.token ?? '',
    grantedScopes: result?.grantedScopes ?? []
  };
}

function extractTokenString(value) {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object' && typeof value.token === 'string') {
    return value.token;
  }

  return '';
}

export async function getAuthToken(interactive = true) {
  const result = await chrome.identity.getAuthToken({
    interactive,
    scopes: [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/calendar'
    ]
  });

  return normalizeAuthTokenResult(result);
}

export async function getStoredAuthToken() {
  const stored = await storage.get(GMAIL_TOKEN_KEY);
  return extractTokenString(stored);
}

export async function refreshToken(token) {
  void token;

  await chrome.identity.clearAllCachedAuthTokens();

  const freshTokenResult = await getAuthToken(false);
  const freshToken = freshTokenResult.token;
  await storage.set(GMAIL_TOKEN_KEY, freshToken);
  return freshToken;
}

export async function signInToFirebase(accessToken) {
  const credential = GoogleAuthProvider.credential(null, accessToken);
  const userCredential = await signInWithCredential(auth, credential);
  const userRef = doc(db, 'users', userCredential.user.uid);
  const existingDoc = await getDoc(userRef);

  await setDoc(
    userRef,
    {
      email: userCredential.user.email ?? '',
      timezone: getTimezone(),
      lastSync: existingDoc.exists() ? existingDoc.data().lastSync ?? null : null,
      createdAt: existingDoc.exists()
        ? existingDoc.data().createdAt ?? serverTimestamp()
        : serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  return userCredential.user;
}

export async function connectGmail() {
  await chrome.identity.clearAllCachedAuthTokens();
  await storage.remove([GMAIL_TOKEN_KEY]);

  const authResult = await getAuthToken(true);
  const accessToken = authResult.token;

  if (!accessToken) {
    throw new Error('Google did not return an OAuth access token.');
  }

  await storage.set(GMAIL_TOKEN_KEY, accessToken);
  let user;

  try {
    user = await signInToFirebase(accessToken);
  } catch {
    const refreshedToken = await refreshToken(accessToken);
    user = await signInToFirebase(refreshedToken);
    await storage.set(GMAIL_TOKEN_KEY, refreshedToken);
  }

  await storage.set(SYNC_STATUS_KEY, {
    stage: 'connected',
    message: 'Gmail connected. Ready to sync emails.',
    updatedAt: new Date().toISOString()
  });

  return {
    accessToken,
    user
  };
}

export async function signOut() {
  await chrome.identity.clearAllCachedAuthTokens();

  await firebaseSignOut(auth);
  await storage.remove([GMAIL_TOKEN_KEY, 'firebaseSession', SYNC_STATUS_KEY]);
}

export function getCurrentUser() {
  return auth.currentUser;
}
