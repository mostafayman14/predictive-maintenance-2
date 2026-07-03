import { Component } from 'react'

import { Button } from '../ui/button'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    this.props.onRetry?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="rounded-2xl border border-amber-200 bg-amber-50 p-6"
        >
          <h2 className="text-lg font-semibold text-amber-900">
            {this.props.title ?? 'Something went wrong'}
          </h2>
          <p className="mt-2 text-sm text-amber-800">
            {this.props.description ??
              'An unexpected rendering error occurred in this section.'}
          </p>
          <Button type="button" variant="outline" className="mt-4" onClick={this.handleRetry}>
            {this.props.retryLabel ?? 'Try again'}
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export { ErrorBoundary }
