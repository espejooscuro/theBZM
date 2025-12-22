const SimpleBot = require('./SimpleBot.js');

async function main() {
    const bot1 = new SimpleBot('MiniEspe', 'MiniEspe');
    await bot1.createBot();
    console.log(`Bot de ${bot1.getBot().username} iniciado.`);

    await new Promise(resolve => setTimeout(resolve, 10000));

    const bot2 = new SimpleBot('nuwifer', 'nuwifer');
    await bot2.createBot();
    console.log(`Bot de ${bot2.getBot().username} iniciado.`);
}

main();
