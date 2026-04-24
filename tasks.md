# AutoAssign AI - Implementation Tasks

This task list is derived from `AutoAssign_AI_Engineering_Plan.docx` and `DESIGN.md`. It covers the MVP end-to-end, including build, security, testing, Chrome Web Store readiness, and launch gates.

## 1. Project Setup and Repo Foundation

- [x] Set up the monorepo structure with separate `extension/` and `backend/` workspaces.
  - [x] Create the `extension/` workspace for the Chrome extension only.
  - [x] Create the `backend/` workspace for Firebase code only.
  - [x] Ensure extension and backend dependencies stay isolated.
  - [x] Add root-level documentation for workspace purpose and development flow.
- [x] Set up package management and scripts.
  - [x] Add install, dev, build, test, lint, and format scripts for each workspace.
  - [x] Add root commands to run workspace tasks conveniently.
  - [x] Standardize Node version and tooling expectations.
- [x] Configure development tooling.
  - [x] Set up ESLint.
  - [x] Set up Prettier.
  - [x] Set up Vitest.
  - [x] Add shared ignore files for build artifacts, secrets, and generated output.
- [x] Define environment configuration.
  - [x] Create `.env` templates for `extension/` and `backend/`.
  - [x] Document required variables for Firebase, Google OAuth, and OpenAI.
  - [x] Make sure secrets are never committed.

## 2. Extension Foundation (Manifest, Build, Structure)

- [x] Configure the extension build system with Vite and CRXJS or equivalent MV3-compatible setup.
  - [x] Ensure popup build output works with Manifest V3.
  - [x] Ensure background service worker is bundled correctly.
  - [x] Verify local development workflow and rebuild behavior.
- [x] Create `manifest.json` for Manifest V3.
  - [x] Add required permissions: `alarms`, `notifications`, `storage`, `identity`.
  - [x] Add required host permissions for Google APIs and Firebase endpoints.
  - [x] Configure `oauth2.client_id` and scopes for Gmail and Calendar.
  - [x] Configure popup entry.
  - [x] Configure background service worker as a module.
  - [x] Configure icons.
  - [x] Add CSP for extension pages.
  - [x] Ensure no unnecessary permissions are requested.
- [x] Create the extension folder architecture.
  - [x] Add popup app entry and HTML.
  - [x] Add background service worker entry.
  - [x] Add services layer.
  - [x] Add utils layer.
  - [x] Add public assets folder for icons and store assets.

## 3. Popup UI and UX Foundation

- [x] Build the popup shell UI in React with Tailwind CSS.
  - [x] Create the root app and auth gate flow.
  - [x] Create the onboarding screen for unauthenticated users.
  - [x] Create the dashboard shell for authenticated users.
  - [x] Match the fixed popup layout target (`400x600`) with header, filter bar, content area, and footer.
- [x] Build the header area.
  - [x] Add branding/logo area.
  - [x] Add manual sync button.
  - [x] Add settings entry point if included in MVP shell.
- [x] Build filtering and search UI.
  - [x] Add status tab filters for `Urgent`, `Upcoming`, `Overdue`, `Completed`.
  - [x] Add subject filter dropdown.
  - [ ] Add debounced search input.
- [x] Build the assignment list UI.
  - [x] Create `AssignmentCard`.
  - [x] Create `EmptyState`.
  - [ ] Add reminder indicators.
  - [x] Add confidence display.
  - [x] Add action buttons area.
- [x] Implement all assignment card states.
  - [x] Pending state.
  - [x] Urgent state.
  - [ ] Overdue state.
  - [ ] Completed state.
  - [x] Needs-review state for vague or missing deadlines.
  - [ ] Snoozed presentation state if surfaced in UI.
- [x] Build footer actions.
  - [x] Add `Delete all my data` action.
  - [x] Add privacy policy link.
- [ ] Add UI loading states.
  - [ ] Initial skeleton state.
  - [ ] Syncing state.
  - [ ] Processing/progress state for batch work if shown.
- [ ] Add user-friendly error states.
  - [ ] Offline state.
  - [ ] Auth expired / reconnect state.
  - [ ] API failure state.
  - [ ] No emails / no assignments state.

## 4. Local Storage and Offline Behavior

- [x] Implement `services/storage.js` as the only extension persistence layer.
  - [x] Add typed or well-defined `get`.
  - [x] Add `set`.
  - [x] Add `clear`.
  - [x] Add `getAll`.
  - [ ] Add defensive error handling for storage failures or quota issues.
- [ ] Define storage keys and cache strategy.
  - [ ] OAuth token storage.
  - [ ] Cached assignments list.
  - [ ] Last sync metadata.
  - [ ] User preferences.
  - [ ] Any reminder or notification metadata needed across service worker restarts.
- [ ] Implement offline-first behavior.
  - [ ] Show cached assignments when network is unavailable.
  - [ ] Avoid breaking popup rendering when backend requests fail.
  - [ ] Invalidate or refresh cache on sync completion, manual refresh, assignment update, and max age expiry.

## 5. Firebase Project and Backend Foundation

- [ ] Initialize the Firebase project.
  - [ ] Enable Firestore.
  - [ ] Enable Firebase Auth.
  - [ ] Enable Cloud Functions v2.
  - [ ] Choose the deployment region closest to India where appropriate.
- [x] Create the backend folder architecture.
  - [x] Add `functions/index.js`.
  - [x] Add auth functions.
  - [x] Add processing functions.
  - [x] Add dedup helpers.
  - [x] Add data deletion function.
- [ ] Configure backend environment and secrets.
  - [ ] Store `OPENAI_API_KEY` securely.
  - [ ] Configure Firebase project values.
  - [ ] Ensure no client secrets leak into extension code.

## 6. Firestore Schema, Rules, and Indexes

- [ ] Implement the `users` collection schema.
  - [ ] Store `uid`, `email`, `gmailSyncToken`, `timezone`, `createdAt`, and `lastSync`.
  - [ ] Add `preferences` structure if used in the implementation.
- [ ] Implement the `assignments` collection schema.
  - [ ] Store `userId`.
  - [ ] Store `dedupHash`.
  - [ ] Store `title`.
  - [ ] Store `deadline` in UTC.
  - [ ] Store `subject`.
  - [ ] Store `priority`.
  - [ ] Store `confidence`.
  - [ ] Store `status`.
  - [ ] Store `source`.
  - [ ] Store `sourceEmailId`.
  - [ ] Store `reminders`.
  - [ ] Store `calendarEventId` if calendar sync is enabled.
  - [ ] Store `needsReview`.
  - [ ] Store `createdAt` and `updatedAt` where applicable.
- [x] Write Firestore security rules.
  - [x] Restrict `users/{uid}` access to the authenticated owner only.
  - [x] Restrict assignment reads to the owner only.
  - [x] Restrict assignment creates to documents whose `userId` matches the authenticated user.
  - [x] Restrict assignment updates and deletes to the owner only.
  - [x] Validate presence and shape of critical fields such as `dedupHash`.
- [x] Define Firestore indexes.
  - [x] Composite index for `(userId, status, deadline)`.
  - [x] Composite index for `(userId, deadline)`.
  - [x] Index strategy for `dedupHash`.
- [ ] Test Firestore rules in the emulator before real deployment.

## 7. Authentication and Identity Flow

- [x] Implement extension-side Gmail OAuth in `services/auth.js`.
  - [x] Add `getAuthToken()` using `chrome.identity.getAuthToken`.
  - [x] Store Gmail OAuth token in `chrome.storage.local` only.
  - [x] Handle permission denial gracefully.
  - [ ] Handle offline state gracefully.
  - [x] Handle token expiry.
  - [x] Implement token refresh using `removeCachedAuthToken` and re-request flow.
  - [x] Implement sign-out and token cleanup flow.
- [x] Implement onboarding and permission explanation flow.
  - [x] Add pre-OAuth permission explanation screen.
  - [x] Add `Connect Gmail` button.
  - [x] Show onboarding only when no valid auth exists.
- [x] Implement backend custom auth token issuance.
  - [x] Verify Google identity token or chosen Google auth proof on the backend.
  - [x] Issue Firebase custom token with Admin SDK.
  - [x] Expose the endpoint/function securely.
- [x] Implement Firebase sign-in from the extension.
  - [ ] Exchange verified Google auth for Firebase custom token.
  - [ ] Sign in with `signInWithCustomToken`.
  - [x] Persist Firebase auth session separately from Gmail OAuth token handling.

## 8. Gmail Integration and Sync Engine

- [x] Implement Gmail API service methods in `services/gmail.js`.
  - [x] `fetchRecentEmails(token, maxResults=50)`.
  - [x] `fetchNewEmailsSince(token, historyId)`.
  - [x] `searchEmails(query)` if needed as a helper.
  - [x] `getEmailBody(messageId)`.
- [x] Implement the initial sync flow.
  - [x] Use the first-sync Gmail search query from the plan.
  - [x] Fetch the latest 50 candidate emails.
  - [x] Normalize returned email data into a consistent structure.
- [x] Implement incremental sync flow.
  - [x] Read stored Gmail `historyId` / `gmailSyncToken`.
  - [x] Use Gmail History API for subsequent syncs.
  - [x] Update the stored history token after a successful incremental sync.
- [x] Implement service worker sync triggers.
  - [x] Trigger initial sync on extension install where appropriate.
  - [x] Trigger sync from popup manual refresh.
  - [x] Trigger recurring sync every 30 minutes with `chrome.alarms`.
- [ ] Implement robust Gmail request handling.
  - [x] Retry once after token refresh on 401.
  - [ ] Handle rate limits and transient network failures.
  - [ ] Avoid duplicate processing due to retries or repeated history fetches.

## 9. Email Cleaning and Parsing Utilities

- [x] Implement email body cleaning in `utils/parser.js`.
  - [x] Strip HTML safely.
  - [x] Remove quoted reply blocks.
  - [x] Remove footers and signatures where possible.
  - [x] Truncate cleaned text to 2000 characters before AI submission.
- [x] Implement regex parsing as Layer 1.
  - [x] Detect `DD/MM/YYYY`.
  - [x] Detect `Month DD`.
  - [x] Detect `next [weekday]`.
  - [x] Detect `by [time]`.
  - [x] Detect `due [date]`.
  - [x] Return normalized result with confidence scoring.
- [x] Implement date utility helpers in `utils/dateUtils.js`.
  - [x] Parse relative dates using user timezone.
  - [x] Normalize all stored deadlines to UTC.
  - [x] Format deadlines for display in the user timezone.
  - [x] Compute time until deadline.
  - [x] Detect overdue status.

## 10. AI Extraction Pipeline

- [x] Implement `parseDeadline` Cloud Function.
  - [x] Use `gpt-4o-mini`.
  - [x] Use the exact extraction prompt from the engineering plan.
  - [x] Return structured JSON only.
  - [ ] Support multiple extracted deadlines from one email.
  - [x] Include user timezone and current date in the prompt context.
- [x] Implement the Layer 1 -> Layer 2 decision logic.
  - [x] Run regex parser first for every email.
  - [x] Skip AI call when regex confidence is above threshold.
  - [x] Send cleaned text to AI only when confidence is low or text is vague.
- [x] Implement `processEmail` orchestration function.
  - [x] Accept the user context, email id, and cleaned email content.
  - [x] Run regex parser.
  - [x] Run AI extractor when needed.
  - [x] Run edge-case handling.
  - [x] Run deduplication.
  - [x] Persist final assignment documents to Firestore.
- [x] Implement extension-to-backend API wrappers in `services/api.js`.
  - [x] Call `processEmail`.
  - [x] Fetch assignments.
  - [x] Update assignment status and fields.
  - [ ] Delete assignment if supported.
  - [x] Delete all user data.
  - [ ] Handle network errors, AI failures, and partial success cases.

## 11. Edge Cases and Deduplication

- [x] Implement deduplication helpers.
  - [x] Generate SHA-256 dedup hash from `userId + emailId + normalizedDeadline`.
  - [x] Check whether a matching assignment already exists.
  - [x] Skip duplicate writes during resync.
- [ ] Implement all required edge-case rules.
  - [ ] Multiple deadlines in one email create multiple assignment records.
  - [x] Vague text like `ASAP` or `soon` becomes high priority with `deadline=null`.
  - [x] Missing deadline with low confidence is handled according to plan rules.
  - [x] Duplicate emails are skipped without overwriting existing user-modified records.
  - [x] Timezone normalization is always applied.
- [x] Add explicit `needsReview` handling.
  - [x] Mark items with vague or null deadlines as `needsReview`.
  - [x] Surface them distinctly in the UI.

## 12. Dashboard Data Integration

- [x] Replace dummy assignment data with live Firestore data.
  - [x] Subscribe to assignment updates for the signed-in user.
  - [x] Apply filtering and sorting in a stable way.
  - [x] Keep local UI state in sync with realtime updates.
- [ ] Implement dashboard sorting and grouping rules.
  - [ ] Overdue first.
  - [ ] Then by deadline ascending.
  - [ ] Respect current status filters and search terms.
- [ ] Implement assignment actions from the popup.
  - [ ] Mark done.
  - [ ] Undo completion if supported.
  - [ ] Snooze.
  - [ ] Open Gmail thread for review.
  - [ ] Sync to Calendar.
- [ ] Reflect confidence, priority, and reminder state in the card UI.

## 13. Background Service Worker Behavior

- [ ] Implement `background.js` as the single MV3 service worker entry.
  - [ ] Avoid persistent in-memory state.
  - [ ] Read and write required state through `chrome.storage.local`.
  - [ ] Use `fetch()` only.
- [ ] Implement runtime event listeners.
  - [ ] `chrome.runtime.onInstalled`.
  - [ ] `chrome.alarms.onAlarm`.
  - [ ] `chrome.notifications.onButtonClicked`.
  - [ ] `chrome.identity.onSignInChanged` if used.
- [ ] Implement popup-to-background message handling.
  - [ ] `SYNC_NOW`.
  - [ ] `MARK_DONE`.
  - [ ] `SNOOZE`.
  - [ ] `DELETE_DATA`.
- [ ] Ensure service worker restart safety.
  - [ ] Persist anything needed to survive worker termination.
  - [ ] Reconstruct needed context on event wake-up.

## 14. Reminder Engine and Notifications

- [ ] Implement reminder scheduling logic in the background service worker.
  - [ ] Create alarms for 24 hours before deadline.
  - [ ] Create alarms for 3 hours before deadline.
  - [ ] Create alarms for 1 hour before deadline.
  - [ ] Skip alarms whose fire time is already in the past.
- [ ] Implement alarm naming and parsing convention.
  - [ ] Use `gmailSync` for recurring Gmail sync.
  - [ ] Use `reminder_{assignmentId}_{offset}` for assignment reminders.
- [ ] Implement notification creation.
  - [ ] Show urgency-based title copy for 24h, 3h, and 1h reminders.
  - [ ] Include assignment title and subject.
  - [ ] Set `requiresInteraction` for the 1-hour reminder if intended.
  - [ ] Add `Mark done` and `Snooze 30 min` buttons.
- [ ] Implement notification actions.
  - [ ] Mark done updates Firestore and local UI state.
  - [ ] Snooze schedules a new alarm 30 minutes later.
  - [ ] Completing an assignment clears existing reminder alarms.
- [ ] Implement reminder lookup behavior.
  - [ ] Fetch assignment details from local cache or backend safely on alarm fire.
  - [ ] Handle missing or already-completed assignments gracefully.

## 15. Google Calendar Sync

- [ ] Implement `services/calendar.js`.
  - [ ] Create calendar events through Google Calendar API.
  - [ ] Update existing calendar events if needed.
  - [ ] Delete calendar events if an assignment is unsynced or removed.
- [ ] Implement calendar event creation rules.
  - [ ] Only allow sync when a valid deadline exists.
  - [ ] Set title format to `[Subject] — [Title]`.
  - [ ] Set event start to the assignment deadline.
  - [ ] Set event end to deadline plus one hour.
  - [ ] Add a one-day reminder.
- [ ] Integrate calendar controls into the UI.
  - [ ] Add a `Sync to Calendar` toggle on assignment cards.
  - [ ] Show success state after sync.
  - [ ] Show recoverable error state on failure.
- [ ] Persist calendar linkage.
  - [ ] Save `calendarEventId` to the assignment document.

## 16. Data Deletion and Privacy Compliance

- [ ] Implement delete-all-data flow.
  - [ ] Create backend endpoint/function to delete user-owned data.
  - [ ] Delete user assignments.
  - [ ] Delete user document or clear required fields according to final policy.
  - [ ] Clear `chrome.storage.local`.
  - [ ] Remove or clear relevant alarms after deletion.
- [ ] Build the popup deletion entry point.
  - [ ] Add the delete action in the footer.
  - [ ] Add confirmation UX to prevent accidental deletion.
- [ ] Write and publish a privacy policy page.
  - [ ] Describe what data is collected.
  - [ ] State what is not collected.
  - [ ] State that data is not sold.
  - [ ] Explain how users can delete data.
  - [ ] Host it on Firebase Hosting or GitHub Pages.
- [ ] Link privacy policy everywhere required.
  - [ ] Popup UI.
  - [ ] Chrome Web Store listing.
  - [ ] Manifest or supporting materials if needed.

## 17. Security, Cost Controls, and Operational Safeguards

- [ ] Enforce token handling rules.
  - [ ] Never store Gmail access tokens in Firestore.
  - [ ] Never send Gmail OAuth tokens to Cloud Functions.
  - [ ] Never log tokens to the console.
- [ ] Enforce content handling rules.
  - [ ] Never send full raw email threads to the backend.
  - [ ] Only send cleaned and truncated content to AI/backend processing.
- [ ] Enforce MV3 constraints.
  - [ ] No DOM access in the service worker.
  - [ ] No persistent state in JS globals.
  - [ ] Use only supported MV3 APIs and patterns.
- [ ] Configure budget and spend controls.
  - [ ] Set Firebase budget alert at $5.
  - [ ] Set Firebase budget alert at $20.
  - [ ] Set OpenAI monthly spend cap to $10.
- [ ] Add safe logging and analytics conventions.
  - [ ] Avoid logging sensitive content.
  - [ ] Truncate or anonymize any event payloads.

## 18. Performance and Resilience

- [ ] Meet extension performance targets.
  - [ ] Popup load target under 500ms where possible.
  - [ ] Ensure service worker wake-up stays lightweight.
  - [ ] Keep UI responsive during sync.
- [ ] Optimize sync and backend performance.
  - [ ] Initial sync for 50 emails should complete within target time.
  - [ ] Keep Cloud Function cold starts under acceptable limits.
  - [ ] Avoid unnecessary Firestore reads and writes.
- [ ] Implement resilience patterns.
  - [ ] Retry with exponential backoff for transient failures.
  - [ ] Handle offline mode cleanly.
  - [ ] Handle API rate limiting.
  - [ ] Handle storage quota issues.

## 19. Analytics and Monitoring

- [ ] Define analytics events and metrics.
  - [ ] Sync completed.
  - [ ] Parse failed.
  - [ ] Assignments detected.
  - [ ] Notification interactions.
  - [ ] Calendar sync adoption.
- [ ] Track operational metrics.
  - [ ] Sync duration.
  - [ ] Error rate.
  - [ ] API latency.
  - [ ] AI parsing success rate.
  - [ ] Regex vs AI usage ratio.
  - [ ] Cost metrics across OpenAI and Firebase.
- [ ] Configure alerts.
  - [ ] Critical alerts for error spikes, latency spikes, crashes, and cost spikes.
  - [ ] Warning alerts for sync failures, low confidence averages, and quota pressure.

## 20. Testing

- [x] Write unit tests for parsing and date utilities.
  - [x] Add at least 15 regex parser test cases.
  - [x] Cover explicit dates.
  - [x] Cover relative dates.
  - [x] Cover vague wording.
  - [x] Cover missing deadlines.
  - [x] Cover timezone normalization.
  - [ ] Cover multi-deadline extraction behavior where testable.
- [ ] Write unit tests for UI logic.
  - [x] Dashboard sorting logic.
  - [ ] Assignment card rendering across all states.
  - [ ] Conditional action rendering.
- [ ] Write unit tests for storage and service helpers.
  - [ ] Storage get/set/clear behavior.
  - [ ] Error paths.
  - [ ] Token refresh handling where testable.
- [ ] Run integration tests for critical flows.
  - [ ] Auth flow.
  - [ ] Initial sync flow.
  - [ ] Incremental sync flow.
  - [ ] Deduplication flow.
  - [ ] Reminder scheduling and notification actions.
  - [ ] Calendar sync flow.
  - [ ] Data deletion flow.
- [ ] Complete manual test matrix.
  - [ ] Chrome stable.
  - [ ] Chrome Canary.
  - [ ] Edge (Chromium).
  - [ ] At least 5 Gmail account types or profiles.
  - [ ] Offline mode.
  - [ ] Zero-email case.
  - [ ] 100+ email case.
  - [ ] Error-state validation.

## 21. Build, Packaging, and Chrome Web Store Readiness

- [ ] Finalize release build behavior.
  - [ ] Produce clean extension `dist/` output.
  - [ ] Ensure no `.env` files are bundled.
  - [ ] Ensure no unnecessary source maps or development artifacts are shipped if not desired.
- [ ] Prepare Chrome Web Store assets.
  - [ ] Icons in required sizes.
  - [ ] Screenshots at required dimensions.
  - [ ] Promotional tile if required.
  - [ ] Store listing copy.
- [ ] Prepare submission requirements.
  - [ ] Verify Manifest V3 compliance.
  - [ ] Verify single-purpose justification.
  - [ ] Verify permissions are clearly justified.
  - [ ] Verify privacy policy is live.
  - [ ] Verify data deletion is implemented.
  - [ ] Verify no obfuscated code.
- [ ] Package and submit.
  - [ ] Build the extension.
  - [ ] Zip the production `dist/` folder only.
  - [ ] Submit to Chrome Web Store.
  - [ ] Track review feedback and required fixes.

## 22. Launch Gates / Definition of Done

- [ ] Firestore security rules are deployed and emulator-tested.
- [ ] OAuth tokens are stored only in `chrome.storage.local`.
- [ ] Deduplication prevents duplicate assignments on re-sync.
- [ ] All required edge cases are handled: vague text, no deadline, duplicate, multi-deadline, timezone.
- [ ] Parser tests cover at least 15 meaningful cases.
- [ ] Privacy policy is live and linked correctly.
- [ ] Delete-all-data flow is implemented and tested.
- [ ] OpenAI spend cap and Firebase budget alerts are configured.
- [ ] Extension is tested on Chrome stable, Chrome Canary, and Edge.
- [ ] Onboarding explains Gmail permission before OAuth starts.
- [ ] Offline, API failure, and empty states all show user-friendly messages.
- [ ] Production build output is clean and ready for store upload.

## 23. Post-MVP Backlog

- [ ] v1.5: PDF attachment parsing with `pdf.js` and OCR where needed.
- [ ] v2.0: Google Classroom integration with separate OAuth scope and verification planning.
- [ ] v2.5: Full web dashboard using a shared Firebase backend.
- [ ] v3.0: AI study planner based on deadlines and Google Calendar availability.
- [ ] v3.5: Mobile app with shared backend and push notifications.
