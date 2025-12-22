const { makeBot } = require('./botRunner.js'); // ahora sí funciona

class SimpleBot {
    constructor(ign, safeIgn) {
        this.ign = ign;
        this.safeIgn = safeIgn;
        this.bot = null;
    }

    async createBot() {
        this.bot = await makeBot(this.ign, this.safeIgn);

        this.bot.once("login", () => {
            if (!this.bot.uuid) this.bot.uuid = this.bot.username;
        });

        this.bot.on("kicked", (reason) => {});

        return this.bot;
    }

    getBot() {
        return this.bot;
    }
}

module.exports = SimpleBot;
