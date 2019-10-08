import React, { Component, Fragment } from "react";
import Grid from "@material-ui/core/Grid";
import {
  withStyles,
  Dialog,
  DialogTitle,
  DialogActions
} from "@material-ui/core";
import Button from "@material-ui/core/Button";

import Player from "./player";
import { getPlayers } from "../helpers/requests";

const styles = {
  scoreParent: {
    textAlign: "center"
  },
  scoreCall: {
    display: "inline-block"
  },
  actionButton: {
    float: "right",
    margin: 10
  }
};

class Game extends Component {
  defaultGameState = {
    score: 0,
    rounds: 0,
    playerIndexesSeen: {},
    playersInPlay: null,
    selectedPlayer: null,
    roundResult: null
  };

  state = {
    players: [],
    isLoading: true,
    isError: false,
    game: this.defaultGameState
  };

  componentDidMount() {
    getPlayers()
      .then(teams => {
        this.setState(
          {
            teams,
            // take the first 2 teams
            teamsInPlay: Object.keys(teams).slice(0, 2),
            isLoading: false,
            isError: false
          },
          this.prepareRound
        );
      })
      .catch(err => this.setState({ isError: true, isLoading: false }));
  }

  randomIndex = (max, numbersToExclude = []) => {
    var randomNumber = Math.floor(Math.random() * Math.floor(max));

    return numbersToExclude.includes(randomNumber)
      ? this.randomIndex(max, numbersToExclude)
      : randomNumber;
  };

  generateRandomPlayerFromTeam = teamId => {
    const { playerIndexesSeen, teams } = this.state;
    const thisTeam = teams[teamId];

    const indexesSeenFromTeam =
      (playerIndexesSeen && playerIndexesSeen[teamId]) || [];

    const numberOfPlayersNotPlayedFromTeam = thisTeam.players.filter(
      ({ id }) => !indexesSeenFromTeam.includes(id)
    ).length;

    const randomIndex = this.randomIndex(
      numberOfPlayersNotPlayedFromTeam,
      indexesSeenFromTeam
    );

    const randomUnplayedPlayer = {
      ...thisTeam.players[randomIndex],
      index: randomIndex
    };

    return randomUnplayedPlayer;
  };

  prepareRound = () => {
    const { teamsInPlay } = this.state;
    const playerA = this.generateRandomPlayerFromTeam(teamsInPlay[0]);
    const playerB = this.generateRandomPlayerFromTeam(teamsInPlay[1]);

    const newPlayers = [playerA, playerB];

    // create new newPlayers arr as sorting will mutate newPlayers
    const [maxScorePlayerId] = [...newPlayers]
      .sort((a, b) => b.score - a.score)
      .map(({ id }) => id);

    this.setState(({ game }) => ({
      game: {
        ...game,
        playersInPlay: newPlayers.map(player => ({
          ...player,
          correctAnswer: player.id === maxScorePlayerId
        })),
        rounds: ++game.rounds,
        roundResult: null,
        selectedPlayer: null
      }
    }));
  };

  onChoosePlayer = chosenPlayer => () => {
    const allScores = this.state.game.playersInPlay.map(({ score }) => score);

    if (chosenPlayer.score === Math.max(...allScores)) {
      this.setState(({ game }) => ({
        game: {
          ...game,
          score: ++game.score,
          selectedPlayer: chosenPlayer.id,
          roundResult: "WIN"
        }
      }));
    } else {
      this.setState(({ game }) => ({
        game: {
          ...game,
          selectedPlayer: chosenPlayer.id,
          roundResult: "LOSE"
        }
      }));
    }
  };

  proceedGame = () => {
    const playerIndexesSeen = this.state.game.playersInPlay.reduce(
      (existingIndexesSeen, player) => {
        return {
          ...existingIndexesSeen,
          [player.teamId]: [
            ...(existingIndexesSeen[player.teamId] || []),
            player.index
          ]
        };
      },
      this.state.game.playerIndexesSeen
    );

    console.log("indexes seen", playerIndexesSeen);

    this.setState(
      ({ game }) => ({
        game: {
          ...game,
          playerIndexesSeen
        }
      }),
      this.prepareRound
    );
  };

  resetGame = () => {
    this.setState(
      {
        game: this.defaultGameState
      },
      this.prepareRound
    );
  };

  renderWinningDialog = () => {
    return (
      <Dialog open>
        <DialogTitle>
          You win, it took you {this.state.game.rounds} rounds to win
        </DialogTitle>
        <DialogActions>
          <Button color="primary" onClick={this.resetGame}>
            Try better
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  render() {
    const { isLoading, isError, game } = this.state;
    const { classes } = this.props;

    if (isLoading || !game.playersInPlay) {
      return <div>Loading...</div>;
    }

    if (isError) {
      return <div>An error occurred, refresh the page</div>;
    }

    const isWinningDialogOpen = game.score === 2;
    const showActionButton = game.roundResult;

    return (
      <Fragment>
        <div className={classes.scoreParent}>
          <div className={classes.scoreCall}>Score: {game.score}</div>
        </div>
        <Grid container spacing={3}>
          {isWinningDialogOpen && this.renderWinningDialog()}
          {game.playersInPlay.map(player => (
            <Grid item xs={6} key={player.id}>
              <Player
                player={player}
                revealResult={game.roundResult}
                selectedPlayer={game.selectedPlayer}
                onChoose={this.onChoosePlayer(player)}
              />
            </Grid>
          ))}
        </Grid>
        {showActionButton && (
          <Button
            className={classes.actionButton}
            variant="contained"
            color="primary"
            onClick={this.proceedGame}
          >
            Next Round
          </Button>
        )}
      </Fragment>
    );
  }
}

export default withStyles(styles)(Game);
