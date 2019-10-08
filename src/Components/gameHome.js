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
  state = {
    players: [],
    isLoading: true,
    isError: false,
    game: {
      score: 0,
      rounds: 0,
      playerIdsSeen: [],
      playersInPlay: null
    }
  };

  componentDidMount() {
    getPlayers()
      .then(players => {
        this.setState(
          { players, isLoading: false, isError: false },
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

  prepareRound = () => {
    const numberOfPlayersNotPlayed = this.state.players.filter(
      ({ id }) => !this.state.game.playerIdsSeen.includes(id)
    ).length;

    const randomIndexA = this.randomIndex(
      numberOfPlayersNotPlayed,
      this.state.game.playerIdsSeen
    );
    const randomIndexB = this.randomIndex(numberOfPlayersNotPlayed, [
      ...this.state.game.playerIdsSeen,
      randomIndexA
    ]);

    const playerA = {
      ...this.state.players[randomIndexA],
      index: randomIndexA
    };
    const playerB = {
      ...this.state.players[randomIndexB],
      index: randomIndexB
    };

    const newPlayers = [playerA, playerB];

    // create new newPlayers arr as sorting will mutate newPlayers
    const [maxScorePlayerId] = [...newPlayers]
      .sort((a, b) => b.score - a.score)
      .map(({ id }) => id);

    this.setState(prevState => ({
      game: {
        ...prevState.game,
        playersInPlay: [playerA, playerB].map(player => ({
          ...player,
          correctAnswer: player.id === maxScorePlayerId
        })),
        rounds: ++prevState.game.rounds,
        roundResult: null,
        selectedPlayer: null
      }
    }));
  };

  onChoosePlayer = chosenPlayer => () => {
    const allScores = this.state.game.playersInPlay.map(({ score }) => score);

    if (chosenPlayer.score === Math.max(...allScores)) {
      this.setState(prevState => ({
        game: {
          ...prevState.game,
          score: ++prevState.game.score,
          selectedPlayer: chosenPlayer.id,
          roundResult: "WIN"
        }
      }));
    } else {
      this.setState(prevState => ({
        game: {
          ...prevState.game,
          selectedPlayer: chosenPlayer.id,
          roundResult: "LOSE"
        }
      }));
    }
  };

  proceedGame = () => {
    this.setState(
      prevState => ({
        game: {
          ...prevState.game,
          playerIdsSeen: [
            ...prevState.game.playerIdsSeen,
            ...prevState.game.playersInPlay.map(({ index }) => index)
          ]
        }
      }),
      this.prepareRound
    );
  };

  resetGame = () => {
    this.setState(
      {
        game: {
          score: 0,
          rounds: 0,
          playerIdsSeen: [],
          playersInPlay: null,
          selectedPlayer: null,
          roundResult: null
        }
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

    const isWinningDialogOpen = game.score === 10;
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
            Next
          </Button>
        )}
      </Fragment>
    );
  }
}

export default withStyles(styles)(Game);
