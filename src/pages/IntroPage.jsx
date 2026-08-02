import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAccountByRiotId } from '../services/apiClient';
import { PLATFORMS, parseRiotId, normalizePlatform, getPlatformMeta } from '../utils/regions';
import { getChampionImageUrl } from '../services/datadragon';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import './IntroPage.css';

const EXAMPLES = [
  {
    riotId: 'Caps#EUW',
    platform: 'euw1',
    name: 'CÄPS',
    meta: 'Pocket picks · ejemplo',
    champs: ['Jhin', 'Jinx', 'Ashe'],
  },
  {
    riotId: 'Doublelift#NA1',
    platform: 'na1',
    name: 'DOUBLELIFT',
    meta: 'Flex · ejemplo',
    champs: ['Vayne', 'Draven', 'Lucian'],
  },
];

function IntroPage() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState('euw1');
  const [riotInput, setRiotInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const platformMeta = useMemo(() => getPlatformMeta(platform), [platform]);

  const goProfile = async (input, plat) => {
    const parsed = parseRiotId(input, getPlatformMeta(plat).label);
    if (!parsed.gameName) {
      setError('Introduce un Riot ID (Nombre#TAG)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const account = await fetchAccountByRiotId(parsed.gameName, parsed.tagLine, plat);
      const name = account.gameName || parsed.gameName;
      const tag = account.tagLine || parsed.tagLine;
      navigate(
        `/profile/${encodeURIComponent(name)}?tagLine=${encodeURIComponent(tag)}&platform=${plat}&puuid=${encodeURIComponent(account.puuid)}`
      );
    } catch (err) {
      setError(err.message || 'No se encontró al jugador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing">
      <div className="shell landing-grid">
        <section className="landing-copy">
          <p className="eyebrow">Expediente de jugador // League of Legends</p>
          <h1 className="display landing-title">
            Tu pool tiene
            <br />
            <span className="text-accent">carácter</span>
          </h1>
          <p className="landing-sub">
            Mastery OS lee tu maestría de campeones y te dice quién eres cuando eliges: tu
            arquetipo, tus mains oxidados y los cofres que dejas sobre la mesa. Sin elo, sin
            historial.
          </p>

          <form
            className="landing-search"
            onSubmit={(e) => {
              e.preventDefault();
              goProfile(riotInput, normalizePlatform(platform));
            }}
          >
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              aria-label="Servidor"
            >
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <input
              value={riotInput}
              onChange={(e) => setRiotInput(e.target.value)}
              placeholder={`${platformMeta.label === 'EUW' ? 'Caps' : 'Nombre'}#${platformMeta.label}`}
              aria-label="Riot ID"
            />
            <button type="submit" className="btn-solid" disabled={loading}>
              {loading ? '…' : 'Ver pool'}
            </button>
          </form>

          {loading && <Loading message="Abriendo expediente…" />}
          {error && <ErrorMessage message={error} />}
        </section>

        <aside className="landing-examples">
          <p className="eyebrow">Expedientes de ejemplo</p>
          <div className="example-list">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.riotId}
                type="button"
                className="example-card"
                onClick={() => {
                  setRiotInput(ex.riotId);
                  setPlatform(ex.platform);
                  goProfile(ex.riotId, ex.platform);
                }}
              >
                <div className="example-icons">
                  {ex.champs.map((id) => (
                    <img key={id} src={getChampionImageUrl(id)} alt="" />
                  ))}
                </div>
                <div className="example-meta">
                  <strong>{ex.name}</strong>
                  <span>{ex.meta}</span>
                </div>
                <span className="example-arrow" aria-hidden>
                  →
                </span>
              </button>
            ))}
          </div>
          <Link to="/compare" className="landing-compare-link">
            O compara dos pools →
          </Link>
        </aside>
      </div>

      <footer className="landing-footer shell">
        <span>Mastery OS · identidad de pool, no elo</span>
        <span>Maestría Riot · sin historial de partidas</span>
      </footer>
    </div>
  );
}

export default IntroPage;
