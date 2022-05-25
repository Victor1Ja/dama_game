const node = {
  goodGuys: [],
  badGuys: [],
  value: 0,
};

const allNodes = [];

const thereIsAPiece = (y, x, where) => {
  for (const piece of where) if (piece.y === y && piece.x === x) return true;
  return false;
};

/**
 *
 * @param {array[]} goodGuys
 * @param {array[]} badGuys
 * @param {number} level player
 */
const MinMax = (goodGuys, badGuys, level, maxDeep = 10) => {};
