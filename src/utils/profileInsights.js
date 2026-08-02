export function masteryPipClass(level) {
  const n = Number(level) || 0;
  if (n >= 7) return 'mastery-pip m7';
  if (n === 6) return 'mastery-pip m6';
  if (n === 5) return 'mastery-pip m5';
  if (n === 4) return 'mastery-pip m4';
  if (n >= 1) return 'mastery-pip m3';
  return 'mastery-pip m0';
}

export function buildVerdict(identity, roster) {
  if (!identity || !roster?.length) {
    return 'Sin maestrías suficientes para emitir un veredicto todavía.';
  }

  const rustyCount = identity.rustyMains?.length || 0;
  const maxLevel = Math.max(...roster.map((r) => r.mastery.championLevel || 0));
  const days = roster[0]?.daysSincePlay;

  const parts = [
    `Pool de ${identity.championsTracked} campeones`,
    `firma ${identity.signature}`,
  ];

  if (maxLevel < 5) {
    parts.push(`sin ninguno por encima de maestría ${maxLevel}`);
  } else {
    parts.push(`${identity.m7} en M7 y ${identity.m5Plus} en M5+`);
  }

  if (rustyCount > 0) {
    parts.push(`${rustyCount} mains oxidados o dormidos`);
  } else if (typeof days === 'number' && days > 365) {
    parts.push('roster muy frío');
  }

  if (identity.chestsAvailable > 0) {
    parts.push(`${identity.chestsAvailable} cofres libres sobre la mesa`);
  }

  return parts.join(', ') + '.';
}

export function getNextActions(roster) {
  if (!roster?.length) return [];

  const closest = [...roster]
    .filter((r) => r.mastery.championLevel < 7)
    .sort(
      (a, b) =>
        (a.mastery.championPointsUntilNextLevel ?? 1e12) -
        (b.mastery.championPointsUntilNextLevel ?? 1e12)
    )[0];

  const chest = [...roster]
    .filter((r) => !r.mastery.chestGranted)
    .sort((a, b) => b.mastery.championPoints - a.mastery.championPoints)[0];

  const rusty = [...roster]
    .filter((r) => r.activity === 'rusty' || r.activity === 'dormant')
    .sort((a, b) => b.mastery.championPoints - a.mastery.championPoints)[0];

  const actions = [];

  if (closest) {
    const need = closest.mastery.championPointsUntilNextLevel ?? 0;
    actions.push({
      id: 'level',
      title: `${closest.champion.name.toUpperCase()} ESTÁ A UN EMPUJÓN`,
      body: need
        ? `Faltan ${need.toLocaleString()} pts para maestría ${closest.mastery.championLevel + 1}.`
        : `Cerca del siguiente nivel de maestría.`,
      cta: 'Fijar como meta',
      action: 'goal',
      champion: closest,
    });
  }

  if (chest) {
    actions.push({
      id: 'chest',
      title: `COFRE LIBRE CON ${chest.champion.name.toUpperCase()}`,
      body: `Es tu campeón con cofre pendiente y más puntos (${chest.mastery.championPoints.toLocaleString()} pts).`,
      cta: 'Ver cofres libres',
      action: 'filter-chests',
      champion: chest,
    });
  }

  if (rusty) {
    actions.push({
      id: 'rusty',
      title: `${rusty.champion.name.toUpperCase()} LLEVA ${rusty.daysSincePlay ?? '?'} DÍAS DORMIDO`,
      body: 'Es tu más oxidado con más puntos acumulados del pool.',
      cta: 'Ver oxidados',
      action: 'filter-rusty',
      champion: rusty,
    });
  }

  return actions.slice(0, 3);
}
