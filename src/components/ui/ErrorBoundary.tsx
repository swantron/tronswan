import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
    onRetry: () => void;
  }>;
  showDetails?: boolean;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You could also send error reports to a logging service here
    if (process.env.NODE_ENV === 'production') {
      // Example: sendErrorReport(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent, showDetails = false } = this.props;

      // If a custom fallback component is provided, use it
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
          />
        );
      }

      // Default error UI
      return (
        <div className='error-boundary' data-testid='error-boundary'>
          <div className='error-boundary-content'>
            <h2>🤖 Oops! Something went wrong</h2>
            <p>
              We encountered an unexpected error. Don&apos;t worry, our robot
              engineers are on it!
            </p>

            <div className='error-boundary-actions'>
              <button
                onClick={this.handleRetry}
                className='error-boundary-retry-button'
                aria-label='Try again'
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className='error-boundary-reload-button'
                aria-label='Reload page'
              >
                Reload Page
              </button>
            </div>

            {showDetails && process.env.NODE_ENV === 'development' && (
              <details className='error-boundary-details'>
                <summary>Error Details (Development Only)</summary>
                <pre className='error-boundary-stack'>
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
