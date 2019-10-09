import React from "react";
import classnames from "classnames";

import Card from "@material-ui/core/Card";
import { CardContent, Typography, WithStyles } from "@material-ui/core";

const styles = {
  card: {
    margin: 10,
    border: "1px solid white"
  },
  LOSE: {
    border: "1px solid red"
  },
  WIN: {
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
  // highlight player if player is selected
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
        {revealResult && <Typography>{player.score}</Typography>}
      </CardContent>
    </Card>
  );
};

export default withStyles(styles)(Player);
