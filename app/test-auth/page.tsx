'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function TestAuthPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localStorageData, setLocalStorageData] = useState<any>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSessionInfo(data);
        console.log('Session data:', data);
        
        // Get localStorage data
        if (typeof window !== 'undefined') {
          const storageData = {
            auth_redirect: localStorage.getItem('auth_redirect'),
            auth_user_id: localStorage.getItem('auth_user_id'),
            supabase_auth_token: localStorage.getItem('supabase.auth.token')
          };
          setLocalStorageData(storageData);
          console.log('localStorage data:', storageData);
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    
    checkSession();
  }, []);
  
  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Clear localStorage
      localStorage.removeItem('auth_redirect');
      localStorage.removeItem('auth_user_id');
      
      // Refresh the page to update session info
      window.location.reload();
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Auth Test Page</h1>
      
      {loading ? (
        <div>Loading session information...</div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-800 rounded-md mb-4">
          Error: {error}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-gray-100 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Session Information</h2>
            <pre className="whitespace-pre-wrap bg-gray-800 text-gray-200 p-4 rounded-md overflow-auto max-h-96">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </div>
          
          {localStorageData && (
            <div className="p-4 bg-gray-100 rounded-md">
              <h2 className="text-lg font-semibold mb-2">localStorage Data</h2>
              <pre className="whitespace-pre-wrap bg-gray-800 text-gray-200 p-4 rounded-md overflow-auto max-h-96">
                {JSON.stringify(localStorageData, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="flex gap-4 flex-wrap">
            {sessionInfo?.session ? (
              <>
                <Button onClick={handleGoToDashboard}>
                  Go to Dashboard
                </Button>
                <Button variant="destructive" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={() => window.location.href = '/auth'}>
                Go to Login
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 