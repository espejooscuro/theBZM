const mineflayer = require('mineflayer');
const fs = require('fs');

const SERVER = 'hub.enderblade.com';
const PORT = 25565;

const file = process.argv[2];
const username = process.argv[3] || 'Bot';

if (!file) {
  console.error('Debes pasar el archivo de token como argumento');
  process.exit(1);
}

const tokens = JSON.parse(fs.readFileSync(file, 'utf8'));

function launchBot() {
  const bot = mineflayer.createBot({
    host: SERVER,
    port: PORT,
    auth: 'microsoft',
    accessToken: tokens.accessToken,
    username: username,
    version: '1.20.4'
  });

  bot.on('spawn', () => {
    console.log(`${username} conectado usando tokens desde ${file}`);
  });

  bot.on('error', err => {
    console.error(`Error del bot ${username}:`, err);
  });

  bot.on('end', () => {
    console.log(`${username} desconectado, reconectando en 5s...`);
    setTimeout(launchBot, 5000); // reconexión automática
  });
}

launchBot();
