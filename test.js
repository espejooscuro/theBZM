const { startBot } = require('./bot.js');

startBot('MiniEspe')
  .then(bot => console.log('Bot iniciado correctamente'))
  .catch(err => console.error('Error al iniciar bot:', err));
