const SkyBlockItem = require('./SkyBlockItem');
const sb = new SkyBlockItem();

(async () => {
  const top10 = await sb.obtenerTop30NPCFlips();
  console.log(top10);
})();

