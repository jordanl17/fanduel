import React from "react";
import { render, waitForElement, fireEvent } from "@testing-library/react";

import Game from "./game";
import { getPlayers } from "../Helpers/requests";
import { generateRandomIndex } from "../Helpers/randomiser";
import * as actualConstants from "../constants";

import transformedTeamsForSingleRoundedGame from "../../fixtures/transformedTeamsForSingleRoundedGame";
import transformedTeamsForFullGame from "../../fixtures/transformedTeamsForFullGame";

jest.mock("../Helpers/randomiser");

// override winning score to simplify integration tests
actualConstants.WINNING_SCORE = 2;

jest.mock("../Helpers/requests", () => ({ getPlayers: jest.fn() }));

const renderGame = () => render(<Game />);

describe("Game", () => {
  test("Loading component should make API call", () => {
    getPlayers.mockReturnValueOnce(Promise.resolve());

    renderGame();
    expect(getPlayers).toHaveBeenCalledTimes(1);
  });

  describe("while API call is loading", () => {
    beforeEach(() => {
      getPlayers.mockReturnValueOnce(Promise.resolve());
    });

    test("should render loading screen", () => {
      const { getByText } = renderGame();

      // immediately check for loading text
      expect(getByText("Loading...")).toBeDefined();
    });
  });

  describe("when API call fails", () => {
    beforeEach(() => {
      getPlayers.mockReturnValueOnce(Promise.reject({ message: "test error" }));
    });

    test("should render error", async () => {
      const { getByText } = renderGame();

      const errorTextElement = await waitForElement(() =>
        getByText(/test error/)
      );
      expect(errorTextElement).toBeDefined();
    });
  });

  describe("when API is successful", () => {
    beforeEach(() => {
      getPlayers.mockReturnValueOnce(
        Promise.resolve(transformedTeamsForSingleRoundedGame)
      );
    });

    test("playing a game round should show proceed button after play", async () => {
      // for both teams select 0th player
      generateRandomIndex.mockReturnValueOnce(0).mockReturnValueOnce(0);

      const { getByText } = renderGame();

      // wait for game screen to fully load
      await waitForElement(() => getByText("Score: 0"));

      // check that teams 1 and 2 are being played, not team 3
      expect(getByText("tim tom")).toBeDefined();
      expect(getByText("bill bob")).toBeDefined();

      // tim tom has higher score of 10 compared to 0
      const correctAnswerElement = getByText("tim tom").parentElement
        .parentElement;

      // select the correct answer
      fireEvent.click(correctAnswerElement);

      // assert that player can move to next round
      expect(getByText("Next Round")).toBeDefined();
    });

    test("playing a correct round should increment score", async () => {
      // for both teams select 0th player
      generateRandomIndex.mockReturnValueOnce(0).mockReturnValueOnce(0);

      const { getByText } = renderGame();

      // wait for game screen to fully load
      await waitForElement(() => getByText("Score: 0"));

      // tim tom has higher score of 10 compared to 0
      const correctAnswerElement = getByText("tim tom").parentElement
        .parentElement;

      // select the correct answer
      fireEvent.click(correctAnswerElement);

      // assert that score has increased
      expect(getByText("Score: 1")).toBeDefined();
    });

    test("playing an incorrect round should retain current score", async () => {
      // for both teams select 0th player
      generateRandomIndex.mockReturnValueOnce(0).mockReturnValueOnce(0);

      const { getByText } = renderGame();

      // wait for game screen to fully load
      await waitForElement(() => getByText("Score: 0"));

      // bill bob has lower score of 1 compared to 10
      const incorrectAnswerElement = getByText("bill bob").parentElement
        .parentElement;

      // select the incorrect answer
      fireEvent.click(incorrectAnswerElement);

      // assert that player can move to next round
      expect(getByText("Next Round")).toBeDefined();

      //assert that score has remained the same
      expect(getByText("Score: 0")).toBeDefined();
    });

    test("playing all available players should allow for resetting", async () => {
      generateRandomIndex
        .mockReturnValueOnce(0) // first game, first round, team 1 pick first player
        .mockReturnValueOnce(0) // first game, first round, team 2 pick first player
        .mockReturnValueOnce(1) // second game, first round, team 1 pick second player
        .mockReturnValueOnce(0); // second game, first round, team 2 pick first player

      const { getByText } = renderGame();

      // wait for game screen to fully load
      await waitForElement(() => getByText("Score: 0"));

      // tim tom has higher score of 10 compared to 1
      const correctAnswerElement = getByText("tim tom").parentElement
        .parentElement;

      // select the correct answer
      fireEvent.click(correctAnswerElement);

      // progress to next round
      fireEvent.click(getByText("Next Round"));

      // game is lost as no more players in team 2
      expect(getByText("You lost")).toBeDefined();

      expect(getByText("Score: 1")).toBeDefined();
      // reset the game
      fireEvent.click(getByText("Try Again"));

      // assert that the score has been reset and a new player for team 1 has been chosen
      expect(getByText("Score: 0")).toBeDefined();
      expect(getByText("santa clause")).toBeDefined();
    });
  });

  test("playing a full successful game should allow for resetting", async () => {
    getPlayers.mockReturnValueOnce(
      Promise.resolve(transformedTeamsForFullGame)
    );

    generateRandomIndex
      .mockReturnValueOnce(0) // first round, team 1 pick first player
      .mockReturnValueOnce(0) // first round, team 2 pick first player
      .mockReturnValueOnce(1) // second round, team 1 pick second player
      .mockReturnValueOnce(1); // second round, team 2 pick second player

    const { getByText } = renderGame();

    // wait for game screen to fully load
    await waitForElement(() => getByText("Score: 0"));

    // tim tom has higher score of 10 compared to 1
    let correctAnswerElement = getByText("tim tom").parentElement.parentElement;

    // select the correct answer
    fireEvent.click(correctAnswerElement);

    // progress to next round
    fireEvent.click(getByText("Next Round"));

    correctAnswerElement = getByText("harry potter").parentElement
      .parentElement;

    // select the correct answer
    fireEvent.click(correctAnswerElement);

    // rounds should read correctly
    expect(getByText(/You win, it took you 2 rounds to win/)).toBeDefined();
  });
});
