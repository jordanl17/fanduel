import { transformPlayers } from "./transforms";

describe("transformPlayers", () => {
  it("should order players into their associated teams with correct transform and team name", () => {
    const input = {
      teams: [{ id: 1, name: "team one" }, { id: 2, name: "team two" }],
      players: [
        {
          first_name: "tim",
          last_name: "tom",
          fppg: 1,
          id: 3,
          team: { _members: [2] }
        },
        {
          first_name: "bill",
          last_name: "bob",
          fppg: 1,
          id: 1,
          team: { _members: [1] }
        },
        {
          first_name: "santa",
          last_name: "clause",
          fppg: 1,
          id: 2,
          team: { _members: [1] }
        }
      ]
    };
    const expectResult = {
      1: {
        name: "team one",
        players: [
          {
            name: "bill bob",
            score: 1,
            id: 1,
            teamId: 1
          },
          {
            name: "santa clause",
            score: 1,
            id: 2,
            teamId: 1
          }
        ]
      },
      2: {
        name: "team two",
        players: [
          {
            name: "tim tom",
            score: 1,
            id: 3,
            teamId: 2
          }
        ]
      }
    };

    const result = transformPlayers(input);

    expect(result).toEqual(expectResult);
  });

  it("should remove players with no defined fppg score", () => {
    const input = {
      teams: [
        { id: 1, name: "team one" },
        { id: 2, name: "team two" },
        // test empty team with no players
        { id: 4, name: "empty team four" }
      ],
      players: [
        {
          // player should be returned
          first_name: "tim",
          last_name: "tom",
          fppg: 100,
          id: 3,
          team: { _members: [2] }
        },
        {
          // player has no fppg - not returned
          first_name: "bill",
          last_name: "bob",
          id: 1,
          team: { _members: [1] }
        },
        {
          // player has 0 fppg - should be returned
          first_name: "santa",
          last_name: "clause",
          fppg: 0,
          id: 2,
          // taking only first team, player should appear in team 1
          team: { _members: [1, 2] }
        }
      ]
    };
    const expectResult = {
      1: {
        name: "team one",
        players: [
          {
            name: "santa clause",
            score: 0,
            id: 2,
            teamId: 1
          }
        ]
      },
      2: {
        name: "team two",
        players: [
          {
            name: "tim tom",
            score: 100,
            id: 3,
            teamId: 2
          }
        ]
      },
      4: {
        name: "empty team four",
        players: []
      }
    };

    const result = transformPlayers(input);

    expect(result).toEqual(expectResult);
  });

  it("should return correct details on players", () => {
    const input = {
      teams: [{ id: 1, name: "team one" }],
      players: [
        {
          first_name: "bill",
          last_name: "bob",
          someOtherField: "test",
          fppg: 1,
          id: 1,
          team: { _members: [1] }
        }
      ]
    };
    const expectResult = {
      1: {
        name: "team one",
        players: [
          {
            name: "bill bob",
            score: 1,
            id: 1,
            teamId: 1
          }
        ]
      }
    };

    const result = transformPlayers(input);

    expect(result).toEqual(expectResult);
  });
});
