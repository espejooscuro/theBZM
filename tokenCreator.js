const mineflayer = require('mineflayer');
const fs = require('fs');
const readline = require('readline');

const SERVER = 'hub.enderblade.com';
const PORT = 25565;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Introduce el nombre del bot (correo Microsoft): ', botName => {
  rl.close();

  const bot = mineflayer.createBot({
    host: SERVER,
    port: PORT,
    username: botName,
    auth: 'microsoft',
    version: '1.20.4'
  });

  bot.on('spawn', () => {
    console.log(`${botName} conectado.`);

    // Guardamos el nombre que nos dio el usuario
    const tokenData = {
      username: botName,                // nombre que le pasamos
      accessToken: bot._client.session ? bot._client.session.accessToken : null,
      server: SERVER,
      port: PORT,
      obtainedAt: new Date().toISOString()
    };

    fs.writeFileSync(`tokens_${botName}.json`, JSON.stringify(tokenData, null, 2));
    console.log(`Datos guardados en tokens_${botName}.json`);
  });

  bot.on('error', err => console.error('Error del bot:', err));
  bot.on('end', () => console.log(`${botName} desconectado.`));
});
