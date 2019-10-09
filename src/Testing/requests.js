import { transformPlayers } from "./transforms";

export const getPlayers = () => {
  return fetch(
    "https://gist.githubusercontent.com/liamjdouglas/bb40ee8721f1a9313c22c6ea0851a105/raw/6b6fc89d55ebe4d9b05c1469349af33651d7e7f1/Player.json",
    { method: "get" }
  )
    .then(response => {
      if (response.status === 200) {
        return response.json();
      }
      // error, then reject after .json()
      const { statusText = "An error occurred" } = response;
      return Promise.reject(statusText);
    })
    .then(body => transformPlayers(body));
};
