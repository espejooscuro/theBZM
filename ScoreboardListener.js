class ScoreboardListener {
  constructor(bot) {
    this.bot = bot;
    this.scoreboard = {};
    this.displayedObjective = null;
    this._listeners = [];

    const handleObjective = (objective) => {
      this.scoreboard[objective.name] = {
        displayName: objective.displayName,
        type: objective.type,
        players: {}
      };
    };
    this.bot.on('scoreboardObjective', handleObjective);
    this._listeners.push({ event: 'scoreboardObjective', handler: handleObjective });

    const handleScore = (score) => {
      if (!this.scoreboard[score.objective]) return;
      this.scoreboard[score.objective].players[score.name] = score.value;
    };
    this.bot.on('scoreboardScore', handleScore);
    this._listeners.push({ event: 'scoreboardScore', handler: handleScore });

    const handleDisplay = (objective) => {
      this.displayedObjective = objective ? objective.name : null;
    };
    this.bot.on('scoreboardDisplayObjective', handleDisplay);
    this._listeners.push({ event: 'scoreboardDisplayObjective', handler: handleDisplay });

    const handleRemove = (objective) => {
      delete this.scoreboard[objective.name];
      if (this.displayedObjective === objective.name) this.displayedObjective = null;
    };
    this.bot.on('scoreboardObjectiveRemove', handleRemove);
    this._listeners.push({ event: 'scoreboardObjectiveRemove', handler: handleRemove });
  }

  removeListeners() {
    if (!this.bot || !this._listeners) return;
    for (const { event, handler } of this._listeners) {
      this.bot.removeListener(event, handler);
    }
    this._listeners = [];
    this.scoreboard = {};
    this.displayedObjective = null;
  }

  obtenerScoreboard() {
    const result = [];
    for (const objName in this.scoreboard) {
      const obj = this.scoreboard[objName];
      const players = Object.entries(obj.players).map(([jugador, puntuacion]) => ({ jugador, puntuacion }));
      result.push({
        objective: objName,
        displayName: obj.displayName,
        tipo: obj.type,
        mostradoEnSidebar: this.displayedObjective === objName,
        jugadores: players
      });
    }
    return JSON.stringify(result, null, 2);
  }
}

module.exports = ScoreboardListener;
