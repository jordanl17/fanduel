import React from "react";
import classnames from "classnames";
import Card from "@material-ui/core/Card";
import { CardContent, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core";

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
        <Typography>
          {player.name}
          {revealResult && (
            <div>
              {player.score}
              {player.correctAnswer ? "correct" : "wrong"}
            </div>
          )}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default withStyles(styles)(Player);
