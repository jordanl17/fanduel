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
import { getPlayers } from "../Helpers/requests";

import { WINNING_SCORE, WIN, LOSE } from "../constants";

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
            // take the first 2 teams to play each other
            teamsInPlay: Object.keys(teams).slice(0, 2),
            isLoading: false,
            isError: false
          },
          this.prepareRound
        );
      })
      .catch(err => this.setState({ isError: err.message, isLoading: false }));
  }

  randomIndex = (max, numbersToExclude = []) => {
    var randomNumber = Math.floor(Math.random() * Math.floor(max));

    return numbersToExclude.includes(randomNumber)
      ? this.randomIndex(max, numbersToExclude)
      : randomNumber;
  };

  generateRandomPlayerFromTeam = teamId => {
    const { game, teams } = this.state;
    const thisTeam = teams[teamId];

    let indexesSeenFromTeam =
      (game.playerIndexesSeen && game.playerIndexesSeen[teamId]) || [];

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
          roundResult: WIN
        }
      }));
    } else {
      this.setState(({ game }) => ({
        game: {
          ...game,
          selectedPlayer: chosenPlayer.id,
          roundResult: LOSE
        }
      }));
    }
  };

  proceedGame = () => {
    const {
      game: { playerIndexesSeen, playersInPlay }
    } = this.state;

    const playerIndexesSeenPostRound = playersInPlay.reduce(
      (existingIndexesSeen, player) => ({
        ...existingIndexesSeen,
        [player.teamId]: [
          ...(existingIndexesSeen[player.teamId] || []),
          player.index
        ]
      }),
      playerIndexesSeen
    );

    const noMorePlayers = Object.entries(playerIndexesSeenPostRound).some(
      ([teamId, indexesSeen]) =>
        indexesSeen.length === this.state.teams[teamId].players.length
    );
    console.log("can you NOT play on", noMorePlayers);
    if (noMorePlayers) {
      return this.setState(prevState => ({
        game: { ...prevState.game, lose: true }
      }));
    }

    this.setState(
      ({ game }) => ({
        game: {
          ...game,
          playerIndexesSeen: playerIndexesSeenPostRound
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

  renderLostDialog = () => this.renderDialog("You lost", "Try Again");

  renderWinningDialog = () =>
    this.renderDialog(
      `You win, it took you ${this.state.game.rounds} rounds to win`,
      "Try Better"
    );

  renderDialog = (body, action) => {
    return (
      <Dialog open>
        <DialogTitle>{body}</DialogTitle>
        <DialogActions>
          <Button color="primary" onClick={this.resetGame}>
            {action}
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
      return <div>An error occurred, refresh the page - {isError}</div>;
    }

    const isWinningDialogOpen = game.score === WINNING_SCORE;
    const isLostDialogOpen = game.lose;
    const showActionButton = game.roundResult;

    return (
      <Fragment>
        <div className={classes.scoreParent}>
          <div className={classes.scoreCall}>Score: {game.score}</div>
        </div>
        <Grid container spacing={3}>
          {isWinningDialogOpen && this.renderWinningDialog()}
          {isLostDialogOpen && this.renderLostDialog()}
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
