import { Component } from 'react'

/**
 * ErrorBoundary for the 3D Canvas.
 * If WebGL crashes (e.g., context lost), this prevents
 * the entire React tree from unmounting.
 */
export default class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[PC-66] 3D renderer error caught:', error.message)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
            zIndex: 1,
          }}
        >
          <div
            style={{
              textAlign: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              color: '#555',
            }}
          >
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              WebGL no disponible
            </p>
            <p style={{ fontSize: '0.6rem', marginTop: '0.5rem', color: '#333' }}>
              Activa la aceleración por hardware en tu navegador
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
