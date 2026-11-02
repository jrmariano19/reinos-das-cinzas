import { worldToScreen, screenToTile, tileDrawOrder, drawIsoDiamond } from './isometric.js';

/**
 * Renderizador de terreno desacoplado da lógica do jogo.
 * Recebe a matriz real de tiles do andar e callbacks para cores/objetos.
 * Não altera movimento, combate, inventário nem persistência.
 */
export function createIsometricWorldRenderer({
  tileWidth = 64,
  tileHeight = 32,
  getTileColor = () => '#536b48'
} = {}) {
  if (tileWidth <= 0 || tileHeight <= 0) throw new RangeError('Dimensões de tile inválidas');

  function cameraFor(player, viewportWidth, viewportHeight) {
    const offset = worldToScreen(player.x, player.y, 0, 0, tileWidth, tileHeight);
    return { x: viewportWidth / 2 - offset.x, y: viewportHeight / 2 - offset.y };
  }

  function draw(ctx, map, player, viewportWidth, viewportHeight, objects = [], drawObject = () => {}) {
    if (!Array.isArray(map) || !map.length) return;
    const camera = cameraFor(player, viewportWidth, viewportHeight);
    const terrain = [];
    for (let y = 0; y < map.length; y++) {
      if (!Array.isArray(map[y])) continue;
      for (let x = 0; x < map[y].length; x++) terrain.push({ x, y, tile: map[y][x] });
    }
    terrain.sort(tileDrawOrder);
    for (const t of terrain) {
      const color = getTileColor(t.tile, t.x, t.y);
      drawIsoDiamond(ctx, t.x, t.y, color, camera.x, camera.y, tileWidth, tileHeight);
    }
    // Ordenação conjunta dos objetos; o chamador desenha os sprites originais.
    [...objects].sort(tileDrawOrder).forEach(o => {
      const p = worldToScreen(o.x, o.y, camera.x, camera.y, tileWidth, tileHeight);
      drawObject(ctx, o, p);
    });
    return camera;
  }

  function hitTest(screenX, screenY, player, viewportWidth, viewportHeight, map) {
    const camera = cameraFor(player, viewportWidth, viewportHeight);
    const tile = screenToTile(screenX, screenY, camera.x, camera.y, tileWidth, tileHeight);
    if (!Array.isArray(map) || tile.y < 0 || tile.y >= map.length ||
        !Array.isArray(map[tile.y]) || tile.x < 0 || tile.x >= map[tile.y].length) return null;
    return tile;
  }

  return { cameraFor, draw, hitTest };
}
