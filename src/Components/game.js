import React, { Component, Fragment } from "react";

import Grid from "@material-ui/core/Grid";
import {
  withStyles,
  Dialog,
  DialogTitle,
  DialogActions,
  Typography
} from "@material-ui/core";
import Button from "@material-ui/core/Button";

import Player from "./player";
import { getPlayers } from "../Helpers/requests";
import { generateRandomIndex } from "../Helpers/randomiser";

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
    playerIndexesUsed: {},
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

  generateRandomPlayerFromTeam = teamId => {
    const { game, teams } = this.state;
    const { players } = teams[teamId];

    // if teamId not in used players, that means first round so set to []
    let indexesUsedFromTeam =
      (game.playerIndexesUsed && game.playerIndexesUsed[teamId]) || [];

    const randomIndex = generateRandomIndex(
      players.length,
      indexesUsedFromTeam
    );

    // add index to allow for ignoring these players in future rounds
    const randomUnplayedPlayer = {
      ...players[randomIndex],
      index: randomIndex
    };

    return randomUnplayedPlayer;
  };

  prepareRound = () => {
    const { teamsInPlay } = this.state;

    const playerA = this.generateRandomPlayerFromTeam(teamsInPlay[0]);
    const playerB = this.generateRandomPlayerFromTeam(teamsInPlay[1]);

    const playersInPlay = [playerA, playerB];

    this.setState(({ game }) => ({
      game: {
        ...game,
        playersInPlay,
        rounds: ++game.rounds,
        roundResult: null,
        selectedPlayer: null
      }
    }));
  };

  onChoosePlayer = chosenPlayer => () => {
    const allScores = this.state.game.playersInPlay.map(({ score }) => score);
    const correctPlay = chosenPlayer.score === Math.max(...allScores);

    if (correctPlay) {
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
      game: { playerIndexesUsed: playersUsedPreRound, playersInPlay }
    } = this.state;

    const updateUsedPlayersForRound = (existingIndexesUsed, player) => ({
      ...existingIndexesUsed,
      [player.teamId]: [
        // if this is first round, set to []
        ...(existingIndexesUsed[player.teamId] || []),
        player.index // add this rounds player to usedPlayers
      ]
    });

    const playerIndexesUsedPostRound = playersInPlay.reduce(
      updateUsedPlayersForRound,
      playersUsedPreRound
    );

    // no more players if some teams have used all their available players
    const noMorePlayers = Object.entries(playerIndexesUsedPostRound).some(
      ([teamId, indexesUsed]) =>
        indexesUsed.length === this.state.teams[teamId].players.length
    );

    if (noMorePlayers) {
      // game is lost - no more rounds can be generated
      return this.setState(prevState => ({
        game: { ...prevState.game, lose: true }
      }));
    }

    this.setState(
      ({ game }) => ({
        game: {
          ...game,
          playerIndexesUsed: playerIndexesUsedPostRound
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

  // TODO: move to a dialog component
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

    if (isError) {
      return <div>An error occurred, refresh the page - {isError}</div>;
    }

    if (isLoading || !game.playersInPlay) {
      return <div>Loading...</div>;
    }

    const isWinningDialogOpen = game.score === WINNING_SCORE;
    const isLostDialogOpen = game.lose;
    const showActionButton = game.roundResult;

    return (
      <Fragment>
        <div className={classes.scoreParent}>
          <Typography className={classes.scoreCall}>
            Score: {game.score}
          </Typography>
        </div>
        <Grid container spacing={3}>
          {isWinningDialogOpen && this.renderWinningDialog()}
          {isLostDialogOpen && this.renderLostDialog()}
          {game.playersInPlay.map(player => (
            <Grid item xs={6} key={`${player.id}-${player.teamId}`}>
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
          <div className={classes.actionButton}>
            <Typography>
              {game.roundResult === WIN ? "Correct" : "Wrong"}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={this.proceedGame}
            >
              Next Round
            </Button>
          </div>
        )}
      </Fragment>
    );
  }
}

export default withStyles(styles)(Game);
