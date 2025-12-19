const mineflayer = require('mineflayer');
const InventoryListener = require('./InventoryListener');
const ContainerInteractor = require('./ContainerInteractor');
const ScoreboardListener = require('./ScoreboardListener');
const ChatListener = require('./ChatListener');
const Panel = require('./Panel');
const fs = require('fs');
const path = require('path');

const basePath = process.pkg ? path.dirname(process.execPath) : __dirname;
const estadoPath = path.join(basePath, 'estado.json');

/* ---------- EXIT CODES ---------- */
const EXIT_CODES = {
  MENSAJE_CRITICO: 10,
  ERROR_RESET: 11,
  DUPE_RESET: 12,
  FATAL: 1
};

/* ---------- estado ---------- */
if (!fs.existsSync(estadoPath)) {
  fs.writeFileSync(estadoPath, JSON.stringify({ webAbierta: false }, null, 2));
}

let bot = null;
let invListener = null;
let interactor = null;
let scoreboard = null;
let chat = null;
let panel = null;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ---------- BOT ---------- */
async function startBot() {
  return new Promise((resolve, reject) => {

    bot = mineflayer.createBot({
      host: 'mc.hypixel.net',
      port: 25565,
      auth: 'microsoft',
      version: '1.8.9',
      keepAlive: true,
      timeout: 60000,
      connectTimeout: 120000
    });

    bot.on('error', err => {
      console.log('❌ Error de red:', err.message);
    });

    process.on('uncaughtException', err => {
      console.log('⚠ Excepción no capturada:', err.message);
      process.exit(EXIT_CODES.FATAL);
    });

    bot.on('end', async reason => {
      console.log('🔌 Conexión cerrada:', reason);

      if (typeof reason === 'string' && reason.includes('socketClosed')) {
        console.log('⏳ Esperando 5 minutos para reset...');
        await delay(5 * 60 * 1000);
        process.exit(EXIT_CODES.ERROR_RESET);
      }
    });

    invListener = new InventoryListener(bot);
    interactor = new ContainerInteractor(bot, 150, 350);
    scoreboard = new ScoreboardListener(bot);

    chat = new ChatListener(bot, {
      palabras: ['Connecting to', 'MiniEspe'],
      tipos: ['sistema'],
      excluirPalabras: ['APPEARING OFFLINE', '✎']
    });

    chat.onceMensajeContiene(
      /You have 60 seconds to warp out|You can't use this when the server is about to restart|Sending packets too fast|kick occurred in your connection, so you were put in the SkyBlock lobby|were spawned in Limbo|You reached your maximum of/i,
      registro => {
        console.log('⚠️ Mensaje crítico:', registro.mensaje);
        process.exit(EXIT_CODES.MENSAJE_CRITICO);
      }
    );

    bot.once('duplicateBoughtReset', ({ nombre }) => {
      console.log(`❌ Dupe detectado: ${nombre}`);
      process.exit(EXIT_CODES.DUPE_RESET);
    });

    bot.once('spawn', async () => {
      try {
        const estado = fs.existsSync(estadoPath)
          ? JSON.parse(fs.readFileSync(estadoPath))
          : {};

        estado.finished = false;
        fs.writeFileSync(estadoPath, JSON.stringify(estado, null, 2));

        panel = new Panel(bot);
        await delay(4000);
        chat.enviar("/skyblock");
        await delay(5000);
        chat.enviar("/warp garden");
        await delay(5000);

        console.log('✅ Bot conectado correctamente');
        await delay(1500);
        panel.manualReset();

        resolve(bot);
      } catch (err) {
        reject(err);
      }
    });
  });
}

/* ---------- AUTO START ---------- */
if (require.main === module) {
  startBot().catch(() => process.exit(EXIT_CODES.FATAL));
}

/* ---------- EXPORT (opcional) ---------- */
module.exports = { startBot };
