class ScoreboardListener {
  constructor(bot) {
    this.bot = bot
    this.scoreboard = {} // Objetivos con jugadores y puntajes
    this.displayedObjective = null // Objetivo mostrado en el sidebar

    // Evento: nuevo objetivo
    this.bot.on('scoreboardObjective', (objective) => {
      this.scoreboard[objective.name] = {
        displayName: objective.displayName,
        type: objective.type,
        players: {}
      }
    })

    // Evento: puntaje de jugador
    this.bot.on('scoreboardScore', (score) => {
      if (!this.scoreboard[score.objective]) return
      this.scoreboard[score.objective].players[score.name] = score.value
    })

    // Evento: objetivo mostrado en el sidebar
    this.bot.on('scoreboardDisplayObjective', (objective) => {
      if (objective) {
        this.displayedObjective = objective.name
      } else {
        this.displayedObjective = null
      }
    })

    // Evento: objetivo eliminado
    this.bot.on('scoreboardObjectiveRemove', (objective) => {
      delete this.scoreboard[objective.name]
      if (this.displayedObjective === objective.name) {
        this.displayedObjective = null
      }
    })
  }

  // Devuelve el scoreboard completo en JSON
  obtenerScoreboard() {
    const result = []

    for (const objName in this.scoreboard) {
      const obj = this.scoreboard[objName]
      const players = []
      for (const player in obj.players) {
        players.push({ jugador: player, puntuacion: obj.players[player] })
      }
      result.push({
        objective: objName,
        displayName: obj.displayName,
        tipo: obj.type,
        mostradoEnSidebar: this.displayedObjective === objName,
        jugadores: players
      })
    }

    return JSON.stringify(result, null, 2)
  }
}

module.exports = ScoreboardListener
