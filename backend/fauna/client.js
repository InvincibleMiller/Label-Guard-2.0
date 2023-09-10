const { Client } = require("fauna");

let _client = null;

function _newClient(secretToken) {
  _client = new Client({
    endpoint: new URL("https://db.fauna.com"),
    secret: secretToken,
  });
}

function getFaunaClient(secretToken) {
  if (!_client) {
    _newClient(secretToken);
  } else if (_client.clientConfiguration.secret !== secretToken) {
    _newClient(secretToken);
  }

  return _client;
}

module.exports = { getFaunaClient };
