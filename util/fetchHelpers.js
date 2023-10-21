import Lo from "lodash";

const Fetcher = {
  post: async (url, data = {}, headers = {}) => {
    // Default options are marked with *
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: { "Content-Type": "application/json", ...headers },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });

    return response;
  },
  get: async (url, headers = {}) => {
    const response = await fetch(url, {
      credentials: "same-origin",
      method: "GET",
      headers: new Headers(headers),
    });

    return response;
  },
  toQueryParams: (obj) => {
    const characterArr = Lo.reduce(
      obj,
      (sum, value, key, list) => {
        return sum + `${key}=${value}&`;
      },
      "?"
    ).split("");
    return characterArr.toSpliced(characterArr.length - 1, 1).join("");
  },
};

module.exports = { Fetcher };
