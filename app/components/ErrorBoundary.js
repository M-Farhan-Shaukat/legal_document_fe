'use client';

import React from 'react';
import ErrorFallback from './ErrorFallback';
import errorLogger from '../utils/errorLogger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error using the error logger utility
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = async (error, errorInfo) => {
    try {
      // Use the error logger utility with additional context
      await errorLogger.logError(error, errorInfo, {
        boundaryName: this.props.name || 'RootErrorBoundary',
        userId: this.props.userId,
        sessionId: this.props.sessionId,
        additionalContext: this.props.context
      });
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          resetKeys={this.props.resetKeys}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
