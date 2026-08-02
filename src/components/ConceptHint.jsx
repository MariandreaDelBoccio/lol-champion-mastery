import './ConceptHint.css';

/**
 * Compact explainer for Mastery OS concepts.
 */
function ConceptHint({ title, children }) {
  return (
    <details className="concept-hint">
      <summary>{title}</summary>
      <div className="concept-hint-body">{children}</div>
    </details>
  );
}

export default ConceptHint;
