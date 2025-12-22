const mineflayer = require('mineflayer');
const fs = require('fs');

const SERVER = 'hub.enderblade.com';
const PORT = 25565;

// Leer todos los archivos que empiezan por tokens_ y terminan en .json
const tokenFiles = fs.readdirSync('.').filter(f => f.startsWith('tokens_') && f.endsWith('.json'));

if (tokenFiles.length === 0) {
  console.log('No se encontraron archivos tokens_*.json en el directorio.');
  process.exit(0);
}

tokenFiles.forEach(file => {
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
    bot.on('end', () => console.log(`${tokens.username} desconectado`));

  } catch (err) {
    console.error('Error leyendo el archivo', file, err);
  }
});
