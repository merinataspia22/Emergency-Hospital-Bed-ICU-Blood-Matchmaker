// Shudhu allowed field gulo nao (user jeno onno field pathate na pare)
const pick = (obj = {}, keys = []) =>
  keys.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key];
    return acc;
  }, {});

export default pick;
