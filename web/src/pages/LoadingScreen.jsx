import './styles/loadingScreen.css'

function LoadingScreen({ label = 'Loading...' }) {
  return (
    <div className="loading-screen">
      <div className="loading-mark">
        <span className="loading-biashara">Biashara</span>
        <span className="loading-pulse">Pulse</span>
      </div>

      <svg className="loading-heartbeat" viewBox="0 0 300 60" preserveAspectRatio="none">
        <path
          className="loading-heartbeat-path"
          d="M0,30 L70,30 L90,10 L110,50 L130,15 L150,30 L300,30"
        />
      </svg>

      <p className="loading-label">{label}</p>
    </div>
  )
}

export default LoadingScreen