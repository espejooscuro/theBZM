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

let bot = null;
let invListener = null;
let interactor = null;
let scoreboard = null;
let chat = null;
let panel = null;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startBot() {
  return new Promise((resolve, reject) => {
    bot = mineflayer.createBot({
      host: 'mc.hypixel.net',
      port: 25565,
      auth: 'microsoft',
      version: '1.8.9'
    });

    bot.on('error', err => reject(err));
    bot.on('end', () => console.log('Bot desconectado'));

    invListener = new InventoryListener(bot);
    interactor = new ContainerInteractor(bot, 150, 350);
    scoreboard = new ScoreboardListener(bot);
    chat = new ChatListener(bot, {
      palabras: ['Connecting to', 'MiniEspe'],
      tipos: ['sistema'],
      excluirPalabras: ['APPEARING OFFLINE', '✎ Mana']
    });

    // Emitir evento crítico
    chat.onMensajeContiene(
      /You have 60 seconds to warp out|You can't use this when the server is about to restart|Sending packets too fast|kick occurred in your connection, so you were put in the SkyBlock lobby|were spawned in Limbo/i,
      (registro) => {
        console.log('⚠️ Mensaje crítico detectado, solicitando reinicio del bot:', registro.mensaje);
        bot.emit('mensajeCritico', registro); // aquí ya es el mismo bot
      }
    );

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
        console.log('✅ ¡Bot conectado con tu cuenta premium!');
        await delay(1500);
        panel.manualReset();

        resolve(bot); // resolvemos la promesa con el bot real
      } catch (err) {
        reject(err);
      }
    });
  });
}

async function stopBot() {
  if (!bot) return;

  try {
    const estado = fs.existsSync(estadoPath)
      ? JSON.parse(fs.readFileSync(estadoPath))
      : {};
    estado.finished = true;
    fs.writeFileSync(estadoPath, JSON.stringify(estado, null, 2));
  } catch (err) {
    console.error("Error escribiendo estado.json:", err);
  }

  try {
    // 🔹 Limpiar listeners del ChatListener
    chat?.removeListeners?.();

    // 🔹 Limpiar todos los listeners del bot
    bot.removeAllListeners();

    // 🔹 Limpiar panel
    panel?.requesterQueue?.forEach(task => task.requester?.destroy?.());
    await panel?.destroy?.();

    // 🔹 Cerrar conexión del bot
    await bot.quit();
  } catch (e) {
    console.error('Error cerrando el bot:', e);
  }

  // 🔹 Limpiar referencias
  bot = null;
  invListener = null;
  interactor = null;
  scoreboard = null;
  chat = null;
  panel = null;

  console.log("Bot detenido completamente");
}


module.exports = { startBot, stopBot };
