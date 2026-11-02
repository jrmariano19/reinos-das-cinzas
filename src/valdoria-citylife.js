/**
 * Movimento de patrulhas e moradores da Valdoria 3D.
 * Sem dependências de renderização: o mesmo simulador serve ao Three.js e aos testes.
 * Rotas estão no plano X/Z, medidas em unidades do cenário.
 */
export function createPatrol(waypoints, speed = 2.3, startIndex = 1) {
  if (!Array.isArray(waypoints) || waypoints.length < 2 ||
      waypoints.some(p => !Array.isArray(p) || p.length !== 2 ||
        !Number.isFinite(p[0]) || !Number.isFinite(p[1]))) {
    throw new TypeError('A patrulha exige ao menos dois pontos X/Z válidos');
  }
  if (!Number.isFinite(speed) || speed <= 0) throw new RangeError('Velocidade inválida');
  const first = waypoints[0];
  return {
    x: first[0], z: first[1], waypoints,
    index: ((startIndex % waypoints.length) + waypoints.length) % waypoints.length,
    speed, heading: 0, walking: false
  };
}

/** Simula um avanço limitado a 50 ms para evitar saltos após troca de aba. */
export function advancePatrol(patrol, elapsedSeconds) {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) {
    patrol.walking = false;
    return patrol;
  }
  let remaining = Math.min(elapsedSeconds, 0.05) * patrol.speed;
  let moved = 0;
  // Vários pontos próximos não podem gerar um loop infinito.
  for (let steps = 0; steps < patrol.waypoints.length && remaining > 0.00001; steps++) {
    const target = patrol.waypoints[patrol.index];
    const dx = target[0] - patrol.x;
    const dz = target[1] - patrol.z;
    const distance = Math.hypot(dx, dz);
    if (distance < 0.0001) {
      patrol.index = (patrol.index + 1) % patrol.waypoints.length;
      continue;
    }
    const travel = Math.min(remaining, distance);
    patrol.x += dx / distance * travel;
    patrol.z += dz / distance * travel;
    patrol.heading = Math.atan2(dx, dz);
    moved += travel;
    remaining -= travel;
    if (travel >= distance - 0.0001) patrol.index = (patrol.index + 1) % patrol.waypoints.length;
    else break;
  }
  patrol.walking = moved > 0.00001;
  return patrol;
}
