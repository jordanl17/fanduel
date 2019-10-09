export const generateRandomIndex = (max, numbersToExclude = []) => {
  var randomNumber = Math.floor(Math.random() * max);

  return numbersToExclude.includes(randomNumber)
    ? generateRandomIndex(max, numbersToExclude)
    : randomNumber;
};
