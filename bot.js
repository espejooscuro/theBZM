const mineflayer = require('mineflayer');
const { SocksClient } = require('socks');
const InventoryListener = require('./InventoryListener');
const ContainerInteractor = require('./ContainerInteractor');
const ScoreboardListener = require('./ScoreboardListener');
const ChatListener = require('./ChatListener');
const Panel = require('./Panel');
const fs = require('fs');
const path = require('path');
const { getTokenInfo } = require('./TokenHelper');

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

async function createBotWithProxy(username, proxyUrl = null, token = null) {
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

  // Si solo tenemos accessToken, obtenemos uuid y username con tokenHelper
  if (token && !token.uuid && !username) {
    const tokenData = await getTokenInfo(token.accessToken);
    if (!tokenData) throw new Error('No se pudo obtener info del token');
    username = tokenData.username;
    token.uuid = tokenData.uuid;
  }

  const options = {
    host: 'mc.hypixel.net',
    port: 25565,
    version: '1.8.9',
    username,
    stream: socket || undefined
  };

  if (token) {
    options.auth = 'mojang';
    options.session = {
      accessToken: token.accessToken,
      clientToken: token.clientToken,
      selectedProfile: { id: token.uuid, name: username, keepAlive: false }
    };
    options.skipValidation = true;
  } else {
    options.auth = 'microsoft';
  }

  const bot = mineflayer.createBot(options);
  bot.username = username;
  return bot;
}

// --- LECTURA DE VARIABLES DE ENTORNO (desde launcher) ---
const BOT_USERNAME = process.env.BOT_USERNAME;
const BOT_PROXY = process.env.BOT_PROXY || null;
const BOT_TOKEN = process.env.BOT_TOKEN ? JSON.parse(process.env.BOT_TOKEN) : null;
const PANEL_PORT = process.env.BOT_PORT ? parseInt(process.env.BOT_PORT) : undefined;

if (!BOT_USERNAME) {
  console.error("❌ Error: No se proporcionó username");
  process.exit(1);
}


// --- START BOT ---
async function startBot(username = BOT_USERNAME, proxy = BOT_PROXY, token = BOT_TOKEN, panelPort = PANEL_PORT) {
  if (!username) throw new Error('No se proporcionó username');

  console.log('🔹 startBot llamado con username:', username);

  const estadoPath = ensureEstado(username);
  console.log('🔹 Antes de crear bot:', { username, proxy, token });

  const bot = await createBotWithProxy(username, proxy, token);
  console.log('🔹 Bot creado:', bot.username);

  bot.on('login', () => console.log(`[${username}] LOGIN OK`));
  bot.on('kicked', r => console.error(`[${username}] KICKED!`, r));
  bot.on('error', e => console.error(`[${username}] ERROR`, e));

  // Listeners
  new InventoryListener(bot);
  new ContainerInteractor(bot, 150, 350);
  new ScoreboardListener(bot);

  const chat = new ChatListener(bot, {
    palabras: ['Connecting to'],
    tipos: ['sistema'],
    excluirPalabras: ['APPEARING OFFLINE', '✎']
  });

  chat.onMensajeContiene(/restart|Limbo|Sending packets too fast/i, () => bot.end());

  let panel = null;

  bot.once('spawn', async () => {
    try {
      const estado = JSON.parse(fs.readFileSync(estadoPath));
      estado.finished = false;
      fs.writeFileSync(estadoPath, JSON.stringify(estado, null, 2));

      if (!panel) {
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

  return bot;
}

// Si se ejecuta directamente (sin launcher), arrancamos con variables de entorno
if (require.main === module) {
  startBot().catch(err => {
    console.error('❌ Error al iniciar bot:', err);
    process.exit(1);
  });
}

module.exports = { startBot, log };
