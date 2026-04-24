import { useEffect, useState } from 'react';
import { connectGmail } from '../services/auth';
import { subscribeAssignments } from '../services/api';
import { storage } from '../services/storage';
import OnboardingScreen from './components/OnboardingScreen';
import Dashboard from './components/Dashboard';

const demoAssignments = [
  {
    id: 'a1',
    title: 'DBMS Assignment - Unit 4',
    subject: 'Database Systems',
    deadline: '2026-04-25T18:30:00.000Z',
    priority: 'high',
    confidence: 0.94,
    status: 'urgent',
    needsReview: false
  },
  {
    id: 'a2',
    title: 'Operating Systems Lab Record',
    subject: 'Operating Systems',
    deadline: '2026-04-27T09:00:00.000Z',
    priority: 'medium',
    confidence: 0.82,
    status: 'upcoming',
    needsReview: false
  },
  {
    id: 'a3',
    title: 'AI Seminar Topic Submission',
    subject: 'Artificial Intelligence',
    deadline: null,
    priority: 'high',
    confidence: 0.41,
    status: 'needs-review',
    needsReview: true
  }
];

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [assignments, setAssignments] = useState(demoAssignments);
  const [syncStatus, setSyncStatus] = useState(null);
  const [lastSyncResults, setLastSyncResults] = useState([]);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    async function loadState() {
      try {
        const [token, storedSyncStatus, storedResults] = await Promise.all([
          storage.get('gmailAuthToken'),
          storage.get('syncStatus'),
          storage.get('lastSyncResults')
        ]);

        setIsAuthenticated(Boolean(token));
        setSyncStatus(storedSyncStatus ?? null);
        setLastSyncResults(storedResults ?? []);
      } catch (error) {
        setAuthError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadState();

    function handleStorageChange(changes, areaName) {
      if (areaName !== 'local') {
        return;
      }

      if (changes.syncStatus) {
        setSyncStatus(changes.syncStatus.newValue ?? null);
      }

      if (changes.lastSyncResults) {
        setLastSyncResults(changes.lastSyncResults.newValue ?? []);
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return () => {};
    }

    return subscribeAssignments(
      (nextAssignments) => {
        if (nextAssignments.length) {
          setAssignments(nextAssignments);
        }
      },
      (error) => setAuthError(error.message)
    );
  }, [isAuthenticated]);

  async function handleConnect() {
    setIsLoading(true);
    setAuthError('');

    try {
      const result = await connectGmail();
      setIsAuthenticated(Boolean(result.accessToken));
      const storedSyncStatus = await storage.get('syncStatus');
      setSyncStatus(storedSyncStatus ?? null);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[600px] w-[400px] items-center justify-center bg-slate-950 text-sm text-slate-200">
        Loading AutoAssign AI...
      </div>
    );
  }

  return (
    <div className="h-[600px] w-[400px] overflow-hidden bg-slate-950 text-slate-50">
      {isAuthenticated ? (
        <Dashboard
          assignments={assignments}
          lastSyncResults={lastSyncResults}
          syncStatus={syncStatus}
        />
      ) : (
        <OnboardingScreen error={authError} onConnect={handleConnect} />
      )}
    </div>
  );
}
