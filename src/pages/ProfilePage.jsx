import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import GoalsPanel from '../components/GoalsPanel';
import PoolShareCard from '../components/PoolShareCard';
import { fetchChampionMasteryByPuuid } from '../services/apiClient';
import {
  fetchChampionData,
  getChampionImageUrl,
  formatMasteryPoints,
  warmDdragon,
} from '../services/datadragon';
import {
  buildMasteryRoster,
  buildPoolIdentity,
  formatRelativePlay,
} from '../utils/masteryAnalytics';
import { normalizePlatform, getPlatformMeta } from '../utils/regions';
import { masteryPipClass, buildVerdict, getNextActions } from '../utils/profileInsights';
import { addGoal } from '../services/goalsStorage';
import './ProfilePage.css';

function ProfilePage() {
  const { summonerName } = useParams();
  const [searchParams] = useSearchParams();
  const tagLine = searchParams.get('tagLine') || 'EUW';
  const platform = normalizePlatform(searchParams.get('platform') || tagLine);
  const puuid = searchParams.get('puuid');
  const platformMeta = getPlatformMeta(platform);

  const [playerData, setPlayerData] = useState(null);
  const [masteryData, setMasteryData] = useState(null);
  const [championData, setChampionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('top');
  const [retryToken, setRetryToken] = useState(0);
  const [goalFlash, setGoalFlash] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        if (!summonerName || !puuid) {
          throw new Error('Falta información del jugador. Vuelve a buscar.');
        }
        setPlayerData({ gameName: summonerName, tagLine, platform, puuid });
        const [mastery, champions] = await Promise.all([
          fetchChampionMasteryByPuuid(puuid, tagLine, platform),
          warmDdragon().then(() => fetchChampionData()),
        ]);
        setMasteryData(mastery);
        setChampionData(champions);
      } catch (err) {
        setError(err.message || 'No se pudo cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [summonerName, tagLine, platform, puuid, retryToken]);

  const roster = useMemo(
    () => buildMasteryRoster(masteryData, championData),
    [masteryData, championData]
  );
  const identity = useMemo(() => buildPoolIdentity(roster), [roster]);
  const verdict = useMemo(() => buildVerdict(identity, roster), [identity, roster]);
  const actions = useMemo(() => getNextActions(roster), [roster]);
  const hero = roster[0];

  const filtered = useMemo(() => {
    if (filter === 'top') return roster.slice(0, 10);
    if (filter === 'hot') return roster.filter((r) => r.activity === 'hot' || r.activity === 'active');
    if (filter === 'rusty') {
      return roster.filter((r) => r.activity === 'rusty' || r.activity === 'dormant');
    }
    if (filter === 'chests') return roster.filter((r) => !r.mastery.chestGranted);
    return roster;
  }, [roster, filter]);

  const roleEntries = Object.entries(identity.roleCounts || {}).sort((a, b) => b[1] - a[1]);

  const profileQuery = `tagLine=${encodeURIComponent(tagLine)}&platform=${platform}&puuid=${encodeURIComponent(puuid || '')}`;

  const setGoalFromAction = (row) => {
    if (!row || !puuid) return;
    const target = Math.min(7, (row.mastery.championLevel || 1) + 1);
    addGoal(puuid, {
      type: 'mastery',
      championId: row.mastery.championId,
      championKey: row.champion.key,
      championName: row.champion.name,
      targetLevel: target,
    });
    setGoalFlash(`Meta: ${row.champion.name} → M${target}`);
    setTimeout(() => setGoalFlash(''), 2500);
  };

  if (loading) return <Loading message="Abriendo expediente…" />;
  if (error) {
    return (
      <div className="shell profile-mos">
        <ErrorMessage message={error} onRetry={() => setRetryToken((t) => t + 1)} />
        <Link to="/">← Volver</Link>
      </div>
    );
  }

  return (
    <div className="profile-mos">
      <div className="shell">
        <p className="eyebrow profile-crumb">
          … / Jugadores / {playerData.gameName}
        </p>

        <div className="profile-hero-row">
          <div>
            <p className="eyebrow">
              {platformMeta.label} · {identity.signature}
            </p>
            <h1 className="display profile-name">
              {playerData.gameName}
              <span className="name-dot" />
            </h1>
            <p className="text-muted">#{playerData.tagLine}</p>
          </div>

          <aside className="verdict-card">
            <p className="eyebrow">Veredicto</p>
            <p className="verdict-text">{verdict}</p>
            <Link
              className="btn-solid"
              to={`/compare?a=${encodeURIComponent(`${playerData.gameName}#${playerData.tagLine}`)}&platformA=${platform}`}
            >
              Comparar este pool
            </Link>
          </aside>
        </div>

        <div className="profile-summary">
          {hero && (
            <Link
              to={`/champion/${hero.champion.key}?from=profile&player=${encodeURIComponent(playerData.gameName)}&${profileQuery}`}
              className="hero-champ"
              style={{
                backgroundImage: `linear-gradient(90deg, rgba(7,7,7,0.92), rgba(7,7,7,0.35)), url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${hero.champion.id}_0.jpg)`,
              }}
            >
              <span className="hero-tag">Más cerca del foco</span>
              <strong className="display">{hero.champion.name}</strong>
              <div className="hero-stats">
                <span>Puntos: {hero.mastery.championPoints.toLocaleString()}</span>
                <span>Última: {formatRelativePlay(hero.mastery.lastPlayTime)}</span>
                <span className={hero.mastery.chestGranted ? '' : 'gold-label'}>
                  {hero.mastery.chestGranted ? 'Cofre hecho' : 'Cofre libre'}
                </span>
              </div>
            </Link>
          )}

          <div className="kpi-grid">
            <div className="kpi">
              <span className="kpi-value">{identity.championsTracked}</span>
              <span className="kpi-label">Con maestría</span>
            </div>
            <div className="kpi">
              <span className="kpi-value">{identity.m7}</span>
              <span className="kpi-label">Maestría 7+</span>
            </div>
            <div className="kpi">
              <span className="kpi-value">{identity.chestsAvailable}</span>
              <span className="kpi-label">Cofres libres</span>
            </div>
            <div className="kpi">
              <span className="kpi-value">{identity.rustyMains.length}</span>
              <span className="kpi-label">Oxidados</span>
            </div>
          </div>
        </div>

        {roleEntries.length > 0 && (
          <div className="role-bar">
            <span className="eyebrow">Cobertura por rol</span>
            <div className="role-chips">
              {roleEntries.map(([tag, n]) => (
                <span key={tag}>
                  {tag} <strong>{n}</strong>
                </span>
              ))}
            </div>
          </div>
        )}

        <section className="now-section">
          <h2 className="display section-title">Qué hacer ahora</h2>
          {actions.length === 0 ? (
            <p className="empty-action">
              Aún no hay recomendaciones — este roster no tiene maestrías suficientes.
              <Link to="/"> Busca otra cuenta</Link>
            </p>
          ) : (
            <div className="now-grid">
              {actions.map((a) => (
                <article key={a.id} className="now-card">
                  <h3>{a.title}</h3>
                  <p>{a.body}</p>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      if (a.action === 'goal') setGoalFromAction(a.champion);
                      if (a.action === 'filter-chests') setFilter('chests');
                      if (a.action === 'filter-rusty') setFilter('rusty');
                    }}
                  >
                    {a.cta}
                  </button>
                </article>
              ))}
            </div>
          )}
          {goalFlash && <p className="goal-flash">{goalFlash}</p>}
        </section>

        <section className="arsenal-section">
          <div className="arsenal-head">
            <h2 className="display section-title">Arsenal</h2>
            <div className="arsenal-filters">
              {[
                { id: 'top', label: 'Top 10' },
                { id: 'all', label: 'Todos' },
                { id: 'hot', label: 'Recientes' },
                { id: 'rusty', label: 'Oxidados' },
                { id: 'chests', label: 'Chest ready' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={filter === f.id ? 'active' : ''}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="empty-action">
              Nada en este filtro.{' '}
              <button type="button" className="linkish" onClick={() => setFilter('all')}>
                Ver todos
              </button>
            </p>
          ) : (
            <div className="arsenal-grid">
              {filtered.map(({ champion, mastery, activity, activityLabel }) => (
                <Link
                  key={champion.key}
                  to={`/champion/${champion.key}?from=profile&player=${encodeURIComponent(playerData.gameName)}&${profileQuery}`}
                  className="arsenal-card"
                >
                  <img src={getChampionImageUrl(champion.id)} alt="" />
                  <div>
                    <strong>{champion.name}</strong>
                    <span>
                      {formatMasteryPoints(mastery.championPoints)} pts
                    </span>
                    <div className="arsenal-tags">
                      {!mastery.chestGranted && <em className="tag-gold">Cofre libre</em>}
                      {(activity === 'rusty' || activity === 'dormant') && (
                        <em className="tag-red">{activityLabel}</em>
                      )}
                    </div>
                  </div>
                  <span className={masteryPipClass(mastery.championLevel)}>
                    M{mastery.championLevel}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="detail-section">
          <h2 className="display section-title">Detalle por campeón</h2>
          <div className="detail-table">
            {roster.slice(0, 25).map(({ champion, mastery, daysSincePlay }) => (
              <Link
                key={champion.key}
                className="detail-row"
                to={`/champion/${champion.key}?from=profile&player=${encodeURIComponent(playerData.gameName)}&${profileQuery}`}
              >
                <div className="detail-champ">
                  <img src={getChampionImageUrl(champion.id)} alt="" />
                  <div>
                    <strong>{champion.name}</strong>
                    <span>{champion.title}</span>
                  </div>
                </div>
                <span>{formatMasteryPoints(mastery.championPoints)} pts</span>
                <span className="text-muted">
                  {daysSincePlay != null ? `${daysSincePlay} d sin jugar` : '—'}
                </span>
                <span className={masteryPipClass(mastery.championLevel)}>
                  M{mastery.championLevel}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <details className="secondary-tools">
          <summary>Metas y tarjeta compartible</summary>
          <GoalsPanel puuid={playerData.puuid} roster={roster} />
          <PoolShareCard
            playerName={playerData.gameName}
            tagLine={playerData.tagLine}
            identity={identity}
          />
        </details>
      </div>
    </div>
  );
}

export default ProfilePage;
