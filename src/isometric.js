/* REINOS DAS CINZAS — projeção isométrica (módulo independente).
 * A lógica do mundo permanece em coordenadas de grade; apenas a apresentação muda.
 * Módulo sem efeitos colaterais para integração gradual ao Canvas atual.
 */
export const ISO_TILE_WIDTH = 64;
export const ISO_TILE_HEIGHT = 32;

export function worldToScreen(x, y, originX = 0, originY = 0, tileWidth = ISO_TILE_WIDTH, tileHeight = ISO_TILE_HEIGHT) {
  return {
    x: originX + (x - y) * tileWidth / 2,
    y: originY + (x + y) * tileHeight / 2
  };
}

export function screenToWorld(screenX, screenY, originX = 0, originY = 0, tileWidth = ISO_TILE_WIDTH, tileHeight = ISO_TILE_HEIGHT) {
  if (tileWidth <= 0 || tileHeight <= 0) throw new RangeError('Dimensões de tile inválidas');
  const dx = (screenX - originX) / (tileWidth / 2);
  const dy = (screenY - originY) / (tileHeight / 2);
  return { x: (dx + dy) / 2, y: (dy - dx) / 2 };
}

export function screenToTile(screenX, screenY, originX = 0, originY = 0, tileWidth = ISO_TILE_WIDTH, tileHeight = ISO_TILE_HEIGHT) {
  const point = screenToWorld(screenX, screenY, originX, originY, tileWidth, tileHeight);
  return { x: Math.round(point.x), y: Math.round(point.y) };
}

export function tileDrawOrder(a, b) {
  return (a.x + a.y) - (b.x + b.y) || a.y - b.y || a.x - b.x;
}

export function drawIsoDiamond(ctx, x, y, fill, originX = 0, originY = 0, tileWidth = ISO_TILE_WIDTH, tileHeight = ISO_TILE_HEIGHT) {
  const p = worldToScreen(x, y, originX, originY, tileWidth, tileHeight);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y - tileHeight / 2);
  ctx.lineTo(p.x + tileWidth / 2, p.y);
  ctx.lineTo(p.x, p.y + tileHeight / 2);
  ctx.lineTo(p.x - tileWidth / 2, p.y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}
