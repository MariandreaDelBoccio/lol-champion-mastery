import { useRef, useState } from 'react';
import { getChampionImageUrl } from '../services/datadragon';
import './PoolShareCard.css';

/**
 * Shareable pool card — copy link + download PNG via canvas.
 */
function PoolShareCard({ playerName, tagLine, identity }) {
  const cardRef = useRef(null);
  const [status, setStatus] = useState('');

  if (!identity || !identity.top5?.length) return null;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus('Enlace copiado');
    } catch {
      setStatus('No se pudo copiar el enlace');
    }
    setTimeout(() => setStatus(''), 2000);
  };

  const handleDownload = async () => {
    const width = 900;
    const height = 520;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Background
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#010a13');
    grad.addColorStop(1, '#1e2328');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Gold top rule
    ctx.fillStyle = '#C8AA6E';
    ctx.fillRect(0, 0, width, 6);

    ctx.fillStyle = '#C8AA6E';
    ctx.font = '600 18px Segoe UI, sans-serif';
    ctx.fillText('MASTERY OS · POOL 2026', 48, 56);

    ctx.fillStyle = '#f0e6d2';
    ctx.font = '700 42px Segoe UI, sans-serif';
    ctx.fillText(`${playerName}#${tagLine}`, 48, 110);

    ctx.fillStyle = '#e6c97a';
    ctx.font = '700 28px Segoe UI, sans-serif';
    ctx.fillText(identity.signature, 48, 156);

    ctx.fillStyle = '#a09b8c';
    ctx.font = '400 18px Segoe UI, sans-serif';
    ctx.fillText(identity.signatureDetail, 48, 188);

    ctx.fillStyle = '#f0e6d2';
    ctx.font = '600 16px Segoe UI, sans-serif';
    ctx.fillText(
      `M5+ ${identity.m5Plus} · M7 ${identity.m7} · ${identity.championsTracked} champs`,
      48,
      230
    );

    // Draw top 5 icons
    const icons = await Promise.all(
      identity.top5.map(
        ({ champion }) =>
          new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve({ img, champion });
            img.onerror = () => resolve({ img: null, champion });
            img.src = getChampionImageUrl(champion.id);
          })
      )
    );

    icons.forEach(({ img, champion }, i) => {
      const x = 48 + i * 160;
      const y = 280;
      ctx.fillStyle = '#3c3c41';
      ctx.fillRect(x, y, 120, 150);
      if (img) {
        ctx.drawImage(img, x + 20, y + 16, 80, 80);
      }
      ctx.fillStyle = '#f0e6d2';
      ctx.font = '600 14px Segoe UI, sans-serif';
      ctx.fillText(champion.name, x + 10, y + 120);
      const mastery = identity.top5[i].mastery;
      ctx.fillStyle = '#C8AA6E';
      ctx.font = '600 13px Segoe UI, sans-serif';
      ctx.fillText(`M${mastery.championLevel}`, x + 10, y + 140);
    });

    const link = document.createElement('a');
    link.download = `pool-${playerName}-${tagLine}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setStatus('Imagen descargada');
    setTimeout(() => setStatus(''), 2000);
  };

  return (
    <section className="pool-share" aria-label="Compartir pool" ref={cardRef}>
      <div className="pool-share-header">
        <div>
          <p className="pool-share-eyebrow">Distribución</p>
          <h2>Tarjeta de pool</h2>
          <p className="pool-share-subtitle">
            Comparte tu identidad de champions — no tu elo.
          </p>
        </div>
        <div className="pool-share-actions">
          <button type="button" onClick={handleCopyLink} className="pool-share-btn secondary">
            Copiar enlace
          </button>
          <button type="button" onClick={handleDownload} className="pool-share-btn primary">
            Descargar PNG
          </button>
        </div>
      </div>

      <div className="pool-share-preview">
        <div className="pool-share-preview-top">
          <span>MASTERY OS · POOL 2026</span>
          <strong>
            {playerName}#{tagLine}
          </strong>
          <em>{identity.signature}</em>
        </div>
        <div className="pool-share-top5">
          {identity.top5.map(({ champion, mastery }) => (
            <div key={champion.key} className="pool-share-champ">
              <img src={getChampionImageUrl(champion.id)} alt={champion.name} />
              <span>{champion.name}</span>
              <small>M{mastery.championLevel}</small>
            </div>
          ))}
        </div>
      </div>

      {status && <p className="pool-share-status">{status}</p>}
    </section>
  );
}

export default PoolShareCard;
