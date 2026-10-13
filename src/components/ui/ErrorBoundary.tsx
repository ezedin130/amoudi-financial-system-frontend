import { Component, ErrorInfo, ReactNode } from 'react';
import { AmoudiMark } from '@/components/branding/AmoudiMark';

export interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // In production, error info can be piped to an external monitoring service.
    // Explicitly avoid logging sensitive objects or credentials.
    if (import.meta.env.DEV) {
      // In development, brief error name without sensitive data
      void error;
      void errorInfo;
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false });
    window.location.href = '/dashboard';
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError || !this.props.children) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg max-w-lg w-full p-8 text-center animate-in fade-in duration-200">
            <div className="flex justify-center mb-4">
              <AmoudiMark size={48} onDark={false} />
            </div>

            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-slate-900 font-jost mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              An unexpected error occurred while rendering this view. Please refresh the page or return to the dashboard.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
              >
                Refresh Page
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0F2E22] hover:bg-[#1a4a38] rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-6">
              Amoudi Financial Management System · Operational Reliability
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
