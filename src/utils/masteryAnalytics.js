/** Average mastery points gained per finished game (rough estimate for UX). */
export const AVG_POINTS_PER_GAME = 600;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Activity bucket from lastPlayTime
 * @param {number|null} lastPlayTime
 * @returns {'hot'|'active'|'rusty'|'dormant'|'unknown'}
 */
export function getActivityStatus(lastPlayTime) {
  if (!lastPlayTime) return 'unknown';
  const days = (Date.now() - lastPlayTime) / DAY_MS;
  if (days <= 7) return 'hot';
  if (days <= 30) return 'active';
  if (days <= 90) return 'rusty';
  return 'dormant';
}

export function getActivityLabel(status) {
  const labels = {
    hot: 'En racha',
    active: 'Activo',
    rusty: 'Oxidado',
    dormant: 'Dormido',
    unknown: 'Sin dato',
  };
  return labels[status] || labels.unknown;
}

export function daysSince(lastPlayTime) {
  if (!lastPlayTime) return null;
  return Math.floor((Date.now() - lastPlayTime) / DAY_MS);
}

/**
 * Points / games estimate toward a target mastery level.
 * Riot already exposes championPointsUntilNextLevel for next level only.
 */
export function getProgressToLevel(mastery, targetLevel) {
  const level = mastery.championLevel || 0;
  const points = mastery.championPoints || 0;

  if (level >= targetLevel) {
    return {
      targetLevel,
      reached: true,
      pointsNeeded: 0,
      gamesEstimate: 0,
    };
  }

  // If targeting next level, prefer API field
  if (targetLevel === level + 1 && typeof mastery.championPointsUntilNextLevel === 'number') {
    const pointsNeeded = Math.max(0, mastery.championPointsUntilNextLevel);
    return {
      targetLevel,
      reached: false,
      pointsNeeded,
      gamesEstimate: Math.ceil(pointsNeeded / AVG_POINTS_PER_GAME),
    };
  }

  // Rough cumulative thresholds used for UX (not exact Riot tables)
  const thresholds = {
    5: 21600,
    6: 21600, // tokens gate more than points after 5; still show points context
    7: 21600,
  };

  if (targetLevel <= 4) {
    const next = mastery.championPointsUntilNextLevel ?? 0;
    return {
      targetLevel,
      reached: false,
      pointsNeeded: next,
      gamesEstimate: Math.ceil(next / AVG_POINTS_PER_GAME),
    };
  }

  // For M5+ emphasize tokens when available
  const pointsNeeded = Math.max(0, (thresholds[targetLevel] || 21600) - points);
  return {
    targetLevel,
    reached: false,
    pointsNeeded,
    gamesEstimate: Math.ceil(pointsNeeded / AVG_POINTS_PER_GAME),
    tokensEarned: mastery.tokensEarned ?? 0,
    tokensNeeded: targetLevel === 6 ? 1 : targetLevel === 7 ? 2 : 0,
  };
}

export function formatRelativePlay(lastPlayTime) {
  const days = daysSince(lastPlayTime);
  if (days === null) return 'Sin partidas registradas';
  if (days === 0) return 'Jugado hoy';
  if (days === 1) return 'Jugado ayer';
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} sem.`;
  return `Hace ${days} días`;
}

/**
 * Build enriched champion+mastery rows sorted by points.
 */
export function buildMasteryRoster(masteryData, championData) {
  if (!masteryData || !championData) return [];

  return masteryData
    .map((mastery) => {
      const champion = Object.values(championData).find(
        (champ) => Number(champ.key) === Number(mastery.championId)
      );
      if (!champion) return null;
      const activity = getActivityStatus(mastery.lastPlayTime);
      return {
        champion,
        mastery,
        activity,
        activityLabel: getActivityLabel(activity),
        daysSincePlay: daysSince(mastery.lastPlayTime),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.mastery.championPoints - a.mastery.championPoints);
}

/**
 * Pool identity scorecard from a sorted roster.
 */
export function buildPoolIdentity(roster) {
  const count = roster.length;
  const top5 = roster.slice(0, 5);
  const top10 = roster.slice(0, 10);
  const m5Plus = roster.filter((r) => r.mastery.championLevel >= 5).length;
  const m7 = roster.filter((r) => r.mastery.championLevel >= 7).length;
  const chestsAvailable = roster.filter((r) => !r.mastery.chestGranted).length;
  const hot = roster.filter((r) => r.activity === 'hot');
  const rusty = roster.filter(
    (r) => r.activity === 'rusty' || r.activity === 'dormant'
  );

  // Role coverage from champion tags
  const roleCounts = {};
  top10.forEach(({ champion }) => {
    (champion.tags || []).forEach((tag) => {
      roleCounts[tag] = (roleCounts[tag] || 0) + 1;
    });
  });

  const topPoints = top5[0]?.mastery.championPoints || 0;
  const secondPoints = top5[1]?.mastery.championPoints || 0;
  const topShare =
    top5.reduce((sum, r) => sum + r.mastery.championPoints, 0) || 1;
  const oneTrickRatio = topPoints / topShare;

  let signature = 'Flex';
  let signatureDetail = 'Pool equilibrado en varios champions';

  if (count > 0 && m5Plus / Math.max(count, 1) >= 0.35 && count >= 20) {
    signature = 'Coleccionista';
    signatureDetail = 'Amplia colección con mucha maestría alta';
  } else if (oneTrickRatio >= 0.55 || (topPoints > 0 && topPoints >= secondPoints * 3)) {
    signature = 'One-trick';
    signatureDetail = top5[0]
      ? `Identidad marcada en ${top5[0].champion.name}`
      : 'Fuerte concentración en un main';
  } else if (top5.length >= 3 && oneTrickRatio < 0.4) {
    signature = 'Pocket picks';
    signatureDetail = 'Varios champions de confianza en el pool';
  }

  return {
    signature,
    signatureDetail,
    top5,
    top10,
    championsTracked: count,
    m5Plus,
    m7,
    m5Rate: count ? Math.round((m5Plus / count) * 100) : 0,
    m7Rate: count ? Math.round((m7 / count) * 100) : 0,
    chestsAvailable,
    hotMains: hot.slice(0, 5),
    rustyMains: rusty.slice(0, 5),
    roleCounts,
  };
}
