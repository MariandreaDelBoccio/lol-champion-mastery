import { useEffect, useMemo, useState } from 'react';
import {
  addGoal,
  getGoalsForPlayer,
  removeGoal,
  currentWeekKey,
} from '../services/goalsStorage';
import { getProgressToLevel } from '../utils/masteryAnalytics';
import ConceptHint from './ConceptHint';
import './GoalsPanel.css';

/**
 * Mastery + weekly chest goals in localStorage.
 */
function GoalsPanel({ puuid, roster }) {
  const [goals, setGoals] = useState([]);
  const [goalType, setGoalType] = useState('mastery');
  const [championKey, setChampionKey] = useState('');
  const [targetLevel, setTargetLevel] = useState(7);
  const [chestTarget, setChestTarget] = useState(3);
  const weekKey = currentWeekKey();

  useEffect(() => {
    setGoals(getGoalsForPlayer(puuid));
  }, [puuid]);

  const options = useMemo(
    () =>
      (roster || []).map(({ champion, mastery }) => ({
        key: champion.key,
        id: champion.id,
        name: champion.name,
        championId: mastery.championId,
        level: mastery.championLevel,
      })),
    [roster]
  );

  const chestsAvailable = useMemo(
    () => (roster || []).filter((r) => !r.mastery.chestGranted).length,
    [roster]
  );

  const chestsGranted = useMemo(
    () => (roster || []).filter((r) => r.mastery.chestGranted).length,
    [roster]
  );

  useEffect(() => {
    if (!championKey && options[0]) {
      setChampionKey(options[0].key);
    }
  }, [options, championKey]);

  const masteryByChampionId = useMemo(() => {
    const map = new Map();
    (roster || []).forEach((row) => {
      map.set(Number(row.mastery.championId), row);
    });
    return map;
  }, [roster]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!puuid) return;

    if (goalType === 'chests') {
      addGoal(puuid, {
        type: 'chests',
        targetCount: Number(chestTarget),
        weekKey,
        baselineGranted: chestsGranted,
      });
    } else {
      const opt = options.find((o) => o.key === championKey);
      if (!opt) return;
      addGoal(puuid, {
        type: 'mastery',
        championId: opt.championId,
        championKey: opt.key,
        championName: opt.name,
        targetLevel: Number(targetLevel),
      });
    }
    setGoals(getGoalsForPlayer(puuid));
  };

  const handleRemove = (goalId) => {
    removeGoal(puuid, goalId);
    setGoals(getGoalsForPlayer(puuid));
  };

  if (!puuid) return null;

  return (
    <section className="goals-panel" aria-label="Metas de maestría">
      <div className="goals-header">
        <div>
          <p className="goals-eyebrow">Hábitos</p>
          <h2>Metas</h2>
          <p className="goals-subtitle">
            Maestría o cofres de esta semana. Se guardan en este navegador.
          </p>
        </div>
      </div>

      <ConceptHint title="¿Para qué sirven las metas?">
        <p>
          Son recordatorios para <strong>volver sin buscar a otra persona</strong>: “M7 en Jinx” o
          “3 cofres esta semana”.
        </p>
        <p>
          Ahora: <strong>{chestsAvailable}</strong> cofres libres · <strong>{chestsGranted}</strong>{' '}
          ya obtenidos en el roster visible.
        </p>
      </ConceptHint>

      <form className="goals-form goals-form-typed" onSubmit={handleAdd}>
        <label>
          Tipo
          <select value={goalType} onChange={(e) => setGoalType(e.target.value)}>
            <option value="mastery">Nivel de maestría</option>
            <option value="chests">Cofres esta semana</option>
          </select>
        </label>

        {goalType === 'mastery' ? (
          <>
            <label>
              Campeón
              <select
                value={championKey}
                onChange={(e) => setChampionKey(e.target.value)}
                disabled={options.length === 0}
              >
                {options.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.name} (M{o.level})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Objetivo
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
              >
                {[5, 6, 7].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Maestría {lvl}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <label>
            Cofres a completar
            <select
              value={chestTarget}
              onChange={(e) => setChestTarget(e.target.value)}
            >
              {[1, 2, 3, 4, 5, 7, 10].map((n) => (
                <option key={n} value={n}>
                  {n} cofres
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          type="submit"
          className="goals-add-btn"
          disabled={goalType === 'mastery' && options.length === 0}
        >
          Añadir meta
        </button>
      </form>

      {goals.length === 0 ? (
        <p className="goals-empty">Aún no hay metas. Elige maestría o cofres.</p>
      ) : (
        <ul className="goals-list">
          {goals.map((goal) => {
            if (goal.type === 'chests') {
              const sameWeek = !goal.weekKey || goal.weekKey === weekKey;
              const baseline = Number(goal.baselineGranted) || 0;
              const earnedSince = Math.max(0, chestsGranted - baseline);
              const reached = sameWeek && earnedSince >= goal.targetCount;

              return (
                <li key={goal.id} className={`goals-item ${reached ? 'is-done' : ''}`}>
                  <div className="goals-item-main">
                    <strong>
                      Cofres · {goal.targetCount} esta semana
                    </strong>
                    {reached ? (
                      <span className="goals-status done">Completada</span>
                    ) : (
                      <span className="goals-status">
                        {sameWeek
                          ? `Progreso ${earnedSince}/${goal.targetCount} · ${chestsAvailable} libres · ${weekKey}`
                          : `Semana antigua (${goal.weekKey}). Crea una meta nueva.`}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="goals-remove-btn"
                    onClick={() => handleRemove(goal.id)}
                  >
                    Quitar
                  </button>
                </li>
              );
            }

            const row = masteryByChampionId.get(Number(goal.championId));
            const progress = row
              ? getProgressToLevel(row.mastery, goal.targetLevel)
              : null;
            const reached =
              progress?.reached ||
              (row && row.mastery.championLevel >= goal.targetLevel);

            return (
              <li key={goal.id} className={`goals-item ${reached ? 'is-done' : ''}`}>
                <div className="goals-item-main">
                  <strong>
                    {goal.championName || 'Champ'} → M{goal.targetLevel}
                  </strong>
                  {reached ? (
                    <span className="goals-status done">Completada</span>
                  ) : progress ? (
                    <span className="goals-status">
                      {progress.pointsNeeded.toLocaleString()} pts · ~
                      {progress.gamesEstimate} partidas
                      {typeof progress.tokensEarned === 'number' &&
                      progress.tokensNeeded > 0
                        ? ` · tokens ${progress.tokensEarned}/${progress.tokensNeeded}`
                        : ''}
                    </span>
                  ) : (
                    <span className="goals-status">Sin datos de maestría</span>
                  )}
                </div>
                <button
                  type="button"
                  className="goals-remove-btn"
                  onClick={() => handleRemove(goal.id)}
                >
                  Quitar
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default GoalsPanel;
