### Scripts

`npm i` - install dependencies  
`npm start` - start a dev server with the app running  
`npm t` - run tests  
`npm run test:coverage` - run tests with coverage

### Game logic

- Users will play 2 teams of players against one another
- Users will only play with each player once in a single game
- Once all players in a single team have been played, and the winning score is yet to be achieved, the game is lost
- Once the score reached 10, the game is won
- On resetting the game, score is reset and all players may be played in a round again
- On making a player selection the user will be given feedback as to whether the choice was correct or wrong, and may then proceed to the next round of the game

### Future work

- Handle 2 players with equal FPPG score
- Allow for user to select the teams to be played
- Allow for the user to play more than 2 teams against one another
- Allow for the user to view more information on each player
- Allow for the user to filter the players to be chosen from based on position played, or injury status

### Testing strategy

Tests of helpers written with jest
Tests of React components written with jest and @testing-library/react. This ensures that although testing of underlying logic is not covered, testing of the views displayed to users is thoroughly tested. The approach to testing `Game` component was through pseudo integration tests, following game flow and scenarios whilst asserting that user would see certain UI elements
