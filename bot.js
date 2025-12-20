const mineflayer = require('mineflayer');
const { SocksClient } = require('socks');
const InventoryListener = require('./InventoryListener');
const ContainerInteractor = require('./ContainerInteractor');
const ScoreboardListener = require('./ScoreboardListener');
const ChatListener = require('./ChatListener');
const Panel = require('./Panel');
const fs = require('fs');
const path = require('path');

const basePath = process.pkg ? path.dirname(process.execPath) : __dirname;

function getEstadoPath(username) {
  return path.join(basePath, `estado_${username}.json`);
}

function ensureEstado(username) {
  const estadoPath = getEstadoPath(username);
  if (!fs.existsSync(estadoPath)) fs.writeFileSync(estadoPath, JSON.stringify({ webAbierta: false }, null, 2));
  return estadoPath;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function log(username, ...args) { console.log(`[${username}]`, ...args); }
function jitterDelay(ms) { return delay(ms + Math.random() * 1500); }

async function createBotWithProxy(username, proxyUrl) {
  let socket;

  if (proxyUrl) {
    const match = proxyUrl.match(/socks5:\/\/(.*):(.*)@(.*):(\d+)/);
    if (!match) throw new Error(`Formato de proxy inválido: ${proxyUrl}`);
    const [, user, pass, host, port] = match;

    const info = await SocksClient.createConnection({
      command: 'connect',
      proxy: {
        host,
        port: parseInt(port),
        type: 5,
        userId: user,
        password: pass
      },
      destination: { host: 'mc.hypixel.net', port: 25565 }
    });

    socket = info.socket;
    log(username, `✅ Conectando vía proxy ${host}:${port}`);
  }

  return mineflayer.createBot({
    username,
    host: 'mc.hypixel.net',
    port: 25565,
    auth: 'microsoft',
    version: '1.8.9',
    stream: socket || undefined
  });
}

async function startBot(username) {
  if (!username) return console.error("❌ Debes pasar un username válido");

  console.log(`Iniciando bot para: ${username}`);
  const estadoPath = ensureEstado(username);

  const proxyUrl = process.env.SOCKS_PROXY || null;
  const bot = await createBotWithProxy(username, proxyUrl);

  bot.on('login', () => console.log(`[${username}] LOGIN OK`));
  bot.on('kicked', (reason) => console.error(`[${username}] KICKED!`, reason));
  bot.on('end', () => console.log(`[${username}] END`));
  bot.on('error', (err) => console.error(`[${username}] ERROR`, err));

  new InventoryListener(bot);
  const itemClicker = new ContainerInteractor(bot, 150, 350);
  new ScoreboardListener(bot);

  const chat = new ChatListener(bot, {
    palabras: ['Connecting to', 'MiniEspe'],
    tipos: ['sistema'],
    excluirPalabras: ['APPEARING OFFLINE', '✎']
  });

  chat.onMensajeContiene(/You have 60 seconds|restart|Sending packets too fast|Limbo|maximum of/i, registro => {
    log(username, '⚠️ Mensaje crítico:', registro.mensaje);
    bot.end(); process.exitCode = 10; process.exit();
  });

  bot.on('duplicateBoughtReset', ({ nombre }) => {
    log(username, '❌ Dupe detectado:', nombre);
    bot.end(); process.exitCode = 12; process.exit();
  });

  bot.once('spawn', async () => {
    try {
      const estado = JSON.parse(fs.readFileSync(estadoPath));
      estado.finished = false;
      fs.writeFileSync(estadoPath, JSON.stringify(estado, null, 2));

      const panelPort = process.env.BOT_PORT ? parseInt(process.env.BOT_PORT) : undefined;
      const panel = new Panel(bot, { username, port: panelPort });

      await jitterDelay(4000);
      chat.enviar('/skyblock');
      await jitterDelay(5000);
      chat.enviar('/warp garden');
      await jitterDelay(5000);
      chat.enviar('/viewstash material');
      await jitterDelay(2000);
      itemClicker.click({ contiene: "Sell Stash Now", tipo: 'contenedor' });
      await jitterDelay(2000);
      itemClicker.click({ contiene: "Selling whole inventory", tipo: 'contenedor' });
      await jitterDelay(5000);

      log(username, '✅ Conectado');
      console.log("READY");
      panel.manualReset();
    } catch (e) {
      log(username, '❌ Error en spawn:', e);
      bot.end();
    }
  });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let username = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--account" && i + 1 < args.length) username = args[i + 1];
  }
  startBot(username).catch(err => console.error("❌ Error crítico:", err));
}

module.exports = { startBot, log };
