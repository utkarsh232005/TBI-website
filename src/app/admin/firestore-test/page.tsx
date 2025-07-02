"use client";

import FirestoreConnectionTest from "@/components/FirestoreConnectionTest";

export default function FirestoreTestPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Firebase Firestore Connection Test
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Use this page to test your Firestore connection and rules before switching 
            the evaluation system from localStorage to Firestore.
          </p>
        </div>
        
        <FirestoreConnectionTest />
        
        <div className="mt-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Access</h2>
          <div className="space-y-2 text-sm text-gray-300">
            <p>• <strong>Current Evaluation System:</strong> localStorage (working offline)</p>
            <p>• <strong>Switch to Firestore:</strong> Run <code className="bg-gray-700 px-2 py-1 rounded">switch-evaluation-version.bat</code></p>
            <p>• <strong>Firebase Console:</strong> <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">console.firebase.google.com</a></p>
            <p>• <strong>Evaluation Page:</strong> <a href="/admin/evaluation" className="text-blue-400 underline">/admin/evaluation</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
