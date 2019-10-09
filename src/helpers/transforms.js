const transformPlayer = player => ({
  name: `${player.first_name} ${player.last_name}`,
  score: player.fppg,
  id: player.id,
  teamId: player.team._members[0]
});

const removeNoScoredPlayers = ({ fppg }) => fppg || fppg === 0;

export const transformPlayers = rawBody => {
  const teamNames = rawBody.teams.reduce(
    (allTeams, team) => ({
      ...allTeams,
      [team.id]: { name: team.name, players: [] }
    }),
    {}
  );

  const playersByTeam = rawBody.players
    .filter(removeNoScoredPlayers)
    .reduce((teams, player) => {
      const playerTeamId = player.team._members[0];
      return {
        ...teams,
        [playerTeamId]: {
          ...teams[playerTeamId],
          players: [...teams[playerTeamId].players, transformPlayer(player)]
        }
      };
    }, teamNames);

  return playersByTeam;
};
