const axios = require('axios');

let tokenInfo = {};

async function getTokenInfo(token) {
    if (tokenInfo[token]) return tokenInfo[token];
    try {
        const headers = { headers: { "Authorization": `Bearer ${token}` } };
        const { id, name } = (await axios.get('https://api.minecraftservices.com/minecraft/profile', headers)).data;
        const data = { uuid: id, username: name };
        tokenInfo[token] = data;
        return data;
    } catch (e) {
        console.error('Error while fetching Minecraft from token:', e);
        return null;
    }
}

module.exports = { getTokenInfo };
