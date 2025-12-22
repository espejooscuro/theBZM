const { createBot } = require("mineflayer");
const { getPackets, makePackets } = require("./packets.js");
const { getTokenInfo } = require('./TokenHandler.js');
const axios = require('axios');

async function makeBot(ign, safeIgn) {
    return new Promise(async (resolve) => {
        let bot;

        if (ign.length > 16) { // login con token
            let { username, uuid } = await getTokenInfo(ign);
            bot = createBot({
                host: 'play.hypixel.net',
                port: 25565,
                version: '1.8.9',
                username: username,
                session: {
                    accessToken: ign,
                    clientToken: uuid,
                    selectedProfile: { id: uuid, name: username, keepAlive: false },
                },
                auth: 'mojang',
                skipValidation: true,
            });
            bot.username = username;
            ign = username;
        } else { // login Microsoft
            bot = createBot({
                username: ign,
                auth: 'microsoft',
                version: '1.8.9',
                host: 'play.hypixel.net',
            });
        }

        makePackets(ign, bot._client);
        bot.setMaxListeners(20);

        bot.once("login", async () => {
            if (!bot.uuid) bot.uuid = await getUUID(ign);
            bot.head = `https://mc-heads.net/head/${bot.uuid}.png`;
            resolve(bot);
        });
    });
}

async function getUUID(ign, attempt = 0) {
    if (attempt === 3) return null;
    try {
        return (await axios.get(`https://api.mojang.com/users/profiles/minecraft/${ign}`)).data.id;
    } catch {
        return getUUID(ign, ++attempt);
    }
}

module.exports = { makeBot };
