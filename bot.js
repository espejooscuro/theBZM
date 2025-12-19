const mineflayer = require('mineflayer');
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

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function log(username, ...args) {
  console.log(`[${username}]`, ...args);
}

async function startBot(username) {
  if (!username) {
    console.error("❌ Debes pasar un username válido");
    return; // no cerramos todo el launcher
  }

  console.log(`Iniciando bot para: ${username}`);

  const estadoPath = ensureEstado(username);

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

  bot.on('kicked', (reason, loggedIn) => {
  console.error(`[${username}] KICKED!`, reason, loggedIn);
});

bot.on('end', (reason) => {
  console.error(`[${username}] END!`, reason);
});

bot.on('error', (err) => {
  console.error(`[${username}] ERROR!`, err.stack || err);
});

bot.on('login', () => {
  console.log(`[${username}] LOGIN OK`);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err.stack || err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', reason.stack || reason, promise);
});

  new InventoryListener(bot);
  let itemClicker = new ContainerInteractor(bot, 150, 350);
  new ScoreboardListener(bot);

  const chat = new ChatListener(bot, {
    palabras: ['Connecting to', 'MiniEspe'],
    tipos: ['sistema'],
    excluirPalabras: ['APPEARING OFFLINE', '✎']
  });

  // Mensajes críticos: solo cerramos el bot, no todo el launcher
  chat.onMensajeContiene(/You have 60 seconds|restart|Sending packets too fast|Limbo|maximum of/i, registro => {
    log(username, '⚠️ Mensaje crítico:', registro.mensaje);
    bot.end();
    process.exitCode = 10;
    process.exit();
  });

  bot.on('duplicateBoughtReset', ({ nombre }) => {
    log(username, '❌ Dupe detectado:', nombre);
    bot.end();
    process.exitCode = 12; // el launcher reinicia procesos con código 12
  process.exit();
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
      chat.enviar('/viewstash material');
      await delay(2000);
      itemClicker.click({ contiene: "Sell Stash Now", tipo: 'contenedor' });
      await delay(2000);
      itemClicker.click({ contiene: "Selling whole inventory", tipo: 'contenedor' });
      await delay(5000);
      log(username, '✅ Conectado');
      console.log("READY"); // Señal para el launcher
      panel.manualReset();

    } catch (e) {
      log(username, '❌ Error en spawn:', e);
      bot.end();
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
    // no cerramos todo el launcher
  });
}

module.exports = { startBot, log };
