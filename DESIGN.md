# AutoAssign AI - Complete System Design Document

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Component Design](#component-design)
3. [Data Flow](#data-flow)
4. [UI/UX Design](#uiux-design)
5. [Security Design](#security-design)
6. [Performance Design](#performance-design)
7. [Error Handling Design](#error-handling-design)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Extension                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Popup UI   │  │  Background  │  │   Services   │      │
│  │   (React)    │◄─┤Service Worker│◄─┤   Layer      │      │
│  └──────────────┘  └──────┬───────┘  └──────┬───────┘      │
│                            │                  │              │
└────────────────────────────┼──────────────────┼──────────────┘
                             │                  │
                    ┌────────▼──────────┐      │
                    │  chrome.* APIs    │      │
                    │  - alarms         │      │
                    │  - notifications  │      │
                    │  - identity       │      │
                    │  - storage.local  │      │
                    └───────────────────┘      │
                                               │
        ┌──────────────────────────────────────┼──────────────┐
        │                                      │              │
   ┌────▼─────┐                          ┌────▼─────┐       │
   │  Gmail   │                          │ Google   │       │
   │   API    │                          │ Calendar │       │
   └──────────┘                          │   API    │       │
                                         └──────────┘       │
                                                            │
┌───────────────────────────────────────────────────────────┼──┐
│                    Firebase Backend                       │  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  Firestore   │  │Cloud Functions│  │Firebase Auth │  │  │
│  │   Database   │◄─┤   - parse    │◄─┤              │◄─┘  │
│  │              │  │   - dedup    │  │              │     │
│  │              │  │   - custom   │  │              │     │
│  │              │  │     token    │  │              │     │
│  └──────────────┘  └──────┬───────┘  └──────────────┘     │
│                            │                               │
│                     ┌──────▼───────┐                       │
│                     │   OpenAI     │                       │
│                     │ gpt-4o-mini  │                       │
│                     └──────────────┘                       │
└───────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack Details

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Extension UI | React | 18.x | Component-based UI |
| Styling | Tailwind CSS | 3.x | Utility-first styling |
| Build Tool | Vite | 5.x | Fast bundling |
| Extension Plugin | CRXJS | Latest | MV3 support |
| Backend | Firebase | Latest | Serverless backend |
| Database | Firestore | Latest | NoSQL document store |
| Functions | Cloud Functions v2 | Latest | Serverless compute |
| Auth | Firebase Auth | Latest | User authentication |
| AI | OpenAI gpt-4o-mini | Latest | Deadline extraction |
| Testing | Vitest | Latest | Unit testing |
| Linting | ESLint | 8.x | Code quality |
| Formatting | Prettier | 3.x | Code formatting |

---

## 2. Component Design

### 2.1 Extension Components

#### 2.1.1 Popup UI Components

```
Popup (App.jsx)
├── AuthGate
│   ├── OnboardingScreen (if not authenticated)
│   └── Dashboard (if authenticated)
│       ├── Header
│       │   ├── Logo
│       │   ├── SyncButton
│       │   └── SettingsButton
│       ├── FilterBar
│       │   ├── TabFilter (Urgent/Upcoming/Overdue/Completed)
│       │   ├── SubjectFilter (dropdown)
│       │   └── SearchInput
│       ├── AssignmentList
│       │   ├── AssignmentCard (repeated)
│       │   │   ├── StatusBadge
│       │   │   ├── PriorityIndicator
│       │   │   ├── Title
│       │   │   ├── Subject
│       │   │   ├── Deadline
│       │   │   ├── ConfidenceScore
│       │   │   ├── ActionButtons
│       │   │   │   ├── MarkDoneButton
│       │   │   │   ├── SnoozeButton
│       │   │   │   ├── CalendarSyncToggle
│       │   │   │   └── ViewEmailButton
│       │   │   └── ReminderIndicators
│       │   └── EmptyState (if no assignments)
│       └── Footer
│           ├── DataDeletionButton
│           └── PrivacyPolicyLink
```

#### 2.1.2 Background Service Worker

```javascript
// background.js - Single file architecture
// NO persistent state - everything in chrome.storage.local

// Event Listeners
chrome.runtime.onInstalled → triggerInitialSync()
chrome.alarms.onAlarm → handleAlarm(alarm)
chrome.notifications.onButtonClicked → handleNotificationAction(notificationId, buttonIndex)
chrome.identity.onSignInChanged → handleAuthChange()

// Alarm Types
- 'gmailSync' → runs every 30 minutes
- 'reminder_{assignmentId}_{offset}' → individual reminders

// Message Handlers (from popup)
- 'SYNC_NOW' → fetchAndProcessEmails()
- 'MARK_DONE' → updateAssignmentStatus()
- 'SNOOZE' → createSnoozeAlarm()
- 'DELETE_DATA' → deleteAllUserData()
```

#### 2.1.3 Services Layer

```
services/
├── auth.js
│   ├── getAuthToken() → chrome.identity.getAuthToken
│   ├── refreshToken() → handle 401 errors
│   ├── signInToFirebase() → custom token exchange
│   └── signOut() → clear all tokens
│
├── gmail.js
│   ├── fetchRecentEmails(token, maxResults)
│   ├── fetchNewEmailsSince(token, historyId)
│   ├── searchEmails(query)
│   └── getEmailBody(messageId)
│
├── api.js
│   ├── processEmail(userId, emailData)
│   ├── getAssignments(userId, filters)
│   ├── updateAssignment(assignmentId, updates)
│   ├── deleteAssignment(assignmentId)
│   └── deleteAllUserData(userId)
│
├── calendar.js
│   ├── syncToCalendar(assignment)
│   ├── updateCalendarEvent(eventId, updates)
│   └── deleteCalendarEvent(eventId)
│
└── storage.js
    ├── get(key)
    ├── set(key, value)
    ├── clear()
    └── getAll()
```

#### 2.1.4 Utils Layer

```
utils/
├── parser.js
│   ├── extractDeadlineRegex(text) → Layer 1 parsing
│   ├── cleanEmailBody(html)
│   ├── removeQuotedText(text)
│   └── truncateText(text, maxLength)
│
└── dateUtils.js
    ├── parseRelativeDate(text, timezone)
    ├── normalizeToUTC(date, timezone)
    ├── formatDeadline(timestamp, timezone)
    ├── getTimeUntilDeadline(timestamp)
    └── isOverdue(timestamp)
```

### 2.2 Backend Components

#### 2.2.1 Cloud Functions

```
functions/
├── index.js (exports all functions)
│
├── auth/
│   └── createCustomToken.js
│       - Verifies Google ID token
│       - Issues Firebase custom token
│       - HTTP callable function
│
├── processing/
│   ├── parseDeadline.js
│   │   - Receives cleaned email body
│   │   - Calls OpenAI API
│   │   - Returns structured JSON
│   │   - HTTP callable function
│   │
│   └── processEmail.js
│       - Orchestrates full pipeline
│       - Regex → AI → Dedup → Save
│       - HTTP callable function
│
├── dedup/
│   └── dedup.js
│       - generateDedupHash(userId, emailId, deadline)
│       - checkDuplicate(hash)
│       - SHA-256 implementation
│
└── data/
    └── deleteUserData.js
        - Deletes all user documents
        - Clears assignments
        - HTTP callable function
```

#### 2.2.2 Firestore Collections

```
users/
  {uid}/
    - email: string
    - gmailSyncToken: string (historyId)
    - timezone: string
    - createdAt: timestamp
    - lastSync: timestamp
    - preferences: object
      - notificationsEnabled: boolean
      - syncInterval: number
      - defaultReminders: array

assignments/
  {autoId}/
    - id: string
    - userId: string (indexed)
    - dedupHash: string (unique indexed)
    - title: string
    - deadline: timestamp (indexed)
    - subject: string
    - priority: enum
    - confidence: number
    - status: enum (indexed)
    - source: enum
    - sourceEmailId: string
    - reminders: array<number>
    - calendarEventId: string (nullable)
    - needsReview: boolean
    - createdAt: timestamp
    - updatedAt: timestamp
```

---

## 3. Data Flow

### 3.1 Initial Sync Flow

```
1. User clicks "Connect Gmail"
   ↓
2. chrome.identity.getAuthToken (OAuth consent)
   ↓
3. Store token in chrome.storage.local
   ↓
4. Exchange for Firebase custom token
   ↓
5. Sign in to Firebase Auth
   ↓
6. Fetch last 50 emails from Gmail API
   ↓
7. For each email:
   a. Clean email body
   b. Send to processEmail function
   c. Regex parse (Layer 1)
   d. If confidence < 0.8 → AI parse (Layer 2)
   e. Edge case handling (Layer 3)
   f. Check dedup hash
   g. Save to Firestore
   ↓
8. Store historyId in users collection
   ↓
9. Schedule chrome.alarms for reminders
   ↓
10. Update popup UI with real-time listener
```

### 3.2 Incremental Sync Flow

```
Every 30 minutes (chrome.alarms):
1. Get stored historyId from Firestore
   ↓
2. Call Gmail History API
   ↓
3. Get only new/modified messages
   ↓
4. Process each new email (same as steps 7a-7g above)
   ↓
5. Update historyId
   ↓
6. Schedule new reminders if needed
```

### 3.3 Reminder Flow

```
chrome.alarms fires:
1. Parse alarm name → get assignmentId + offset
   ↓
2. Fetch assignment from chrome.storage.local cache
   ↓
3. Create chrome.notification with:
   - Title: deadline urgency
   - Body: assignment title + subject
   - Buttons: "Mark Done" | "Snooze 30 min"
   ↓
4. User clicks button:
   - Mark Done → update Firestore status → clear all alarms
   - Snooze → create new alarm for +30 min
```

### 3.4 Calendar Sync Flow

```
User toggles "Sync to Calendar":
1. Check if assignment has valid deadline
   ↓
2. Call Google Calendar API with token
   ↓
3. Create event:
   - Summary: [Subject] — [Title]
   - Start: deadline timestamp
   - End: deadline + 1 hour
   - Reminder: 1 day before
   ↓
4. Store calendarEventId in Firestore
   ↓
5. Show success indicator in UI
```

---

## 4. UI/UX Design

### 4.1 Color Scheme

```css
/* Tailwind config */
colors: {
  primary: '#4F46E5',      // Indigo-600
  secondary: '#10B981',    // Green-500
  danger: '#EF4444',       // Red-500
  warning: '#F59E0B',      // Amber-500
  
  status: {
    urgent: '#DC2626',     // Red-600
    upcoming: '#3B82F6',   // Blue-500
    overdue: '#991B1B',    // Red-900
    completed: '#059669',  // Green-600
    needsReview: '#D97706' // Amber-600
  },
  
  priority: {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#6B7280'
  }
}
```

### 4.2 Component States

#### AssignmentCard States
```
1. Pending (default)
   - White background
   - Blue left border
   - All actions enabled

2. Urgent (< 24 hours)
   - Red left border
   - Pulsing animation
   - "🔴 Due soon" badge

3. Overdue
   - Red background (light)
   - Red text
   - "⚠️ Overdue" badge
   - Only "Mark Done" action

4. Completed
   - Green checkmark
   - Strikethrough text
   - Collapsed view
   - "Undo" action

5. Needs Review (vague deadline)
   - Yellow left border
   - "⚠️ No deadline found" badge
   - "Review in Gmail" button
```

### 4.3 Responsive Layout

```
Popup dimensions: 400px × 600px (fixed)

Layout:
- Header: 60px (fixed)
- FilterBar: 50px (fixed)
- AssignmentList: flex-1 (scrollable)
- Footer: 40px (fixed)

Card spacing: 12px gap
Card padding: 16px
Border radius: 8px
```

### 4.4 Loading States

```
1. Initial load: Skeleton cards (3 placeholders)
2. Syncing: Spinner on sync button + "Syncing..." text
3. Processing: Progress bar for batch operations
4. Empty state: Illustration + "No assignments found"
```

### 4.5 Error States

```
1. No internet: "📡 Offline - showing cached data"
2. Auth error: "🔒 Please reconnect Gmail"
3. API error: "⚠️ Something went wrong - try again"
4. No emails: "📭 No assignments detected yet"
```

---

## 5. Security Design

### 5.1 Token Management

```
CRITICAL RULES:
✓ Gmail OAuth token → chrome.storage.local ONLY
✓ Firebase Auth token → managed by Firebase SDK
✗ NEVER store tokens in Firestore
✗ NEVER send tokens to Cloud Functions
✗ NEVER log tokens to console
```

### 5.2 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    
    // Users can only read/write their own user document
    match /users/{uid} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == uid;
    }
    
    // Users can only access their own assignments
    match /assignments/{docId} {
      allow read: if request.auth != null 
                  && request.auth.uid == resource.data.userId;
      
      allow create: if request.auth != null 
                    && request.auth.uid == request.resource.data.userId
                    && request.resource.data.dedupHash is string;
      
      allow update: if request.auth != null 
                    && request.auth.uid == resource.data.userId;
      
      allow delete: if request.auth != null 
                    && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 5.3 Content Security Policy

```json
// manifest.json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'"
}
```

### 5.4 Data Privacy

```
Data collected:
✓ Email metadata (subject, date, sender)
✓ Email body content (processed locally, truncated)
✓ User timezone
✓ Assignment data (extracted deadlines)

Data NOT collected:
✗ Full email content
✗ Email attachments
✗ Contact lists
✗ Personal information beyond email address

Data retention:
- Assignments: until user deletes
- Email metadata: not stored (only processed)
- User data: deleted on request
```

---

## 6. Performance Design

### 6.1 Optimization Strategies

#### 6.1.1 Extension Performance

```
1. Service Worker Optimization
   - No persistent state
   - Minimal memory footprint
   - Fast wake-up time (<100ms)

2. Popup Performance
   - Virtual scrolling for >50 assignments
   - Lazy load images
   - Debounced search (300ms)
   - Memoized components

3. Storage Strategy
   - Cache assignments in chrome.storage.local
   - Sync with Firestore in background
   - Offline-first approach
```

#### 6.1.2 Backend Performance

```
1. Firestore Optimization
   - Composite indexes:
     * (userId, status, deadline)
     * (userId, deadline)
     * (dedupHash) - unique
   
2. Cloud Function Optimization
   - Cold start: <2s (Node.js 20)
   - Warm execution: <500ms
   - Timeout: 60s
   - Memory: 256MB

3. AI Cost Optimization
   - Regex first (60% of emails)
   - Prompt caching enabled
   - Max 2000 chars per request
   - Batch processing (future)
```

### 6.2 Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| Popup load time | <500ms | <1s |
| Sync 50 emails | <5s | <10s |
| AI parsing per email | <1s | <3s |
| Notification delay | <100ms | <500ms |
| Firestore query | <200ms | <1s |
| Service worker wake | <100ms | <300ms |

### 6.3 Caching Strategy

```
chrome.storage.local cache:
- assignments: full list (max 500)
- lastSync: timestamp
- authToken: OAuth token
- userPreferences: settings object

Cache invalidation:
- On sync completion
- On manual refresh
- On assignment update
- Every 30 minutes (max age)
```

---

## 7. Error Handling Design

### 7.1 Error Categories

```
1. Network Errors
   - No internet connection
   - API timeout
   - Rate limiting

2. Auth Errors
   - Token expired
   - Permission denied
   - User revoked access

3. Data Errors
   - Invalid email format
   - Parsing failure
   - Duplicate detection

4. System Errors
   - Service worker crash
   - Storage quota exceeded
   - Firestore write failure
```

### 7.2 Error Handling Strategy

```javascript
// Retry logic with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}

// Error recovery
const errorHandlers = {
  'auth/token-expired': () => refreshToken(),
  'network/offline': () => showOfflineMode(),
  'quota/exceeded': () => clearOldCache(),
  'api/rate-limit': () => scheduleRetry(60000)
};
```

### 7.3 User-Facing Error Messages

```javascript
const errorMessages = {
  // Network
  'OFFLINE': 'You\'re offline. Showing cached assignments.',
  'TIMEOUT': 'Request timed out. Please try again.',
  
  // Auth
  'AUTH_EXPIRED': 'Session expired. Please reconnect Gmail.',
  'AUTH_DENIED': 'Gmail permission denied. Extension won\'t work without it.',
  
  // Data
  'PARSE_FAILED': 'Couldn\'t extract deadline from this email.',
  'SYNC_FAILED': 'Sync failed. Will retry in 30 minutes.',
  
  // System
  'STORAGE_FULL': 'Storage full. Please delete old assignments.',
  'UNKNOWN': 'Something went wrong. Please try again.'
};
```

### 7.4 Logging Strategy

```javascript
// Development: console.log
// Production: Firebase Analytics events

const logLevels = {
  ERROR: 'error',    // Critical failures
  WARN: 'warn',      // Recoverable issues
  INFO: 'info',      // Important events
  DEBUG: 'debug'     // Detailed debugging
};

// Example events
analytics.logEvent('sync_completed', {
  emailCount: 50,
  newAssignments: 3,
  duration: 4200
});

analytics.logEvent('parse_failed', {
  confidence: 0.3,
  emailSubject: '[truncated]',
  errorType: 'vague_deadline'
});
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

```
utils/parser.test.js
- 15+ test cases for regex patterns
- Edge cases: vague text, no deadline, multiple dates
- Timezone handling

utils/dateUtils.test.js
- Relative date parsing
- UTC normalization
- Overdue detection

services/storage.test.js
- Get/set/clear operations
- Error handling

components/AssignmentCard.test.js
- All 5 status states
- Button interactions
- Conditional rendering
```

### 8.2 Integration Tests

```
1. Auth flow
   - OAuth consent
   - Token refresh
   - Firebase sign-in

2. Sync flow
   - Initial sync (50 emails)
   - Incremental sync
   - Deduplication

3. Reminder flow
   - Alarm scheduling
   - Notification display
   - Action handling

4. Calendar sync
   - Event creation
   - Event update
   - Event deletion
```

### 8.3 Manual Testing Checklist

```
□ Test on Chrome stable
□ Test on Chrome Canary
□ Test on Edge (Chromium)
□ Test with 5 different Gmail accounts
□ Test offline mode
□ Test with 0 emails
□ Test with 100+ emails
□ Test all notification actions
□ Test calendar sync
□ Test data deletion
□ Test privacy policy link
□ Test all error states
```

---

## 9. Deployment Design

### 9.1 Build Process

```bash
# Extension build
cd extension
npm run build
# Output: dist/ folder

# Backend deploy
cd backend
firebase deploy --only functions,firestore
```

### 9.2 Environment Variables

```
# extension/.env
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_GOOGLE_CLIENT_ID=xxx

# backend/.env
OPENAI_API_KEY=xxx
FIREBASE_PROJECT_ID=xxx
```

### 9.3 Chrome Web Store Submission

```
Required assets:
- Icon: 16×16, 48×48, 128×128 (PNG)
- Screenshots: 1280×800 (5 images)
- Promotional tile: 440×280 (PNG)
- Privacy policy URL
- Store listing copy (132 chars)

Review checklist:
□ Manifest V3 compliant
□ Privacy policy live
□ Data deletion implemented
□ Permissions justified
□ No obfuscated code
□ Single purpose
```

---

## 10. Monitoring & Analytics

### 10.1 Key Metrics

```
User Metrics:
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Retention rate (D1, D7, D30)
- Churn rate

Feature Metrics:
- Emails synced per user
- Assignments detected per user
- AI parsing success rate
- Regex vs AI usage ratio
- Calendar sync adoption
- Notification click-through rate

Performance Metrics:
- Sync duration (p50, p95, p99)
- API latency
- Error rate
- Crash rate

Cost Metrics:
- OpenAI API spend
- Firebase read/write operations
- Cloud Function invocations
```

### 10.2 Alerts

```
Critical Alerts (PagerDuty):
- Error rate > 5%
- API latency > 5s
- Crash rate > 1%
- Cost spike > $50/day

Warning Alerts (Email):
- Sync failure rate > 10%
- AI parsing confidence < 0.6 (avg)
- Storage quota > 80%
```

---

## 11. Future Enhancements

### 11.1 v1.5 - PDF Parsing
- Extract deadlines from PDF attachments
- Use pdf.js in background worker
- OCR for scanned PDFs

### 11.2 v2.0 - Google Classroom
- OAuth scope: classroom.courses.readonly
- Fetch assignments from Classroom API
- Unified deadline view

### 11.3 v2.5 - Web Dashboard
- Next.js web app
- Shared Firebase backend
- Full-screen calendar view
- Analytics dashboard

### 11.4 v3.0 - AI Study Planner
- Analyze all deadlines
- Generate revision schedule
- Integrate with Google Calendar free/busy
- Smart time blocking

### 11.5 v3.5 - Mobile App
- React Native
- FCM notifications
- Shared Firebase backend
- iOS + Android

---

## 12. Design Decisions & Rationale

### 12.1 Why Chrome Extension?
- Zero install friction
- Direct Gmail access
- Native notifications
- Cross-platform (Windows, Mac, Linux)

### 12.2 Why Firebase?
- No DevOps burden
- Real-time sync
- Free tier covers early users
- Scalable to millions

### 12.3 Why gpt-4o-mini?
- 20x cheaper than GPT-4
- Fast inference (<1s)
- Good enough for deadline extraction
- Prompt caching support

### 12.4 Why Regex First?
- 60% of emails have explicit dates
- Free (no API cost)
- Instant (<10ms)
- Reduces AI dependency

### 12.5 Why Service Worker?
- Manifest V3 requirement
- Event-driven (low memory)
- Persistent alarms
- Background sync

---

**End of Design Document**
