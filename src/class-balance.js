/** Reinos das Cinzas: funções de balanceamento independentes do jogo legado. */
export const TIER_LEVELS = Object.freeze([1,20,40,60,80]);
export const LEVEL_CAP = 120;
export function tierForLevel(level) {
  if (!Number.isInteger(level) || level < 1 || level > LEVEL_CAP) throw new RangeError('Nível inválido');
  return TIER_LEVELS.filter(min => level >= min).length;
}
export function attributePointsForLevel(level) {
  if (!Number.isInteger(level) || level < 1 || level > LEVEL_CAP) throw new RangeError('Nível inválido');
  return 5 * (level - 1);
}
export function skillPointsForLevel(level) {
  if (!Number.isInteger(level) || level < 1 || level > LEVEL_CAP) throw new RangeError('Nível inválido');
  return Math.floor(level / 2);
}
export function experienceToNext(level) {
  if (!Number.isInteger(level) || level < 1 || level > LEVEL_CAP) throw new RangeError('Nível inválido');
  return level === LEVEL_CAP ? null : Math.floor(100*level**1.65+18*level**2.25);
}
export function defenseMultiplier(defense, attackerLevel) {
  if (!Number.isFinite(defense) || defense < 0 || !Number.isInteger(attackerLevel) || attackerLevel < 1) throw new RangeError('Parâmetros inválidos');
  return 1-Math.min(.75,defense/(defense+75+8*attackerLevel));
}
export function areaDamageMultiplier(targets) {
  if (!Number.isInteger(targets) || targets < 1) throw new RangeError('Alvos inválidos');
  return Math.max(.65,1-.07*Math.max(0,targets-5));
}
export function partyXpPool(baseXp,members) {
  if (!Number.isFinite(baseXp) || baseXp < 0 || !Number.isInteger(members) || members<1 || members>6) throw new RangeError('Grupo inválido');
  return Math.floor(baseXp*(1+.08*(members-1)));
}
export const PVP_DAMAGE_MULTIPLIER=.68;
