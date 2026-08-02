import { useEffect, useMemo, useState } from 'react';
import ConceptHint from './ConceptHint';
import { maybeSaveSnapshot, getLatestSnapshot, diffAgainstSnapshot } from '../services/snapshotStorage';
import './ProgressDelta.css';

/**
 * Shows progress since last local snapshot and persists a new one.
 */
function ProgressDelta({ puuid, roster, identity }) {
  const [diff, setDiff] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (!puuid || !roster?.length || !identity) return;

    const baseline = getLatestSnapshot(puuid);
    const nextDiff = diffAgainstSnapshot(roster, baseline);
    setDiff(nextDiff);

    const saved = maybeSaveSnapshot(puuid, roster, identity);
    if (saved) setSavedAt(saved.at);
  }, [puuid, roster, identity]);

  const baselineLabel = useMemo(() => {
    if (!diff?.baselineAt) return null;
    try {
      return new Date(diff.baselineAt).toLocaleString();
    } catch {
      return diff.baselineAt;
    }
  }, [diff]);

  const hasChanges = useMemo(() => {
    if (!diff?.hasBaseline) return false;
    return (
      diff.pointsGained > 0 ||
      diff.levelUps.length > 0 ||
      diff.newChampions > 0 ||
      (diff.totalsDelta?.m7 || 0) !== 0 ||
      (diff.totalsDelta?.m5Plus || 0) !== 0
    );
  }, [diff]);

  if (!diff) return null;

  const forceSnapshot = () => {
    const saved = maybeSaveSnapshot(puuid, roster, identity, { force: true });
    if (saved) {
      setSavedAt(saved.at);
      // New baseline → no delta until the next visit / games
      setDiff({
        hasBaseline: true,
        baselineAt: saved.at,
        pointsGained: 0,
        levelUps: [],
        newChampions: 0,
        totalsDelta: { points: 0, m5Plus: 0, m7: 0 },
      });
    }
  };

  return (
    <section className="progress-delta" aria-label="Progreso desde última visita">
      <div className="progress-delta-header">
        <div>
          <p className="progress-eyebrow">Continuidad</p>
          <h2>Progreso desde el último snapshot</h2>
          <p className="progress-subtitle">
            {diff.hasBaseline
              ? `Comparado con tu visita del ${baselineLabel}. No usa historial de Riot: solo lo que guardamos en este navegador.`
              : 'Primera visita: acabamos de guardar un punto de partida local.'}
          </p>
        </div>
        <button type="button" className="progress-force-btn" onClick={forceSnapshot}>
          Reiniciar baseline
        </button>
      </div>

      <ConceptHint title="¿Por qué veo ceros?">
        <p>
          El snapshot es una foto en <strong>este navegador</strong>, no el historial de Riot. Si no
          has jugado desde la última visita, todo queda en 0 — es el comportamiento esperado.
        </p>
        <p>
          Tras unas partidas, recarga el perfil: deberías ver puntos ganados y subidas de nivel.
        </p>
      </ConceptHint>

      {!diff.hasBaseline && (
        <p className="progress-empty">
          Juega unas partidas y vuelve a abrir este perfil: aquí verás cuántos puntos de maestría
          sumaste desde ahora.
          {savedAt ? ' Snapshot inicial guardado.' : ''}
        </p>
      )}

      {diff.hasBaseline && !hasChanges && (
        <p className="progress-empty">
          Sin cambios desde el último snapshot — es normal si aún no has jugado (o Riot aún no
          actualizó la maestría). Los ceros no son un error.
        </p>
      )}

      {diff.hasBaseline && hasChanges && (
        <>
          <div className="progress-metrics">
            <div className="progress-metric">
              <span className="progress-value">
                +{diff.pointsGained.toLocaleString()}
              </span>
              <span className="progress-label">Puntos ganados</span>
            </div>
            <div className="progress-metric">
              <span className="progress-value">{diff.levelUps.length}</span>
              <span className="progress-label">Subidas de nivel</span>
            </div>
            <div className="progress-metric">
              <span className="progress-value">{diff.newChampions}</span>
              <span className="progress-label">Champs nuevos</span>
            </div>
            <div className="progress-metric">
              <span className="progress-value">
                {diff.totalsDelta?.m7 > 0 ? `+${diff.totalsDelta.m7}` : diff.totalsDelta?.m7 || 0}
              </span>
              <span className="progress-label">Δ M7</span>
            </div>
          </div>

          {diff.levelUps?.length > 0 && (
            <ul className="progress-levelups">
              {diff.levelUps.slice(0, 8).map((u) => (
                <li key={u.key}>
                  {u.name}: M{u.from} → M{u.to}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

export default ProgressDelta;
