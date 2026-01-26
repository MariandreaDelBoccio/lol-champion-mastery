import './ErrorMessage.css';

/**
 * ErrorMessage component for displaying errors to users
 * Provides a consistent way to show error states throughout the app
 */
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Oops! Something went wrong</h3>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-btn">
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;