export const isIn = (array, object) => {
  const filter = array.filter((item) => {
    if (item.x === object.x && item.y === object.y) return item;
    return null;
  });
  if (filter.length) return true;
  return false;
};
