import { onCall } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { OAuth2Client } from 'google-auth-library';
import { app } from '../firebaseAdmin.js';

const client = new OAuth2Client();

export const createCustomToken = onCall(async (request) => {
  const idToken = request.data?.idToken;
  const audience = request.data?.clientId;

  if (!idToken || !audience) {
    throw new Error('idToken and clientId are required.');
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience
  });

  const payload = ticket.getPayload();

  if (!payload?.sub) {
    throw new Error('Unable to verify Google ID token.');
  }

  const customToken = await getAuth(app).createCustomToken(payload.sub, {
    email: payload.email ?? ''
  });

  return {
    customToken,
    email: payload.email ?? ''
  };
});
