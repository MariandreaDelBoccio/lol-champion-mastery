import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { fetchAccountByRiotId, fetchChampionMasteryByPuuid } from '../services/apiClient';
import { fetchChampionData, getChampionImageUrl, formatMasteryPoints, warmDdragon } from '../services/datadragon';
import { buildMasteryRoster, buildPoolIdentity } from '../utils/masteryAnalytics';
import { compareRosters } from '../utils/comparePools';
import { splitDuelRows } from '../utils/duelLayout';
import { PLATFORMS, parseRiotId, normalizePlatform, getPlatformMeta } from '../utils/regions';
import { masteryPipClass } from '../utils/profileInsights';
import './ComparePage.css';

async function loadPlayer(riotInput, platform) {
  const parsed = parseRiotId(riotInput, getPlatformMeta(platform).label);
  if (!parsed.gameName) throw new Error('Riot ID incompleto');
  const account = await fetchAccountByRiotId(parsed.gameName, parsed.tagLine, platform);
  const mastery = await fetchChampionMasteryByPuuid(
    account.puuid,
    account.tagLine || parsed.tagLine,
    platform
  );
  return {
    gameName: account.gameName || parsed.gameName,
    tagLine: account.tagLine || parsed.tagLine,
    puuid: account.puuid,
    platform,
    mastery,
  };
}

function ComparePage() {
  const [searchParams] = useSearchParams();
  const [aInput, setAInput] = useState(searchParams.get('a') || '');
  const [bInput, setBInput] = useState(searchParams.get('b') || '');
  const [platformA, setPlatformA] = useState(normalizePlatform(searchParams.get('platformA') || 'euw1'));
  const [platformB, setPlatformB] = useState(normalizePlatform(searchParams.get('platformB') || 'euw1'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [showAllSoloB, setShowAllSoloB] = useState(false);

  const handleCompare = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setShowAllSoloB(false);
    try {
      await warmDdragon();
      const champions = await fetchChampionData();
      const [playerA, playerB] = await Promise.all([
        loadPlayer(aInput, normalizePlatform(platformA)),
        loadPlayer(bInput, normalizePlatform(platformB)),
      ]);
      const rosterA = buildMasteryRoster(playerA.mastery, champions);
      const rosterB = buildMasteryRoster(playerB.mastery, champions);
      const comparison = compareRosters(
        rosterA,
        rosterB,
        `${playerA.gameName}#${playerA.tagLine}`,
        `${playerB.gameName}#${playerB.tagLine}`
      );
      setResult({
        playerA,
        playerB,
        identityA: buildPoolIdentity(rosterA),
        identityB: buildPoolIdentity(rosterB),
        comparison,
        duel: splitDuelRows(comparison),
      });
    } catch (err) {
      setError(err.message || 'No se pudo comparar');
    } finally {
      setLoading(false);
    }
  };

  const shortName = (label) => (label || '').split('#')[0];

  return (
    <div className="duel-page">
      <div className="shell">
        <p className="eyebrow">Social ligero</p>
        <h1 className="display duel-title">
          Duelo de pool<span className="text-accent">.</span>
        </h1>
        <p className="duel-sub">
          Quién tiene más ownership de cada campeón. Solo maestría — sin elo ni historial.
        </p>

        <form className="duel-form" onSubmit={handleCompare}>
          <div className="duel-inputs">
            <label>
              <span>Jugador A</span>
              <div className="duel-field">
                <select value={platformA} onChange={(e) => setPlatformA(e.target.value)}>
                  {PLATFORMS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
                <input value={aInput} onChange={(e) => setAInput(e.target.value)} placeholder="Nombre#TAG" required />
              </div>
            </label>
            <div className="duel-vs">VS</div>
            <label>
              <span>Jugador B</span>
              <div className="duel-field">
                <select value={platformB} onChange={(e) => setPlatformB(e.target.value)}>
                  {PLATFORMS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
                <input value={bInput} onChange={(e) => setBInput(e.target.value)} placeholder="Nombre#TAG" required />
              </div>
            </label>
          </div>
          <button type="submit" className="btn-solid duel-cta" disabled={loading}>
            {loading ? 'Comparando…' : 'Comparar maestría'}
          </button>
        </form>

        {loading && <Loading message="Cargando ambos pools…" />}
        {error && <ErrorMessage message={error} />}

        {result && (
          <div className="duel-results">
            {result.playerA.puuid === result.playerB.puuid && (
              <p className="duel-warn">Estás comparando el mismo invocador.</p>
            )}

            <div className="duel-score">
              <div className="duel-score-side">
                <strong>{shortName(result.comparison.labelA)}</strong>
                <span>
                  {formatMasteryPoints(result.duel.totalPtsA)} pts · {result.identityA.championsTracked} champs
                </span>
              </div>
              <div className="duel-score-center">
                <p className="display scoreline">
                  {result.comparison.winsA} – {result.comparison.winsB}
                </p>
                <p className="eyebrow">Campeones ganados</p>
              </div>
              <div className="duel-score-side right">
                <strong>{shortName(result.comparison.labelB)}</strong>
                <span>
                  {formatMasteryPoints(result.duel.totalPtsB)} pts · {result.identityB.championsTracked} champs
                </span>
              </div>
            </div>

            <div className="domain-bar" aria-hidden>
              <div className="domain-a" style={{ width: `${result.duel.pctA}%` }} />
              <div className="domain-b" style={{ width: `${result.duel.pctB}%` }} />
            </div>
            <p className="domain-caption">
              {result.duel.pctA}% / {result.duel.pctB}% puntos · {result.comparison.ties} empates ·{' '}
              {result.duel.shared.length} en común
            </p>

            <section className="duel-block">
              <h2 className="display section-title">Campeones en común</h2>
              {result.duel.shared.length === 0 ? (
                <p className="empty-action">No comparten campeones con maestría.</p>
              ) : (
                <div className="shared-list">
                  {result.duel.shared.slice(0, 12).map((row) => {
                    const max = Math.max(row.a?.points || 0, row.b?.points || 0, 1);
                    return (
                      <div key={row.championId} className="shared-row">
                        <div className="shared-side">
                          <div className="shared-bar-track">
                            <div
                              className="shared-bar a"
                              style={{ width: `${((row.a?.points || 0) / max) * 100}%` }}
                            />
                          </div>
                          <span>
                            {row.a ? (
                              <>
                                {formatMasteryPoints(row.a.points)}
                                <i className={masteryPipClass(row.a.level)}>M{row.a.level}</i>
                              </>
                            ) : (
                              <em className="sin">Sin maestría</em>
                            )}
                          </span>
                        </div>
                        <div className="shared-mid">
                          <img src={getChampionImageUrl(row.champion.id)} alt="" />
                          <strong>{row.champion.name}</strong>
                          <small>
                            {row.winner === 'tie'
                              ? 'Empate'
                              : row.winner === 'a'
                                ? `Manda ${shortName(result.comparison.labelA)}`
                                : `Manda ${shortName(result.comparison.labelB)}`}
                          </small>
                        </div>
                        <div className="shared-side right">
                          <div className="shared-bar-track">
                            <div
                              className="shared-bar b"
                              style={{ width: `${((row.b?.points || 0) / max) * 100}%` }}
                            />
                          </div>
                          <span>
                            {row.b ? (
                              <>
                                {formatMasteryPoints(row.b.points)}
                                <i className={masteryPipClass(row.b.level)}>M{row.b.level}</i>
                              </>
                            ) : (
                              <em className="sin">Sin maestría</em>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="solo-grid">
              <div>
                <h2 className="display section-title">
                  Solo {shortName(result.comparison.labelA)}
                </h2>
                {(showAllSoloB ? result.duel.soloA : result.duel.soloA.slice(0, 8)).map((row) => (
                  <div key={row.championId} className="solo-row">
                    <img src={getChampionImageUrl(row.champion.id)} alt="" />
                    <div>
                      <strong>{row.champion.name}</strong>
                      <span>
                        {formatMasteryPoints(row.a.points)} · manda A
                      </span>
                    </div>
                    <span className={masteryPipClass(row.a.level)}>M{row.a.level}</span>
                    <em className="sin">Sin maestría B</em>
                  </div>
                ))}
                {result.duel.soloA.length === 0 && (
                  <p className="empty-action">Sin exclusivos.</p>
                )}
              </div>
              <div>
                <h2 className="display section-title">
                  Solo {shortName(result.comparison.labelB)}
                </h2>
                {(showAllSoloB ? result.duel.soloB : result.duel.soloB.slice(0, 8)).map((row) => (
                  <div key={row.championId} className="solo-row">
                    <img src={getChampionImageUrl(row.champion.id)} alt="" />
                    <div>
                      <strong>{row.champion.name}</strong>
                      <span>
                        {formatMasteryPoints(row.b.points)} · manda B
                      </span>
                    </div>
                    <span className={masteryPipClass(row.b.level)}>M{row.b.level}</span>
                    <em className="sin">Sin maestría A</em>
                  </div>
                ))}
                {result.duel.soloB.length > 8 && !showAllSoloB && (
                  <button type="button" className="btn-ghost" onClick={() => setShowAllSoloB(true)}>
                    + {result.duel.soloB.length - 8} campeones más
                  </button>
                )}
                {result.duel.soloB.length === 0 && (
                  <p className="empty-action">Sin exclusivos.</p>
                )}
              </div>
            </section>
          </div>
        )}

        <footer className="duel-footer">
          <span>Mastery OS · identidad de pool, no elo</span>
          <Link to="/">Buscar otro expediente</Link>
        </footer>
      </div>
    </div>
  );
}

export default ComparePage;
