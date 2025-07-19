"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, Shield } from 'lucide-react';
import { sessionManager } from '@/lib/session-manager';
import { useUser } from '@/contexts/user-context';
import { format } from 'date-fns';

export function SessionStatus() {
  const { user, firebaseUser } = useUser();
  const [sessionValid, setSessionValid] = useState(false);
  const [timeSinceActivity, setTimeSinceActivity] = useState(0);
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);

  useEffect(() => {
    const updateSessionStatus = () => {
      if (sessionManager) {
        setSessionValid(sessionManager.isSessionValid());
        setTimeSinceActivity(sessionManager.getTimeSinceLastActivity());
      }
      
      // Get token expiry if available
      if (firebaseUser) {
        firebaseUser.getIdTokenResult().then((idTokenResult) => {
          setTokenExpiry(new Date(idTokenResult.expirationTime));
        }).catch(() => {
          setTokenExpiry(null);
        });
      }
    };

    updateSessionStatus();
    const interval = setInterval(updateSessionStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [firebaseUser]);

  const handleRefreshToken = async () => {
    if (sessionManager) {
      await sessionManager.forceTokenRefresh();
      // Update status after refresh
      setTimeout(() => {
        if (firebaseUser) {
          firebaseUser.getIdTokenResult().then((idTokenResult) => {
            setTokenExpiry(new Date(idTokenResult.expirationTime));
          });
        }
      }, 1000);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-green-400" />
          Session Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Session Valid:</span>
          <Badge variant={sessionValid ? "default" : "destructive"}>
            {sessionValid ? "Active" : "Expired"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Last Activity:</span>
          <span className="text-sm font-mono">
            {formatDuration(timeSinceActivity)} ago
          </span>
        </div>
        
        {tokenExpiry && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Token Expires:</span>
            <span className="text-xs font-mono">
              {format(tokenExpiry, 'MMM dd, HH:mm')}
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">User ID:</span>
          <span className="text-xs font-mono text-gray-500">
            {user.uid.slice(0, 8)}...
          </span>
        </div>
        
        <Button
          onClick={handleRefreshToken}
          variant="outline"
          size="sm"
          className="w-full border-gray-600 hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Session
        </Button>
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Sessions auto-refresh every 30 minutes</p>
          <p>• Max session time: 24 hours</p>
          <p>• Activity tracked for optimal performance</p>
        </div>
      </CardContent>
    </Card>
  );
}
