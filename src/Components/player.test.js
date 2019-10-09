import React from "react";
import { render } from "@testing-library/react";

import Player from "./player";

// strongly define constants incase these change in the future
jest.mock("../constants", () => ({
  WIN: "WIN",
  LOSE: "LOSE"
}));

const defaultProps = {
  player: { id: 1, name: "bill bob", score: 10.1111 },
  onChoose: jest.fn(),
  classes: {}
};
const renderPlayer = additionalProps =>
  render(<Player {...{ ...defaultProps, ...additionalProps }} />);

describe("Player", () => {
  it("should correctly display the players details when round not played", () => {
    const { getByText, queryByText } = renderPlayer();

    expect(getByText("bill bob")).toBeDefined();
    /**
     * should not display player score
     * query used to handle no result found
     */
    expect(queryByText(/10.11/)).toBeNull();
  });

  it("should correctly display the players deails once the round is player", () => {
    const { getByText } = renderPlayer({
      selectedPlayer: 2,
      revealResult: "WIN"
    });

    expect(getByText("bill bob")).toBeDefined();
    expect(getByText(/10.11/)).toBeDefined();
  });

  it("should render green border when the player was a correct selection", () => {
    const { getByText } = renderPlayer({
      selectedPlayer: 1,
      revealResult: "WIN"
    });

    // card is 2nd parent of player name
    const personCardElement = getByText("bill bob").parentElement.parentElement;
    expect(personCardElement.className).toMatch(/WIN/);
  });

  it("should render red border when the player was an incorrect selection", () => {
    const { getByText } = renderPlayer({
      selectedPlayer: 1,
      revealResult: "LOSE"
    });

    // card is 2nd parent of player name
    const personCardElement = getByText("bill bob").parentElement.parentElement;
    expect(personCardElement.className).toMatch(/LOSE/);
  });

  it("should render no border when the player was not selected but the round has been played", () => {
    const { getByText } = renderPlayer({
      selectedPlayer: 2, // selected player is not this player
      revealResult: "WIN"
    });

    // card is 2nd parent of player name
    const personCardElement = getByText("bill bob").parentElement.parentElement;
    expect(personCardElement.className).not.toMatch(/WIN|LOSE/);
  });
});
