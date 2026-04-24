# AutoAssign AI

AutoAssign AI is a Chrome extension plus Firebase backend that detects assignment deadlines from Gmail, stores them in Firestore, and reminds students before deadlines.

## Workspaces

- `extension/`: Chrome Extension (Manifest V3, React, Vite, Tailwind)
- `backend/`: Firebase backend (Functions, Firestore rules, indexes)

## Phase 1 Goal

Phase 1 establishes the monorepo, extension shell, backend scaffold, local storage wrapper, and dashboard UI with dummy data.

## Quick Start

1. Install dependencies from the repo root with `npm install`.
2. Start extension development with `npm run dev:extension`.
3. Load the generated extension build in Chrome after running a build.
4. Use the Firebase Emulator later when backend work starts.

## Manual Setup Still Needed

- Create a Firebase project and collect project configuration values.
- Create a Google OAuth client for the Chrome extension.
- Install workspace dependencies with `npm install`.
- Add real icon assets for Chrome Web Store submission.

