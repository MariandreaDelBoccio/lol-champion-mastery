/**
 * Mastery OS — product positioning & validation brief
 * Use this script in 5–10 interviews with ranked one-tricks / mains.
 */

export const POSITIONING = {
  promise: 'El hogar de tu relación con tus campeones',
  antiPromise: 'No somos el sitio donde miras una partida',
  primaryUser: 'Jugador ranked / semi-serio con 3–8 champions que “son suyos”',
  jobToBeDone:
    '¿Cómo cuido y progreso mi identidad con mis campeones?',
  competitorJob: '¿Cómo gano esta partida / este elo?',
};

export const HYPOTHESES = [
  {
    id: 'H1',
    statement:
      'Los mains miran maestría como identidad/ego, no solo como número en un perfil genérico.',
    signal: 'Describen su pool sin que se lo pidas; comparten pantallazos de M7.',
  },
  {
    id: 'H2',
    statement:
      'Tokens, cofres y “última vez jugado” son más accionables que el ranking de puntos solo.',
    signal: 'Quieren saber qué champ está oxidado antes de ranked.',
  },
  {
    id: 'H3',
    statement:
      'Metas simples (M7 en X) generan retorno sin buscar a otro summoner.',
    signal: 'Vuelven a la app entre sesiones de juego.',
  },
  {
    id: 'H4',
    statement:
      'Una tarjeta de pool compartible distribuye mejor que SEO genérico de builds.',
    signal: 'La pegan en Discord / Twitter al menos una vez.',
  },
];

/** 20-min interview script for target players */
export const INTERVIEW_SCRIPT = {
  screener: [
    '¿Juegas ranked al menos unas cuantas veces por semana?',
    '¿Tienes 1–8 campeones que consideras “tuyos”?',
  ],
  questions: [
    'Cuando abres OP.GG/U.GG, ¿para qué entras normalmente?',
    '¿Has mirado tu maestría últimamente? ¿Por qué sí/no?',
    '¿Cómo describirías tu identidad de pool a un duo?',
    '¿Te importa saber qué mains están oxidados antes de ranked?',
    'Si pudieras fijar una meta de maestría, ¿cuál sería?',
    '¿Compartirías una tarjeta de tu Top 5 de maestría? ¿Dónde?',
  ],
  successCriteria: [
    'Vuelve sin buscar a otro summoner (metas/hábitos)',
    'Comparte pool card ≥ 1 vez',
    'En 10s entiende “quién soy con mis champs”',
  ],
};
