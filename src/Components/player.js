import React from "react";
import classnames from "classnames";
import PropTypes from "prop-types";

import Card from "@material-ui/core/Card";
import { CardContent, Typography, withStyles } from "@material-ui/core";

import { WIN, LOSE } from "../constants";

const styles = {
  card: {
    margin: 10,
    border: "1px solid white"
  },
  [LOSE]: {
    border: "1px solid red"
  },
  [WIN]: {
    border: "1px solid green"
  }
};

const Player = ({
  selectedPlayer,
  player,
  revealResult,
  onChoose,
  classes
}) => {
  const shouldHighlightPlayer = selectedPlayer === player.id;

  return (
    <Card
      className={classnames([
        classes.card,
        shouldHighlightPlayer && classes[revealResult]
      ])}
      onClick={onChoose}
    >
      <CardContent>
        <Typography>{player.name}</Typography>
        {revealResult && (
          <Typography>Player Score: {player.score.toFixed(2)}</Typography>
        )}
      </CardContent>
    </Card>
  );
};

Player.defaultProps = {
  selectedPlayer: null,
  revealResult: null
};

Player.propTypes = {
  selectedPlayer: PropTypes.string,
  player: PropTypes.shape({
    id: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  }),
  revealResult: PropTypes.string,
  onChoose: PropTypes.func.isRequired,
  classes: PropTypes.shape({
    card: PropTypes.string.isRequired,
    [LOSE]: PropTypes.string.isRequired,
    [WIN]: PropTypes.string.isRequired
  })
};

export default withStyles(styles)(Player);
