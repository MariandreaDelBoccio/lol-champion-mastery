import { Link } from 'react-router-dom';
import { getChampionImageUrl, getMasteryBadgeUrl, formatMasteryPoints } from '../services/datadragon';
import './ChampionCard.css';

/**
 * ChampionCard component displays individual champion mastery info
 * Shows champion image, name, mastery level, and points
 */
function ChampionCard({ champion, masteryData }) {
  // Get the champion image URL
  const championImageUrl = getChampionImageUrl(champion.id);
  
  // Get mastery badge URL if mastery level exists
  const masteryBadgeUrl = masteryData?.championLevel 
    ? getMasteryBadgeUrl(masteryData.championLevel) 
    : null;

  return (
    <Link 
      to={`/champion/${champion.key}`} 
      className="champion-card"
    >
      <div className="champion-image-container">
        <img 
          src={championImageUrl} 
          alt={champion.name}
          className="champion-image"
          onError={(e) => {
            // Fallback if image fails to load
            e.target.src = 'https://via.placeholder.com/120x120?text=Champion';
          }}
        />
        
        {/* Mastery badge overlay */}
        {masteryBadgeUrl && (
          <img 
            src={masteryBadgeUrl}
            alt={`Mastery ${masteryData.championLevel}`}
            className="mastery-badge"
          />
        )}
      </div>

      <div className="champion-info">
        <h3 className="champion-name">{champion.name}</h3>
        <p className="champion-title">{champion.title}</p>
        
        {/* Mastery information */}
        {masteryData ? (
          <div className="mastery-info">
            <div className="mastery-level">
              Level {masteryData.championLevel}
            </div>
            <div className="mastery-points">
              {formatMasteryPoints(masteryData.championPoints)} points
            </div>
            {masteryData.lastPlayTime && (
              <div className="last-played">
                Last played: {new Date(masteryData.lastPlayTime).toLocaleDateString()}
              </div>
            )}
          </div>
        ) : (
          <div className="no-mastery">
            No mastery data
          </div>
        )}
      </div>
    </Link>
  );
}

export default ChampionCard;