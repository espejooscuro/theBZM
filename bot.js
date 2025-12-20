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
  if (!fs.existsSync(estadoPath)) {
    fs.writeFileSync(estadoPath, JSON.stringify({ webAbierta: false }, null, 2));
  }
  return estadoPath;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function log(username, ...args) { console.log(`[${username}]`, ...args); }
function jitterDelay(ms) { return delay(ms + Math.random() * 1500); }

async function createBot(username, proxyUrl = null, accessToken = null, clientToken = null) {
  let socket;

  if (proxyUrl) {
    const match = proxyUrl.match(/socks5:\/\/(.*):(.*)@(.*):(\d+)/);
    if (!match) throw new Error(`Formato de proxy inválido: ${proxyUrl}`);
    const [, user, pass, host, port] = match;

    const info = await SocksClient.createConnection({
      command: 'connect',
      proxy: { host, port: parseInt(port), type: 5, userId: user, password: pass },
      destination: { host: 'mc.hypixel.net', port: 25565 }
    });

    socket = info.socket;
    log(username, `✅ Conectando vía proxy ${host}:${port}`);
  }

  return mineflayer.createBot({
    username,              // solo para referencia local
    host: 'mc.hypixel.net',
    port: 25565,
    auth: 'microsoft',
    accessToken,           // token exclusivo por bot
    clientToken,           // token exclusivo por bot
    version: '1.8.9',
    stream: socket
  });
}

async function startBot(username, accessToken = null, clientToken = null) {
  if (!username) return;

  console.log(`Iniciando bot para: ${username}`);
  const estadoPath = ensureEstado(username);
  const proxyUrl = process.env.SOCKS_PROXY || null;

  const bot = await createBot(username, proxyUrl, accessToken, clientToken);

  bot.on('login', () => console.log(`[${username}] LOGIN OK`));
  bot.on('kicked', r => console.error(`[${username}] KICKED!`, r));
  bot.on('error', e => console.error(`[${username}] ERROR`, e));

  new InventoryListener(bot);
  new ContainerInteractor(bot, 150, 350);
  new ScoreboardListener(bot);

  const chat = new ChatListener(bot, {
    palabras: ['Connecting to'],
    tipos: ['sistema'],
    excluirPalabras: ['APPEARING OFFLINE', '✎']
  });

  chat.onMensajeContiene(/restart|Limbo|Sending packets too fast/i, () => {
    bot.end();
  });

  let panel = null;

  bot.once('spawn', async () => {
    try {
      const estado = JSON.parse(fs.readFileSync(estadoPath));
      estado.finished = false;
      fs.writeFileSync(estadoPath, JSON.stringify(estado, null, 2));

      if (!panel) {
        const panelPort = process.env.BOT_PORT ? parseInt(process.env.BOT_PORT) : undefined;
        panel = new Panel(bot, { username, port: panelPort });
        bot.once('end', () => panel?.destroy());
      }

      await jitterDelay(4000);
      chat.enviar('/skyblock');
      await jitterDelay(5000);
      chat.enviar('/warp garden');
      await jitterDelay(5000);

      console.log("READY");
      panel.manualReset();
    } catch (e) {
      log(username, '❌ Error en spawn:', e);
      bot.end();
    }
  });
}

if (require.main === module) {
  const i = process.argv.indexOf("--account");
  const username = i !== -1 ? process.argv[i + 1] : null;
  const accessToken = process.env.ACCESS_TOKEN || null;
  const clientToken = process.env.CLIENT_TOKEN || null;
  startBot(username, accessToken, clientToken);
}

module.exports = { startBot, log };
