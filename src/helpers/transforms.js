export const transformPlayers = rawBody =>
  rawBody.players.map(player => ({
    name: `${player.first_name} ${player.last_name}`,
    score: player.fppg,
    id: player.id
  }));
