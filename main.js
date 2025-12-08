// main.js
const { app } = require('electron');
require('./launcher'); // tu launcher.js con toda la lógica

app.whenReady().then(() => {
  console.log('✅ BZM iniciado con Electron');
});

process.on('SIGINT', async () => {
  console.log('\nApagando todo...');
  process.exit(0);
});
