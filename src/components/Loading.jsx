import './Loading.css';

/**
 * Loading component - shows a spinner with optional message
 * Used throughout the app when data is being fetched
 */
function Loading({ message = 'Loading...' }) {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
}

export default Loading;