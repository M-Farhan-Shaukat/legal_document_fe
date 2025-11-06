/**
 * Error logging utility for sending errors to backend or external services
 */

class ErrorLogger {
  constructor(config = {}) {
    this.config = {
      endpoint: '/api/log-error',
      enableConsoleLog: true,
      enableRemoteLog: false,
      maxRetries: 3,
      retryDelay: 1000,
      ...config
    };
  }

  /**
   * Log error with context information
   * @param {Error} error - The error object
   * @param {Object} errorInfo - React error info
   * @param {Object} context - Additional context
   */
  async logError(error, errorInfo = {}, context = {}) {
    const errorData = this.formatError(error, errorInfo, context);

    // Always log to console in development
    if (this.config.enableConsoleLog || process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Context:', context);
      console.error('Formatted Data:', errorData);
      console.groupEnd();
    }

    // Send to remote logging service if enabled
    if (this.config.enableRemoteLog) {
      await this.sendToRemote(errorData);
    }

    return errorData;
  }

  /**
   * Format error data for logging
   */
  formatError(error, errorInfo, context) {
    return {
      // Error details
      message: error?.message || 'Unknown error',
      name: error?.name || 'Error',
      stack: error?.stack || 'No stack trace available',
      
      // React error info
      componentStack: errorInfo?.componentStack || 'No component stack',
      
      // Context information
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      
      // Browser info
      browserInfo: this.getBrowserInfo(),
      
      // Custom context
      ...context,
      
      // App info
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || 'Unknown',
      environment: process.env.NODE_ENV || 'Unknown'
    };
  }

  /**
   * Get browser information
   */
  getBrowserInfo() {
    if (typeof window === 'undefined') return {};

    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: window.screen?.width,
        height: window.screen?.height
      },
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
  }

  /**
   * Send error data to remote logging service
   */
  async sendToRemote(errorData, retryCount = 0) {
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('Error logged to remote service successfully');
      return await response.json();
    } catch (error) {
      console.error('Failed to log error to remote service:', error);
      
      // Retry logic
      if (retryCount < this.config.maxRetries) {
        console.log(`Retrying error log (attempt ${retryCount + 1}/${this.config.maxRetries})`);
        
        await new Promise(resolve => 
          setTimeout(resolve, this.config.retryDelay * (retryCount + 1))
        );
        
        return this.sendToRemote(errorData, retryCount + 1);
      }
      
      console.error('Max retries reached. Error logging failed.');
    }
  }

  /**
   * Log performance issues
   */
  logPerformanceIssue(metric, value, threshold) {
    const performanceData = {
      type: 'performance',
      metric,
      value,
      threshold,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
    };

    console.warn('Performance issue detected:', performanceData);
    
    if (this.config.enableRemoteLog) {
      this.sendToRemote(performanceData);
    }
  }

  /**
   * Log user actions for debugging
   */
  logUserAction(action, data = {}) {
    const actionData = {
      type: 'user_action',
      action,
      data,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
    };

    console.log('User action:', actionData);
    
    // You might want to store these in localStorage for debugging
    if (typeof window !== 'undefined') {
      const actions = JSON.parse(localStorage.getItem('debug_actions') || '[]');
      actions.push(actionData);
      
      // Keep only last 50 actions
      if (actions.length > 50) {
        actions.shift();
      }
      
      localStorage.setItem('debug_actions', JSON.stringify(actions));
    }
  }
}

// Create singleton instance
const errorLogger = new ErrorLogger({
  enableRemoteLog: process.env.NODE_ENV === 'production',
  enableConsoleLog: true
});

export default errorLogger;

// Export class for custom configurations
export { ErrorLogger };
