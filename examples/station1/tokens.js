fs = require('fs');
const {Auth} = require('@aliconnect/sdk/src/js/aim/server');
const config = require('./config.json');
const {client_id} = config;
const gui_id = '05a62751-297f-4c8c-a6ea-c12b5e50785f';
const aliconnect_id = 'c9b05c80-4d2b-46c1-abfb-0464854dbd9a';
const expiresAfter = 3600;

function createToken(options){
  const {config,payload} = options;
  const {secret} = config;
  const {client_secret} = secret;
  return Auth.makeToken({payload,client_secret,expiresAfter});
}

const apiKey = config.secret.apiKey = createToken({
  config: require('/aliconnect/config/client/'+aliconnect_id+'.json'),
  payload: {
    client_id: aliconnect_id,
    sub: client_id,
  },
  expiresAfter,
});
fs.writeFile('./config.json', JSON.stringify(config, null, 2), err => {});

fs.writeFile('./tokens.json', JSON.stringify({
  serverCloud: {
    apiKey,
  },
  guiLocal: {
    apiKey: createToken({
      config,
      payload: {
        client_id: client_id,
        aud: client_id,
        sub: gui_id,
      },
      expiresAfter,
    })
  },
  guiCloud: {
    apiKey: createToken({
      config: require('/aliconnect/config/client/'+aliconnect_id+'.json'),
      payload: {
        client_id: aliconnect_id,
        sub: gui_id,
        aud: client_id,
      },
      expiresAfter,
    })
  },
}, null, 2), err => {});
