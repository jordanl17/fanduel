import React from "react";
import Card from "@material-ui/core/Card";
import { CardContent, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core";

const styles = {
  card: {
    margin: 10
  }
};

const Player = ({ player, onChoose, classes }) => {
  return (
    <Card className={classes.card} onClick={onChoose}>
      <CardContent>
        <Typography>{player.name}</Typography>
      </CardContent>
    </Card>
  );
};

export default withStyles(styles)(Player);
