'use client';

import React, { useState } from 'react';

/**
 * Test component to verify ErrorBoundary functionality
 * This component should only be used in development
 */
const ErrorBoundaryTest = () => {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [errorType, setErrorType] = useState('render');

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const triggerError = (type) => {
    setErrorType(type);
    setShouldThrow(true);
  };

  // Throw error during render
  if (shouldThrow && errorType === 'render') {
    throw new Error('Test render error triggered by ErrorBoundaryTest component');
  }

  const handleAsyncError = async () => {
    try {
      // Simulate async error
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Test async error triggered by ErrorBoundaryTest component'));
        }, 100);
      });
    } catch (error) {
      // Async errors need to be thrown in a way that ErrorBoundary can catch
      setTimeout(() => {
        throw error;
      }, 0);
    }
  };

  const handleEventError = () => {
    // Event handler errors won't be caught by ErrorBoundary
    // This demonstrates the limitation
    throw new Error('Test event handler error (this will NOT be caught by ErrorBoundary)');
  };

  return (
    <div className="card border-warning m-3">
      <div className="card-header bg-warning text-dark">
        <h5 className="mb-0">🧪 Error Boundary Test (Development Only)</h5>
      </div>
      <div className="card-body">
        <p className="text-muted mb-3">
          Use these buttons to test different types of errors and see how the ErrorBoundary handles them.
        </p>
        
        <div className="d-flex flex-wrap gap-2">
          <button 
            className="btn btn-danger btn-sm"
            onClick={() => triggerError('render')}
          >
            Trigger Render Error
          </button>
          
          <button 
            className="btn btn-warning btn-sm"
            onClick={handleAsyncError}
          >
            Trigger Async Error
          </button>
          
          <button 
            className="btn btn-info btn-sm"
            onClick={handleEventError}
          >
            Trigger Event Error (Won't be caught)
          </button>
          
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setShouldThrow(false);
              console.log('Error test reset');
            }}
          >
            Reset
          </button>
        </div>
        
        <div className="mt-3">
          <small className="text-muted">
            <strong>Note:</strong> ErrorBoundary only catches errors in:
            <ul className="mt-1 mb-0">
              <li>Component render methods</li>
              <li>Lifecycle methods</li>
              <li>Constructor</li>
            </ul>
            It does NOT catch errors in:
            <ul className="mt-1 mb-0">
              <li>Event handlers</li>
              <li>Async code (setTimeout, promises)</li>
              <li>Server-side rendering</li>
            </ul>
          </small>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundaryTest;
