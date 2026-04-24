import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const extensionRoot = dirname(fileURLToPath(import.meta.url));
  const env = loadEnv(mode, extensionRoot, '');
  const googleClientId = env.VITE_GOOGLE_CLIENT_ID || '';

  const manifest = {
    manifest_version: 3,
    name: 'AutoAssign AI',
    version: '0.1.0',
    description: 'Automatically tracks assignment deadlines from Gmail.',
    permissions: ['alarms', 'notifications', 'storage', 'identity'],
    host_permissions: [
      'https://www.googleapis.com/*',
      'https://identitytoolkit.googleapis.com/*',
      'https://securetoken.googleapis.com/*',
      'https://firestore.googleapis.com/*',
      'https://*.firebaseio.com/*',
      'https://asia-south1-autoassign-c23b7.cloudfunctions.net/*'
    ],
    action: {
      default_popup: 'popup/index.html'
    },
    background: {
      service_worker: 'src/background/background.js',
      type: 'module'
    },
    icons: {
      '16': 'icons/16.png',
      '48': 'icons/48.png',
      '128': 'icons/128.png'
    },
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'"
    }
  };

  if (googleClientId.endsWith('.apps.googleusercontent.com')) {
    manifest.oauth2 = {
      client_id: googleClientId,
      scopes: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/calendar'
      ]
    };
  }

  return {
    plugins: [react(), crx({ manifest })]
  };
});
