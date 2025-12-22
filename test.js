const mineflayer = require('mineflayer');
const fs = require('fs');

const SERVER = 'hub.enderblade.com';
const PORT = 25565;

const tokenFiles = fs.readdirSync('.').filter(f => f.startsWith('tokens_') && f.endsWith('.json'));

if (!tokenFiles.length) {
  console.log('No se encontraron archivos tokens_*.json.');
  process.exit(0);
}

function launchBot(file) {
  try {
    const tokens = JSON.parse(fs.readFileSync(file, 'utf8'));

    const bot = mineflayer.createBot({
      host: SERVER,
      port: PORT,
      username: tokens.username,
      auth: 'microsoft',
      accessToken: tokens.accessToken,
      version: '1.20.4'
    });

    bot.on('spawn', () => {
      console.log(`${tokens.username} conectado usando tokens desde ${file}`);
    });

    bot.on('error', err => console.error(`Error del bot ${tokens.username}:`, err));

    bot.on('end', () => {
      console.log(`${tokens.username} desconectado, reconectando en 5s...`);
      setTimeout(() => launchBot(file), 5000); // reconecta automáticamente
    });

  } catch (err) {
    console.error('Error leyendo el archivo', file, err);
  }
}

// Conectar bots uno por uno con pequeño retraso
tokenFiles.forEach((file, i) => setTimeout(() => launchBot(file), i * 2000));
