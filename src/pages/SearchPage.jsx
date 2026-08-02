import { Navigate } from 'react-router-dom';

/** Search is now on the landing; keep route for bookmarks. */
function SearchPage() {
  return <Navigate to="/" replace />;
}

export default SearchPage;
