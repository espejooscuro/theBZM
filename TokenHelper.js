// tokenHelper.js
const axios = require('axios');
const { error } = require('./logger.js'); // tu logger

// Cache para no pedir el mismo token varias veces
let tokenCache = {};

/**
 * Obtiene la información de un token de Minecraft (username y UUID)
 * @param {string} token - El accessToken de Minecraft
 * @returns {Promise<{uuid: string, username: string} | null>}
 */
async function getTokenInfo(token) {
    if (tokenCache[token]) return tokenCache[token];

    try {
        const headers = {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        };

        const response = await axios.get('https://api.minecraftservices.com/minecraft/profile', headers);
        const { id, name } = response.data;

        const data = { uuid: id, username: name };
        tokenCache[token] = data;

        return data;
    } catch (e) {
        error('Error al obtener info de Minecraft desde token:', e);
        return null;
    }
}

module.exports = { getTokenInfo };
