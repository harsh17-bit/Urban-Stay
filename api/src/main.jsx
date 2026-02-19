import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <pre>{this.state.error?.message ?? 'Unknown error'}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

const root = document.getElementById('root')
console.log('Root element:', root);
if (!root) {
  document.body.innerHTML = '<p style="padding:2rem">No #root element found. Check index.html.</p>'
} else {
  console.log('Rendering React App...');
  createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  )
}
