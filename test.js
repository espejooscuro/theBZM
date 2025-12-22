const mineflayer = require('mineflayer');
const fs = require('fs');
const readline = require('readline');
const axios = require('axios');

const SERVER = 'hub.enderblade.com';
const PORT = 25565;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para obtener UUID desde token o nombre
async function getUUIDFromToken(token) {
  try {
    const { data } = await axios.get('https://api.minecraftservices.com/minecraft/profile', {
      headers: { "Authorization": `Bearer ${token}` }
    });
    return { username: data.name, uuid: data.id };
  } catch (e) {
    console.error('Error obteniendo UUID desde token:', e.message);
    return null;
  }
}

// Función que crea un bot a partir de un JSON de tokens
async function makeBotFromJSON(file) {
  if (!fs.existsSync(file)) {
    console.error('Archivo no encontrado:', file);
    return null;
  }

  const tokens = JSON.parse(fs.readFileSync(file, 'utf8'));
  let sessionInfo;

  if (tokens.accessToken) {
    sessionInfo = await getUUIDFromToken(tokens.accessToken);
    if (!sessionInfo) return null;
  }

  const bot = mineflayer.createBot({
    host: SERVER,
    port: PORT,
    username: tokens.username || (sessionInfo && sessionInfo.username),
    auth: 'microsoft',
    accessToken: tokens.accessToken,
    version: '1.20.4'
  });

  bot.once('spawn', () => {
    console.log(`${bot.username} conectado!`);
  });

  bot.on('error', err => console.error('Error del bot:', err));
  bot.on('end', () => console.log(`${bot.username} desconectado`));

  return bot;
}

// Bucle interactivo para cargar múltiples bots
async function startBotLoop() {
  rl.question('Nombre del bot (archivo tokens_<nombre>.json) o "salir": ', async name => {
    if (name.toLowerCase() === 'salir') {
      rl.close();
      return;
    }

    const file = `tokens_${name}.json`;
    await makeBotFromJSON(file);

    // Pedir siguiente bot
    startBotLoop();
  });
}

// Iniciar bucle
startBotLoop();
