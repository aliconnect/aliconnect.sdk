require('@aliconnect/sdk').init({
  authRoot: 'https://oauth.aliconnect.nl/v1',
  socketRoot: 'https://aliconnect.nl:444',
  serviceRoot: 'https://aliconnect.nl/v1',
  server: {
    http: {
      port: 8081,
    },
  },
}).then(async (Aim) => {
  // console.debug(Aim);
  const {Client, Item, config, server} = Aim;
  Aim.config({
    definitions: {
      verkeerslicht: {
        prototype: {
          setStand (stand) {
            console.debug(this.id, 'setStand', stand);
            this.stand = stand;
          },
          init () {
            this.on('change', ({name,value}) => {
              switch (name) {
                case 'handstand': {
                  clearTimeout(this.to);
                  // console.log(1, this.id, name, value);
                  switch (value) {
                    case 'rood': {
                      this.to = setTimeout(() => this.setStand('rood'), 3000);
                      return this.setStand('geel');
                    }
                    case 'groen': {
                      this.setStand('groen');
                    }
                  }
                }
              }
            });
          }
        },
      },
      // company: {
      //   prototype: {
      //     init() {
      //       this.on('change', ({name,value}) => {
      //         const companies = Item.items.filter(item => item.schema === this.schema);
      //         companies[1].companyName = value;
      //       });
      //     }
      //   },
      // },
    }
  });
  const {client_id, secret, offline, definitions, items} = config;

  const {client_secret} = secret;
  var payload = {
    azp: client_id,
    sub: client_id,
    scope: 'admin',
  };
  console.debug({payload,client_secret});
  const accessToken = Aim.makeToken({
    type: 'sha256',
    expiresAfter: 3600,
    payload,
    client_secret,
  });
  const getAccessToken = () => accessToken;
  server.getAccessToken = getAccessToken;
  // console.debug(offline,items, Array.from(Item.items.values()).map(i => i.init));

  if (offline) {
    if (items) {
      items.forEach(Item.get);
    }
  } else {

    const socketClient = Client.create({getAccessToken,serviceRoot: 'wss://aliconnect.nl:444'});
    await socketClient.connect();

    const serviceClient = Client.create({getAccessToken,serviceRoot: 'https://aliconnect.nl/v1'});
    await serviceClient.api(`/verkeerslicht`).order('verkeerslichtId').get().then(({value}) => value.map(Item.get));
    await serviceClient.api(`/company`).order('companyId').get().then(({value}) => value.map(Item.get));

    const clientAccessToken = Aim.makeToken({
      type: 'sha256',
      expiresAfter: 3600,
      payload: {
        azp: client_id,
        aud: client_id,
        scope: 'admin',
      },
      client_secret,
    });
    console.log(`localhost:${config.server.http.port}/?client_id=${client_id}&access_token=${encodeURI(clientAccessToken)}`);
  }

  var companies = Array.from(Item.items.values()).filter(item => item.schema === definitions.company);
  var verkeerslichten = Array.from(Item.items.values()).filter(item => item.schema === definitions.verkeerslicht);

  console.debug(companies.map(company => company.companyName));

  // setInterval(() => companies[0].companyName = 'Company 0 '+new Date().toLocaleString(), 5000);
});
