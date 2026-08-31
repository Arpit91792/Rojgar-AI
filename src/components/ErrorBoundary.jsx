import React, { Component } from 'react'

class ErrorBoundary extends Component {
      constructor(props) {
            super(props)
            this.state = { hasError: false, error: null, errorInfo: null }
      }

      static getDerivedStateFromError(error) {
            return { hasError: true }
      }

      componentDidCatch(error, errorInfo) {
            this.setState({
                  error: error,
                  errorInfo: errorInfo
            })
            console.error('ErrorBoundary caught an error:', error, errorInfo)
      }

      render() {
            if (this.state.hasError) {
                  return (
                        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                              <div className="bg-white rounded-xl border shadow-lg p-8 max-w-md w-full">
                                    <div className="text-center">
                                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <span className="text-2xl text-red-600 font-bold">!</span>
                                          </div>
                                          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                                          <p className="text-gray-600 mb-6">
                                                We're sorry, but there was an error loading this page. Please try refreshing the page.
                                          </p>
                                          <div className="space-y-4">
                                                <button
                                                      onClick={() => window.location.reload()}
                                                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                                >
                                                      Refresh Page
                                                </button>
                                                <button
                                                      onClick={() => this.setState({ hasError: false })}
                                                      className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                                >
                                                      Try Again
                                                </button>
                                          </div>
                                          {process.env.NODE_ENV === 'development' && this.state.error && (
                                                <div className="mt-6 p-4 bg-red-50 rounded-lg text-left">
                                                      <p className="text-sm font-medium text-red-800 mb-2">Error Details:</p>
                                                      <pre className="text-xs text-red-600 overflow-auto">
                                                            {this.state.error.toString()}
                                                      </pre>
                                                </div>
                                          )}
                                    </div>
                              </div>
                        </div>
                  )
            }

            return this.props.children
      }
}

export default ErrorBoundary