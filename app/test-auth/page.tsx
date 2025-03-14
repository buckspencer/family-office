'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/hooks/useSession';

export default function TestAuth() {
  const { user, isLoading, error } = useSession();
  const [apiSession, setApiSession] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Test the API endpoint
  const fetchApiSession = async () => {
    setApiLoading(true);
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      setApiSession(data);
    } catch (err) {
      console.error('Error fetching API session:', err);
      setApiError('Failed to fetch session from API');
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Client-Side Session (useSession hook)</h2>
        {isLoading ? (
          <p>Loading session...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : user ? (
          <div className="bg-green-100 p-4 rounded">
            <p className="font-medium">Authenticated as:</p>
            <pre className="bg-gray-100 p-2 mt-2 rounded overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="bg-yellow-100 p-4 rounded">Not authenticated</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Server API Session Test</h2>
        <button
          onClick={fetchApiSession}
          disabled={apiLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {apiLoading ? 'Loading...' : 'Test API Session'}
        </button>
        
        {apiError && (
          <p className="text-red-500 mt-2">{apiError}</p>
        )}
        
        {apiSession && (
          <div className="mt-4">
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(apiSession, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 