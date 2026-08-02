import './PoolIdentity.css';

/**
 * Pool Identity scorecard — who you are by champions, not by elo.
 */
function PoolIdentity({ identity, playerName }) {
  if (!identity) return null;

  const roleEntries = Object.entries(identity.roleCounts || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <section className="pool-identity" aria-label="Identidad de pool">
      <div className="pool-identity-header">
        <div>
          <p className="pool-eyebrow">Identidad de pool</p>
          <h2 className="pool-signature text-gradient-gold">{identity.signature}</h2>
          <p className="pool-signature-detail">{identity.signatureDetail}</p>
        </div>
        <div className="pool-player-chip">{playerName}</div>
      </div>

      <div className="pool-metrics">
        <div className="pool-metric">
          <span className="pool-metric-value">{identity.championsTracked}</span>
          <span className="pool-metric-label">Con maestría</span>
        </div>
        <div className="pool-metric">
          <span className="pool-metric-value">{identity.m5Plus}</span>
          <span className="pool-metric-label">M5+ ({identity.m5Rate}%)</span>
        </div>
        <div className="pool-metric">
          <span className="pool-metric-value">{identity.m7}</span>
          <span className="pool-metric-label">M7 ({identity.m7Rate}%)</span>
        </div>
        <div className="pool-metric">
          <span className="pool-metric-value">{identity.chestsAvailable}</span>
          <span className="pool-metric-label">Cofres pendientes</span>
        </div>
      </div>

      {roleEntries.length > 0 && (
        <div className="pool-roles">
          <h3>Cobertura Top 10</h3>
          <div className="pool-role-tags">
            {roleEntries.map(([tag, n]) => (
              <span key={tag} className="pool-role-tag">
                {tag} · {n}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pool-activity-columns">
        <div className="pool-activity-col">
          <h3>Mains en racha</h3>
          {identity.hotMains.length === 0 ? (
            <p className="pool-empty">Ninguno jugado esta semana</p>
          ) : (
            <ul>
              {identity.hotMains.map(({ champion, mastery }) => (
                <li key={champion.key}>
                  <span>{champion.name}</span>
                  <span className="pool-activity-meta">M{mastery.championLevel}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="pool-activity-col">
          <h3>Oxidados / dormidos</h3>
          {identity.rustyMains.length === 0 ? (
            <p className="pool-empty">Pool fresco</p>
          ) : (
            <ul>
              {identity.rustyMains.map(({ champion, mastery, activityLabel, daysSincePlay }) => (
                <li key={champion.key}>
                  <span>{champion.name}</span>
                  <span className="pool-activity-meta">
                    {activityLabel}
                    {daysSincePlay != null ? ` · ${daysSincePlay}d` : ''} · M{mastery.championLevel}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default PoolIdentity;
