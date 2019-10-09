import { generateRandomIndex } from "./randomiser";

const mockMath = Object.create(global.Math);
mockMath.random = () => jest.fn();

const randomSpy = jest.spyOn(global.Math, "random");

describe("generateRandomIndex", () => {
  afterEach(() => {
    randomSpy.mockClear();
  });

  describe("return whole numbers between 0 and max", () => {
    it("should return 5 when max is 10 and random number is 0.5", () => {
      randomSpy.mockReturnValueOnce(0.5);
      const max = 10;
      const numbersToExclude = [];

      const result = generateRandomIndex(max, numbersToExclude);

      expect(result).toEqual(5);
    });

    it("should return 5 when max is 10 and random number is 0.59", () => {
      randomSpy.mockReturnValueOnce(0.59);
      const max = 10;
      const numbersToExclude = [];

      const result = generateRandomIndex(max, numbersToExclude);

      expect(result).toEqual(5);
    });

    it("should return 10 when max is 10 and random number is 1", () => {
      randomSpy.mockReturnValueOnce(1);

      const max = 10;
      const numbersToExclude = [];

      const result = generateRandomIndex(max, numbersToExclude);

      expect(result).toEqual(10);
    });

    it("should return 0 when max is 10 and random number is 0.4", () => {
      randomSpy.mockReturnValueOnce(0.04);

      const max = 10;
      const numbersToExclude = [];

      const result = generateRandomIndex(max, numbersToExclude);

      expect(result).toEqual(0);
    });
  });

  it("should keep chosing a random number if the previous random number was in the list of excluded", () => {
    const max = 10;
    const numbersToExclude = [4, 6, 8];

    randomSpy
      .mockReturnValueOnce(0.63) // first try pick random index as 6
      .mockReturnValueOnce(0.4) // second try pick random index as 4
      .mockReturnValueOnce(0.89) // third try pick random index as 8
      .mockReturnValueOnce(0.1); // fourth try correctly pick random index as 1

    const result = generateRandomIndex(max, numbersToExclude);

    expect(result).toEqual(1);
    expect(randomSpy).toHaveBeenCalledTimes(4);
  });
});
