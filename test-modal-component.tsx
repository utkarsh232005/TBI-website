"use client";

import React, { useState } from 'react';
import CreateEvaluationModal from './src/app/admin/evaluation/NewEvaluationModal';

export default function TestModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ padding: '20px', backgroundColor: '#121212', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>Modal Test Page</h1>
      
      <button 
        onClick={() => {
          console.log('Opening modal...');
          setIsOpen(true);
        }}
        style={{
          backgroundColor: '#4F46E5',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Open Create Evaluation Modal
      </button>

      <div style={{ marginTop: '20px', color: 'white' }}>
        <p>Modal is currently: {isOpen ? 'OPEN' : 'CLOSED'}</p>
      </div>

      <CreateEvaluationModal 
        isOpen={isOpen}
        onClose={() => {
          console.log('Closing modal...');
          setIsOpen(false);
        }}
        onSubmit={(data: any) => {
          console.log('Modal submitted with data:', data);
          setIsOpen(false);
        }}
      />
    </div>
  );
}
