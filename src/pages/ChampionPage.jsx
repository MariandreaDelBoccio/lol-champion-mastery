import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import {
  getChampionDetailsById,
  getChampionSplashUrl,
  formatMasteryPoints,
} from '../services/datadragon';
import { fetchChampionMasteryByPuuid } from '../services/apiClient';
import {
  getActivityStatus,
  getActivityLabel,
  formatRelativePlay,
  getProgressToLevel,
  AVG_POINTS_PER_GAME,
} from '../utils/masteryAnalytics';
import { addGoal, getGoalsForPlayer } from '../services/goalsStorage';
import './ChampionPage.css';

function ChampionPage() {
  const { championId } = useParams();
  const [searchParams] = useSearchParams();
  const fromProfile = searchParams.get('from') === 'profile';
  const playerName = searchParams.get('player');
  const tagLine = searchParams.get('tagLine');
  const platform = searchParams.get('platform') || tagLine;
  const puuid = searchParams.get('puuid');

  const [championData, setChampionData] = useState(null);
  const [mastery, setMastery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [goalMsg, setGoalMsg] = useState('');

  const getBackLink = () => {
    if (fromProfile && playerName && tagLine && puuid) {
      const plat = platform ? `&platform=${encodeURIComponent(platform)}` : '';
      return `/profile/${encodeURIComponent(playerName)}?tagLine=${encodeURIComponent(tagLine)}${plat}&puuid=${encodeURIComponent(puuid)}`;
    }
    return '/search';
  };

  const getBackText = () => {
    if (fromProfile && playerName) {
      return `← Volver al pool de ${playerName}#${tagLine}`;
    }
    return '← Volver a buscar';
  };

  useEffect(() => {
    const fetchChampionDetails = async () => {
      setLoading(true);
      setError('');

      try {
        const champion = await getChampionDetailsById(championId);
        setChampionData(champion);

        if (puuid && tagLine) {
          const masteryList = await fetchChampionMasteryByPuuid(puuid, tagLine, platform);
          const entry = masteryList.find(
            (m) => String(m.championId) === String(champion.key || championId)
          );
          setMastery(entry || null);
        } else {
          setMastery(null);
        }
      } catch (err) {
        setError(err.message || 'No se pudo cargar el campeón');
      } finally {
        setLoading(false);
      }
    };

    if (championId) {
      fetchChampionDetails();
    }
  }, [championId, puuid, tagLine, platform]);

  const handleRetry = () => {
    setChampionData(null);
  };

  const handleAddGoal = (targetLevel) => {
    if (!puuid || !championData || !mastery) return;
    const existing = getGoalsForPlayer(puuid).some(
      (g) => g.championId === mastery.championId && g.targetLevel === targetLevel
    );
    if (existing) {
      setGoalMsg('Esa meta ya existe');
    } else {
      addGoal(puuid, {
        championId: mastery.championId,
        championKey: championData.key,
        championName: championData.name,
        targetLevel,
      });
      setGoalMsg(`Meta M${targetLevel} guardada`);
    }
    setTimeout(() => setGoalMsg(''), 2500);
  };

  if (loading) {
    return <Loading message="Cargando journey del campeón..." />;
  }

  if (error) {
    return (
      <div className="champion-page">
        <ErrorMessage message={error} onRetry={handleRetry} />
        <div className="back-link">
          <Link to={getBackLink()}>{getBackText()}</Link>
        </div>
      </div>
    );
  }

  if (!championData) {
    return (
      <div className="champion-page">
        <div className="champion-not-found">
          <h2>Campeón no encontrado</h2>
          <p>No se pudo cargar el campeón solicitado.</p>
          <Link to={getBackLink()} className="back-link">
            {getBackText()}
          </Link>
        </div>
      </div>
    );
  }

  const splashUrl = getChampionSplashUrl(championData.id);
  const activity = mastery ? getActivityStatus(mastery.lastPlayTime) : 'unknown';
  const nextProgress = mastery ? getProgressToLevel(mastery, mastery.championLevel + 1) : null;
  const toM7 = mastery ? getProgressToLevel(mastery, 7) : null;

  return (
    <div className="champion-page">
      <div className="champion-hero" style={{ backgroundImage: `url(${splashUrl})` }}>
        <div className="champion-hero-overlay">
          <div className="champion-hero-content">
            <Link to={getBackLink()} className="back-link">
              {getBackText()}
            </Link>
            <h1 className="champion-name">{championData.name}</h1>
            <p className="champion-title">{championData.title}</p>
            <div className="champion-tags">
              {championData.tags.map((tag, index) => (
                <span key={index} className="champion-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="champion-content">
        {mastery ? (
          <section className="champion-journey">
            <div className="journey-header">
              <div>
                <p className="journey-eyebrow">Champion Journey</p>
                <h2>
                  Relación de {playerName || 'jugador'} con {championData.name}
                </h2>
              </div>
              <div className={`journey-activity activity-${activity}`}>
                {getActivityLabel(activity)}
              </div>
            </div>

            <div className="journey-metrics">
              <div className="journey-metric">
                <span className="journey-value">M{mastery.championLevel}</span>
                <span className="journey-label">Nivel</span>
              </div>
              <div className="journey-metric">
                <span className="journey-value">
                  {formatMasteryPoints(mastery.championPoints)}
                </span>
                <span className="journey-label">Puntos</span>
              </div>
              <div className="journey-metric">
                <span className="journey-value">
                  {mastery.chestGranted ? 'Hecho' : 'Libre'}
                </span>
                <span className="journey-label">Cofre de temporada</span>
              </div>
              <div className="journey-metric">
                <span className="journey-value">{mastery.tokensEarned || 0}</span>
                <span className="journey-label">Tokens</span>
              </div>
            </div>

            <div className="journey-progress-block">
              <p className="journey-playtime">{formatRelativePlay(mastery.lastPlayTime)}</p>
              {!nextProgress?.reached && mastery.championLevel < 7 && (
                <p>
                  Siguiente nivel: {nextProgress.pointsNeeded.toLocaleString()} pts (~
                  {nextProgress.gamesEstimate} partidas a ~{AVG_POINTS_PER_GAME} pts)
                </p>
              )}
              {toM7 && !toM7.reached && mastery.championLevel < 7 && (
                <p>
                  Rumbo a M7: {toM7.pointsNeeded.toLocaleString()} pts de referencia
                  {typeof toM7.tokensNeeded === 'number' && toM7.tokensNeeded > 0
                    ? ` · tokens ${mastery.tokensEarned || 0}/${toM7.tokensNeeded || (mastery.championLevel === 5 ? 1 : 2)}`
                    : ''}
                </p>
              )}
              {mastery.championLevel >= 7 && (
                <p className="journey-complete">Maestría 7 alcanzada — ownership total.</p>
              )}
            </div>

            {puuid && mastery.championLevel < 7 && (
              <div className="journey-goal-actions">
                {[5, 6, 7]
                  .filter((lvl) => lvl > mastery.championLevel)
                  .map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      className="journey-goal-btn"
                      onClick={() => handleAddGoal(lvl)}
                    >
                      Meta: M{lvl}
                    </button>
                  ))}
                {goalMsg && <span className="journey-goal-msg">{goalMsg}</span>}
              </div>
            )}
          </section>
        ) : fromProfile ? (
          <section className="champion-journey muted">
            <h2>Sin maestría de este jugador</h2>
            <p>No hay datos de maestría para {championData.name} en este perfil.</p>
          </section>
        ) : null}

        <div className="champion-info-grid">
          <div className="champion-lore">
            <h2>Lore</h2>
            <p>{championData.blurb}</p>
          </div>

          <div className="champion-stats">
            <h2>Info del campeón</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Ataque:</span>
                <span className="stat-value">{championData.info.attack}/10</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Defensa:</span>
                <span className="stat-value">{championData.info.defense}/10</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Magia:</span>
                <span className="stat-value">{championData.info.magic}/10</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Dificultad:</span>
                <span className="stat-value">{championData.info.difficulty}/10</span>
              </div>
            </div>
          </div>
        </div>

        <div className="champion-tips-section">
          <div className="tips-container">
            <div className="champion-tips ally-tips">
              <div className="tips-header">
                <div className="tips-icon ally-icon">⚔️</div>
                <h3>Jugando con {championData.name}</h3>
              </div>
              {championData.allytips && championData.allytips.length > 0 ? (
                <ul className="tips-list">
                  {championData.allytips.map((tip, index) => (
                    <li key={index} className="tip-item">
                      <span className="tip-bullet">•</span>
                      <span className="tip-text">{tip}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-tips">
                  <p>No hay tips específicos para {championData.name}.</p>
                </div>
              )}
            </div>

            <div className="champion-tips enemy-tips">
              <div className="tips-header">
                <div className="tips-icon enemy-icon">🛡️</div>
                <h3>Jugando contra {championData.name}</h3>
              </div>
              {championData.enemytips && championData.enemytips.length > 0 ? (
                <ul className="tips-list">
                  {championData.enemytips.map((tip, index) => (
                    <li key={index} className="tip-item">
                      <span className="tip-bullet">•</span>
                      <span className="tip-text">{tip}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-tips">
                  <p>No hay tips específicos contra {championData.name}.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChampionPage;
