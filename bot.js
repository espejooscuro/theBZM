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

if (!fs.existsSync(estadoPath)) {
  fs.writeFileSync(estadoPath, JSON.stringify({ webAbierta: false }, null, 2));
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function log(username, ...args) {
  console.log(`[${username}]`, ...args);
}

async function startBot(username) {
  if (!username) {
    console.error("❌ Debes pasar un username válido");
    process.exit(1);
  }

  console.log(`Iniciando bot para: ${username}`);

  const bot = mineflayer.createBot({
    host: 'mc.hypixel.net',
    port: 25565,
    auth: 'microsoft',
    username,
    version: '1.8.9',
    keepAlive: true,
    timeout: 60000,
    connectTimeout: 120000
  });

  bot.on('error', err => log(username, '❌ Error:', err.message));
  bot.on('end', reason => log(username, '🔌 Desconectado:', reason));

  new InventoryListener(bot);
  new ContainerInteractor(bot, 150, 350);
  new ScoreboardListener(bot);

  const chat = new ChatListener(bot, {
    palabras: ['Connecting to', 'MiniEspe'],
    tipos: ['sistema'],
    excluirPalabras: ['APPEARING OFFLINE', '✎']
  });

  chat.onceMensajeContiene(/You have 60 seconds|restart|Sending packets too fast|Limbo|maximum of/i, registro => {
    log(username, '⚠️ Mensaje crítico:', registro.mensaje);
    bot.end();
    process.exit(10);
  });

  bot.once('duplicateBoughtReset', ({ nombre }) => {
    log(username, '❌ Dupe detectado:', nombre);
    bot.end();
    process.exit(12);
  });

  bot.once('spawn', async () => {
    try {
      const estado = JSON.parse(fs.readFileSync(estadoPath));
      estado.finished = false;
      fs.writeFileSync(estadoPath, JSON.stringify(estado, null, 2));

      // Tomar el puerto del launcher
      const panelPort = process.env.BOT_PORT ? parseInt(process.env.BOT_PORT) : undefined;
      const panel = new Panel(bot, { username, port: panelPort });

      await delay(4000);
      chat.enviar('/skyblock');
      await delay(5000);
      chat.enviar('/warp garden');
      await delay(5000);

      log(username, '✅ Conectado');
      console.log("READY"); // Señal para el launcher
      panel.manualReset();

    } catch (e) {
      log(username, '❌ Error en spawn:', e);
      process.exit(11);
    }
  });
}

// Ejecutar automáticamente si se llama desde la línea de comandos
if (require.main === module) {
  const args = process.argv.slice(2);
  let username = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--account" && i + 1 < args.length) {
      username = args[i + 1];
      break;
    }
  }

  startBot(username).catch(err => {
    console.error("❌ Error crítico:", err);
    process.exit(11);
  });
}

module.exports = { startBot, log };
