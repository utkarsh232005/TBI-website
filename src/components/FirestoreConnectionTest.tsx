"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface TestResult {
  operation: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: string;
}

export default function FirestoreConnectionTest() {
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const updateTestResult = (operation: string, status: 'pending' | 'success' | 'error', message: string, details?: string) => {
    setTestResults(prev => {
      const existingIndex = prev.findIndex(r => r.operation === operation);
      const newResult = { operation, status, message, details };
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newResult;
        return updated;
      } else {
        return [...prev, newResult];
      }
    });
  };

  const runFirestoreTest = async () => {
    setIsTestRunning(true);
    setTestResults([]);

    // Test 1: Read from evaluation_rounds collection
    try {
      updateTestResult('read', 'pending', 'Testing read permissions...');
      
      const evaluationRef = collection(db, 'evaluation_rounds');
      const snapshot = await getDocs(evaluationRef);
      
      updateTestResult('read', 'success', `Successfully read ${snapshot.docs.length} documents`, 
        `Collection exists and is readable. Found ${snapshot.docs.length} evaluation rounds.`);
    } catch (error: any) {
      updateTestResult('read', 'error', 'Read permission failed', error.message);
    }

    // Test 2: Write to evaluation_rounds collection
    try {
      updateTestResult('write', 'pending', 'Testing write permissions...');
      
      const evaluationRef = collection(db, 'evaluation_rounds');
      const testDoc = await addDoc(evaluationRef, {
        roundName: 'Connection Test Round',
        description: 'This is a test document to verify write permissions',
        scheduledAt: new Date(),
        status: 'test',
        createdAt: new Date(),
        isTestDocument: true
      });
      
      updateTestResult('write', 'success', 'Write permission successful', 
        `Test document created with ID: ${testDoc.id}`);

      // Test 3: Delete the test document
      try {
        updateTestResult('delete', 'pending', 'Testing delete permissions...');
        
        await deleteDoc(doc(db, 'evaluation_rounds', testDoc.id));
        
        updateTestResult('delete', 'success', 'Delete permission successful', 
          'Test document cleaned up successfully');
      } catch (error: any) {
        updateTestResult('delete', 'error', 'Delete permission failed', error.message);
      }
      
    } catch (error: any) {
      updateTestResult('write', 'error', 'Write permission failed', error.message);
    }

    // Test 4: Notifications collection
    try {
      updateTestResult('notifications', 'pending', 'Testing notifications collection...');
      
      const notificationRef = collection(db, 'notifications');
      const testNotification = await addDoc(notificationRef, {
        type: 'connection_test',
        title: 'Connection Test',
        message: 'Testing notifications collection permissions',
        createdAt: new Date(),
        read: false,
        isTestDocument: true
      });
      
      // Clean up test notification
      await deleteDoc(doc(db, 'notifications', testNotification.id));
      
      updateTestResult('notifications', 'success', 'Notifications collection accessible', 
        'Can read, write, and delete from notifications collection');
        
    } catch (error: any) {
      updateTestResult('notifications', 'error', 'Notifications collection failed', error.message);
    }

    setIsTestRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-300 bg-yellow-900/20 border-yellow-700';
      case 'success':
        return 'text-green-300 bg-green-900/20 border-green-700';
      case 'error':
        return 'text-red-300 bg-red-900/20 border-red-700';
      default:
        return 'text-gray-300 bg-gray-900/20 border-gray-700';
    }
  };

  const allTestsPassed = testResults.length > 0 && testResults.every(r => r.status === 'success');
  const hasErrors = testResults.some(r => r.status === 'error');

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 text-white rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <AlertTriangle className="w-6 h-6 mr-2 text-yellow-500" />
          Firestore Connection Test
        </h2>
        <p className="text-gray-400">
          Test your Firestore rules and connection before using the evaluation system
        </p>
      </div>

      <div className="mb-6">
        <Button
          onClick={runFirestoreTest}
          disabled={isTestRunning}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
        >
          {isTestRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Firestore Tests'
          )}
        </Button>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-3">Test Results:</h3>
          
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getStatusIcon(result.status)}
                  <span className="ml-2 font-medium capitalize">{result.operation} Test</span>
                </div>
                <span className="text-sm opacity-75">
                  {result.status === 'pending' ? 'Running...' : 
                   result.status === 'success' ? 'Passed' : 'Failed'}
                </span>
              </div>
              
              <p className="text-sm mb-2">{result.message}</p>
              
              {result.details && (
                <div className="text-xs opacity-75 bg-black/20 p-2 rounded">
                  {result.details}
                </div>
              )}
            </div>
          ))}

          {!isTestRunning && (
            <div className={`p-4 rounded-lg border mt-6 ${
              allTestsPassed 
                ? 'text-green-300 bg-green-900/20 border-green-700'
                : hasErrors 
                  ? 'text-red-300 bg-red-900/20 border-red-700'
                  : 'text-yellow-300 bg-yellow-900/20 border-yellow-700'
            }`}>
              <div className="flex items-center mb-2">
                {allTestsPassed ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2" />
                )}
                <span className="font-medium">
                  {allTestsPassed 
                    ? '✅ All tests passed! Firestore is ready to use.'
                    : hasErrors
                      ? '❌ Some tests failed. Check Firebase rules deployment.'
                      : '⚠️ Tests incomplete.'}
                </span>
              </div>
              
              {hasErrors && (
                <div className="text-sm mt-2">
                  <p className="mb-2">To fix permission errors:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
                    <li>Select your project → Firestore Database → Rules</li>
                    <li>Copy the contents of your local firestore.rules file</li>
                    <li>Paste into the rules editor and click "Publish"</li>
                    <li>Wait 2-3 minutes, then run this test again</li>
                  </ol>
                </div>
              )}
              
              {allTestsPassed && (
                <p className="text-sm mt-2">
                  Your Firestore rules are properly deployed. You can now use the Firestore version 
                  of the evaluation system by running <code>switch-evaluation-version.bat</code> 
                  and selecting option 1.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
