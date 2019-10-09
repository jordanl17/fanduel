import { getPlayers } from "./requests";
import { transformPlayers } from "./transforms";

jest.mock("./transforms");

global.fetch = jest.fn();

describe("getPlayers", () => {
  it("should make get request to correct URL", done => {
    global.fetch.mockReturnValueOnce(
      Promise.resolve({ status: 200, json: jest.fn() })
    );

    getPlayers()
      .then(() => {
        expect(fetch).toHaveBeenCalledWith(
          "https://gist.githubusercontent.com/liamjdouglas/bb40ee8721f1a9313c22c6ea0851a105/raw/6b6fc89d55ebe4d9b05c1469349af33651d7e7f1/Player.json",
          { method: "get" }
        );
        done();
      })
      .catch(err => done.fail(err));
  });

  describe("when request is successful", () => {
    describe("and response is 200", () => {
      const mockJson = jest.fn();

      beforeEach(() => {
        global.fetch.mockReturnValueOnce(
          Promise.resolve({ status: 200, json: mockJson })
        );
      });

      it("should correctly convert response to JSON", () => {
        getPlayers().then(() => {
          expect(mockJson).toHaveBeenCalledTimes(1);
        });
      });

      it("should transform the response", done => {
        mockJson.mockReturnValueOnce(Promise.resolve({ test: "body" }));

        getPlayers()
          .then(() => {
            expect(transformPlayers).toHaveBeenCalledWith({ test: "body" });
            done();
          })
          .catch(err => done.fail(err));
      });
    });

    describe("and response is unsuccessful with defined error", () => {
      beforeEach(() => {
        global.fetch.mockReturnValueOnce(
          Promise.resolve({ status: 400, statusText: "test error" })
        );
      });

      it("should fail with returned error message", done => {
        getPlayers()
          .then(() => done.fail())
          .catch(message => {
            expect(message).toEqual("test error");
            done();
          });
      });
    });

    describe("and response is unsuccessful with unexpected error", () => {
      beforeEach(() => {
        global.fetch.mockReturnValueOnce(Promise.resolve({ status: 1000 }));
      });

      it("should fail with default returned error message", done => {
        getPlayers()
          .then(() => done.fail())
          .catch(message => {
            expect(message).toEqual("An error occurred");
            done();
          });
      });
    });
  });

  describe("when request fails", () => {
    beforeEach(() => {
      global.fetch.mockReturnValueOnce(Promise.reject("test error"));
    });

    it("should fail", done => {
      getPlayers()
        .then(() => done.fail())
        .catch(err => {
          expect(err).toEqual("test error");
          done();
        });
    });
  });
});
