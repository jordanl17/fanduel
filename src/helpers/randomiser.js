export const generateRandomIndex = (max, numbersToExclude = []) => {
  var randomNumber = Math.floor(Math.random() * Math.floor(max));

  return numbersToExclude.includes(randomNumber)
    ? generateRandomIndex(max, numbersToExclude)
    : randomNumber;
};
