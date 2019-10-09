import React from "react";
import {
  Dialog as MUIDialog,
  DialogTitle,
  DialogActions,
  Button
} from "@material-ui/core";

export const Dialog = ({ body, action, onClick }) => (
  <MUIDialog open>
    <DialogTitle>{body}</DialogTitle>
    <DialogActions>
      <Button color="primary" onClick={onClick}>
        {action}
      </Button>
    </DialogActions>
  </MUIDialog>
);
