import React, { useContext } from 'react';
import { Context } from './TechLife/HRMS/Components/HrmsContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Functional component wrapper to access Context within class render method
      const ErrorDisplay = () => {
        // Access theme from Context
        const { theme } = useContext(Context);
        const isDark = theme === 'dark';

        // Apply conditional classes for a modern, error-focused UI
        const baseClass = `fixed inset-0 flex items-center justify-center font-sans z-49 ${
          isDark ? 'bg-gray-900' : 'bg-gray-100'
        }`;
        
        const containerClass = `p-6 rounded-2xl shadow-2xl border w-full max-w-2xl mx-4 transition-colors duration-300 ${
          isDark 
            ? 'bg-red-900 border-red-800 text-white' 
            : 'bg-red-50 border-red-300 text-gray-800'
        }`;
        
        const titleClass = `text-2xl font-bold mb-4 ${
          isDark ? 'text-red-300' : 'text-red-700'
        }`;
        
        const detailsClass = `text-left p-4 rounded-lg border text-sm mt-4 cursor-pointer ${
          isDark 
            ? 'bg-red-800 border-red-700 text-red-200' 
            : 'bg-white border-gray-300 text-gray-700'
        }`;

        const scrollableContentClass = `overflow-y-auto max-h-60 mt-2 pr-2 ${
          isDark ? 'scrollbar-dark' : 'scrollbar-light'
        }`;

        return (
          <div className={baseClass}>
            <div className={containerClass}>
              <div className="flex items-center mb-4">
                <div className={`text-3xl mr-3 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  ⚠️
                </div>
                <h2 className={titleClass}>
                  Application Error
                </h2>
              </div>
              
              <p className="mb-6 text-lg">
                We're sorry, but something went wrong. Please try reloading the application.
              </p>
              
              <details className={detailsClass}>
                <summary className="font-semibold flex items-center cursor-pointer py-2">
                  <span className="mr-2">🔧</span>
                  Technical Details
                </summary>
                <div className={scrollableContentClass}>
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
                    {this.state.error && this.state.error.toString()}
                    {"\n\n"}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => window.location.reload()}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    isDark 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  Reload Application
                </button>
                
                <button
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 border ${
                    isDark 
                      ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-600' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-300'
                  }`}
                >
                  Try Again
                </button>
              </div>
              
              <div className={`text-xs mt-4 text-center ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>
                If the problem persists, please contact support.
              </div>
            </div>
          </div>
        );
      };

      return <ErrorDisplay />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;